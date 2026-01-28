import { useApi } from './useApi';
import { useTeamStore } from '~/stores/team';

export const useTeam = () => {
  const api = useApi();
  const teamStore = useTeamStore();

  const fetchTeams = async () => {
    const teams = await api.get<any[]>('/teams');
    teamStore.setTeams(teams);
    return teams;
  };

  const fetchTeam = async (teamId: string) => {
    const team = await api.get<any>(`/teams/${teamId}`);
    teamStore.setCurrentTeam(team);
    return team;
  };

  const createTeam = async (data: { name: string; logoUrl?: string }) => {
    const team = await api.post<any>('/teams', data);
    await fetchTeams();
    return team;
  };

  const updateTeam = async (teamId: string, data: { name?: string; logoUrl?: string }) => {
    const team = await api.patch<any>(`/teams/${teamId}`, data);
    teamStore.setCurrentTeam(team);
    return team;
  };

  const deleteTeam = async (teamId: string) => {
    await api.delete(`/teams/${teamId}`);
    await fetchTeams();
  };

  const joinTeam = async (code: string) => {
    const result = await api.post<any>(`/teams/join/${code}`);
    await fetchTeams();
    return result;
  };

  const fetchMembers = async (teamId: string) => {
    const members = await api.get<any[]>(`/teams/${teamId}/members`);
    teamStore.setMembers(members);
    return members;
  };

  const removeMember = async (teamId: string, userId: string) => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
    await fetchMembers(teamId);
  };

  const transferAdmin = async (teamId: string, newAdminUserId: string) => {
    await api.patch(`/teams/${teamId}/transfer-admin`, { newAdminUserId });
    await fetchMembers(teamId);
  };

  return {
    teams: computed(() => teamStore.teams),
    currentTeam: computed(() => teamStore.currentTeam),
    members: computed(() => teamStore.members),
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    fetchMembers,
    removeMember,
    transferAdmin,
  };
};
