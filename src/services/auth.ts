import api from './api';
import { User } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  fullName?: string;
}

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
}

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', userData);
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token from storage
      localStorage.removeItem('token');
    }
  },

  refreshToken: async (): Promise<string> => {
    const response = await api.post<LoginResponse>('/auth/refresh');
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    return newToken;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/user');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService; 