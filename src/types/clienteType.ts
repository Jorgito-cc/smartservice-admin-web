// src/types/clienteType.ts

export interface ClienteData {
  preferencia?: string | null;
}

export interface ClienteUsuario {
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
  rol: "cliente";
  Cliente: ClienteData;
  Tecnico: null;
  Admin: null;
}

export interface RespuestaClientes {
  total: number;
  usuarios: ClienteUsuario[];
}
