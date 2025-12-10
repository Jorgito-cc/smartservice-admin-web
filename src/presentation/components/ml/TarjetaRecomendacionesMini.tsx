/**
 * TarjetaRecomendacionesMini
 * Componente para mostrar recomendaciones en el dashboard del cliente
 * Versión simplificada y visual
 */

import React, { useEffect, useState } from "react";
import { Star, MapPin, TrendingUp, Loader, AlertTriangle, Sparkles } from "lucide-react";
import { obtenerRecomendacionesTecnicos, verificarSaludML } from "../../../api/ml";
import type { TecnicoConRecomendacion } from "../../../types/ml";

interface Props {
  id_solicitud: number;
  onSelectTecnico?: (tecnico: TecnicoConRecomendacion) => void;
  maxMostrar?: number;
}

export const TarjetaRecomendacionesMini: React.FC<Props> = ({
  id_solicitud,
  onSelectTecnico,
  maxMostrar = 3,
}) => {
  const [tecnicos, setTecnicos] = useState<TecnicoConRecomendacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        // Verificar salud
        const health = await verificarSaludML();
        if (!health.modelo_disponible) {
          setError("Servicio de recomendaciones no disponible");
          return;
        }

        // Obtener recomendaciones
        const recomendaciones = await obtenerRecomendacionesTecnicos(id_solicitud);
        setTecnicos(recomendaciones.slice(0, maxMostrar));

        if (recomendaciones.length === 0) {
          setError("Sin técnicos disponibles");
        }
      } catch (err) {
        setError("Error cargando recomendaciones");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    if (id_solicitud) {
      cargar();
    }
  }, [id_solicitud, maxMostrar]);

  if (cargando) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-indigo-700 font-medium">Buscando técnicos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (tecnicos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Técnicos Recomendados ({tecnicos.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tecnicos.map((tecnico, idx) => (
          <div
            key={tecnico.id_tecnico}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
            onClick={() => onSelectTecnico?.(tecnico)}
          >
            {/* Header con foto y ranking */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tecnico.foto ? (
                  <img
                    src={tecnico.foto}
                    alt={tecnico.nombre}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {tecnico.nombre.charAt(0)}
                    {tecnico.apellido.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {tecnico.nombre} {tecnico.apellido}
                  </p>
                  {tecnico.especialidades.length > 0 && (
                    <p className="text-xs text-gray-600 truncate">
                      {tecnico.especialidades[0].nombre}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                #{idx + 1}
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500 font-semibold">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  {tecnico.calificacion_promedio.toFixed(1)}
                </div>
                <p className="text-gray-600">{tecnico.servicios_realizados} servicios</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-500 font-semibold">
                  <MapPin className="w-3 h-3" />
                  {tecnico.distancia_km.toFixed(1)}km
                </div>
                <p className="text-gray-600">Distancia</p>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-bold">
                  {(tecnico.score_recomendacion * 100).toFixed(0)}%
                </div>
                <p className="text-gray-600">Compatibilidad</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-gray-600 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Recomendado
              </div>
              {tecnico.disponibilidad && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Disponible
                </span>
              )}
            </div>

            {/* Botón de selección */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectTecnico?.(tecnico);
              }}
              className="w-full mt-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg transition-colors text-sm"
            >
              Ver Perfil
            </button>
          </div>
        ))}
      </div>

      {/* Link a ver todos */}
      <div className="text-center pt-2">
        <a
          href={`/cliente/solicitud/${id_solicitud}/recomendados`}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
        >
          Ver todos los técnicos recomendados →
        </a>
      </div>
    </div>
  );
};
