import {api} from "./axios";

export const activarTecnicoRequest = async (id: number) => {
  const res = await api.patch(`/auth/tecnico/activar/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

export const desactivarTecnicoRequest = async (id: number) => {
  const res = await api.patch(`/auth/tecnico/desactivar/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};
