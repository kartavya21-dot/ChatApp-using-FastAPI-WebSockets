import {api} from './api.js'

export const register = async (name, email, password) => {
  const response = await api.post("/register", { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const res = await api.post("/login", { email, password });

  localStorage.setItem("accessToken", res.data.access_token);
  localStorage.setItem("refreshToken", res.data.refresh_token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data.user;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data;
};