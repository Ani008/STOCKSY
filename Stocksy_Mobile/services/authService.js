import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const storeToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

// ─── Auth calls ───────────────────────────────────────────────────────────────

export const signup = async (username, email, password) => {
  const response = await api.post('/auth/signup', { username, email, password });
  await storeToken(response.data.token);
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  await storeToken(response.data.token);
  return response.data;
};

export const logout = async () => {
  await clearToken();
  const response = await api.post('/auth/logout');
  return response.data;
};

// ─── Default export (object) so both import styles work ──────────────────────
// LoginPage.js  → import authService from '...'  → authService.login(...)
// App.js        → import { getStoredToken } from '...'  → getStoredToken()

const authService = { signup, login, logout, getStoredToken };
export default authService;