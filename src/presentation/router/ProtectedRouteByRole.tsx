import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteByRoleProps = {
  children: React.ReactElement;
  allowedRoles: string[];
};

export default function ProtectedRouteByRole({ children, allowedRoles }: ProtectedRouteByRoleProps) {
  const { user, isAuthenticated, loading } = useAuth();

  // Esperar a que termine la inicialización
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar que el usuario tenga un rol válido
  if (!user || !user.rol) {
    return <Navigate to="/" replace />;
  }

  // Normalizar el rol (en caso de que venga con mayúsculas o espacios)
  const userRol = user.rol.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.trim().toLowerCase());

  if (!normalizedAllowedRoles.includes(userRol)) {
    console.log("Rol no permitido:", userRol, "Roles permitidos:", normalizedAllowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
}

