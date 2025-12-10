import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Notificaciones } from "../components/Notificaciones";
import { FaHome, FaPlusCircle, FaComments, FaUser, FaStar } from "react-icons/fa";
import { TarjetaFlotanteRecomendaciones } from "../components/ml/TarjetaFlotanteRecomendaciones";
import { useRecomendaciones } from "../../hooks/useRecomendaciones";

export const ClienteLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Obtener recomendaciones - usar 1 como ID por defecto
  const { tecnicos, loading } = useRecomendaciones(1, false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SmartService</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Notificaciones />
              <span className="text-gray-700">{user?.nombre} {user?.apellido}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/cliente"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
            >
              <FaHome className="mr-2" />
              Inicio
            </Link>
            <Link
              to="/cliente/solicitar"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
            >
              <FaPlusCircle className="mr-2" />
              Crear Solicitud
            </Link>
            <Link
              to="/cliente/solicitudes"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
            >
              <FaComments className="mr-2" />
              Mis Solicitudes
            </Link>
            <Link
              to="/cliente/servicios"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
            >
              <FaComments className="mr-2" />
              Mis Servicios
            </Link>
            <Link
              to="/cliente/solicitudes"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
              title="Ver técnicos recomendados por IA"
            >
              <FaStar className="mr-2 text-yellow-500" />
              Recomendados
            </Link>
            <Link
              to="/cliente/perfil"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600"
            >
              <FaUser className="mr-2" />
              Perfil
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Tarjeta Flotante de Recomendaciones */}
      <TarjetaFlotanteRecomendaciones
        tecnicos={tecnicos}
        loading={loading}
        posicion="bottom-right"
        autoAbrir={true}
        tiempoAutoAbrir={3000}
      />
    </div>
  );
};

