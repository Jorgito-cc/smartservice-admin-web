import { api } from "./axios";

export interface KPIs {
  total_servicios: number;
  servicios_completados: number;
  total_ingresos: string;
  total_clientes: number;
  total_tecnicos: number;
  tasa_completacion: string;
}

export interface ServicioPorCategoria {
  categoria: string;
  total: number;
}

export interface Ingreso {
  fecha: string;
  total: number;
  comision: number;
  monto_tecnico: number;
}

export interface TecnicoTop {
  id_tecnico: number;
  nombre: string;
  apellido: string;
  foto?: string | null;
  total_servicios: number;
  calificacion: number;
}

export interface DashboardStats {
  servicios: {
    total: number;
    mes: number;
    semana: number;
    porEstado: Array<{ estado: string; cantidad: number }>;
  };
  tecnicos: {
    total: number;
    activos: number;
  };
  clientes: {
    total: number;
  };
  ingresos: {
    total: number;
    mes: number;
  };
  topTecnicos: Array<{
    id_tecnico: number;
    nombre: string;
    apellido: string;
    foto: string | null;
    total_servicios: number;
  }>;
}

export interface IngresosPorZona {
  periodo: string;
  datos: Array<{ zona: string; ingresos: number }>;
}

export interface ClienteRecurrente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface TecnicoDestacado {
  id_tecnico: number;
  nombre: string;
  apellido: string;
  foto: string | null;
  calificacion: number;
  total_servicios: number;
}

// KPIs generales
export const getKPIs = async (): Promise<KPIs> => {
  try {
    const { data } = await api.get<KPIs>("/reportes/resumen-general");
    return data;
  } catch (error) {
    console.error("Error obteniendo KPIs:", error);
    return {
      total_servicios: 0,
      servicios_completados: 0,
      total_ingresos: "0",
      total_clientes: 0,
      total_tecnicos: 0,
      tasa_completacion: "0",
    };
  }
};

// Servicios por categoría
export const getServiciosPorCategoria = async (): Promise<ServicioPorCategoria[]> => {
  try {
    const { data } = await api.get<ServicioPorCategoria[]>("/reportes/servicios-por-categoria");
    return data || [];
  } catch (error) {
    console.error("Error obteniendo servicios por categoría:", error);
    return [];
  }
};

// Ingresos por período
export const getIngresosPorPeriodo = async (): Promise<Ingreso[]> => {
  try {
    const { data } = await api.get<Ingreso[]>("/reportes/ingresos");
    return data || [];
  } catch (error) {
    console.error("Error obteniendo ingresos por período:", error);
    return [];
  }
};

// Técnicos top
export const getTecnicosTop = async (): Promise<TecnicoTop[]> => {
  try {
    const { data } = await api.get<TecnicoTop[]>("/reportes/tecnicos-top");
    return data || [];
  } catch (error) {
    console.error("Error obteniendo técnicos top:", error);
    // Fallback: intentar con endpoint alternativo
    try {
      const { data: dashData } = await api.get<DashboardStats>("/reportes/dashboard");
      return dashData?.topTecnicos?.map((t) => ({
        id_tecnico: t.id_tecnico,
        nombre: t.nombre,
        apellido: t.apellido,
        foto: t.foto,
        total_servicios: t.total_servicios,
        calificacion: 0,
      })) || [];
    } catch (fallbackError) {
      console.error("Error en fallback de técnicos top:", fallbackError);
      return [];
    }
  }
};

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const { data } = await api.get("/reportes/dashboard");
    return data;
  } catch (error) {
    console.error("Error obteniendo dashboard stats:", error);
    return {
      servicios: {
        total: 0,
        mes: 0,
        semana: 0,
        porEstado: [],
      },
      tecnicos: {
        total: 0,
        activos: 0,
      },
      clientes: {
        total: 0,
      },
      ingresos: {
        total: 0,
        mes: 0,
      },
      topTecnicos: [],
    };
  }
};

// Ingresos por Zona
export const getIngresosPorZona = async (
  periodo: "semana" | "mes" | "trimestral" = "mes"
): Promise<IngresosPorZona> => {
  try {
    const { data } = await api.get("/reportes/ingresos-por-zona", {
      params: { periodo },
    });
    return data;
  } catch (error) {
    console.error("Error obteniendo ingresos por zona:", error);
    return {
      periodo,
      datos: [],
    };
  }
};

// Clientes Recurrentes
export const getClientesRecurrentes = async (): Promise<{
  clientes: ClienteRecurrente[];
}> => {
  try {
    const { data } = await api.get("/reportes/clientes-recurrentes");
    return data;
  } catch (error) {
    console.error("Error obteniendo clientes recurrentes:", error);
    return { clientes: [] };
  }
};

// Técnicos Destacados
export const getTecnicosDestacados = async (): Promise<{
  tecnicos: TecnicoDestacado[];
}> => {
  try {
    const { data } = await api.get("/reportes/tecnicos-destacados");
    return data;
  } catch (error) {
    console.error("Error obteniendo técnicos destacados:", error);
    return { tecnicos: [] };
  }
};

