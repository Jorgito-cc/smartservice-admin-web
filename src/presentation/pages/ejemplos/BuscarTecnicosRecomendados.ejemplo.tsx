/**
 * Ejemplo: Página de Búsqueda de Técnicos con Recomendaciones ML
 * 
 * Este archivo muestra cómo integrar las recomendaciones ML
 * en una página real de la aplicación
 */

import React, { useState } from "react";
import { BuscarTecnicosRecomendados } from "@/presentation/components/ml/BuscarTecnicosRecomendados";
import { useRecomendacionesTecnicos, useSaludML } from "@/hooks/useML";
import { TecnicoConRecomendacion } from "@/types/ml";

/**
 * Ejemplo 1: Usar el componente completo (más simple)
 */
export const BuscarTecnicosPage_Ejemplo1 = () => {
  const [id_solicitud] = useState(123); // Viene de props o URL
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<TecnicoConRecomendacion | null>(null);

  const handleSelectTecnico = (tecnico: TecnicoConRecomendacion) => {
    setTecnicoSeleccionado(tecnico);
    console.log("Técnico seleccionado:", tecnico);

    // Aquí puedes redirigir a página de ofertas, etc.
    // navigate(`/ofertas/${tecnico.id_tecnico}`, { state: { solicitud: id_solicitud } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Buscar Técnicos</h1>
          <p className="text-gray-600 mt-2">
            El sistema de IA analiza automáticamente tus necesidades y recomienda los mejores técnicos
          </p>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Recomendaciones */}
          <div className="lg:col-span-2">
            <BuscarTecnicosRecomendados
              id_solicitud={id_solicitud}
              onSelectTecnico={handleSelectTecnico}
              mostrarDetalles={true}
            />
          </div>

          {/* Columna derecha: Técnico seleccionado */}
          {tecnicoSeleccionado && (
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Técnico Seleccionado</h3>

              <div className="space-y-4">
                {/* Foto */}
                {tecnicoSeleccionado.foto ? (
                  <img
                    src={tecnicoSeleccionado.foto}
                    alt={tecnicoSeleccionado.nombre}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-600">
                      {tecnicoSeleccionado.nombre.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Nombre */}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {tecnicoSeleccionado.nombre} {tecnicoSeleccionado.apellido}
                  </h4>
                  <p className="text-gray-500">{tecnicoSeleccionado.email}</p>
                </div>

                {/* Contacto */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Teléfono:</strong>
                  </p>
                  <a
                    href={`tel:${tecnicoSeleccionado.telefono}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {tecnicoSeleccionado.telefono}
                  </a>
                </div>

                {/* Rating */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Calificación:</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-500">
                      ⭐ {tecnicoSeleccionado.calificacion_promedio.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">/5.0</span>
                  </div>
                </div>

                {/* Score ML */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Compatibilidad ML:</strong>
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                        style={{ width: `${Math.min(tecnicoSeleccionado.score_recomendacion, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.min(tecnicoSeleccionado.score_recomendacion, 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Distancia */}
                {tecnicoSeleccionado.distancia_km !== undefined && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Distancia:</strong>
                    </p>
                    <p className="font-semibold text-gray-900">
                      📍 {tecnicoSeleccionado.distancia_km.toFixed(1)} km
                    </p>
                  </div>
                )}

                {/* Especialidades */}
                {tecnicoSeleccionado.especialidades && tecnicoSeleccionado.especialidades.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Especialidades:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tecnicoSeleccionado.especialidades.map((esp, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {esp.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {tecnicoSeleccionado.descripcion && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Acerca de:</strong>
                    </p>
                    <p className="text-gray-700 text-sm">{tecnicoSeleccionado.descripcion}</p>
                  </div>
                )}

                {/* Razón de recomendación */}
                <div className="border-t pt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 <strong>{tecnicoSeleccionado.razon_recomendacion}</strong>
                  </p>
                </div>

                {/* Botones */}
                <div className="border-t pt-4 space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Enviar Oferta
                  </button>
                  <button
                    onClick={() => setTecnicoSeleccionado(null)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                  >
                    Ver Otros Técnicos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Ejemplo 2: Usar hooks personalizados para más control
 */
export const BuscarTecnicosPage_Ejemplo2 = () => {
  const [id_solicitud] = useState(123);
  const { recomendaciones, cargando, error, mlStatus, recargar } = useRecomendacionesTecnicos({
    id_solicitud,
    usarCache: true,
  });

  const [orden, setOrden] = useState<"score" | "distancia" | "rating">("score");

  // Ordenar
  const recomendacionesOrdenadas = [...recomendaciones].sort((a, b) => {
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

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Técnicos Recomendados</h2>

        {/* Indicador de salud */}
        {mlStatus && (
          <div className="text-sm">
            {mlStatus.disponible ? (
              <span className="text-green-600 font-semibold">✅ Servicio ML activo</span>
            ) : (
              <span className="text-red-600 font-semibold">⚠️ Servicio ML offline</span>
            )}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-6">
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="score">Mejor compatibilidad</option>
          <option value="distancia">Más cercano</option>
          <option value="rating">Mejor calificado</option>
        </select>

        <button
          onClick={recargar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Recargar
        </button>
      </div>

      {/* Contenido */}
      {cargando && <p className="text-center py-8">Cargando recomendaciones...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      )}

      {!cargando && !error && recomendacionesOrdenadas.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hay técnicos disponibles</p>
      )}

      {!cargando && !error && recomendacionesOrdenadas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recomendacionesOrdenadas.map((tecnico) => (
            <div key={tecnico.id_tecnico} className="bg-gray-50 p-4 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg">
                {tecnico.nombre} {tecnico.apellido}
              </h3>
              <p className="text-sm text-gray-600">{tecnico.email}</p>

              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <strong>Score:</strong> {tecnico.score_recomendacion.toFixed(1)}/100
                </p>
                <p>
                  <strong>Rating:</strong> ⭐ {tecnico.calificacion_promedio.toFixed(1)}/5.0
                </p>
                <p>
                  <strong>Distancia:</strong> 📍 {(tecnico.distancia_km || 0).toFixed(1)} km
                </p>
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Ejemplo 3: Monitorear salud del servicio ML
 */
export const EstadoMLService = () => {
  const { status, modeloCargado, scalerCargado, disponible, ultimoCheck, verificar } = useSaludML();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Estado del Servicio ML</h3>
        <button onClick={verificar} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Verificar
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          Estado:{" "}
          {disponible ? (
            <span className="text-green-600 font-bold">✅ Activo</span>
          ) : (
            <span className="text-red-600 font-bold">❌ Inactivo</span>
          )}
        </p>
        <p>Modelo: {modeloCargado ? "✅ Cargado" : "❌ No cargado"}</p>
        <p>Scaler: {scalerCargado ? "✅ Cargado" : "❌ No cargado"}</p>
        {ultimoCheck && (
          <p className="text-gray-500">
            Última verificación: {new Date(ultimoCheck).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Ejemplo de uso completo en una página
 */
export const PaginaPrincipalConML = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">SmartService</h1>
          <p className="text-gray-600">Conectando clientes con técnicos especializados</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna principal: Recomendaciones */}
          <div className="lg:col-span-3">
            <BuscarTecnicosPage_Ejemplo1 />
          </div>

          {/* Sidebar: Estado ML */}
          <aside className="space-y-6">
            <EstadoMLService />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaginaPrincipalConML;
