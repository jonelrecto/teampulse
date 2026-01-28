import { defineStore } from 'pinia';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: Date;
  createdAt: Date;
}

interface NotificationPreference {
  id: string;
  userId: string;
  teamId: string;
  reminderEnabled: boolean;
  reminderTime: string;
  digestFrequency: string;
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    preferences: [] as NotificationPreference[],
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.readAt).length,
  },

  actions: {
    setNotifications(notifications: Notification[]) {
      this.notifications = notifications;
    },

    setPreferences(preferences: NotificationPreference[]) {
      this.preferences = preferences;
    },
  },
});
