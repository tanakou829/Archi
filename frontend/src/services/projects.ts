import api from './api';
import { Project, ProjectCreate, ProjectUpdate } from '../types';

class ProjectService {
  async listProjects(): Promise<Project[]> {
    const response = await api.get('/projects/');
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  }

  async createProject(data: ProjectCreate): Promise<Project> {
    try {
      console.log('Creating project with data:', data);
      const response = await api.post('/projects/', data);
      console.log('Project created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create project:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  }

  async getProject(projectId: number): Promise<Project> {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: number, data: ProjectUpdate): Promise<Project> {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  }

  // Helper methods for managing selected project in localStorage
  setSelectedProject(projectId: number): void {
    localStorage.setItem('selectedProjectId', projectId.toString());
  }

  getSelectedProject(): number | null {
    const projectId = localStorage.getItem('selectedProjectId');
    return projectId ? parseInt(projectId, 10) : null;
  }

  clearSelectedProject(): void {
    localStorage.removeItem('selectedProjectId');
  }
}

export const projectService = new ProjectService();
