import { api } from "./axios";

export interface Calificacion {
  id_calificacion: number;
  id_servicio: number;
  id_cliente: number;
  id_tecnico: number;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
}

// Crear calificación (cliente)
export const crearCalificacion = async (idServicio: number, puntuacion: number, comentario?: string) => {
  const { data } = await api.post<{ msg: string; calificacion: Calificacion; promedio_tecnico: string }>("/calificacion", {
    id_servicio: idServicio,
    puntuacion,
    comentario: comentario || "",
  });
  return data;
};

// Listar calificaciones de un técnico
export const listarCalificacionesPorTecnico = async (idTecnico: number): Promise<Calificacion[]> => {
  const { data } = await api.get<Calificacion[]>(`/calificacion/tecnico/${idTecnico}`);
  return data;
};

