import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual local IP address for physical device testing
// For web/emulator, localhost often works, but 10.0.2.2 is needed for Android Emulator
const BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  // We can call the backend logout if needed, but primarily we clear local storage
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.log('Logout API call failed', err);
  } finally {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  }
};

export default api;
