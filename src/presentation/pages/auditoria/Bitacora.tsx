import { useEffect, useState } from "react";
import { getAuditoriaLogs } from "../../../api/auditoria";
import type { AuditoriaLog } from "../../../types/auditoriaLogType";

export const Bitacora = () => {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Cargando bitácora...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📘 Bitácora del Sistema</h1>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Acción</th>
            <th className="p-2 border">Detalles</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id_log} className="hover:bg-gray-50">
              <td className="border p-2">
                {new Date(log.fecha).toLocaleString()}
              </td>

              <td className="border p-2">
                {log.Usuario?.nombre} {log.Usuario?.apellido}
              </td>

              <td className="border p-2">{log.Usuario?.rol}</td>

              <td className="border p-2">{log.accion}</td>

              <td className="border p-2 text-xs max-w-sm break-words">
                {log.detalles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
