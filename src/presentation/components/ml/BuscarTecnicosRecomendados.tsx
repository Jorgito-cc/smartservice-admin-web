/**
 * Componente: BuscarTecnicosRecomendados
 * 
 * Muestra una lista de técnicos recomendados por el modelo ML para una solicitud
 * Permite filtrar, ordenar y seleccionar técnicos
 */

import React, { useEffect, useState } from "react";
import { Star, MapPin, Zap, TrendingUp, AlertTriangle, Loader } from "lucide-react";
import { obtenerTecnicosConRecomendaciones, verificarSaludML } from "../../../api/ml";
import { TecnicoConRecomendacion, MLServiceStatus } from "../../../types/ml";

interface Props {
  id_solicitud: number;
  onSelectTecnico?: (tecnico: TecnicoConRecomendacion) => void;
  mostrarDetalles?: boolean;
}

export const BuscarTecnicosRecomendados: React.FC<Props> = ({
  id_solicitud,
  onSelectTecnico,
  mostrarDetalles = true,
}) => {
  const [recomendaciones, setRecomendaciones] = useState<TecnicoConRecomendacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlStatus, setMlStatus] = useState<MLServiceStatus | null>(null);
  const [filtroOrden, setFiltroOrden] = useState<"score" | "distancia" | "rating">("score");

  // Cargar recomendaciones al montar
  useEffect(() => {
    const cargar = async () => {
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
        const tecnicosRecomendados = await obtenerTecnicosConRecomendaciones(id_solicitud);

        if (tecnicosRecomendados.length === 0) {
          setError("No hay técnicos disponibles para esta solicitud");
          setRecomendaciones([]);
        } else {
          setRecomendaciones(tecnicosRecomendados);
        }
      } catch (err) {
        console.error("[BuscarTecnicos] Error:", err);
        setError(`Error al obtener recomendaciones: ${err instanceof Error ? err.message : "Error desconocido"}`);
        setRecomendaciones([]);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id_solicitud]);

  // Ordenar recomendaciones
  const tecnicosOrdenados = [...recomendaciones].sort((a, b) => {
    switch (filtroOrden) {
      case "distancia":
        return (a.distancia_km || 0) - (b.distancia_km || 0);
      case "rating":
        return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
      case "score":
      default:
        return (b.score_recomendacion || 0) - (a.score_recomendacion || 0);
    }
  });

  // Renderizar contenido
  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin w-6 h-6 text-blue-500 mr-2" />
        <span className="text-gray-600">Generando recomendaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error en recomendaciones</h3>
            <p className="text-red-800 text-sm">{error}</p>
            {mlStatus && !mlStatus.disponible && (
              <p className="text-red-700 text-xs mt-2">
                💡 El servicio ML no está disponible. Se mostrarán todos los técnicos.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Técnicos Recomendados</h2>
          <p className="text-sm text-gray-600">
            {recomendaciones.length} técnico{recomendaciones.length !== 1 ? "s" : ""} disponible{recomendaciones.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Selector de orden */}
        <div>
          <select
            value={filtroOrden}
            onChange={(e) => setFiltroOrden(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="score">Mejor coincidencia</option>
            <option value="distancia">Más cercano</option>
            <option value="rating">Mejor calificado</option>
          </select>
        </div>
      </div>

      {/* Lista de técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tecnicosOrdenados.map((tecnico, index) => (
          <TarjetaTecnicoRecomendado
            key={tecnico.id_tecnico}
            tecnico={tecnico}
            onSelect={() => onSelectTecnico?.(tecnico)}
          />
        ))}
      </div>

      {/* Información de ML Service */}
      {mostrarDetalles && mlStatus && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p className="font-semibold">ℹ️ Información del servicio ML</p>
          <p>Estado: {mlStatus.disponible ? "✅ En línea" : "❌ Offline"}</p>
          <p>Modelos: {mlStatus.modelos_listos ? "✅ Listos" : "❌ No listos"}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Componente: TarjetaTecnicoRecomendado
 * Tarjeta individual de un técnico con detalles de recomendación
 */
interface TarjetaProps {
  tecnico: TecnicoConRecomendacion;
  onSelect: () => void;
}

const TarjetaTecnicoRecomendado: React.FC<TarjetaProps> = ({ tecnico, onSelect }) => {
  const scorePercentage = Math.min((tecnico.score_recomendacion / 100) * 100, 100);
  const ratingColor = tecnico.calificacion_promedio >= 4.5
    ? "text-yellow-500"
    : tecnico.calificacion_promedio >= 3.5
    ? "text-yellow-400"
    : "text-gray-400";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header: Foto + Nombre + Ranking */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {tecnico.foto ? (
            <img
              src={tecnico.foto}
              alt={tecnico.nombre}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
              {tecnico.nombre.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {tecnico.nombre} {tecnico.apellido}
            </h3>
            <p className="text-xs text-gray-500">{tecnico.email}</p>
          </div>
        </div>

        {/* Badge de ranking */}
        {tecnico.ranking <= 3 && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            #{tecnico.ranking}
          </div>
        )}
      </div>

      {/* Score de recomendación */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700">Compatibilidad ML</span>
          <span className="text-xs font-bold text-blue-600">{scorePercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Información de contacto y disponibilidad */}
      <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
        {/* Teléfono */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-xs mr-2">📱</span>
          <a href={`tel:${tecnico.telefono}`} className="text-blue-600 hover:underline">
            {tecnico.telefono}
          </a>
        </div>

        {/* Distancia */}
        {tecnico.distancia_km !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span>{tecnico.distancia_km.toFixed(1)} km de distancia</span>
          </div>
        )}

        {/* Disponibilidad */}
        <div className="flex items-center text-sm">
          <Zap className="w-4 h-4 mr-2" />
          <span className={tecnico.disponibilidad ? "text-green-600 font-semibold" : "text-gray-400"}>
            {tecnico.disponibilidad ? "✓ Disponible" : "✗ No disponible"}
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
        {/* Rating */}
        <div>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className={`w-4 h-4 ${ratingColor} fill-current`} />
          </div>
          <p className="font-semibold text-gray-900">{tecnico.calificacion_promedio.toFixed(1)}</p>
          <p className="text-gray-500">Rating</p>
        </div>

        {/* Experiencia */}
        <div>
          <TrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="font-semibold text-gray-900">
            {(tecnico.especialidades?.length || 0)}
          </p>
          <p className="text-gray-500">Especialidades</p>
        </div>

        {/* Servicios */}
        <div>
          <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
          <p className="font-semibold text-gray-900">{Math.floor(tecnico.calificacion_promedio || 0) * 5}</p>
          <p className="text-gray-500">Servicios</p>
        </div>
      </div>

      {/* Descripción + Razón de recomendación */}
      <div className="space-y-2 mb-3">
        {tecnico.descripcion && (
          <p className="text-xs text-gray-600 line-clamp-2">{tecnico.descripcion}</p>
        )}
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <p className="text-xs text-blue-800 font-semibold">
            💡 {tecnico.razon_recomendacion}
          </p>
        </div>
      </div>

      {/* Botón de selección */}
      <button
        onClick={onSelect}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Seleccionar técnico
      </button>
    </div>
  );
};
