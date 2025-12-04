import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarSolicitudesDisponibles } from "../../../api/solicitud";
import { FaList, FaCheckCircle, FaClock } from "react-icons/fa";

export const DashboardTecnicoPage = () => {
  const [solicitudesDisponibles, setSolicitudesDisponibles] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await listarSolicitudesDisponibles();
      setSolicitudesDisponibles(data.length);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Técnico</h1>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaList className={loading ? "animate-spin" : ""} />
          {loading ? "Actualizando..." : "Actualizar Datos"}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Solicitudes Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{solicitudesDisponibles}</p>
            </div>
            <FaList className="text-4xl text-green-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Servicios Activos</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <FaClock className="text-4xl text-blue-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completados</p>
              <p className="text-3xl font-bold text-gray-600">0</p>
            </div>
            <FaCheckCircle className="text-4xl text-gray-300" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/tecnico/solicitudes")}
            className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition text-left"
          >
            <FaList className="text-2xl text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Ver Solicitudes Disponibles</h3>
            <p className="text-sm text-gray-600">Explora nuevas oportunidades de trabajo</p>
          </button>

          <button
            onClick={() => navigate("/tecnico/servicios")}
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition text-left"
          >
            <FaCheckCircle className="text-2xl text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Mis Servicios</h3>
            <p className="text-sm text-gray-600">Gestiona tus servicios asignados</p>
          </button>
        </div>
      </div>
    </div>
  );
};

