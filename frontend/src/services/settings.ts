import api from './api';
import { UserSetting, UserSettingCreate, UserSettingUpdate } from '../types';

export const settingsService = {
  async listSettings(projectId: number, category?: string): Promise<UserSetting[]> {
    const params: any = { project_id: projectId };
    if (category) {
      params.category = category;
    }
    const response = await api.get<UserSetting[]>('/settings/', { params });
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  async createSetting(settingData: UserSettingCreate): Promise<UserSetting> {
    const response = await api.post<UserSetting>('/settings/', settingData);
    return response.data;
  },

  async updateSetting(settingId: number, settingData: UserSettingUpdate): Promise<UserSetting> {
    const response = await api.put<UserSetting>(`/settings/${settingId}`, settingData);
    return response.data;
  },

  async deleteSetting(settingId: number): Promise<void> {
    await api.delete(`/settings/${settingId}`);
  },

  async getSetting(settingId: number): Promise<UserSetting> {
    const response = await api.get<UserSetting>(`/settings/${settingId}`);
    return response.data;
  },
};
