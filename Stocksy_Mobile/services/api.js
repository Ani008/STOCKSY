import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.API_BASE_URL || "http://192.168.43.192:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — reads token from SecureStore and attaches to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // If SecureStore fails, proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwraps data and normalizes errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
