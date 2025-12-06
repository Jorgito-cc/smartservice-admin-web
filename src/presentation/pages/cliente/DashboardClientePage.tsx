import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarSolicitudesCliente, type Solicitud } from "../../../api/solicitud";
import { FaPlusCircle, FaComments, FaCheckCircle, FaClock } from "react-icons/fa";

export const DashboardClientePage = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const data = await listarSolicitudesCliente();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    } finally {
      setLoading(false);
    }
  };

  const activas = solicitudes.filter((s) => ["pendiente", "con_ofertas", "asignado", "en_proceso"].includes(s.estado));
  const completadas = solicitudes.filter((s) => s.estado === "completado");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={cargarSolicitudes}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <FaClock className={loading ? "animate-spin" : ""} />
            {loading ? "..." : "Actualizar"}
          </button>
          <button
            onClick={() => navigate("/cliente/solicitar")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
          >
            <FaPlusCircle className="mr-2" />
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Solicitudes Activas</p>
              <p className="text-3xl font-bold text-indigo-600">{activas.length}</p>
            </div>
            <FaComments className="text-4xl text-indigo-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completadas</p>
              <p className="text-3xl font-bold text-green-600">{completadas.length}</p>
            </div>
            <FaCheckCircle className="text-4xl text-green-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-600">{solicitudes.length}</p>
            </div>
            <FaClock className="text-4xl text-gray-300" />
          </div>
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Solicitudes Recientes</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes solicitudes aún</p>
            <button
              onClick={() => navigate("/cliente/solicitar")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Crear Primera Solicitud
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudes.slice(0, 5).map((solicitud) => (
              <div
                key={solicitud.id_solicitud}
                className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/cliente/solicitud/${solicitud.id_solicitud}/chat`)}
              >
                <div>
                  <p className="font-medium text-gray-800">{solicitud.categoria?.nombre}</p>
                  <p className="text-sm text-gray-600 truncate max-w-md">{solicitud.descripcion}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${solicitud.estado === "completado" ? "bg-green-100 text-green-800" :
                  solicitud.estado === "asignado" || solicitud.estado === "en_proceso" ? "bg-blue-100 text-blue-800" :
                    solicitud.estado === "con_ofertas" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                  }`}>
                  {solicitud.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

