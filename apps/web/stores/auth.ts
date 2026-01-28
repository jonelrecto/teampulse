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
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async fetchProfile() {
      try {
        this.loading = true;
        const api = useApi();
        this.user = await api.get<User>('/users/me');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data: { displayName?: string; timezone?: string }) {
      const api = useApi();
      this.user = await api.patch<User>('/users/me', data);
    },

    clear() {
      this.user = null;
    },
  },
});
