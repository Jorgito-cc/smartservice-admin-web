import { useEffect, useState } from "react";
import { FaSpinner, FaToggleOn, FaToggleOff, FaStar } from "react-icons/fa";
import { obtenerTodosTecnicos, activarTecnicoRequest, desactivarTecnicoRequest } from "../../../api/tecnicos";
import type { TecnicoCompleto } from "../../../api/tecnicos";

export const GestionTecnicos = () => {
  const [tecnicos, setTecnicos] = useState<TecnicoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTodosTecnicos();
      setTecnicos(data);
    } catch (err) {
      console.error("Error cargando técnicos", err);
      setError("Error al cargar los técnicos. Por favor, intenta de nuevo.");
      setTecnicos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const activar = async (id: number) => {
    try {
      await activarTecnicoRequest(id);
      cargarTecnicos();
    } catch (err) {
      console.error("Error activando técnico:", err);
      setError("Error al activar el técnico");
    }
  };

  const desactivar = async (id: number) => {
    try {
      await desactivarTecnicoRequest(id);
      cargarTecnicos();
    } catch (err) {
      console.error("Error desactivando técnico:", err);
      setError("Error al desactivar el técnico");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestión de Técnicos
      </h1>

      {tecnicos.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No hay técnicos registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tecnicos.map((t) => (
            <div
              key={t.id_tecnico}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              {/* Header: Nombre y Estado */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {t.nombre} {t.apellido}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ID: {t.id_tecnico}</p>
                </div>

                {/* Badge Estado */}
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  t.estado
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {t.estado ? "✓ Activo" : "✗ Deshabilitado"}
                </div>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email:</p>
                  <p className="text-gray-800 dark:text-gray-200">{t.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Teléfono:</p>
                  <p className="text-gray-800 dark:text-gray-200">{t.telefono || "No especificado"}</p>
                </div>
              </div>

              {/* Descripción */}
              {t.descripcion && (
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Descripción:</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{t.descripcion}</p>
                </div>
              )}

              {/* Stats: Calificación y Disponibilidad */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                <div className="text-center">
                  <div className="flex justify-center items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {t.calificacion_promedio ? parseFloat(t.calificacion_promedio as any).toFixed(2) : "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Calificación</p>
                </div>

                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    t.disponibilidad ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.disponibilidad ? "Disponible" : "Ocupado"}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Estado</p>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {t.especialidades.length}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Especialidades</p>
                </div>
              </div>

              {/* Especialidades */}
              {t.especialidades.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    Especialidades:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.especialidades.map((e) => (
                      <span
                        key={e.id_especialidad}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {e.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {t.estado ? (
                  <button
                    onClick={() => desactivar(t.id_usuario)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                  >
                    <FaToggleOff /> Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => activar(t.id_usuario)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                  >
                    <FaToggleOn /> Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
