import { apiRequest } from './api';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at: string;
};

export const notificationService = {
  async list() {
    return apiRequest<AppNotification[]>('/api/notifications');
  },

  async unreadCount() {
    const result = await apiRequest<{ count: number }>('/api/notifications/unread-count');
    return result.count;
  },

  async markRead(id: string) {
    return apiRequest<{ ok: boolean }>('/api/notifications/' + encodeURIComponent(id) + '/read', {
      method: 'PATCH',
    });
  },

  async markAllRead() {
    return apiRequest<{ ok: boolean; count: number }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};
