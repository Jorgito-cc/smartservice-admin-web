// src/api/auth.ts
import { api } from "./axios";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/authType";
import type { RegisterTecnicoDTO, RespuestaRegister } from "../types/registroTypes";
export async function loginRequest(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", payload);
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.usuario));
  return data;
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function refreshTokenRequest() {
  const refreshToken = localStorage.getItem("refreshToken");
  const { data } = await api.post("/auth/refresh-token", { refreshToken });
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

export async function getPerfilRequest() {
  const { data } = await api.get("/auth/perfil");
  return data.usuario;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getSessionUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}


export const registerTecnicoRequest = async (data: RegisterTecnicoDTO) => {
    const res = await api.post<RespuestaRegister>("/auth/register", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return res.data;
  };
