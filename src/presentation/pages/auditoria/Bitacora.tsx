import { useEffect, useState } from "react";
import { getAuditoriaLogs } from "../../../api/auditoria";
import type { AuditoriaLog } from "../../../types/auditoriaLogType";
import { FaExpand } from "react-icons/fa";
import { BitacoraAnalisis } from "./BitacoraAnalisis";

// Función para formatear la acción
const formatearAccion = (accion: string): string => {
  const metodoMap: { [key: string]: string } = {
    POST: "➕ Crear",
    PUT: "✏️ Actualizar",
    PATCH: "🔧 Modificar",
    DELETE: "🗑️ Eliminar",
    GET: "👁️ Consultar",
  };

  // Extraer método y ruta
  const [metodo, ...ruta] = accion.split(" ");
  const rutaCompleta = ruta.join(" ");

  // Obtener nombre amigable del recurso
  const recursos: { [key: string]: string } = {
    "/api/solicitudes": "Solicitud",
    "/api/categorias": "Categoría",
    "/api/usuarios": "Usuario",
    "/api/servicios": "Servicio",
    "/api/pagos": "Pago",
    "/api/calificaciones": "Calificación",
    "/api/ofertas": "Oferta",
    "/api/chat": "Mensaje",
  };

  let recurso = "Registro";
  for (const [ruta, nombre] of Object.entries(recursos)) {
    if (rutaCompleta.includes(ruta)) {
      recurso = nombre;
      break;
    }
  }

  const metodoFormato = metodoMap[metodo] || metodo;
  return `${metodoFormato} ${recurso}`;
};

// Función para formatear los detalles
const formatearDetalles = (detallesJson: string): string => {
  try {
    const detalles = JSON.parse(detallesJson);
    const resumen = [];

    // Mostrar solo información importante
    if (detalles.statusCode) {
      resumen.push(`Status: ${detalles.statusCode}`);
    }

    if (detalles.body && typeof detalles.body === "object") {
      const campos = Object.keys(detalles.body).length;
      resumen.push(`${campos} campo(s) modificado(s)`);
    }

    if (detalles.params && Object.keys(detalles.params).length > 0) {
      resumen.push(`Parámetros: ${Object.keys(detalles.params).join(", ")}`);
    }

    return resumen.length > 0 ? resumen.join(" | ") : "Sin detalles";
  } catch {
    return detallesJson.substring(0, 80) + "...";
  }
};

// Componente Modal para ver detalles completos
const DetallesModal = ({
  detalles,
  onClose,
}: {
  detalles: string;
  onClose: () => void;
}) => {
  const [parsed, setParsed] = useState<{
    statusCode?: number;
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    try {
      setParsed(JSON.parse(detalles));
    } catch {
      setParsed(null);
    }
  }, [detalles]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Detalles Completos</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {parsed ? (
            <div className="space-y-4">
              {parsed.statusCode && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Status Code
                  </h4>
                  <p className="text-sm mt-1 font-mono">{parsed.statusCode}</p>
                </div>
              )}

              {parsed.body && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Datos Enviados
                  </h4>
                  <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(parsed.body, null, 2)}
                  </pre>
                </div>
              )}

              {parsed.params && Object.keys(parsed.params).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Parámetros
                  </h4>
                  <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(parsed.params, null, 2)}
                  </pre>
                </div>
              )}

              {parsed.query && Object.keys(parsed.query).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                    Query
                  </h4>
                  <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(parsed.query, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No se pudo parsear los detalles
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Bitacora = () => {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetalles, setSelectedDetalles] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lista" | "analisis">("lista");

  const loadLogs = async () => {
    try {
      const data = await getAuditoriaLogs();
      setLogs(data);
    } catch (e) {
      console.error("Error cargando auditoría:", e);
      alert("Error cargando los logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) return <p className="p-6">Cargando bitácora...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        📘 Bitácora del Sistema
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("lista")}
          className={`px-4 py-2 font-semibold transition ${
            String(activeTab) === "lista"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
          }`}
        >
          📋 Bitácora
        </button>
        <button
          onClick={() => setActiveTab("analisis")}
          className={`px-4 py-2 font-semibold transition ${
            String(activeTab) === "analisis"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
          }`}
        >
          📊 Bitácora Análisis
        </button>
      </div>

      {/* Contenido de Tabs */}
      {String(activeTab) === "lista" ? (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead className="bg-indigo-600 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Resumen
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Ver Detalles
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {logs.map((log) => (
                  <tr
                    key={log.id_log}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(log.fecha).toLocaleString("es-BO")}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {log.Usuario?.nombre} {log.Usuario?.apellido}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {log.Usuario?.rol}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatearAccion(log.accion)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {formatearDetalles(log.detalles)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedDetalles(log.detalles)}
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                        title="Ver detalles completos"
                      >
                        <FaExpand /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay registros de auditoría disponibles
            </div>
          )}

          {selectedDetalles && (
            <DetallesModal
              detalles={selectedDetalles}
              onClose={() => setSelectedDetalles(null)}
            />
          )}
        </>
      ) : (
        <BitacoraAnalisis />
      )}
    </div>
  );
};
