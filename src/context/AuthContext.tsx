import { createContext, useContext, useMemo, useState } from "react";
import type { AuthResponse, UserDTO, LoginRequest, RegisterRequest } from "../types/authType";
import {
  loginRequest,
  registerRequest,
  clearSession,
  getSessionUser,
  getPerfilRequest,
} from "../api/auth";

type AuthContextType = {
  user: UserDTO | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  register: (payload: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshPerfil: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDTO | null>(getSessionUser());

  const login = async (payload: LoginRequest) => {
    const res = await loginRequest(payload);
    setUser(res.usuario);

    // VALIDACIÓN EXTRA: Solo admin puede entrar a la web
    if (res.usuario.rol !== "admin") {
      throw new Error("Solo administradores pueden acceder al panel web");
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
    clearSession();
    setUser(null);
    window.location.reload();
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout, refreshPerfil }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
