import { api } from "./axios";

export interface SolicitudData {
  id_solicitud: number;
  id_cliente: number;
  id_categoria: number;
  descripcion: string;
  ubicacion_texto: string;
  precio_ofrecido?: number;
  estado: "pendiente" | "asignado" | "en_proceso" | "finalizado" | "cancelado";
  fecha_publicacion: string;
}

export interface SolicitudUsuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  foto?: string;
}

export interface SolicitudCliente {
  id_cliente: number;
  Usuario?: SolicitudUsuario;
}

export interface SolicitudCategoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export interface SolicitudTecnico {
  id_tecnico: number;
  Usuario?: SolicitudUsuario;
}

export interface ServicioAsignado {
  id_servicio: number;
  id_tecnico: number;
  Tecnico?: SolicitudTecnico;
}

export interface Solicitud extends SolicitudData {
  Cliente?: SolicitudCliente;
  Categoria?: SolicitudCategoria;
  ServicioAsignado?: ServicioAsignado;
}

export interface RespuestaSolicitudes {
  total: number;
  solicitudes: Solicitud[];
}

/**
 * Obtener todas las solicitudes (admin)
 * GET /solicitud/admin/listar
 */
export const listarTodasSolicitudes = async (): Promise<Solicitud[]> => {
  try {
    const { data } = await api.get<Solicitud[]>("/solicitud/admin/listar");
    return data || [];
  } catch (error) {
    console.error("Error en listarTodasSolicitudes:", error);
    // Fallback: intentar endpoint alternativo
    try {
      const { data } = await api.get<Solicitud[]>("/solicitud");
      return data || [];
    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError);
      return [];
    }
  }
};

/**
 * Obtener solicitud por ID
 * GET /solicitud/:id
 */
export const obtenerSolicitudPorId = async (id: number): Promise<Solicitud | null> => {
  try {
    const { data } = await api.get<Solicitud>(`/solicitud/${id}`);
    return data;
  } catch (error) {
    console.error(`Error obteniendo solicitud ${id}:`, error);
    return null;
  }
};

/**
 * Cambiar estado de solicitud
 * PUT /solicitud/:id/estado
 */
export const cambiarEstadoSolicitud = async (
  id: number,
  estado: string
): Promise<Solicitud | null> => {
  try {
    const { data } = await api.put<Solicitud>(`/solicitud/${id}/estado`, { estado });
    return data;
  } catch (error) {
    console.error(`Error cambiando estado de solicitud ${id}:`, error);
    return null;
  }
};
