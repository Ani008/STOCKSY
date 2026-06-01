import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.10.170:5000/api';

console.log('[api.js] API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach JWT token from AsyncStorage ─────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API ➡️ ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} — token attached ✅`);
      } else {
        console.log(`[API ➡️ ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} — no token`);
      }
    } catch (e) {
      console.log('[API ➡️ ] Could not read token from AsyncStorage:', e.message);
    }
    return config;
  },
  (error) => {
    console.log('[API ➡️ ] Request setup error:', error.message);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API ✅] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`[API ❌] ${error.response.status} ${error.config?.url}`);
      console.log('[API ❌] Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('[API 🔴] No response received — check IP/server');
      console.log('[API 🔴] URL attempted:', error.config?.baseURL + error.config?.url);
    } else {
      console.log('[API 🔴] Axios config error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;