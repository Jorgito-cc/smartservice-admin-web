import { api } from "./axios";

export interface PagoServicio {
  id_pago: number;
  id_servicio: number;
  monto_total: number;
  comision_empresa: number;
  monto_tecnico: number;
  estado: "pendiente" | "pagado" | "cancelado";
  metodo_pago?: "tarjeta" | "qr" | "efectivo" | "movil";
  stripe_payment_id: string | null;
  fecha_pago: string | null;
}

// Crear checkout de Stripe o registrar pago con otro método
export const crearCheckout = async (
  idServicio: number,
  metodoPago: "tarjeta" | "qr" | "efectivo" | "movil" = "tarjeta"
): Promise<{ url?: string; msg?: string; pago?: any; requiere_confirmacion?: boolean }> => {
  const { data } = await api.post("/pago/checkout", {
    id_servicio: idServicio,
    metodo_pago: metodoPago,
  });
  return data;
};

// Obtener información de pago por servicio
export const obtenerPagoPorServicio = async (idServicio: number): Promise<PagoServicio | { estado: "sin_registro" }> => {
  const { data } = await api.get<PagoServicio | { estado: "sin_registro" }>(`/pago/servicio/${idServicio}`);
  return data;
};

