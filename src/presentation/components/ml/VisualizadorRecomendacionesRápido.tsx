/**
 * VisualizadorRecomendacionesRápido
 * 
 * Componente para mostrar recomendaciones de forma rápida y visual
 * Se puede usar en cualquier página
 */

import React, { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TecnicoConRecomendacion } from "../../../types/ml";

interface Props {
  tecnicos: TecnicoConRecomendacion[];
  loading?: boolean;
  onClose?: () => void;
}

export const VisualizadorRecomendacionesRápido: React.FC<Props> = ({
  tecnicos,
  loading = false,
  onClose,
}) => {
  const [indiceActual, setIndiceActual] = useState(0);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="font-semibold">Buscando técnicos recomendados...</p>
        </div>
      </div>
    );
  }

  if (tecnicos.length === 0) {
    return null;
  }

  const tecnico = tecnicos[indiceActual];
  const avance = ((indiceActual + 1) / tecnicos.length) * 100;

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-2xl border border-indigo-200">
      {/* Botón cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white rounded-full transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {/* Contenido */}
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Técnico Recomendado</h2>
          <span className="ml-auto text-sm font-medium text-gray-600">
            {indiceActual + 1} de {tecnicos.length}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
            style={{ width: `${avance}%` }}
          />
        </div>

        {/* Tarjeta del técnico */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Foto */}
          <div className="flex-shrink-0">
            {tecnico.foto ? (
              <img
                src={tecnico.foto}
                alt={`${tecnico.nombre} ${tecnico.apellido}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                {tecnico.nombre.charAt(0)}
                {tecnico.apellido.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900">
              {tecnico.nombre} {tecnico.apellido}
            </h3>

            {/* Especialidades */}
            {tecnico.especialidades.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tecnico.especialidades.slice(0, 2).map((esp, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {esp.nombre}
                  </span>
                ))}
                {tecnico.especialidades.length > 2 && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    +{tecnico.especialidades.length - 2} más
                  </span>
                )}
              </div>
            )}

            {/* Métricas principales */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-2xl font-bold text-yellow-500">
                  ⭐ {tecnico.calificacion_promedio.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">{tecnico.servicios_realizados} servicios</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-500">
                  📍 {tecnico.distancia_km.toFixed(1)}km
                </p>
                <p className="text-xs text-gray-600">Distancia</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">
                  {(tecnico.score_recomendacion * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600">Compatibilidad</p>
              </div>
            </div>

            {/* Descripción */}
            {tecnico.descripcion && (
              <p className="mt-4 text-sm text-gray-700 italic">
                "{tecnico.descripcion.substring(0, 100)}..."
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {tecnico.disponibilidad && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ✓ Disponible
                </span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Oferta #{tecnico.ofertas_totales}
              </span>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="border-t border-indigo-200 pt-4 flex flex-col sm:flex-row gap-3">
          {tecnico.email && (
            <a
              href={`mailto:${tecnico.email}`}
              className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-center transition-colors"
            >
              📧 Enviar Email
            </a>
          )}
          {tecnico.telefono && (
            <a
              href={`tel:${tecnico.telefono}`}
              className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-center transition-colors"
            >
              📱 Llamar
            </a>
          )}
          <a
            href={`/cliente/solicitud/1/recomendados`}
            className="flex-1 py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-center transition-colors"
          >
            👁️ Ver Más
          </a>
        </div>

        {/* Navegación */}
        {tecnicos.length > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-indigo-200">
            <button
              onClick={() => setIndiceActual((prev) => (prev - 1 + tecnicos.length) % tecnicos.length)}
              className="p-2 hover:bg-white rounded-full transition-colors border border-indigo-200"
              title="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-indigo-600" />
            </button>

            <div className="flex gap-2">
              {tecnicos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndiceActual(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === indiceActual ? "bg-indigo-600 w-8" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  title={`Ir a técnico ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setIndiceActual((prev) => (prev + 1) % tecnicos.length)}
              className="p-2 hover:bg-white rounded-full transition-colors border border-indigo-200"
              title="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-indigo-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
