import { defineStore } from 'pinia';

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  inviteCode: string;
}

interface Member {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
  };
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: [] as Team[],
    currentTeam: null as Team | null,
    members: [] as Member[],
  }),

  actions: {
    setTeams(teams: Team[]) {
      this.teams = teams;
    },

    setCurrentTeam(team: Team | null) {
      this.currentTeam = team;
    },

    setMembers(members: Member[]) {
      this.members = members;
    },
  },
});
