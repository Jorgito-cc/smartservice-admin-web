import { api } from "./axios";

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  cuerpo: string;
  leido: boolean;
  fecha_envio: string;
}

// Listar notificaciones del usuario
export const listarNotificaciones = async (): Promise<Notificacion[]> => {
  const { data } = await api.get<Notificacion[]>("/notificaciones");
  return data;
};

// Marcar todas como leídas
export const marcarTodasLeidas = async (): Promise<void> => {
  await api.put("/notificaciones/leidas");
};

// Marcar una como leída
export const marcarLeida = async (idNotificacion: number): Promise<void> => {
  await api.put(`/notificaciones/${idNotificacion}/leida`);
};

// Eliminar una notificación
export const eliminarNotificacion = async (idNotificacion: number): Promise<void> => {
  await api.delete(`/notificaciones/${idNotificacion}`);
};

