import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../utils/socket";
import { obtenerHistorialServicio, Mensaje } from "../../api/chat";
import { obtenerServicio, cambiarEstadoServicio, Servicio } from "../../api/servicio";
import { obtenerPagoPorServicio } from "../../api/pago";
import { useAuth } from "../../context/AuthContext";
import { FaPaperPlane, FaCheckCircle, FaClock, FaTools, FaCreditCard, FaStar } from "react-icons/fa";

interface ChatPrivadoProps {
  esCliente?: boolean;
}

export const ChatPrivado = ({ esCliente = false }: ChatPrivadoProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [pagoEstado, setPagoEstado] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    cargarDatos();
    conectarSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("nuevoMensaje");
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cargarDatos = async () => {
    if (!id) return;
    try {
      const [mensajesData, servicioData] = await Promise.all([
        obtenerHistorialServicio(Number(id)),
        obtenerServicio(Number(id)),
      ]);
      setMensajes(mensajesData);
      setServicio(servicioData);

      // Si es cliente, verificar estado del pago
      if (esCliente) {
        try {
          const pagoData = await obtenerPagoPorServicio(Number(id));
          if (pagoData && "estado" in pagoData) {
            setPagoEstado(pagoData.estado);
          }
        } catch (err) {
          console.error("Error cargando pago:", err);
        }
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const conectarSocket = () => {
    const socket = getSocket();
    if (!socket || !id) return;

    // Unirse al chat del servicio
    socket.emit("joinRoom", { id_servicio: Number(id) });

    // Escuchar nuevos mensajes
    socket.on("nuevoMensaje", (mensaje: Mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    });
  };

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !id || !user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("enviarMensaje", {
      id_servicio: Number(id),
      emisor_id: user.id_usuario,
      mensaje: nuevoMensaje.trim(),
    });

    setNuevoMensaje("");
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!id || cambiandoEstado) return;

    setCambiandoEstado(true);
    try {
      await cambiarEstadoServicio(Number(id), nuevoEstado);
      await cargarDatos();
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error al cambiar estado");
    } finally {
      setCambiandoEstado(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; icon: JSX.Element; text: string }> = {
      en_camino: {
        color: "bg-blue-100 text-blue-800",
        icon: <FaClock className="mr-1" />,
        text: "En Camino",
      },
      en_ejecucion: {
        color: "bg-purple-100 text-purple-800",
        icon: <FaTools className="mr-1" />,
        text: "Trabajando",
      },
      completado: {
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="mr-1" />,
        text: "Completado",
      },
    };

    return badges[estado] || badges.en_camino;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando chat...</div>
      </div>
    );
  }

  const badge = servicio ? getEstadoBadge(servicio.estado) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] bg-white rounded-lg shadow-lg">
      {/* Header con estado */}
      <div className="p-4 border-b bg-indigo-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Chat Privado</h2>
            <p className="text-sm text-gray-600">Servicio #{id}</p>
          </div>
          {servicio && badge && (
            <div className={`px-4 py-2 rounded-full flex items-center ${badge.color}`}>
              {badge.icon}
              <span className="ml-2 font-medium">{badge.text}</span>
            </div>
          )}
        </div>

        {/* Botones para cambiar estado (solo técnico) */}
        {!esCliente && servicio && servicio.estado !== "completado" && (
          <div className="mt-3 flex space-x-2">
            {servicio.estado === "en_camino" && (
              <button
                onClick={() => cambiarEstado("en_ejecucion")}
                disabled={cambiandoEstado}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {cambiandoEstado ? "Actualizando..." : "Marcar como Trabajando"}
              </button>
            )}
            {servicio.estado === "en_ejecucion" && (
              <button
                onClick={() => cambiarEstado("completado")}
                disabled={cambiandoEstado}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {cambiandoEstado ? "Actualizando..." : "Marcar como Completado"}
              </button>
            )}
          </div>
        )}

        {/* Botones de pago y calificación (solo cliente, servicio completado) */}
        {esCliente && servicio && servicio.estado === "completado" && (
          <div className="mt-3 flex space-x-2">
            {pagoEstado !== "pagado" && (
              <button
                onClick={() => navigate(`/cliente/servicio/${id}/pago`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
              >
                <FaCreditCard />
                Pagar Servicio
              </button>
            )}
            {pagoEstado === "pagado" && (
              <button
                onClick={() => navigate(`/cliente/servicio/${id}/calificar`)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm flex items-center gap-2"
              >
                <FaStar />
                Calificar Técnico
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.map((mensaje) => {
          const esMio = mensaje.emisor_id === user?.id_usuario;

          return (
            <div key={mensaje.id_mensaje} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-md rounded-lg p-3 ${
                  esMio ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {!esMio && (
                  <div className="text-xs font-semibold mb-1">
                    {mensaje.Usuario?.nombre} {mensaje.Usuario?.apellido}
                  </div>
                )}
                <div>{mensaje.mensaje}</div>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(mensaje.fecha).toLocaleTimeString("es-BO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={enviarMensaje}
            disabled={!nuevoMensaje.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            <FaPaperPlane className="mr-2" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

