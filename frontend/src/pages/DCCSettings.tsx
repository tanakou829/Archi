import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dccService } from '../services/dcc';
import { settingsService } from '../services/settings';
import { DCCPluginTemplate, DCCSettingTemplate, UserSetting } from '../types';

const DCCSettings: React.FC = () => {
  const { pluginName } = useParams<{ pluginName: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<DCCPluginTemplate | null>(null);
  const [existingSettings, setExistingSettings] = useState<UserSetting[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [pluginName]);

  const loadData = async () => {
    try {
      if (!pluginName) return;
      
      const [templateData, settingsData] = await Promise.all([
        dccService.getPluginTemplate(pluginName),
        settingsService.listSettings(pluginName),
      ]);

      setTemplate(templateData);
      setExistingSettings(settingsData);

      // Initialize form data with existing settings or defaults
      const initialData: Record<string, string> = {};
      templateData.settings.forEach((setting: DCCSettingTemplate) => {
        const existing = settingsData.find((s) => s.key === setting.key);
        initialData[setting.key] = existing?.value || setting.default_value?.toString() || '';
      });
      setFormData(initialData);
    } catch (err) {
      console.error('Failed to load DCC settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (!pluginName) return;

      // Save or update each setting
      for (const [key, value] of Object.entries(formData)) {
        const existing = existingSettings.find((s) => s.key === key);
        const settingTemplate = template?.settings.find((s) => s.key === key);

        if (existing) {
          // Update existing setting
          await settingsService.updateSetting(existing.id, {
            value,
            description: settingTemplate?.description,
          });
        } else {
          // Create new setting
          await settingsService.createSetting({
            category: pluginName,
            key,
            value,
            description: settingTemplate?.description,
          });
        }
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!template) {
    return <div className="container">Plugin not found</div>;
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>{template.display_name} Settings</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {template.description}
          </p>

          {message && (
            <div className={message.includes('success') ? 'success' : 'error'}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {template.settings.map((setting) => (
              <div key={setting.key} className="form-group">
                <label>
                  {setting.label}
                  {setting.required && ' *'}
                </label>
                {setting.description && (
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {setting.description}
                  </p>
                )}

                {setting.type === 'boolean' ? (
                  <select
                    value={formData[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    required={setting.required}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : setting.options ? (
                  <select
                    value={formData[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    required={setting.required}
                  >
                    <option value="">Select...</option>
                    {setting.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={setting.type === 'number' ? 'number' : 'text'}
                    value={formData[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    required={setting.required}
                  />
                )}
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DCCSettings;
