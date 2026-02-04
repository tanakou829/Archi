import api from './api';
import { User, UserCreate, UserUpdate, UserLogin, Token } from '../types';

export const authService = {
  async register(userData: UserCreate): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  async login(credentials: UserLogin): Promise<Token> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<Token>('/auth/login', formData);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export const userService = {
  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    const response = await api.put<User>(`/users/${userId}`, userData);
    return response.data;
  },

  async getUser(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  async listUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },
};
