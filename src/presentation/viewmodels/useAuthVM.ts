import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//  Esquema de validación con Zod
const schema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Debe tener al menos 6 caracteres"),
});

export type AuthFormData = z.infer<typeof schema>;

export function useAuthVM() {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<AuthFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: AuthFormData) => {
    console.log("Formulario enviado:", data);
    console.log("JSON:", JSON.stringify(data, null, 2));

    alert(`Bienvenido, ${data.name}!`);
    reset();
    setIsOpen(false);
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
    register,
    handleSubmit,
    onSubmit,
    formState,
  };
}
