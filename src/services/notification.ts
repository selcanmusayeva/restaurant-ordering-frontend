import api from './api';
import { Notification } from '../types';

const notificationService = {
  // Waiter endpoints
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/waiter/notifications');
    return response.data;
  },

  markNotificationAsRead: async (id: number): Promise<Notification> => {
    const response = await api.put<Notification>(`/waiter/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService; 