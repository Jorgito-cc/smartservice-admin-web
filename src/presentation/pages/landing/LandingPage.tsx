import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {FeatureCard} from "../../components/FeatureCard";
import AuthModal from "../../components/AuthModal";
import { useAuthVM } from "../../viewmodels/useAuthVM";
import { FaNetworkWired, FaBrain, FaChartLine } from "react-icons/fa";

export const LandingPage = () => {
  const authVM = useAuthVM();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="bg-gray-50 text-center py-20 px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Sistema Web y Móvil para Servicios a Domicilio
          </h2>
          <p className="text-gray-600 mb-8">
            Optimiza la gestión y recomendación de servicios con Inteligencia Artificial.
          </p>
          <button
            onClick={authVM.openModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Comenzar
          </button>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<FaNetworkWired />}
              title="Conecta con Técnicos"
              description="Encuentra profesionales calificados fácilmente."
            />
            <FeatureCard
              icon={<FaBrain />}
              title="Algoritmos de IA"
              description="Recomendaciones inteligentes y personalizadas."
            />
            <FeatureCard
              icon={<FaChartLine />}
              title="Análisis en Tiempo Real"
              description="Datos actualizados para decisiones precisas."
            />
          </div>
        </section>

        <section className="flex justify-center mt-16">
          <img
            src="/mockup-smartservice.png"
            alt="App SmartService"
            className="w-64 md:w-80 drop-shadow-xl"
          />
        </section>
      </main>

      <Footer />

      {/* Modal flotante */}
      <AuthModal vm={authVM} />
    </div>
  );
};
