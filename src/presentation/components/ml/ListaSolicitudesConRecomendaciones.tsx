/**
 * ListaSolicitudesConRecomendaciones
 * 
 * Muestra las solicitudes del cliente con opción de ver recomendaciones
 * Integra el componente TarjetaRecomendacionesMini
 */

import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { TarjetaRecomendacionesMini } from "../../components/ml/TarjetaRecomendacionesMini";
import type { TecnicoConRecomendacion } from "../../../types/ml";

interface Solicitud {
  id_solicitud: number;
  descripcion: string;
  categoria?: string;
  estado?: string;
  fecha_creacion?: string;
}

interface Props {
  solicitudes: Solicitud[];
}

export const ListaSolicitudesConRecomendaciones: React.FC<Props> = ({ solicitudes }) => {
  const [expandido, setExpandido] = useState<number | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);

  const handleVerRecomendaciones = (solicitud: Solicitud) => {
    setExpandido(expandido === solicitud.id_solicitud ? null : solicitud.id_solicitud);
  };

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <div key={solicitud.id_solicitud} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Encabezado de solicitud */}
          <button
            onClick={() => handleVerRecomendaciones(solicitud)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900">{solicitud.categoria || "Solicitud"}</h3>
              <p className="text-sm text-gray-600 mt-1">{solicitud.descripcion}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{solicitud.estado || "Activa"}</span>
                <span>{solicitud.fecha_creacion || new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Indicador de ML */}
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">ML</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandido === solicitud.id_solicitud ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Contenido expandido con recomendaciones */}
          {expandido === solicitud.id_solicitud && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <TarjetaRecomendacionesMini
                id_solicitud={solicitud.id_solicitud}
                maxMostrar={3}
                onSelectTecnico={(tecnico) => {
                  console.log("Técnico seleccionado:", tecnico);
                  // Aquí puedes manejar la selección
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
