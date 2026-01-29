export const useAvatar = () => {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
  
    const uploadAvatar = async (file: File) => {
      try {
        authStore.uploadingAvatar = true;
  
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
  
        // Upload to API
        const response = await $fetch<any>(`${config.public.apiUrl}/users/me/avatar`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${tokenCookie.value}`,
          },
        });
  
        // Update user in store
        if (response && response.avatarUrl) {
          authStore.user = response;
  
          // Update cookie
          const userCookie = useCookie('user_profile');
          userCookie.value = JSON.stringify(authStore.user);
        }
  
        return response;
      } catch (error: any) {
        console.error('Failed to upload avatar:', error);
        throw new Error(error.message || 'Failed to upload avatar');
      } finally {
        authStore.uploadingAvatar = false;
      }
    };
  
    return {
      uploadAvatar,
    };
  };