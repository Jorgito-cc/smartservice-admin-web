/**
 * Hook: useRecomendacionesTecnicos
 * 
 * Simplifica el uso de recomendaciones ML en componentes
 * Maneja loading, errores y caché automáticamente
 */

import { useState, useEffect, useCallback } from "react";
import { TecnicoConRecomendacion, MLServiceStatus } from "../types/ml";
import {
  obtenerTecnicosConRecomendaciones,
  verificarSaludML,
  recomendacionesCache,
} from "../api/ml";

interface UseRecomendacionesOptions {
  /** ID de la solicitud para obtener recomendaciones */
  id_solicitud: number;

  /** Si usar caché (por defecto: true) */
  usarCache?: boolean;

  /** Callback cuando las recomendaciones se cargan */
  onSuccess?: (datos: TecnicoConRecomendacion[]) => void;

  /** Callback cuando hay error */
  onError?: (error: Error) => void;

  /** Auto-cargar al montar el componente (por defecto: true) */
  autoCargar?: boolean;
}

interface UseRecomendacionesResult {
  /** Array de técnicos recomendados */
  recomendaciones: TecnicoConRecomendacion[];

  /** Si está cargando recomendaciones */
  cargando: boolean;

  /** Mensaje de error si ocurrió alguno */
  error: Error | null;

  /** Estado del servicio ML */
  mlStatus: MLServiceStatus | null;

  /** Función para recargar recomendaciones manualmente */
  recargar: () => Promise<void>;

  /** Función para limpiar caché */
  limpiarCache: () => void;
}

/**
 * Hook para obtener recomendaciones de técnicos
 * 
 * @example
 * const { recomendaciones, cargando, error } = useRecomendacionesTecnicos({
 *   id_solicitud: 123,
 *   usarCache: true
 * });
 */
export const useRecomendacionesTecnicos = (
  options: UseRecomendacionesOptions
): UseRecomendacionesResult => {
  const {
    id_solicitud,
    usarCache = true,
    onSuccess,
    onError,
    autoCargar = true,
  } = options;

  const [recomendaciones, setRecomendaciones] = useState<TecnicoConRecomendado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mlStatus, setMlStatus] = useState<MLServiceStatus | null>(null);

  // Función principal de carga
  const cargarRecomendaciones = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      // Verificar salud del ML
      const health = await verificarSaludML();
      setMlStatus({
        disponible: health.status === "ok",
        modelos_listos: health.modelo_disponible,
        ultimo_check: Date.now(),
      });

      // Obtener recomendaciones
      let datos: TecnicoConRecomendacion[];

      if (usarCache) {
        datos = await recomendacionesCache.obtener(id_solicitud);
      } else {
        datos = await obtenerTecnicosConRecomendaciones(id_solicitud);
      }

      setRecomendaciones(datos);

      // Callback de éxito
      if (onSuccess) {
        onSuccess(datos);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      setError(error);

      // Callback de error
      if (onError) {
        onError(error);
      }

      console.error("[useRecomendacionesTecnicos] Error:", error);
    } finally {
      setCargando(false);
    }
  }, [id_solicitud, usarCache, onSuccess, onError]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoCargar) {
      cargarRecomendaciones();
    }
  }, [autoCargar, cargarRecomendaciones]);

  // Recargar manualmente
  const recargar = useCallback(async () => {
    // Limpiar caché antes de recargar
    if (usarCache) {
      recomendacionesCache.limpiar(id_solicitud);
    }
    await cargarRecomendaciones();
  }, [cargarRecomendaciones, id_solicitud, usarCache]);

  // Limpiar caché
  const limpiarCache = useCallback(() => {
    recomendacionesCache.limpiar(id_solicitud);
  }, [id_solicitud]);

  return {
    recomendaciones,
    cargando,
    error,
    mlStatus,
    recargar,
    limpiarCache,
  };
};

// ============================================
// Hook: useSaludML
// ============================================

interface UseSaludMLResult {
  /** Estado del servicio */
  status: "ok" | "error" | "checking";

  /** Si el modelo está cargado */
  modeloCargado: boolean;

  /** Si el scaler está cargado */
  scalerCargado: boolean;

  /** Si está todo disponible */
  disponible: boolean;

  /** Última verificación */
  ultimoCheck: number | null;

  /** Función para verificar nuevamente */
  verificar: () => Promise<void>;
}

/**
 * Hook para monitorear la salud del servicio ML
 * 
 * @example
 * const { disponible, status } = useSaludML();
 * if (!disponible) {
 *   return <p>Servicio ML no disponible</p>;
 * }
 */
export const useSaludML = (): UseSaludMLResult => {
  const [status, setStatus] = useState<"ok" | "error" | "checking">("checking");
  const [modeloCargado, setModeloCargado] = useState(false);
  const [scalerCargado, setScalerCargado] = useState(false);
  const [ultimoCheck, setUltimoCheck] = useState<number | null>(null);

  const verificar = useCallback(async () => {
    setStatus("checking");
    try {
      const health = await verificarSaludML();
      setStatus(health.status);
      setModeloCargado(health.modelo_cargado);
      setScalerCargado(health.scaler_cargado);
      setUltimoCheck(Date.now());
    } catch (error) {
      setStatus("error");
      setModeloCargado(false);
      setScalerCargado(false);
      setUltimoCheck(Date.now());
      console.error("[useSaludML] Error:", error);
    }
  }, []);

  // Verificar al montar
  useEffect(() => {
    verificar();

    // Verificar cada 30 segundos
    const interval = setInterval(verificar, 30000);
    return () => clearInterval(interval);
  }, [verificar]);

  return {
    status,
    modeloCargado,
    scalerCargado,
    disponible: status === "ok" && modeloCargado && scalerCargado,
    ultimoCheck,
    verificar,
  };
};

// ============================================
// Hook: useSeleccionarTecnico
// ============================================

interface UseSeleccionarTecnicoResult {
  /** Técnico actualmente seleccionado */
  tecnicoSeleccionado: TecnicoConRecomendacion | null;

  /** Score del técnico seleccionado */
  scoreSeleccionado: number | null;

  /** Ranking del técnico seleccionado */
  rankingSeleccionado: number | null;

  /** Función para seleccionar un técnico */
  seleccionar: (tecnico: TecnicoConRecomendacion) => void;

  /** Función para deseleccionar */
  deseleccionar: () => void;
}

/**
 * Hook para manejar la selección de un técnico
 * 
 * @example
 * const { tecnicoSeleccionado, seleccionar } = useSeleccionarTecnico();
 */
export const useSeleccionarTecnico = (): UseSeleccionarTecnicoResult => {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<TecnicoConRecomendacion | null>(null);

  const seleccionar = useCallback((tecnico: TecnicoConRecomendacion) => {
    setTecnicoSeleccionado(tecnico);
    console.log(`[useSeleccionarTecnico] Seleccionado: ${tecnico.nombre} (Score: ${tecnico.score_recomendacion})`);
  }, []);

  const deseleccionar = useCallback(() => {
    setTecnicoSeleccionado(null);
  }, []);

  return {
    tecnicoSeleccionado,
    scoreSeleccionado: tecnicoSeleccionado?.score_recomendacion || null,
    rankingSeleccionado: tecnicoSeleccionado?.ranking || null,
    seleccionar,
    deseleccionar,
  };
};

// ============================================
// Hook: useFiltrarRecomendaciones
// ============================================

interface UseFiltrarRecomendacionesOptions {
  /** Array de técnicos a filtrar */
  recomendaciones: TecnicoConRecomendacion[];

  /** Orden inicial (score, distancia, rating) */
  ordenInicial?: "score" | "distancia" | "rating";

  /** Filtro inicial de distancia máxima (km) */
  distanciaMaximaInicial?: number;

  /** Filtro inicial de rating mínimo */
  ratingMinimoInicial?: number;
}

interface UseFiltrarRecomendacionesResult {
  /** Técnicos filtrados y ordenados */
  filtrados: TecnicoConRecomendacion[];

  /** Orden actual */
  orden: "score" | "distancia" | "rating";

  /** Cambiar orden */
  setOrden: (o: "score" | "distancia" | "rating") => void;

  /** Distancia máxima */
  distanciaMaxima: number | null;

  /** Cambiar distancia máxima */
  setDistanciaMaxima: (d: number | null) => void;

  /** Rating mínimo */
  ratingMinimo: number | null;

  /** Cambiar rating mínimo */
  setRatingMinimo: (r: number | null) => void;

  /** Limpiar todos los filtros */
  limpiarFiltros: () => void;
}

/**
 * Hook para filtrar y ordenar recomendaciones
 * 
 * @example
 * const { filtrados, orden, setOrden } = useFiltrarRecomendaciones({
 *   recomendaciones,
 *   ordenInicial: "score"
 * });
 */
export const useFiltrarRecomendaciones = (
  options: UseFiltrarRecomendacionesOptions
): UseFiltrarRecomendacionesResult => {
  const {
    recomendaciones,
    ordenInicial = "score",
    distanciaMaximaInicial,
    ratingMinimoInicial,
  } = options;

  const [orden, setOrden] = useState<"score" | "distancia" | "rating">(ordenInicial);
  const [distanciaMaxima, setDistanciaMaxima] = useState<number | null>(distanciaMaximaInicial || null);
  const [ratingMinimo, setRatingMinimo] = useState<number | null>(ratingMinimoInicial || null);

  // Filtrar y ordenar
  const filtrados = recomendaciones
    .filter((t) => {
      // Filtro de distancia
      if (distanciaMaxima !== null && (t.distancia_km || 0) > distanciaMaxima) {
        return false;
      }

      // Filtro de rating
      if (ratingMinimo !== null && (t.calificacion_promedio || 0) < ratingMinimo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (orden) {
        case "distancia":
          return (a.distancia_km || 0) - (b.distancia_km || 0);
        case "rating":
          return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
        case "score":
        default:
          return (b.score_recomendacion || 0) - (a.score_recomendacion || 0);
      }
    });

  const limpiarFiltros = useCallback(() => {
    setOrden(ordenInicial);
    setDistanciaMaxima(null);
    setRatingMinimo(null);
  }, [ordenInicial]);

  return {
    filtrados,
    orden,
    setOrden,
    distanciaMaxima,
    setDistanciaMaxima,
    ratingMinimo,
    setRatingMinimo,
    limpiarFiltros,
  };
};
