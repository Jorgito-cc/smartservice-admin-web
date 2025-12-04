import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { FeatureCard } from "../../components/FeatureCard";
import AuthModal from "../../components/AuthModal";
import { useAuthVM } from "../../viewmodels/useAuthVM";

import {
  FaNetworkWired,
  FaBrain,
  FaChartLine,
  FaMobileAlt,
} from "react-icons/fa";

export const LandingPage = () => {
  const authVM = useAuthVM();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="text-center py-24 px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Plataforma Inteligente para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              Servicios a Domicilio
            </span>
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Gestiona solicitudes, recibe recomendaciones de IA, coordina técnicos
            y analiza datos en tiempo real con nuestra solución web y móvil.
          </p>

          <button
            onClick={authVM.openModal}
            className="mt-8 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition font-semibold"
          >
            Iniciar Sesión / Registrarse
          </button>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <FeatureCard
              icon={<FaNetworkWired />}
              title="Conecta con Técnicos"
              description="Encuentra profesionales confiables y verificados."
            />
            <FeatureCard
              icon={<FaBrain />}
              title="IA para Recomendaciones"
              description="Sistema inteligente que prioriza técnicos según experiencia, zona y calificaciones."
            />
            <FeatureCard
              icon={<FaChartLine />}
              title="Business Intelligence"
              description="Panel con métricas clave para toma de decisiones."
            />
          </div>
        </section>

  

        {/* Extra Section */}
        <section className="mt-24 px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            Disponible en Web y Móvil
          </h3>
          <p className="text-gray-500 max-w-xl mx-auto mt-2">
            Accede desde cualquier dispositivo y gestiona servicios de forma
            rápida, segura y eficiente.
          </p>

          <div className="flex justify-center mt-6 text-indigo-600 text-6xl">
            <FaMobileAlt />
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de Login / Registro */}
      <AuthModal vm={authVM} />
    </div>
  );
};
