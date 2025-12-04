import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../utils/socket";
import { obtenerHistorialGrupal, Mensaje } from "../../api/chat";
import { aceptarOferta } from "../../api/servicio";
import { useAuth } from "../../context/AuthContext";
import { FaPaperPlane, FaDollarSign, FaCheck } from "react-icons/fa";

interface ChatGrupalProps {
  esCliente?: boolean;
}

export const ChatGrupal = ({ esCliente = false }: ChatGrupalProps) => {
  const { id } = useParams<{ id: string }>();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [mostrarFormOferta, setMostrarFormOferta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aceptando, setAceptando] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    cargarMensajes();
    conectarSocket();

    return () => {
      // Limpiar listeners al desmontar
      const socket = getSocket();
      if (socket) {
        socket.off("nuevoMensajeGrupal");
        socket.off("servicioAsignado");
        socket.off("expulsarDelChat");
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cargarMensajes = async () => {
    if (!id) return;
    try {
      const data = await obtenerHistorialGrupal(Number(id));
      setMensajes(data);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    } finally {
      setLoading(false);
    }
  };

  const conectarSocket = () => {
    const socket = getSocket();
    if (!socket) return;

    // Unirse al chat grupal
    socket.emit("joinSolicitudChat", { id_solicitud: Number(id) });

    // Escuchar nuevos mensajes
    socket.on("nuevoMensajeGrupal", (mensaje: Mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    });

    // Si es cliente, escuchar cuando se asigna servicio
    if (esCliente) {
      socket.on("servicioAsignado", (data: { id_servicio: number }) => {
        navigate(`/cliente/servicio/${data.id_servicio}/chat`);
      });
    }

    // Si es técnico, escuchar si es expulsado
    if (!esCliente) {
      socket.on("expulsarDelChat", (data: { id_tecnico: number; motivo: string }) => {
        if (data.id_tecnico === user?.id_usuario) {
          alert(data.motivo || "El servicio fue asignado a otro técnico");
          navigate("/tecnico/solicitudes");
        }
      });
    }
  };

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !id || !user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("enviarMensajeGrupal", {
      id_solicitud: Number(id),
      emisor_id: user.id_usuario,
      mensaje: nuevoMensaje.trim(),
      precio: null,
    });

    setNuevoMensaje("");
  };

  const enviarOferta = () => {
    if (!precioOferta || !id || !user) return;

    const precio = parseFloat(precioOferta);
    if (isNaN(precio) || precio <= 0) {
      alert("Ingresa un precio válido");
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit("enviarMensajeGrupal", {
      id_solicitud: Number(id),
      emisor_id: user.id_usuario,
      mensaje: nuevoMensaje.trim() || `Oferta: ${precio} Bs.`,
      precio: precio,
    });

    setNuevoMensaje("");
    setPrecioOferta("");
    setMostrarFormOferta(false);
  };

  const aceptarOfertaMensaje = async (idMensaje: number) => {
    if (!id || aceptando) return;

    setAceptando(idMensaje);
    try {
      // Buscar la oferta correspondiente al mensaje
      const mensaje = mensajes.find((m) => m.id_mensaje === idMensaje);
      if (!mensaje || !mensaje.precio) {
        alert("No se pudo encontrar la oferta");
        return;
      }

      // Obtener la oferta desde la API
      const { listarOfertasPorSolicitud } = await import("../../api/oferta");
      const ofertas = await listarOfertasPorSolicitud(Number(id));
      const oferta = ofertas.find(
        (o) => o.id_tecnico === mensaje.emisor_id && o.precio === mensaje.precio
      );

      if (!oferta) {
        alert("No se pudo encontrar la oferta");
        return;
      }

      // Aceptar oferta
      const response = await aceptarOferta(oferta.id_oferta);
      navigate(`/cliente/servicio/${response.servicio.id_servicio}/chat`);
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error al aceptar oferta");
    } finally {
      setAceptando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-indigo-50">
        <h2 className="text-xl font-semibold text-gray-800">Chat Grupal</h2>
        <p className="text-sm text-gray-600">Solicitud #{id}</p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.map((mensaje) => {
          const esMio = mensaje.emisor_id === user?.id_usuario;
          const esOferta = mensaje.es_oferta || mensaje.precio !== null;

          return (
            <div
              key={mensaje.id_mensaje}
              className={`flex ${esMio ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md rounded-lg p-3 ${
                  esMio
                    ? "bg-indigo-600 text-white"
                    : esOferta
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {!esMio && (
                  <div className="text-xs font-semibold mb-1">
                    {mensaje.Usuario?.nombre} {mensaje.Usuario?.apellido}
                  </div>
                )}
                {esOferta && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">
                      <FaDollarSign className="inline mr-1" />
                      {mensaje.precio} Bs.
                    </span>
                    {esCliente && !esMio && (
                      <button
                        onClick={() => aceptarOfertaMensaje(mensaje.id_mensaje)}
                        disabled={aceptando === mensaje.id_mensaje}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <FaCheck className="mr-1" />
                        {aceptando === mensaje.id_mensaje ? "Aceptando..." : "Aceptar"}
                      </button>
                    )}
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
        {mostrarFormOferta && !esCliente && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de la oferta (Bs.)
            </label>
            <input
              type="number"
              value={precioOferta}
              onChange={(e) => setPrecioOferta(e.target.value)}
              placeholder="Ej: 30.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <div className="flex space-x-2">
              <button
                onClick={enviarOferta}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Enviar Oferta
              </button>
              <button
                onClick={() => {
                  setMostrarFormOferta(false);
                  setPrecioOferta("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {!esCliente && (
            <button
              onClick={() => setMostrarFormOferta(!mostrarFormOferta)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaDollarSign className="mr-2" />
              Oferta
            </button>
          )}
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !mostrarFormOferta && enviarMensaje()}
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

