export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const supabaseUser = useSupabaseUser();
  const userCookie = useCookie('user_profile');

  // Load user from cookie on app initialization
  if (userCookie.value && !authStore.user) {
    try {
      authStore.user = JSON.parse(userCookie.value as string);
    } catch (e) {
      console.error('Failed to parse user cookie:', e);
      userCookie.value = null;
    }
  }

  // If we have a Supabase session but no user data, fetch it
  if (supabaseUser.value && !authStore.user) {
    try {
      await authStore.fetchProfile();
      if (authStore.user) {
        userCookie.value = JSON.stringify(authStore.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile on init:', error);
    }
  }
});