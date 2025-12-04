export interface RegisterTecnicoDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  descripcion?: string;
  rol: "tecnico";
  foto?: string;
  ci: string;
  foto_ci?: string;
  calificacion_promedio?: number;
  especialidades: EspecialidadDTO[];
}
  export interface EspecialidadDTO {
  nombre: string;
  referencias: string;
  anio_experiencia: number;
}

export interface RespuestaRegister {
  msg: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    foto: string | null;
    estado: boolean;
    ci: string | null;
    foto_ci: string | null;
  };
}
