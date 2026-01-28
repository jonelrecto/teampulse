export default defineNuxtRouteMiddleware(async (to, from) => {
  const teamId = to.params.teamId as string;
  if (!teamId) return;

  const api = useApi();
  try {
    await api.get(`/teams/${teamId}`);
  } catch (error: any) {
    if (error.message?.includes('403') || error.message?.includes('not a member')) {
      return navigateTo('/dashboard');
    }
    throw error;
  }
});
