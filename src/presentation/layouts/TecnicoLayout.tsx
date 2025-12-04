import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Notificaciones } from "../components/Notificaciones";
import { FaHome, FaList, FaComments, FaUser, FaToggleOn, FaToggleOff } from "react-icons/fa";

export const TecnicoLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">SmartService - Técnico</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Disponible</span>
                <button className="text-green-500">
                  <FaToggleOn size={24} />
                </button>
              </div>
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
              to="/tecnico"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-green-500 hover:text-green-600"
            >
              <FaHome className="mr-2" />
              Inicio
            </Link>
            <Link
              to="/tecnico/solicitudes"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-green-500 hover:text-green-600"
            >
              <FaList className="mr-2" />
              Solicitudes Disponibles
            </Link>
            <Link
              to="/tecnico/servicios"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-green-500 hover:text-green-600"
            >
              <FaComments className="mr-2" />
              Mis Servicios
            </Link>
            <Link
              to="/tecnico/perfil"
              className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 border-b-2 border-transparent hover:border-green-500 hover:text-green-600"
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
    </div>
  );
};

