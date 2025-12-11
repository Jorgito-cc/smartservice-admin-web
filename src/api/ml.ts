/**
 * Machine Learning API Service
 * Gestiona la comunicación con el backend Node que actúa como proxy
 * hacia el servicio Flask ML
 */

import { api } from "./axios";
import type {
  MLRecomendacionRequest,
  MLHealthResponse,
  TecnicoConRecomendacion,
} from "../types/ml";
import {
  ML_REQUEST_TIMEOUT,
  ML_MAX_RETRIES,
  ML_RETRY_DELAY,
  ML_CACHE_DURATION,
} from "../types/ml";

/**
 * Obtiene recomendaciones de técnicos para una solicitud
 * El backend Node enriquece los datos del ML con info de técnico de la BD
 *
 * @param id_solicitud - ID de la solicitud de servicio
 * @returns Array de técnicos recomendados con datos completos ordenados por score
 * @throws Error si el servicio ML está unavailable
 */
export const obtenerRecomendacionesTecnicos = async (
  id_solicitud: number
): Promise<TecnicoConRecomendacion[]> => {
  let ultimoError: Error | null = null;

  for (let intento = 0; intento <= ML_MAX_RETRIES; intento++) {
    try {
      // Request al backend proxy
      const payload: MLRecomendacionRequest = { id_solicitud };
      
      console.log(`[Frontend ML] 📤 Enviando a Node.js:`);
      console.log(JSON.stringify(payload, null, 2));
      console.log(`[Frontend ML] Endpoint: POST /api/ml/recomendar`);
      
      const { data } = await api.post<{
        id_solicitud: number;
        tecnicos_recomendados: TecnicoConRecomendacion[];
        total: number;
      }>("/ml/recomendar", payload, {
        timeout: ML_REQUEST_TIMEOUT,
      });

      console.log(`[Frontend ML] ✅ Respuesta recibida de Node.js`);
      console.log(`[Frontend ML] 🔍 RESPUESTA COMPLETA:`);
      console.log(JSON.stringify(data, null, 2));

      // Respuesta enriquecida del backend con datos de técnico
      if (!data.tecnicos_recomendados || data.tecnicos_recomendados.length === 0) {
        console.warn(`[ML] Sin recomendaciones para solicitud ${id_solicitud}`);
        return [];
      }

      console.log(`[ML] ✅ Recomendaciones procesadas: ${data.total} técnicos`);
      console.log(`[ML] 📊 Técnicos recomendados:`, data.tecnicos_recomendados.map(t => ({
        id_tecnico: t.id_tecnico,
        nombre: t.nombre,
        score: t.score_recomendacion,
        distancia_km: t.distancia_km
      })));
      
      return data.tecnicos_recomendados;
    } catch (error) {
      ultimoError = error as Error;

      if (intento < ML_MAX_RETRIES) {
        // Esperar antes de reintentar (backoff exponencial)
        const delayMs = ML_RETRY_DELAY * Math.pow(2, intento);
        console.warn(
          `[ML] ⚠️ Reintentando en ${delayMs}ms... (intento ${intento + 1}/${ML_MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`[ML] Error después de ${ML_MAX_RETRIES} reintentos:`, error);
      }
    }
  }

  // Si llegamos aquí, todos los reintentos fallaron
  console.error("[ML] Servicio no disponible, retornando lista vacía");
  throw new Error(
    `ML Service unavailable: ${ultimoError?.message || "Unknown error"}`
  );
};

/**
 * Verifica la salud del servicio ML
 * Útil para mostrar warnings si el ML está down
 *
 * @returns Estado actual del servicio ML
 */
export const verificarSaludML = async (): Promise<MLHealthResponse> => {
  try {
    const { data } = await api.get<MLHealthResponse>("/ml/health", {
      timeout: 5000, // Timeout más corto para health check
    });
    return data;
  } catch (error) {
    console.error("[ML] Error en health check:", error);
    return {
      status: "error",
      modelo_cargado: false,
      scaler_cargado: false,
      modelo_disponible: false,
    };
  }
};

/**
 * Obtiene información del modelo entrenado
 * @returns Metadata del modelo
 */
export const obtenerInfoModelo = async () => {
  try {
    const { data } = await api.get("/ml/info");
    return data;
  } catch (error) {
    console.error("[ML] Error obteniendo info del modelo:", error);
    throw error;
  }
};

// --- Simple caché en memoria para recomendaciones (exportado para hooks que lo usan)
type CacheEntry = {
  recomendaciones: TecnicoConRecomendacion[];
  timestamp: number;
};

const _cache = new Map<number, CacheEntry>();

export const recomendacionesCache = {
  async obtener(id_solicitud: number): Promise<TecnicoConRecomendacion[]> {
    const entry = _cache.get(id_solicitud);
    const ahora = Date.now();
    if (entry && ahora - entry.timestamp < ML_CACHE_DURATION) {
      return entry.recomendaciones;
    }
    // Si no hay cache o está expirado, obtener desde la API y guardar
    const datos = await obtenerRecomendacionesTecnicos(id_solicitud);
    _cache.set(id_solicitud, { recomendaciones: datos, timestamp: ahora });
    return datos;
  },
  limpiar(id_solicitud: number) {
    _cache.delete(id_solicitud);
  },
  limpiarTodos() {
    _cache.clear();
  },
};

// Alias de compatibilidad: algunos hooks/componentes importan este nombre
export const obtenerTecnicosConRecomendaciones = obtenerRecomendacionesTecnicos;

// Re-export tipos
export type { TecnicoConRecomendacion, MLHealthResponse };
