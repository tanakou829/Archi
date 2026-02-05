export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  section?: string;
  unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  section?: string;
  unit?: string;
}

export interface UserUpdate {
  full_name?: string;
  section?: string;
  unit?: string;
  email?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserSetting {
  id: number;
  user_id: number;
  project_id: number;
  category: string;
  key: string;
  value?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSettingCreate {
  project_id: number;
  category: string;
  key: string;
  value?: string;
  description?: string;
}

export interface UserSettingUpdate {
  value?: string;
  description?: string;
}

export interface DCCPlugin {
  name: string;
  display_name: string;
  description: string;
}

export interface DCCSettingTemplate {
  key: string;
  label: string;
  type: string;
  default_value?: any;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface DCCPluginTemplate extends DCCPlugin {
  settings: DCCSettingTemplate[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}
