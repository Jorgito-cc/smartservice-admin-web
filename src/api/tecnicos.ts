import { api } from "./axios";
import type { TecnicoUsuario, RespuestaTecnicos } from "../types/tecnicoType";

export interface TecnicoCompleto {
  id_tecnico: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  foto?: string;
  estado: boolean;
  descripcion?: string;
  calificacion_promedio?: number | null;
  disponibilidad: boolean;
  especialidades: Array<{
    id_especialidad: number;
    nombre: string;
  }>;
}

// Obtener todos los técnicos con información completa
export const obtenerTodosTecnicos = async (): Promise<TecnicoCompleto[]> => {
  try {
    const { data } = await api.get<TecnicoCompleto[]>("/auth/tecnicos/todos");
    return data || [];
  } catch (error) {
    console.error("Error obteniendo técnicos:", error);
    return [];
  }
};

// Obtener todos los técnicos (método antiguo, para compatibilidad)
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
