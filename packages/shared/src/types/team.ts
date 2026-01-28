export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMembership {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
  };
}

export enum TeamRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
