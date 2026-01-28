export interface User {
  id: string;
  supabaseId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
}
