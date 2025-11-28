import { api } from "./axios";

import type { RespuestaUsuarios } from "../types/usuarioType";

export const getAllUsuariosRequest = async () => {
  const res = await api.get<RespuestaUsuarios>("/auth/perfiles", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data.usuarios; // 👈 SOLO enviamos el array
};



export const activarTecnicoRequest = async (id: number) => {
    const res = await api.patch(`/auth/tecnico/activar/${id}`);
    return res.data;
  };
  
  export const desactivarTecnicoRequest = async (id: number) => {
    const res = await api.patch(`/auth/tecnico/desactivar/${id}`);
    return res.data;
  };