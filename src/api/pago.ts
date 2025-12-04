import { api } from "./axios";

export interface PagoServicio {
  id_pago: number;
  id_servicio: number;
  monto_total: number;
  comision_empresa: number;
  monto_tecnico: number;
  estado: "pendiente" | "pagado" | "cancelado";
  stripe_payment_id: string | null;
  fecha_pago: string | null;
}

// Crear checkout de Stripe
export const crearCheckout = async (idServicio: number): Promise<{ url: string }> => {
  const { data } = await api.post<{ url: string }>("/pago/checkout", {
    id_servicio: idServicio,
  });
  return data;
};

// Obtener información de pago por servicio
export const obtenerPagoPorServicio = async (idServicio: number): Promise<PagoServicio | { estado: "sin_registro" }> => {
  const { data } = await api.get<PagoServicio | { estado: "sin_registro" }>(`/pago/servicio/${idServicio}`);
  return data;
};

