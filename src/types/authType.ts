
export type LoginRequest = {
    email: string;
    password: string;
  };
  
  export type RegisterRequest = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: "admin" | "cliente" | "tecnico";
  };
  
  export type UserDTO = {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    rol: string;
    estado: boolean;
    foto: string | null;
  };
  
  export type AuthResponse = {
    msg: string;
    token: string;
    refreshToken: string;
    usuario: UserDTO;
  };
  