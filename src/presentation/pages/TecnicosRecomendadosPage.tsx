/**
 * TecnicosRecomendadosPage
 * Página para que el cliente visualice técnicos recomendados por el ML
 * para una solicitud específica
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Zap,
  TrendingUp,
  AlertTriangle,
  Loader,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { obtenerRecomendacionesTecnicos, verificarSaludML } from "../../api/ml";
import type { TecnicoConRecomendacion, MLServiceStatus } from "../../types/ml";

interface TecnicoConRanking extends TecnicoConRecomendacion {
  ranking: number;
}

export const TecnicosRecomendadosPage: React.FC = () => {
  const { id_solicitud } = useParams<{ id_solicitud: string }>();
  const navigate = useNavigate();

  const [tecnicos, setTecnicos] = useState<TecnicoConRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlStatus, setMlStatus] = useState<MLServiceStatus | null>(null);
  const [ordenarPor, setOrdenarPor] = useState<"score" | "distancia" | "calificacion">("score");
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    cargarRecomendaciones();
  }, [id_solicitud]);

  const cargarRecomendaciones = async () => {
    if (!id_solicitud) {
      setError("ID de solicitud no válido");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // Verificar estado del ML
      const health = await verificarSaludML();
      setMlStatus({
        disponible: health.status === "ok",
        modelos_listos: health.modelo_disponible,
        ultimo_check: Date.now(),
      });

      if (!health.modelo_disponible) {
        setError("El servicio de recomendaciones no está disponible en este momento");
        setTecnicos([]);
        return;
      }

      // Obtener recomendaciones
      const recomendaciones = await obtenerRecomendacionesTecnicos(parseInt(id_solicitud));

      if (recomendaciones.length === 0) {
        setError("No hay técnicos disponibles para esta solicitud");
        setTecnicos([]);
        return;
      }

      // Agregar ranking
      const conRanking = recomendaciones.map((t, idx) => ({
        ...t,
        ranking: idx + 1,
      }));

      setTecnicos(conRanking);
    } catch (err) {
      console.error("Error cargando recomendaciones:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener técnicos recomendados. Intenta nuevamente."
      );
      setTecnicos([]);
    } finally {
      setCargando(false);
    }
  };

  const tecnicosOrdenados = [...tecnicos].sort((a, b) => {
    switch (ordenarPor) {
      case "distancia":
        return a.distancia_km - b.distancia_km;
      case "calificacion":
        return b.calificacion_promedio - a.calificacion_promedio;
      case "score":
      default:
        return b.score_recomendacion - a.score_recomendacion;
    }
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando técnicos recomendados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Técnicos Recomendados
          </h1>
          <p className="text-gray-600">
            Estos técnicos fueron seleccionados por el sistema basado en ubicación,
            experiencia y calificaciones
          </p>
        </div>

        {/* Estado del ML */}
        {mlStatus && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              mlStatus.disponible
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <Zap
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                mlStatus.disponible ? "text-green-600" : "text-yellow-600"
              }`}
            />
            <div>
              <p
                className={`text-sm font-medium ${
                  mlStatus.disponible ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {mlStatus.disponible
                  ? "✅ Sistema de recomendaciones activo"
                  : "⚠️ Sistema de recomendaciones en revisión"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Última verificación: {new Date(mlStatus.ultimo_check).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={cargarRecomendaciones}
                className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Controles de ordenamiento */}
        {tecnicos.length > 0 && (
          <div className="mb-6 flex gap-3">
            <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="score">⭐ Puntuación ML</option>
              <option value="calificacion">🌟 Calificación</option>
              <option value="distancia">📍 Distancia</option>
            </select>
          </div>
        )}

        {/* Lista de técnicos */}
        <div className="space-y-4">
          {tecnicosOrdenados.map((tecnico) => (
            <div
              key={tecnico.id_tecnico}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              {/* Header del técnico */}
              <button
                onClick={() => setExpandido(expandido === tecnico.id_tecnico ? null : tecnico.id_tecnico)}
                className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 text-left">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {tecnico.foto ? (
                      <img
                        src={tecnico.foto}
                        alt={`${tecnico.nombre} ${tecnico.apellido}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {tecnico.nombre.charAt(0)}
                        {tecnico.apellido.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tecnico.nombre} {tecnico.apellido}
                      </h3>
                      {tecnico.disponibilidad && (
                        <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Disponible
                        </span>
                      )}
                    </div>

                    {/* Especialidades */}
                    {tecnico.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tecnico.especialidades.slice(0, 3).map((esp, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {esp.nombre}
                          </span>
                        ))}
                        {tecnico.especialidades.length > 3 && (
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            +{tecnico.especialidades.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    {/* Métricas principales */}
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {tecnico.calificacion_promedio.toFixed(1)}
                        </span>
                        <span className="text-gray-600">({tecnico.servicios_realizados})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-gray-900">
                          {tecnico.distancia_km.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-gray-900">
                          #{tecnico.ranking}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Puntuación: {(tecnico.score_recomendacion * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón expandir */}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    expandido === tecnico.id_tecnico ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Detalles expandibles */}
              {expandido === tecnico.id_tecnico && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
                  {/* Descripción */}
                  {tecnico.descripcion && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Acerca de
                      </h4>
                      <p className="text-sm text-gray-700">{tecnico.descripcion}</p>
                    </div>
                  )}

                  {/* Contacto */}
                  <div className="grid grid-cols-2 gap-4">
                    {tecnico.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a
                          href={`mailto:${tecnico.email}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {tecnico.email}
                        </a>
                      </div>
                    )}
                    {tecnico.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a
                          href={`tel:${tecnico.telefono}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {tecnico.telefono}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas completas */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {tecnico.ofertas_totales}
                      </p>
                      <p className="text-xs text-gray-600">Ofertas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {tecnico.servicios_realizados}
                      </p>
                      <p className="text-xs text-gray-600">Servicios</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {(tecnico.score_recomendacion * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600">Compatibilidad</p>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-4 border-t border-gray-300">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Ver Oferta o Crear Servicio
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {tecnicos.length === 0 && !cargando && !error && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">No hay técnicos disponibles en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};
