// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  //baseURL: "https://smartservicebackend-production.up.railway.app/api", // tu backend
    baseURL: "http://localhost:4000/api", // tu backend

  
  withCredentials: false,
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Variable para controlar si ya se está refrescando el token
let isRefreshing = false;
// Cola de peticiones fallidas para reintentar después del refresh
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de respuesta para manejar errores 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es una petición de login o refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No hay refresh token, logout forzado
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Hacemos la petición de refresh usando una instancia nueva de axios para evitar bucles
         const response = await axios.post("https://smartservicebackend-production.up.railway.app/api/auth/refresh-token", {
       //       const response = await axios.post("http://localhost:4000/api/auth/refresh-token", {

          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);

        api.defaults.headers.common["Authorization"] = "Bearer " + token;
        originalRequest.headers["Authorization"] = "Bearer " + token;

        processQueue(null, token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Si falla el refresh, logout forzado
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);