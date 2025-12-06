import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../utils/socket";
import { listarNotificaciones, marcarLeida, eliminarNotificacion, type Notificacion } from "../../api/notificacion";
import { FaBell, FaTimes, FaCheck } from "react-icons/fa";

export const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarNotificaciones();
    conectarSocket();

    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await listarNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const conectarSocket = () => {
    const socket = getSocket();
    if (!socket) return;

    // Escuchar nuevas notificaciones
    socket.on("nuevaNotificacion", (notificacion: Notificacion) => {
      setNotificaciones((prev) => [notificacion, ...prev]);
    });
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leido: true } : n))
      );
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await eliminarNotificacion(id);
      setNotificaciones((prev) => prev.filter((n) => n.id_notificacion !== id));
    } catch (error) {
      console.error("Error eliminando notificación:", error);
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leido).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <FaBell className="text-xl" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
            {noLeidas > 0 && (
              <span className="text-sm text-gray-600">{noLeidas} no leídas</span>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : notificaciones.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay notificaciones</div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id_notificacion}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notificacion.leido ? "bg-blue-50" : ""
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{notificacion.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notificacion.cuerpo}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notificacion.fecha_envio).toLocaleString("es-BO")}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      {!notificacion.leido && (
                        <button
                          onClick={() => handleMarcarLeida(notificacion.id_notificacion)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Marcar como leída"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(notificacion.id_notificacion)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

