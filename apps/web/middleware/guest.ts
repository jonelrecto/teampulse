export default defineNuxtRouteMiddleware(() => {
  const supabaseUser = useSupabaseUser();
  const authStore = useAuthStore();

  // Load user from cookie if available
  const userCookie = useCookie('user_profile');
  if (userCookie.value && !authStore.user) {
    try {
      authStore.user = JSON.parse(userCookie.value as string);
    } catch (e) {
      console.error('Failed to parse user cookie:', e);
      userCookie.value = null;
    }
  }

  // If both Supabase session and app user exist, redirect to dashboard
  if (supabaseUser.value && authStore.user) {
    return navigateTo('/dashboard');
  }
});