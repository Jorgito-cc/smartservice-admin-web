import { api } from "./axios";

export interface CrearSolicitudDTO {
  id_categoria: number;
  descripcion: string;
  precio_ofrecido?: number;
  ubicacion_texto?: string;
  lat?: number;
  lon?: number;
  fotos?: string[];
}

export interface Solicitud {
  id_solicitud: number;
  id_cliente: number;
  id_categoria: number;
  descripcion: string;
  fecha_publicacion: string;
  ubicacion_texto?: string;
  lat?: number;
  lon?: number;
  precio_ofrecido?: number;
  fotos?: string[];
  estado: "pendiente" | "con_ofertas" | "asignado" | "en_proceso" | "completado" | "cancelado";
  categoria?: {
    id_categoria: number;
    nombre: string;
    descripcion?: string;
  };
}

// Crear solicitud (cliente)
export const crearSolicitud = async (data: CrearSolicitudDTO) => {
  const { data: response } = await api.post<{ msg: string; solicitud: Solicitud }>("/solicitudes", data);
  return response;
};

// Listar solicitudes del cliente
export const listarSolicitudesCliente = async (): Promise<Solicitud[]> => {
  const { data } = await api.get<Solicitud[]>("/solicitudes");
  return data;
};

// Listar solicitudes disponibles (técnico)
export const listarSolicitudesDisponibles = async (): Promise<Solicitud[]> => {
  const { data } = await api.get<{ msg: string; data: Solicitud[] }>("/solicitudes/disponibles");
  return data.data;
};

// Obtener detalle de solicitud
export const obtenerSolicitud = async (id: number): Promise<Solicitud> => {
  const { data } = await api.get<Solicitud>(`/solicitudes/${id}`);
  return data;
};

// Cambiar estado de solicitud
export const cambiarEstadoSolicitud = async (id: number, estado: string) => {
  const { data } = await api.put(`/solicitudes/${id}/estado`, { estado });
  return data;
};

