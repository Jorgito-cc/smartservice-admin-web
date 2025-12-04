import { api } from "./axios";

export interface Mensaje {
  id_mensaje: number;
  id_solicitud?: number;
  id_servicio?: number;
  emisor_id: number;
  mensaje: string;
  precio?: number;
  es_oferta?: boolean;
  fecha: string;
  leido: boolean;
  Usuario?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    foto?: string;
    rol: string;
  };
}

// Obtener historial de chat grupal
export const obtenerHistorialGrupal = async (idSolicitud: number): Promise<Mensaje[]> => {
  const { data } = await api.get<Mensaje[]>(`/chat/solicitud/${idSolicitud}`);
  return data;
};

// Obtener historial de chat 1 a 1
export const obtenerHistorialServicio = async (idServicio: number): Promise<Mensaje[]> => {
  const { data } = await api.get<Mensaje[]>(`/chat/servicio/${idServicio}`);
  return data;
};

// Enviar mensaje (REST - también se puede usar Socket.IO)
export const enviarMensaje = async (data: {
  id_servicio?: number;
  mensaje: string;
}) => {
  const { data: response } = await api.post<Mensaje>("/chat", data);
  return response;
};

// Marcar mensajes como leídos
export const marcarMensajesLeidos = async (idServicio: number) => {
  const { data } = await api.put(`/chat/leidos/${idServicio}`);
  return data;
};

