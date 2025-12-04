import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarSolicitudesDisponibles } from "../../../api/solicitud";
import type { Solicitud } from "../../../api/solicitud";
import { getSocket } from "../../../utils/socket";
import { FaEye, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

export const SolicitudesDisponiblesPage = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const socket = getSocket();

  useEffect(() => {
    cargarSolicitudes();

    if (socket) {
      socket.on("new_request", (nuevaSolicitud: Solicitud) => {
        setSolicitudes((prev) => [nuevaSolicitud, ...prev]);
        // Opcional: Mostrar notificación toast/sonido
      });

      return () => {
        socket.off("new_request");
      };
    }
  }, [socket]);

  const cargarSolicitudes = async () => {
    try {
      const data = await listarSolicitudesDisponibles();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando solicitudes disponibles...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Solicitudes Disponibles</h1>
        <button
          onClick={cargarSolicitudes}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Actualizar
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay solicitudes disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id_solicitud}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="mb-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {solicitud.categoria?.nombre || "Sin categoría"}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {solicitud.descripcion}
              </h3>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {solicitud.ubicacion_texto && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span className="truncate">{solicitud.ubicacion_texto}</span>
                  </div>
                )}
                {solicitud.precio_ofrecido && (
                  <div className="flex items-center">
                    <FaDollarSign className="mr-2 text-green-500" />
                    <span className="font-semibold text-green-600">
                      Precio ofrecido: {solicitud.precio_ofrecido} Bs.
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(solicitud.fecha_publicacion).toLocaleDateString("es-BO")}
                </div>
              </div>

              <button
                onClick={() => navigate(`/tecnico/solicitud/${solicitud.id_solicitud}/chat`)}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
              >
                <FaEye className="mr-2" />
                Ver y Responder
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

