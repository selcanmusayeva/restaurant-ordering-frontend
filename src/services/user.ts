import api from './api';
import { User, UserRole } from '../types';

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  deactivateUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export default userService; 