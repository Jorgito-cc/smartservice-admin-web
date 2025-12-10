import { api } from "./axios";

export interface PagoServicio {
  id_pago: number;
  id_servicio: number;
  monto_total: number;
  comision_empresa: number;
  monto_tecnico: number;
  estado: "pendiente" | "pagado" | "cancelado" | "fallido";
  stripe_payment_id: string | null;
  fecha_pago: string | null;
  ServicioAsignado?: {
    id_servicio?: number;
    id_solicitud?: number;
    id_tecnico?: number;
    SolicitudServicio?: {
      Cliente?: {
        Usuario?: {
          nombre: string;
          apellido: string;
        };
      };
    };
    Tecnico?: {
      Usuario?: {
        nombre: string;
        apellido: string;
        email: string;
        foto?: string;
      };
    };
  };
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

// Listar todos los pagos (ADMIN)
export const listarTodosPagos = async (): Promise<PagoServicio[]> => {
  try {
    const { data } = await api.get<PagoServicio[]>("/pago/admin/listar", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data || [];
  } catch (error) {
    console.error("Error en listarTodosPagos:", error);
    // Fallback: intentar sin headers explícitos (axios los agrega automáticamente)
    try {
      const { data } = await api.get<PagoServicio[]>("/pago/admin/listar");
      return data || [];
    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError);
      return [];
    }
  }
};

