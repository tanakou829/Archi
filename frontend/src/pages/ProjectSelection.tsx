import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projects';
import { authService } from '../services/auth';
import { Project, ProjectCreate } from '../types';
import ErrorDisplay from '../components/ErrorDisplay';

const ProjectSelection: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState<ProjectCreate>({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setApiError(null);
      setLoading(true);
      const projectsData = await projectService.listProjects();
      
      // Validate that we received an array
      const validProjects = Array.isArray(projectsData) ? projectsData : [];
      setProjects(validProjects);
      console.log('Projects loaded successfully:', validProjects.length, 'projects');
      
      // If user has no projects, show create form
      if (validProjects.length === 0) {
        setShowCreateForm(true);
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load projects. Please try again.';
      setApiError(errorMessage);
      
      // Set projects to empty array on error
      setProjects([]);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        authService.logout();
        projectService.clearSelectedProject();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId: number) => {
    projectService.setSelectedProject(projectId);
    navigate('/dashboard');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newProject.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const createdProject = await projectService.createProject(newProject);
      // Ensure projects is an array before spreading
      const currentProjects = Array.isArray(projects) ? projects : [];
      setProjects([...currentProjects, createdProject]);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
      
      // Automatically select the newly created project
      handleSelectProject(createdProject.id);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      
      // Check if it's a network error
      if (!err.response) {
        setError('Cannot connect to server. Please check your internet connection.');
        return;
      }
      
      const errorMessage = err.response?.data?.detail 
        || err.message 
        || 'Failed to create project. Please try again.';
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    authService.logout();
    projectService.clearSelectedProject();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
          <div className="loading">Loading projects...</div>
        </div>
      </div>
    );
  }

  // Show API error with retry option
  if (apiError) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
          <h2>Project Selection</h2>
          <ErrorDisplay 
            error={apiError}
            onRetry={loadProjects}
            showLoginButton={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Select a Project</h1>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Your Projects</h2>
          
          {error && (
            <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          {projects.length === 0 && !showCreateForm ? (
            <div style={{ marginTop: '20px' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                You don't have any projects yet. Create your first project to get started.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create New Project
              </button>
            </div>
          ) : Array.isArray(projects) && projects.length > 0 ? (
            <>
              <div className="settings-grid" style={{ marginTop: '20px' }}>
                {projects.map((project) => (
                  <div key={project.id} className="setting-item">
                    <h4>{project.name}</h4>
                    {project.description && <p>{project.description}</p>}
                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '12px' }}
                      onClick={() => handleSelectProject(project.id)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>

              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-secondary"
                  style={{ marginTop: '20px' }}
                >
                  Create New Project
                </button>
              )}
            </>
          ) : null}

          {showCreateForm && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <h3>Create New Project</h3>
              <form onSubmit={handleCreateProject} style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="projectName" style={{ display: 'block', marginBottom: '5px' }}>
                    Project Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                    style={{ width: '100%', padding: '8px', fontSize: '1em' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="projectDescription" style={{ display: 'block', marginBottom: '5px' }}>
                    Description
                  </label>
                  <textarea
                    id="projectDescription"
                    value={newProject.description || ''}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description (optional)"
                    rows={3}
                    style={{ width: '100%', padding: '8px', fontSize: '1em' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary">
                    Create Project
                  </button>
                  {projects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProject({ name: '', description: '' });
                        setError('');
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelection;
