import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteByRoleProps = {
  children: React.ReactElement;
  allowedRoles: string[];
};

export default function ProtectedRouteByRole({ children, allowedRoles }: ProtectedRouteByRoleProps) {
  const { user, isAuthenticated } = useAuth();

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
    // DEBUG: Mostrar por qué falló en lugar de redirigir
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado (Debug)</h1>
        <p className="mb-2"><strong>Tu Rol (Normalizado):</strong> "{userRol}"</p>
        <p className="mb-2"><strong>Roles Permitidos:</strong> {JSON.stringify(normalizedAllowedRoles)}</p>
        <p className="mb-2"><strong>Rol Original:</strong> "{user.rol}"</p>
        <p className="text-sm text-gray-500">Por favor comparte esta pantalla con el soporte.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Volver al Login
        </button>
      </div>
    );
    // return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

