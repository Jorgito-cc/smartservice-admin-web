// src/api/categoria.ts
import { api } from "./axios";
import type { CategoriaType } from "../types/categoriaType";

// Obtener todas las categorías (público)
export const getCategoriasRequest = async (): Promise<CategoriaType[]> => {
  const { data } = await api.get("/categorias");
  return data;
};

// Obtener una categoría por ID (público)
export const getCategoriaByIdRequest = async (id: number): Promise<CategoriaType> => {
  const { data } = await api.get(`/categorias/${id}`);
  return data;
};

// Crear categoría (solo admin)
export const createCategoriaRequest = async (payload: Partial<CategoriaType>) => {
  const { data } = await api.post("/categorias", payload);
  return data;
};

// Actualizar categoría (solo admin)
export const updateCategoriaRequest = async (id: number, payload: Partial<CategoriaType>) => {
  const { data } = await api.put(`/categorias/${id}`, payload);
  return data;
};

// Eliminar categoría (solo admin)
export const deleteCategoriaRequest = async (id: number) => {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
};
