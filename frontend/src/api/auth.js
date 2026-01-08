import {api} from './api.js'

export const register = async (name, email, password) => {
  const response = await api.post("/register", { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });
  localStorage.setItem("accessToken", response.data.access_token);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
};

export const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data;
};