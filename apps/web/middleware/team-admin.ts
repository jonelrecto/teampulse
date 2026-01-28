export default defineNuxtRouteMiddleware(async (to, from) => {
  const teamId = to.params.teamId as string;
  if (!teamId) return;

  const api = useApi();
  try {
    const members = await api.get(`/teams/${teamId}/members`);
    const user = useSupabaseUser();
    const authStore = useAuthStore();
    if (!authStore.user) {
      await authStore.fetchProfile();
    }

    const currentMember = members.find((m: any) => m.userId === authStore.user?.id);
    if (!currentMember || currentMember.role !== 'ADMIN') {
      return navigateTo(`/teams/${teamId}`);
    }
  } catch (error: any) {
    return navigateTo('/dashboard');
  }
});
