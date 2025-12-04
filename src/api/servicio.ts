import { api } from "./axios";

export interface Servicio {
  id_servicio: number;
  id_solicitud: number;
  id_oferta: number;
  id_tecnico: number;
  fecha_asignacion: string;
  estado: "en_camino" | "en_ejecucion" | "completado";
}

// Aceptar oferta y crear servicio (cliente)
export const aceptarOferta = async (idOferta: number) => {
  const { data } = await api.post<{ msg: string; servicio: Servicio }>("/servicios/asignar", {
    id_oferta: idOferta,
  });
  return data;
};

// Obtener detalle de servicio
export const obtenerServicio = async (idServicio: number): Promise<Servicio> => {
  const { data } = await api.get<Servicio>(`/servicios/${idServicio}`);
  return data;
};

// Cambiar estado del servicio (técnico)
export const cambiarEstadoServicio = async (idServicio: number, estado: string) => {
  const { data } = await api.put(`/servicios/${idServicio}/estado`, { estado });
  return data;
};

// Listar servicios del técnico
export const listarServiciosPorTecnico = async (): Promise<Servicio[]> => {
  const { data } = await api.get<{ msg: string; data: Servicio[] }>("/servicios/tecnico/mis-servicios");
  return data.data;
};

// Listar servicios del cliente
export const listarServiciosPorCliente = async (): Promise<Servicio[]> => {
  const { data } = await api.get<{ msg: string; data: Servicio[] }>("/servicios/cliente/mis-servicios");
  return data.data;
};

