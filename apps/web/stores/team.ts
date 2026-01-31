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

interface Role {
  teamId: string,
  userId: string,
  role: string
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: [] as Team[],
    currentTeam: null as Team | null,
    members: [] as Member[],
    role: [] as Role[],
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

    setRole(role: Role[]) {
      this.role = role;
    }
  },
});
