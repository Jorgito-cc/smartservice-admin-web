// src/components/AuthModal.tsx
import { useState } from "react";
import { useAuthVM } from "../viewmodels/useAuthVM";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

export default function AuthModal({ vm }: { vm: ReturnType<typeof useAuthVM> }) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  if (!vm.isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">

        {/* BOTÓN PARA CERRAR */}
        <button
          onClick={vm.closeModal}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-3xl font-bold bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition"
        >
          ×
        </button>

        {/* TABS */}
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 text-center font-semibold transition ${activeTab === "login"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-4 text-center font-semibold transition ${activeTab === "register"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Registrarse
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className="p-6">
          {activeTab === "login" ? (
            <div className="max-w-md mx-auto">
              <LoginPage />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <RegisterPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
