// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api", // tu backend
  withCredentials: false,
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
