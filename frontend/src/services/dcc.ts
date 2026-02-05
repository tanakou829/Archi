import api from './api';
import { DCCPlugin, DCCPluginTemplate } from '../types';

export const dccService = {
  async listPlugins(): Promise<DCCPlugin[]> {
    const response = await api.get<DCCPlugin[]>('/dcc/plugins');
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  async getAllTemplates(): Promise<Record<string, any>> {
    const response = await api.get<Record<string, any>>('/dcc/templates');
    return response.data;
  },

  async getPluginTemplate(pluginName: string): Promise<DCCPluginTemplate> {
    const response = await api.get<DCCPluginTemplate>(`/dcc/templates/${pluginName}`);
    return response.data;
  },
};
