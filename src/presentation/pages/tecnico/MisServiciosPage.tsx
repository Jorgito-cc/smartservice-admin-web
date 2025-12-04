import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarServiciosPorTecnico, Servicio } from "../../../api/servicio";
import { FaTools, FaCheckCircle, FaClock, FaComments } from "react-icons/fa";

export const MisServiciosPage = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const navigate = useNavigate();

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await listarServiciosPorTecnico();
      setServicios(data);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const serviciosFiltrados = filtroEstado === "todos" 
    ? servicios 
    : servicios.filter(s => s.estado === filtroEstado);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "en_camino":
        return "bg-blue-100 text-blue-800";
      case "en_ejecucion":
        return "bg-yellow-100 text-yellow-800";
      case "completado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "en_camino":
        return <FaClock className="text-blue-600" />;
      case "en_ejecucion":
        return <FaTools className="text-yellow-600" />;
      case "completado":
        return <FaCheckCircle className="text-green-600" />;
      default:
        return null;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "en_camino":
        return "En Camino";
      case "en_ejecucion":
        return "En Ejecución";
      case "completado":
        return "Completado";
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mis Servicios</h1>
        
        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-4 py-2 rounded-lg ${
              filtroEstado === "todos"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroEstado("en_camino")}
            className={`px-4 py-2 rounded-lg ${
              filtroEstado === "en_camino"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            En Camino
          </button>
          <button
            onClick={() => setFiltroEstado("en_ejecucion")}
            className={`px-4 py-2 rounded-lg ${
              filtroEstado === "en_ejecucion"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            En Ejecución
          </button>
          <button
            onClick={() => setFiltroEstado("completado")}
            className={`px-4 py-2 rounded-lg ${
              filtroEstado === "completado"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Completados
          </button>
        </div>
      </div>

      {serviciosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaTools className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">No tienes servicios {filtroEstado !== "todos" ? `con estado "${getEstadoTexto(filtroEstado)}"` : ""}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {serviciosFiltrados.map((servicio) => (
            <div
              key={servicio.id_servicio}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Servicio #{servicio.id_servicio}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Asignado: {new Date(servicio.fecha_asignacion).toLocaleDateString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getEstadoColor(servicio.estado)}`}>
                  {getEstadoIcon(servicio.estado)}
                  <span className="font-medium">{getEstadoTexto(servicio.estado)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/tecnico/servicio/${servicio.id_servicio}/chat`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaComments />
                  Ir al Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

