export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient();
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

  // Check if Supabase session exists
  if (!supabaseUser.value) {
    authStore.clear();
    userCookie.value = null;
    return navigateTo('/login');
  }

  // Ensure we have app-level user data
  if (!authStore.user) {
    try {
      await authStore.fetchProfile();
      // Save to cookie
      if (authStore.user) {
        userCookie.value = JSON.stringify(authStore.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Session exists but app user data is missing/invalid -> force logout
      await supabase.auth.signOut();
      authStore.clear();
      userCookie.value = null;
      return navigateTo('/login');
    }
  }
});