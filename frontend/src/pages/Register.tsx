import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { UserCreate } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    section: '',
    unit: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h2>Artist Registration</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Register your artist profile to access the configuration manager
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Section</label>
            <select name="section" value={formData.section} onChange={handleChange}>
              <option value="">Select section...</option>
              <option value="Modeling">Modeling</option>
              <option value="Animation">Animation</option>
              <option value="VFX">VFX</option>
              <option value="Rigging">Rigging</option>
              <option value="Lighting">Lighting</option>
              <option value="Texturing">Texturing</option>
            </select>
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange}>
              <option value="">Select unit...</option>
              <option value="Unit A">Unit A</option>
              <option value="Unit B">Unit B</option>
              <option value="Unit C">Unit C</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#4CAF50' }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
