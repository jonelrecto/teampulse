export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  teamId: string;
  reminderEnabled: boolean;
  reminderTime: string;
  digestFrequency: DigestFrequency;
}

export enum DigestFrequency {
  OFF = 'OFF',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}
