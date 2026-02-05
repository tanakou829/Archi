import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import { projectService } from './services/projects';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DCCSettings from './pages/DCCSettings';
import ProjectSelection from './pages/ProjectSelection';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const ProjectRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  if (!projectService.getSelectedProject()) {
    return <Navigate to="/projects" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectSelection />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProjectRoute>
              <Dashboard />
            </ProjectRoute>
          }
        />
        <Route
          path="/settings/:pluginName"
          element={
            <ProjectRoute>
              <DCCSettings />
            </ProjectRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
