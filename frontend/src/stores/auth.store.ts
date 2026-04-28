import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AUTH_TOKEN_KEY } from '../services/api';
import {
  authService,
  type AuthTenant,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
} from '../services/auth.service';

const AUTH_USER_KEY = 'auth.user';
const AUTH_TENANT_KEY = 'auth.tenant';

function readJson<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const user = ref<AuthUser | null>(readJson<AuthUser>(AUTH_USER_KEY));
  const tenant = ref<AuthTenant | null>(readJson<AuthTenant>(AUTH_TENANT_KEY));
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  const setAuthData = (newToken: string, userData: AuthUser, tenantData: AuthTenant) => {
    token.value = newToken;
    user.value = userData;
    tenant.value = tenantData;

    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TENANT_KEY, JSON.stringify(tenantData));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    tenant.value = null;

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TENANT_KEY);
  };

  const login = async (credentials: LoginPayload) => {
    loading.value = true;
    try {
      const data = await authService.login(credentials);
      setAuthData(data.accessToken, data.user, data.tenant);
      return data;
    } finally {
      loading.value = false;
    }
  };

  const signup = async (payload: SignupPayload) => {
    loading.value = true;
    try {
      const data = await authService.signup(payload);
      setAuthData(data.accessToken, data.user, data.tenant);
      return data;
    } finally {
      loading.value = false;
    }
  };

  return { token, user, tenant, loading, isAuthenticated, login, signup, logout };
});
