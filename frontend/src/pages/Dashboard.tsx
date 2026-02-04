import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { settingsService } from '../services/settings';
import { dccService } from '../services/dcc';
import { User, UserSetting, DCCPlugin } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSetting[]>([]);
  const [dccPlugins, setDccPlugins] = useState<DCCPlugin[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, settingsData, pluginsData] = await Promise.all([
        authService.getCurrentUser(),
        settingsService.listSettings(),
        dccService.listPlugins(),
      ]);
      setUser(userData);
      setSettings(settingsData);
      setDccPlugins(pluginsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
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
