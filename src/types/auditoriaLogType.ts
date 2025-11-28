export interface AuditoriaUsuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  }
  
  export interface AuditoriaLog {
    id_log: number;
    usuario_id: number;
    accion: string;
    fecha: string;
    detalles: string;
    Usuario: AuditoriaUsuario;
  }
  