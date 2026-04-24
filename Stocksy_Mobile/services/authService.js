import api from "./api";

/**
 * Login user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response;
};

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export const signup = async (name, email, password) => {
  const response = await api.post("/auth/signup", { 
    name, 
    username: name,   // ← fixes "username is required" error
    email, 
    password 
  });
  return response;
};

/**
 * Logout user (clears token from server if needed)
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await api.post("/auth/logout");
};

const authService = { login, signup, logout };
export default authService;