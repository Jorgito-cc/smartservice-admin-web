export interface RegisterTecnicoDTO {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string | null;
    descripcion?: string | null;
    foto?: string | null;
    rol: "tecnico";
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
    };
  }
  