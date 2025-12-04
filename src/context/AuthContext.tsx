import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { AuthResponse, UserDTO, LoginRequest, RegisterRequest } from "../types/authType";
import {
  loginRequest,
  registerRequest,
  clearSession,
  getSessionUser,
  getPerfilRequest,
} from "../api/auth";
import { initSocket, disconnectSocket } from "../utils/socket";
type AuthContextType = {
  user: UserDTO | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  register: (payload: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshPerfil: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicializar user SÍNCRONAMENTE desde localStorage
  const [user, setUser] = useState<UserDTO | null>(() => getSessionUser());
  const [loading, setLoading] = useState(true);

  // Inicializar Socket.IO después del primer render
  useEffect(() => {
    const currentUser = getSessionUser();
    if (currentUser) {
      const token = localStorage.getItem("token");
      if (token && currentUser.id_usuario) {
        initSocket(token, currentUser.id_usuario);
      }
    }
    // Marcar como cargado después de inicializar socket
    setLoading(false);
  }, []);

  const login = async (payload: LoginRequest) => {
    const res = await loginRequest(payload);
    setUser(res.usuario);

    // Inicializar Socket.IO después del login
    if (res.usuario?.id_usuario) {
      const token = localStorage.getItem("token");
      if (token) {
        initSocket(token, res.usuario.id_usuario);
      }
    }

    return res;
  };

  const register = async (payload: RegisterRequest) => {
    const res = await registerRequest(payload);
    return res;
  };

  const refreshPerfil = async () => {
    const perfil = await getPerfilRequest();
    setUser(perfil);
    localStorage.setItem("user", JSON.stringify(perfil));
  };

  const logout = () => {
    disconnectSocket();
    clearSession();
    setUser(null);
    window.location.reload();
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout, refreshPerfil }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
