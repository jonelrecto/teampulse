import { TeamRole } from './team';

export interface CheckIn {
  id: string;
  userId: string;
  teamId: string;
  yesterday: string;
  today: string;
  blockers?: string;
  mood: Mood;
  energy: number;
  checkInDate: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  attachments?: CheckInAttachment[];
}

export interface CheckInAttachment {
  id: string;
  checkInId: string;
  url: string;
  filename: string;
  storagePath: string;
  createdAt: Date;
}

export enum Mood {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  OKAY = 'OKAY',
  LOW = 'LOW',
  STRUGGLING = 'STRUGGLING',
}

export interface CheckInDraft {
  teamId: string;
  yesterday: string;
  today: string;
  blockers?: string;
  mood?: Mood;
  energy?: number;
  timestamp: number;
}
