import * as SecureStore from "expo-secure-store";
import api from "./api";

// Key used to store the token — consistent across the whole app
export const TOKEN_KEY = "auth_token";

/**
 * Login user with email and password.
 * Saves the returned token to SecureStore so the user stays logged in.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  if (response?.token) {
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
  }
  return response;
};

/**
 * Register a new user.
 * Saves the returned token to SecureStore on success.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const signup = async (name, email, password) => {
  const response = await api.post("/auth/signup", {
    name,
    username: name, // ← fixes "username is required" backend error
    email,
    password,
  });
  if (response?.token) {
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
  }
  return response;
};

/**
 * Logout user.
 * Always deletes the local token regardless of whether the server call succeeds.
 * This matches the docs behaviour: "silently fails if server unreachable —
 * app still navigates to Login."
 *
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (_) {
    // Ignore server errors — token is deleted either way
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

/**
 * Check if a valid token is stored locally.
 * Used by App.js on launch to decide initial route.
 *
 * @returns {Promise<string|null>} token string or null
 */
export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (_) {
    return null;
  }
};

const authService = { login, signup, logout, getStoredToken };
export default authService;
