// src/components/AuthModal.tsx
import { useAuthVM } from "../viewmodels/useAuthVM";

export default function AuthModal({ vm }: { vm: ReturnType<typeof useAuthVM> }) {
  if (!vm.isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6 relative animate-fade-in">
        
        {/* BOTÓN PARA CERRAR */}
        <button
          onClick={vm.closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Iniciar Sesión Administrativa
        </h2>

        {/* FORMULARIO */}
        <form onSubmit={vm.handleSubmit(vm.onSubmit)} className="space-y-4">

          {/* CORREO */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              {...vm.register("email")}
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {vm.formState.errors.email && (
              <p className="text-red-600 text-sm">{vm.formState.errors.email.message}</p>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              {...vm.register("password")}
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {vm.formState.errors.password && (
              <p className="text-red-600 text-sm">{vm.formState.errors.password.message}</p>
            )}
          </div>

          {/* BOTÓN login */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 mt-4 hover:bg-blue-700 transition"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
