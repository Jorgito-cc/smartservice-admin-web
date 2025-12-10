// src/types/tecnicoType.ts

export interface TecnicoData {
  descripcion?: string | null;
  calificacion_promedio?: string | number | null;
  disponibilidad?: boolean;
}

export interface TecnicoUsuario {
  id_usuario: number;
  nombre: string;
  ci?: string | null;
  apellido: string;
  email: string;
  telefono?: string | null;
  foto?: string | null;
  foto_ci?: string | null;
  estado: boolean;
  token_real?: string | null;
  rol: "tecnico";
  Cliente: null;
  Tecnico: TecnicoData;
  Admin: null;
}

export interface RespuestaTecnicos {
  total: number;
  usuarios: TecnicoUsuario[];
}
