import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { settingsService } from '../services/settings';
import { dccService } from '../services/dcc';
import { projectService } from '../services/projects';
import { User, UserSetting, DCCPlugin, Project } from '../types';
import ErrorDisplay from '../components/ErrorDisplay';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<UserSetting[]>([]);
  const [dccPlugins, setDccPlugins] = useState<DCCPlugin[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setApiError(null);
      setLoading(true);
      
      const projectId = projectService.getSelectedProject();
      if (!projectId) {
        navigate('/projects');
        return;
      }

      const [userData, projectData, settingsData, pluginsData] = await Promise.all([
        authService.getCurrentUser(),
        projectService.getProject(projectId),
        settingsService.listSettings(projectId),
        dccService.listPlugins(),
      ]);
      setUser(userData);
      setProject(projectData);
      setSettings(settingsData);
      setDccPlugins(pluginsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load dashboard data. Please try again.';
      setApiError(errorMessage);
      
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

  const handleLogout = () => {
    authService.logout();
    projectService.clearSelectedProject();
    navigate('/login');
  };

  const handleChangeProject = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show API error with retry option
  if (apiError) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
          <h2>Dashboard Error</h2>
          <ErrorDisplay 
            error={apiError}
            onRetry={loadData}
            onGoBack={() => navigate('/projects')}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Artist Configuration Manager</h1>
          <div className="nav">
            <span>Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Project: {project?.name}</h2>
          <button onClick={handleChangeProject} className="btn btn-secondary">
            Change Project
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            My Settings
          </button>
          <button
            className={`tab ${activeTab === 'dcc' ? 'active' : ''}`}
            onClick={() => setActiveTab('dcc')}
          >
            DCC Tools
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="card">
            <h2>Profile Information</h2>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Full Name:</strong> {user?.full_name || 'Not set'}</p>
              <p><strong>Section:</strong> {user?.section || 'Not set'}</p>
              <p><strong>Unit:</strong> {user?.unit || 'Not set'}</p>
              <p><strong>Account Created:</strong> {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h2>My Settings</h2>
            {settings.length === 0 ? (
              <p style={{ color: '#666', marginTop: '20px' }}>
                No settings configured yet. Configure your DCC tools in the DCC Tools tab.
              </p>
            ) : (
              <div className="settings-grid" style={{ marginTop: '20px' }}>
                {settings.map((setting) => (
                  <div key={setting.id} className="setting-item">
                    <h4>{setting.category} - {setting.key}</h4>
                    <p><strong>Value:</strong> {setting.value || 'Not set'}</p>
                    {setting.description && <p>{setting.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dcc' && (
          <div className="card">
            <h2>DCC Tools Configuration</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Configure your Digital Content Creation tools settings
            </p>
            <div className="settings-grid">
              {dccPlugins.map((plugin) => (
                <div key={plugin.name} className="setting-item">
                  <h4>{plugin.display_name}</h4>
                  <p>{plugin.description}</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '12px' }}
                    onClick={() => navigate(`/settings/${plugin.name}`)}
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
