import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/axios";
import { FaEye, FaSpinner } from "react-icons/fa";
import ReassignModal from "./ReassignModal";

type Status = "pendiente" | "asignado" | "en_proceso" | "finalizado" | "cancelado";

interface Solicitud {
  id_solicitud: number;
  id_cliente: number;
  id_categoria: number;
  descripcion: string;
  ubicacion_texto: string;
  precio_ofrecido?: number;
  estado: Status;
  fecha_publicacion: string;
  Cliente?: {
    Usuario?: {
      nombre: string;
      apellido: string;
    };
  };
  Categoria?: {
    nombre: string;
  };
  ServicioAsignado?: {
    id_tecnico: number;
    Tecnico?: {
      nombre: string;
      apellido: string;
    };
  };
}

const statusMap: Record<Status, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  en_proceso: "En Proceso",
  finalizado: "Finalizado",
  cancelado: "Cancelado"
};

export const RequestListPage = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status>("pendiente");
  const [selectedRequest, setSelectedRequest] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      // Endpoint para admin que lista todas las solicitudes
      const { data } = await api.get<Solicitud[]>("/solicitud/admin/listar");
      setSolicitudes(data);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = solicitudes.filter((s) => s.estado === selectedStatus);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "asignado":
      case "en_proceso":
        return "bg-blue-100 text-blue-700";
      case "finalizado":
        return "bg-green-100 text-green-700";
      case "cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestión de Solicitudes
      </h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {(["pendiente", "asignado", "en_proceso", "finalizado", "cancelado"] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${selectedStatus === s
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
          >
            {statusMap[s]} ({solicitudes.filter(sol => sol.estado === s).length})
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No hay solicitudes con estado "{statusMap[selectedStatus]}"
                </td>
              </tr>
            ) : (
              filtered.map((solicitud) => (
                <tr
                  key={solicitud.id_solicitud}
                  className="border-b dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 font-medium">#{solicitud.id_solicitud}</td>
                  <td className="px-4 py-3">
                    {solicitud.Cliente?.Usuario?.nombre} {solicitud.Cliente?.Usuario?.apellido}
                  </td>
                  <td className="px-4 py-3">{solicitud.Categoria?.nombre || "N/A"}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={solicitud.descripcion}>
                    {solicitud.descripcion}
                  </td>
                  <td className="px-4 py-3">
                    {solicitud.ServicioAsignado?.Tecnico
                      ? `${solicitud.ServicioAsignado.Tecnico.nombre} ${solicitud.ServicioAsignado.Tecnico.apellido}`
                      : "Sin asignar"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(solicitud.fecha_publicacion).toLocaleDateString("es-BO")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(
                        solicitud.estado
                      )}`}
                    >
                      {statusMap[solicitud.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/solicitud/${solicitud.id_solicitud}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition inline-flex items-center gap-2"
                    >
                      <FaEye /> Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <ReassignModal
          request={selectedRequest as any}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
