import { api } from "./axios";

export interface CrearOfertaDTO {
  id_solicitud: number;
  precio: number;
  mensaje?: string;
}

export interface Oferta {
  id_oferta: number;
  id_solicitud: number;
  id_tecnico: number;
  precio: number;
  mensaje?: string;
  fecha_oferta: string;
  estado: "enviada" | "seleccionada" | "rechazada";
  Usuario?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    foto?: string;
  };
  Tecnico?: {
    calificacion_promedio: number;
    descripcion?: string;
  };
}

// Crear oferta (técnico)
export const crearOferta = async (data: CrearOfertaDTO) => {
  const { data: response } = await api.post<{ msg: string; oferta: Oferta }>("/ofertas", data);
  return response;
};

// Listar ofertas de una solicitud
export const listarOfertasPorSolicitud = async (idSolicitud: number): Promise<Oferta[]> => {
  const { data } = await api.get<Oferta[]>(`/ofertas/solicitud/${idSolicitud}`);
  return data;
};

// Obtener detalle de oferta
export const obtenerOferta = async (id: number): Promise<Oferta> => {
  const { data } = await api.get<Oferta>(`/ofertas/${id}`);
  return data;
};

