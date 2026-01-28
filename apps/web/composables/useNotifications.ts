import { useApi } from './useApi';
import { useNotificationsStore } from '~/stores/notifications';

export const useNotifications = () => {
  const api = useApi();
  const notificationsStore = useNotificationsStore();

  const fetchNotifications = async (unreadOnly = false) => {
    const notifications = await api.get<any[]>(
      `/users/me/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
    );
    notificationsStore.setNotifications(notifications);
    return notifications;
  };

  const markAsRead = async (notificationId: string) => {
    await api.patch(`/users/me/notifications/${notificationId}/read`);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.patch('/users/me/notifications/read-all');
    await fetchNotifications();
  };

  const fetchPreferences = async () => {
    const preferences = await api.get<any[]>('/users/me/notifications/preferences');
    notificationsStore.setPreferences(preferences);
    return preferences;
  };

  const updatePreferences = async (
    teamId: string,
    data: {
      reminderEnabled?: boolean;
      reminderTime?: string;
      digestFrequency?: string;
    },
  ) => {
    await api.patch('/users/me/notifications/preferences', { teamId, ...data });
    await fetchPreferences();
  };

  return {
    notifications: computed(() => notificationsStore.notifications),
    unreadCount: computed(() => notificationsStore.unreadCount),
    preferences: computed(() => notificationsStore.preferences),
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchPreferences,
    updatePreferences,
  };
};
