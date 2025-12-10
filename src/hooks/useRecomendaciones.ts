/**
 * Hook para consumir recomendaciones del ML
 * Uso: const { tecnicos, loading, error } = useRecomendaciones(id_solicitud)
 */

import { useState, useEffect, useCallback } from "react";
import { obtenerRecomendacionesTecnicos, verificarSaludML } from "../api/ml";
import type { TecnicoConRecomendacion, MLServiceStatus } from "../types/ml";

interface UseRecomendacionesReturn {
  tecnicos: TecnicoConRecomendacion[];
  loading: boolean;
  error: string | null;
  mlStatus: MLServiceStatus | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y gestionar recomendaciones de técnicos
 * @param id_solicitud - ID de la solicitud
 * @param autoFetch - Si debe cargar automáticamente al montar (default: true)
 */
export const useRecomendaciones = (
  id_solicitud: number,
  autoFetch = true
): UseRecomendacionesReturn => {
  const [tecnicos, setTecnicos] = useState<TecnicoConRecomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlStatus, setMlStatus] = useState<MLServiceStatus | null>(null);

  const fetch = useCallback(async () => {
    if (!id_solicitud) {
      setError("ID de solicitud inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar salud del ML
      const health = await verificarSaludML();
      setMlStatus({
        disponible: health.status === "ok",
        modelos_listos: health.modelo_disponible,
        ultimo_check: Date.now(),
      });

      if (!health.modelo_disponible) {
        setError("El servicio de recomendaciones no está disponible");
        setTecnicos([]);
        return;
      }

      // Obtener recomendaciones
      const recomendaciones = await obtenerRecomendacionesTecnicos(id_solicitud);
      setTecnicos(recomendaciones);

      if (recomendaciones.length === 0) {
        setError("No hay técnicos disponibles para esta solicitud");
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error obteniendo recomendaciones: ${mensaje}`);
      setTecnicos([]);
    } finally {
      setLoading(false);
    }
  }, [id_solicitud]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [id_solicitud, autoFetch, fetch]);

  return {
    tecnicos,
    loading,
    error,
    mlStatus,
    refetch: fetch,
  };
};

// ============================================
// Hook para filtrar recomendaciones
// ============================================

interface UseFilterRecomendacionesOptions {
  ordenarPor?: "score" | "distancia" | "calificacion";
  limitar?: number;
  filtroEspecialidad?: string;
}

/**
 * Hook para filtrar y ordenar recomendaciones
 */
export const useFiltrarRecomendaciones = (
  tecnicos: TecnicoConRecomendacion[],
  opciones: UseFilterRecomendacionesOptions = {}
) => {
  const {
    ordenarPor = "score",
    limitar = 10,
    filtroEspecialidad = "",
  } = opciones;

  return tecnicos
    .filter((t) => {
      if (!filtroEspecialidad) return true;
      return t.especialidades.some((e) =>
        e.nombre.toLowerCase().includes(filtroEspecialidad.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case "distancia":
          return a.distancia_km - b.distancia_km;
        case "calificacion":
          return b.calificacion_promedio - a.calificacion_promedio;
        case "score":
        default:
          return b.score_recomendacion - a.score_recomendacion;
      }
    })
    .slice(0, limitar);
};

// ============================================
// Hook para seleccionar técnico
// ============================================

interface UseSeleccionarTecnicoReturn {
  seleccionado: TecnicoConRecomendacion | null;
  seleccionar: (tecnico: TecnicoConRecomendacion) => void;
  deseleccionar: () => void;
}

/**
 * Hook para manejar selección de un técnico
 */
export const useSeleccionarTecnico = (): UseSeleccionarTecnicoReturn => {
  const [seleccionado, setSeleccionado] = useState<TecnicoConRecomendacion | null>(null);

  return {
    seleccionado,
    seleccionar: (tecnico) => setSeleccionado(tecnico),
    deseleccionar: () => setSeleccionado(null),
  };
};

// ============================================
// Hook para estadísticas de recomendaciones
// ============================================

interface RecomendacionesStats {
  total: number;
  promedioCaliificacion: number;
  distanciaPromedio: number;
  scorePromedio: number;
  masExperimentado: TecnicoConRecomendacion | null;
  masCercano: TecnicoConRecomendacion | null;
}

/**
 * Hook para calcular estadísticas de las recomendaciones
 */
export const useEstadisticasRecomendaciones = (
  tecnicos: TecnicoConRecomendacion[]
): RecomendacionesStats => {
  if (tecnicos.length === 0) {
    return {
      total: 0,
      promedioCaliificacion: 0,
      distanciaPromedio: 0,
      scorePromedio: 0,
      masExperimentado: null,
      masCercano: null,
    };
  }

  const total = tecnicos.length;
  const promedioCaliificacion =
    tecnicos.reduce((sum, t) => sum + t.calificacion_promedio, 0) / total;
  const distanciaPromedio =
    tecnicos.reduce((sum, t) => sum + t.distancia_km, 0) / total;
  const scorePromedio =
    tecnicos.reduce((sum, t) => sum + t.score_recomendacion, 0) / total;

  const masExperimentado = [...tecnicos].sort(
    (a, b) => b.servicios_realizados - a.servicios_realizados
  )[0];

  const masCercano = [...tecnicos].sort(
    (a, b) => a.distancia_km - b.distancia_km
  )[0];

  return {
    total,
    promedioCaliificacion,
    distanciaPromedio,
    scorePromedio,
    masExperimentado,
    masCercano,
  };
};
