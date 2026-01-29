import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    uploadingAvatar: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async createUser(loadPayload: Object) {
      try {
        this.loading = true;
        const api = useApi();
        this.user = await api.post<User>('/users', loadPayload);
        return this.user;
      } catch (error) {
        console.error('Failed to create profile:', error);
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        this.loading = true;
        const api = useApi();
        this.user = await api.get<User>('/users/me');
        return this.user;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data: { displayName?: string; timezone?: string }) {
      const api = useApi();
      this.user = await api.patch<User>('/users/me', data);
    },

    async uploadAvatar(file: File) {
      try {
        this.uploadingAvatar = true;

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('avatar', file);

        // Get auth token from cookie
        const tokenCookie = useCookie('auth_token');
        const config = useRuntimeConfig();
        const user_profile = useCookie('user_profile');
        const id = user_profile?.value?.id;

        // Upload to API
        const response = await $fetch<User>(`${config.public.apiUrl}/users/${id}/avatar`, {
          method: 'PATCH',
          body: formData,
          headers: {
            Authorization: `Bearer ${tokenCookie.value}`,
          },
        });

        // Update user in store
        if (response && response.avatarUrl) {
          this.user = response;

          // Update cookie
          const userCookie = useCookie('user_profile');
          userCookie.value = JSON.stringify(this.user);
        }

        return response;
      } catch (error: any) {
        console.error('Failed to upload avatar:', error);
        throw new Error(error.message || 'Failed to upload avatar');
      } finally {
        this.uploadingAvatar = false;
      }
    },

    clear() {
      this.user = null;
    },
  },
});