import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarSolicitudesCliente, Solicitud } from "../../../api/solicitud";
import { FaEye, FaComments, FaCheckCircle, FaClock } from "react-icons/fa";

export const MisSolicitudesPage = () => {
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

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; icon: JSX.Element; text: string }> = {
      pendiente: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <FaClock className="mr-1" />,
        text: "Pendiente",
      },
      con_ofertas: {
        color: "bg-blue-100 text-blue-800",
        icon: <FaComments className="mr-1" />,
        text: "Con Ofertas",
      },
      asignado: {
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="mr-1" />,
        text: "Asignado",
      },
      en_proceso: {
        color: "bg-purple-100 text-purple-800",
        icon: <FaClock className="mr-1" />,
        text: "En Proceso",
      },
      completado: {
        color: "bg-gray-100 text-gray-800",
        icon: <FaCheckCircle className="mr-1" />,
        text: "Completado",
      },
    };

    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Solicitudes</h1>
        <button
          onClick={() => navigate("/cliente/solicitar")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Nueva Solicitud
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No tienes solicitudes aún</p>
          <button
            onClick={() => navigate("/cliente/solicitar")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Crear Primera Solicitud
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => {
            const badge = getEstadoBadge(solicitud.estado);
            return (
              <div
                key={solicitud.id_solicitud}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {solicitud.categoria?.nombre || "Sin categoría"}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${badge.color}`}>
                        {badge.icon}
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{solicitud.descripcion}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {new Date(solicitud.fecha_publicacion).toLocaleDateString("es-BO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {solicitud.precio_ofrecido && (
                        <span className="font-semibold text-indigo-600">
                          Precio ofrecido: {solicitud.precio_ofrecido} Bs.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {solicitud.estado === "con_ofertas" && (
                      <button
                        onClick={() => navigate(`/cliente/solicitud/${solicitud.id_solicitud}/ofertas`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Ver Ofertas
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/cliente/solicitud/${solicitud.id_solicitud}/chat`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
                    >
                      <FaEye className="mr-2" />
                      Ver Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

