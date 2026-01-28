import { useSupabaseClient, useSupabaseUser } from '#imports';
import { useAuthStore } from '~/stores/auth';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    await authStore.fetchProfile();
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
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    authStore.clear();
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

  return {
    user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: computed(() => !!user.value),
  };
};
