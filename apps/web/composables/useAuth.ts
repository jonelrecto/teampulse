import { useSupabaseClient, useSupabaseUser } from '#imports';
import { useAuthStore } from '~/stores/auth';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const supabaseUser = useSupabaseUser();
  const authStore = useAuthStore();
  const router = useRouter();

  // Cookie to store user profile
  const userCookie = useCookie('user_profile', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Cookie to store auth token
  const tokenCookie = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Store the access token
    if (data.session?.access_token) {
      tokenCookie.value = data.session.access_token;
    }

    await authStore.fetchProfile();

    // Store user in cookie
    if (authStore.user) {
      userCookie.value = JSON.stringify(authStore.user);
    }
    
    return data;
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) throw error;

    const supabaseUserId = data?.user?.id;

    if (!supabaseUserId) {
      throw new Error('Failed to get user ID from registration');
    }

    // Store the access token
    if (data.session?.access_token) {
      tokenCookie.value = data.session.access_token;
    }

    const userProfile = await authStore.createUser({
      supabaseId: supabaseUserId,
      email,
      displayName,
    });

    // Store user in cookie
    if (userProfile) {
      userCookie.value = JSON.stringify(userProfile);
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    authStore.clear();
    
    // Clear cookies
    userCookie.value = null;
    tokenCookie.value = null;
    
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  };

  // Load user from cookie if exists
  const loadUserFromCookie = () => {
    if (userCookie.value && !authStore.user) {
      try {
        authStore.user = JSON.parse(userCookie.value as string);
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
        userCookie.value = null;
      }
    }
  };

  return {
    user: computed(() => authStore.user),
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: computed(() => !!authStore.user && !!supabaseUser.value),
    loadUserFromCookie,
  };
};