import { api } from "./axios";
import type { TecnicoUsuario, RespuestaTecnicos } from "../types/tecnicoType";

// Obtener todos los técnicos
export const obtenerTecnicos = async (): Promise<TecnicoUsuario[]> => {
  const res = await api.get<RespuestaTecnicos>("/auth/perfiles", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  // Filtrar solo los técnicos
  return res.data.usuarios.filter((u) => u.rol === "tecnico");
};

// Obtener un técnico por ID
export const obtenerTecnicoPorId = async (id: number): Promise<TecnicoUsuario> => {
  const res = await api.get<RespuestaTecnicos>("/auth/perfiles", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  const tecnico = res.data.usuarios.find(
    (u) => u.id_usuario === id && u.rol === "tecnico"
  );
  
  if (!tecnico) {
    throw new Error("Técnico no encontrado");
  }
  
  return tecnico as TecnicoUsuario;
};

// Activar técnico
export const activarTecnicoRequest = async (id: number) => {
  const res = await api.patch(`/auth/tecnico/activar/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

// Desactivar técnico
export const desactivarTecnicoRequest = async (id: number) => {
  const res = await api.patch(`/auth/tecnico/desactivar/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};
