export interface ClienteData {
    preferencia?: string | null;
  }
  
  export interface TecnicoData {
    descripcion?: string | null;
    calificacion_promedio?: number | null;
    disponibilidad?: boolean;
  }
  
  export interface AdminData {
    id_admin?: number;
  }
  export interface UsuarioType {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
    foto?: string | null;
    estado: boolean;
    rol: "admin" | "cliente" | "tecnico";
  
    token_real?: string | null;
  
    Cliente?: ClienteData | null;
    Tecnico?: TecnicoData | null;
    Admin?: AdminData | null;
  }
  
  export interface RespuestaUsuarios {
    total: number;
    usuarios: UsuarioType[];
  }
  