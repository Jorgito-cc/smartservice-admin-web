import { api } from "./axios";

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

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/reportes/dashboard");
  return data;
};

export const getIngresosPorZona = async (
  periodo: "semana" | "mes" | "trimestral" = "mes"
): Promise<IngresosPorZona> => {
  const { data } = await api.get("/reportes/ingresos-por-zona", {
    params: { periodo },
  });
  return data;
};

export const getClientesRecurrentes = async (): Promise<{
  clientes: ClienteRecurrente[];
}> => {
  const { data } = await api.get("/reportes/clientes-recurrentes");
  return data;
};

export const getTecnicosDestacados = async (): Promise<{
  tecnicos: TecnicoDestacado[];
}> => {
  const { data } = await api.get("/reportes/tecnicos-destacados");
  return data;
};

