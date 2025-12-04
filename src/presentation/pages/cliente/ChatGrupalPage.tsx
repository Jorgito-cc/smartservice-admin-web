import { useState, useEffect, useRef } from "react";
import { api } from "../../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getSocket } from "../../../utils/socket";
import { FaPaperPlane } from "react-icons/fa";

type Mensaje = {
  id_mensaje?: number;
  emisor_id: number;
  mensaje: string;
  precio?: number;
  es_oferta: boolean;
  emisor?: {
    nombre: string;
    apellido: string;
    foto: string | null;
    rol: string;
  };
  createdAt?: string;
};

export const ChatGrupalPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    // Cargar historial de mensajes
    const cargarHistorial = async () => {
      try {
        const { data } = await api.get(`/chat/solicitud/${id}`);
        setMensajes(data);
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    };

    if (id) {
      cargarHistorial();
    }

    if (socket && id) {
      // Unirse a la sala de la solicitud
      socket.emit("joinSolicitudChat", { id_solicitud: id });

      // Escuchar nuevos mensajes
      socket.on("nuevoMensajeGrupal", (msg: Mensaje) => {
        setMensajes((prev) => [...prev, msg]);
      });

      // Escuchar nuevas ofertas (si vienen por otro evento, aunque el chat las maneja)
      socket.on("new_offer", (oferta: any) => {
        // Las ofertas también se muestran como mensajes
        const msgOferta: Mensaje = {
          emisor_id: oferta.id_tecnico,
          mensaje: oferta.mensaje,
          precio: oferta.precio,
          es_oferta: true,
          emisor: oferta.tecnico
        };
        setMensajes((prev) => [...prev, msgOferta]);
      });

      // Escuchar si se asignó el servicio (para redirigir)
      socket.on("servicioAsignado", (data: any) => {
        alert("¡Servicio asignado! Redirigiendo al chat privado...");
        navigate(`/cliente/servicio/${data.id_servicio}/chat`);
      });

      return () => {
        socket.off("nuevoMensajeGrupal");
        socket.off("new_offer");
        socket.off("servicioAsignado");
      };
    }
  }, [socket, id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !socket) return;

    socket.emit("enviarMensajeGrupal", {
      id_solicitud: id,
      emisor_id: user?.id_usuario,
      mensaje: nuevoMensaje,
      precio: null // Mensaje normal
    });

    setNuevoMensaje("");
  };

  const aceptarOferta = (mensaje: Mensaje) => {
    if (!socket) return;

    if (window.confirm(`¿Aceptar oferta de Bs. ${mensaje.precio} de ${mensaje.emisor?.nombre}?`)) {
      // Enviar evento para seleccionar oferta
      // Nota: Necesitamos el ID del mensaje o de la oferta para vincularlo correctamente
      // Por ahora asumimos que el backend puede manejarlo con el ID del técnico y precio
      // O idealmente el mensaje trae el ID de la oferta si es oferta

      // Como el backend espera id_mensaje_oferta en "seleccionarOferta"
      if (mensaje.id_mensaje) {
        socket.emit("seleccionarOferta", {
          id_solicitud: id,
          id_mensaje_oferta: mensaje.id_mensaje,
          id_cliente: user?.id_usuario
        });
      } else {
        // Fallback si no tenemos ID de mensaje (ej. vino por evento new_offer)
        // Esto requeriría ajustar el backend o asegurar que new_offer traiga estructura de mensaje
        alert("Error: No se puede procesar esta oferta en este momento.");
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Solicitud #{id}</h2>
          <p className="text-sm text-gray-500">Esperando ofertas de técnicos...</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Aún no hay mensajes ni ofertas.</p>
            <p className="text-sm">Los técnicos disponibles recibirán tu solicitud pronto.</p>
          </div>
        )}

        {mensajes.map((msg, idx) => {
          const esMio = msg.emisor_id === user?.id_usuario;

          return (
            <div key={idx} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${esMio ? "bg-indigo-100 text-gray-800" : "bg-white text-gray-800"
                } ${msg.es_oferta ? "border-2 border-green-400" : ""}`}>

                {!esMio && (
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-xs text-indigo-600 mr-2">
                      {msg.emisor?.nombre} {msg.emisor?.apellido}
                    </span>
                    <span className="text-[10px] px-1 bg-gray-200 rounded text-gray-600">
                      {msg.emisor?.rol}
                    </span>
                  </div>
                )}

                <p>{msg.mensaje}</p>

                {msg.es_oferta && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-bold text-green-600 text-lg">
                      Oferta: Bs. {msg.precio}
                    </p>
                    {!esMio && (
                      <button
                        onClick={() => aceptarOferta(msg)}
                        className="mt-2 w-full py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      >
                        Aceptar Oferta
                      </button>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-gray-400 text-right mt-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t">
        <form onSubmit={enviarMensaje} className="flex gap-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!nuevoMensaje.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};
