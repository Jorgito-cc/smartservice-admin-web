/**
 * EJEMPLO: Cómo integrar recomendaciones en MisSolicitudesPage
 * 
 * Este archivo muestra cómo mostrar recomendaciones directamente
 * en la lista de solicitudes del cliente
 */

// MisSolicitudesPage.tsx - EJEMPLO DE INTEGRACIÓN

import React, { useState } from "react";
import { useRecomendaciones } from "@/hooks/useRecomendaciones";
import { VisualizadorRecomendacionesRápido } from "@/presentation/components/ml/VisualizadorRecomendacionesRápido";
import { TarjetaRecomendacionesMini } from "@/presentation/components/ml/TarjetaRecomendacionesMini";
import { Solicitud } from "@/types/solicitud";

interface MisSolicitudesPageProps {
  solicitudes: Solicitud[];
}

export const MisSolicitudesPage: React.FC<MisSolicitudesPageProps> = ({ solicitudes }) => {
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Mis Solicitudes</h1>

      {/* OPCIÓN 1: Mostrar mini recomendaciones en cada card de solicitud */}
      <div className="grid gap-4">
        {solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{solicitud.descripcion}</h3>
                <p className="text-sm text-gray-600">Creada: {solicitud.fecha_creacion}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                solicitud.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {solicitud.estado}
              </span>
            </div>

            {/* Mini recomendaciones en cada solicitud */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-3">Técnicos Recomendados:</p>
              <TarjetaRecomendacionesMini
                id_solicitud={solicitud.id}
                maxMostrar={3}
                onSelectTecnico={(tecnico) => {
                  console.log("Técnico seleccionado:", tecnico);
                  // Aquí podrías abrir un modal o ir a otra página
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* OPCIÓN 2: Mostrar vista detallada en modal cuando se selecciona una solicitud */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              Solicitud #{solicitudSeleccionada}
            </h2>
            <MisSolicitudesConRecomendacionesDetalladas
              id_solicitud={solicitudSeleccionada}
              onClose={() => setSolicitudSeleccionada(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente para mostrar recomendaciones detalladas de una solicitud
 */
const MisSolicitudesConRecomendacionesDetalladas: React.FC<{
  id_solicitud: number;
  onClose: () => void;
}> = ({ id_solicitud, onClose }) => {
  const { tecnicos, loading, error } = useRecomendaciones(id_solicitud);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
        <p className="mt-4 text-gray-600">Cargando recomendaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        Error al cargar recomendaciones: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <VisualizadorRecomendacionesRápido
        tecnicos={tecnicos}
        loading={loading}
        onClose={onClose}
      />
    </div>
  );
};

/**
 * EJEMPLO: Dashboard con recomendaciones pinned
 */
export const DashboardConRecomendacionesPinned: React.FC = () => {
  const { tecnicos, loading } = useRecomendaciones(1); // Usar última solicitud

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Contenido principal */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Contenido del dashboard */}
      </div>

      {/* Sidebar con recomendaciones pinned */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>✨ Recomendados Hoy</span>
          </h2>
          <VisualizadorRecomendacionesRápido
            tecnicos={tecnicos}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * EJEMPLO: Solicitud expandible con recomendaciones
 */
export const SolicitudExpandible: React.FC<{ solicitud: Solicitud }> = ({
  solicitud,
}) => {
  const [expandida, setExpandida] = React.useState(false);
  const { tecnicos, loading } = useRecomendaciones(solicitud.id);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpandida(!expandida)}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 bg-white"
      >
        <div className="text-left">
          <h3 className="font-bold">{solicitud.descripcion}</h3>
          <p className="text-sm text-gray-600">{solicitud.fecha_creacion}</p>
        </div>
        <span className={`transform transition-transform ${expandida ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {expandida && (
        <div className="bg-gray-50 p-4 border-t">
          <VisualizadorRecomendacionesRápido
            tecnicos={tecnicos}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

/**
 * EJEMPLO: Grid de solicitudes con mini recomendaciones
 */
export const GridSolicitudesConMiniRecomendaciones: React.FC<{
  solicitudes: Solicitud[];
}> = ({ solicitudes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {solicitudes.map((solicitud) => (
        <div
          key={solicitud.id}
          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Card Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <h3 className="font-bold line-clamp-2">{solicitud.descripcion}</h3>
          </div>

          {/* Card Content */}
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-600">
              <p>Fecha: {solicitud.fecha_creacion}</p>
              <p>Estado: <span className="font-medium">{solicitud.estado}</span></p>
            </div>

            {/* Mini recomendaciones */}
            <div className="border-t pt-3">
              <TarjetaRecomendacionesMini
                id_solicitud={solicitud.id}
                maxMostrar={2}
              />
            </div>

            {/* Button */}
            <a
              href={`/cliente/solicitud/${solicitud.id}/recomendados`}
              className="block text-center py-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-medium"
            >
              Ver Detalles
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
