/**
 * Machine Learning Types & Interfaces
 * Integration con Flask ML Microservice para recomendaciones de técnicos
 */

// ============================================
// REQUEST TYPES (Lo que enviamos al ML)
// ============================================

/**
 * Solicitud para obtener recomendaciones de técnicos
 * Se envía al endpoint POST /api/ml/recomendar
 */
export interface MLRecomendacionRequest {
  /** ID de la solicitud de servicio */
  id_solicitud: number;
}

// ============================================
// RESPONSE TYPES (Lo que retorna el ML)
// ============================================

/**
 * Representa un técnico recomendado por el modelo ML
 * Incluye todas las características usadas en la predicción
 */
export interface TecnicoRecomendadoML {
  /** ID único del técnico */
  id_tecnico: number;

  /** Score predicho por el modelo XGBoost (mayor = mejor) */
  score: number;

  /** Distancia en km desde la ubicación del cliente */
  distancia_km: number;

  /** Rating promedio del técnico (1-5) */
  rating_promedio: number;

  /** Rating histórico agregado de todas las calificaciones */
  historico_rating: number;

  /** Cantidad total de calificaciones recibidas */
  cantidad_calificaciones: number;

  /** Precio promedio que cobra el técnico */
  precio_promedio: number;

  /** Total de ofertas que ha enviado */
  ofertas_totales: number;

  /** Cantidad de servicios realizados */
  servicios_realizados: number;

  /** Disponibilidad actual (1 = disponible, 0 = no disponible) */
  disponibilidad: number;
}

/**
 * Respuesta completa del servicio ML
 * Retorna lista de técnicos ordenados por score (mejores primero)
 */
export interface MLRecomendacionResponse {
  /** ID de la solicitud para la que se generaron recomendaciones */
  id_solicitud: number;

  /** Lista de técnicos recomendados ordenados por score (DESC) */
  tecnicos_recomendados: TecnicoRecomendadoML[];

  /** Total de técnicos recomendados disponibles */
  total: number;
}

/**
 * Estado de salud del servicio ML
 */
export interface MLHealthResponse {
  /** Estado general del servicio */
  status: "ok" | "error";

  /** Si el modelo de recomendación está cargado */
  modelo_cargado: boolean;

  /** Si el scaler de features está cargado */
  scaler_cargado: boolean;

  /** Si ambos están disponibles y el servicio está listo */
  modelo_disponible: boolean;
}

// ============================================
// DOMAIN INTEGRATION TYPES
// ============================================

/**
 * Técnico con información de recomendación
 * Combina datos del técnico con el score del ML
 */
export interface TecnicoConRecomendacion {
  /** ID del técnico */
  id_tecnico: number;

  /** ID del usuario */
  id_usuario: number;

  /** Nombre del técnico */
  nombre: string;

  /** Apellido del técnico */
  apellido: string;

  /** Email de contacto */
  email: string;

  /** Teléfono de contacto */
  telefono: string;

  /** URL o path de foto de perfil */
  foto: string | null;

  /** Rating promedio (1-5) */
  calificacion_promedio: number;

  /** Disponibilidad actual */
  disponibilidad: boolean;

  /** Descripción/biografía profesional */
  descripcion: string;

  /** Lista de especialidades */
  especialidades: Array<{
    id_especialidad?: number;
    nombre: string;
  }>;

  /** Score del modelo ML (0-100 aprox) */
  score_recomendacion: number;

  /** Ranking entre las recomendaciones (1 = mejor) */
  ranking: number;

  /** Distancia desde cliente (en km) */
  distancia_km: number;

  /** Explicación breve de por qué fue recomendado */
  razon_recomendacion: string;
}

// ============================================
// CACHE & STATE TYPES
// ============================================

/**
 * Caché de recomendaciones para evitar llamadas repetidas
 */
export interface RecomendacionesCache {
  /** ID de la solicitud */
  id_solicitud: number;

  /** Recomendaciones guardadas */
  recomendaciones: TecnicoConRecomendacion[];

  /** Timestamp de cuándo se generó */
  timestamp: number;

  /** Si ha expirado la caché */
  expirado: boolean;
}

/**
 * Estado del servicio ML para el frontend
 */
export interface MLServiceStatus {
  /** Si el servicio está disponible */
  disponible: boolean;

  /** Si los modelos están cargados */
  modelos_listos: boolean;

  /** Mensaje de error si hay problema */
  error?: string;

  /** Última vez que se verificó el estado */
  ultimo_check: number;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Error retornado por el servicio ML
 */
export interface MLErrorResponse {
  /** Mensaje de error */
  error: string;

  /** Mensaje adicional (ej: "El modelo no está entrenado") */
  message?: string;

  /** Código HTTP */
  status?: number;
}

// ============================================
// CONSTANTS
// ============================================

/** Duración de caché de recomendaciones en ms (10 minutos) */
export const ML_CACHE_DURATION = 10 * 60 * 1000;

/** Timeout para llamadas al servicio ML en ms */
export const ML_REQUEST_TIMEOUT = 30 * 1000;

/** Máximo de reintentosara llamadas al ML */
export const ML_MAX_RETRIES = 2;

/** Delay inicial para reintentos exponenciales (ms) */
export const ML_RETRY_DELAY = 1000;

/** Número de técnicos a mostrar de las recomendaciones */
export const ML_RECOMENDACIONES_LIMITE = 10;
