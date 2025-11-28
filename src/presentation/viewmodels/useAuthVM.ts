import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ESQUEMA PARA LOGIN
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useAuthVM() {
  const { login } = useAuth();
  const navigate = useNavigate();   // <-- IMPORTANTE

  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login({
        email: data.email,
        password: data.password,
      });

      alert(`Bienvenido, ${res.usuario.nombre}!`);

      reset();
      setIsOpen(false);

      // 🚀🚀 REDIRECCIÓN AQUÍ
      navigate("/admin");

    } catch (error: any) {
      alert(error.message || "Error iniciando sesión");
    }
  };

  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    register,
    handleSubmit,
    onSubmit,
    formState,
  };
}
