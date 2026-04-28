import { api } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthTenant {
  id: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  familyName: string;
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  tenant: AuthTenant;
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async signup(payload: SignupPayload) {
    const { data } = await api.post<AuthResponse>('/auth/signup', payload);
    return data;
  },
};
