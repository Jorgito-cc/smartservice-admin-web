import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPagoPorServicio, crearCheckout, PagoServicio } from "../../../api/pago";
import { obtenerServicio } from "../../../api/servicio";
import { FaCreditCard, FaCheckCircle, FaTimes, FaSpinner } from "react-icons/fa";

export const PagoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<any>(null);
  const [pago, setPago] = useState<PagoServicio | { estado: "sin_registro" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [servicioData, pagoData] = await Promise.all([
        obtenerServicio(Number(id)),
        obtenerPagoPorServicio(Number(id)),
      ]);
      setServicio(servicioData);
      setPago(pagoData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    if (!id) return;
    
    try {
      setProcesando(true);
      const { url } = await crearCheckout(Number(id));
      // Redirigir a Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Error iniciando pago:", error);
      alert(error.response?.data?.msg || "Error al iniciar el pago");
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="text-center py-12">
        <FaTimes className="mx-auto text-4xl text-red-500 mb-4" />
        <p className="text-gray-600">Servicio no encontrado</p>
      </div>
    );
  }

  const pagoCompletado = pago && "estado" in pago && pago.estado === "pagado";
  const sinRegistro = pago && "estado" in pago && pago.estado === "sin_registro";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pago del Servicio</h1>

        {pagoCompletado ? (
          <div className="text-center py-8">
            <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pago Completado</h2>
            <p className="text-gray-600 mb-6">Tu pago fue procesado exitosamente</p>
            {pago && "monto_total" in pago && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Monto pagado:</p>
                <p className="text-2xl font-bold text-green-600">Bs. {pago.monto_total}</p>
              </div>
            )}
            <button
              onClick={() => navigate("/cliente")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Detalles del Servicio</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Servicio #:</span> {servicio.id_servicio}</p>
                <p><span className="font-medium">Estado:</span> {servicio.estado}</p>
              </div>
            </div>

            {pago && "monto_total" in pago && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Pago</h2>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Monto Total:</span>
                    <span className="font-bold text-lg">Bs. {pago.monto_total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Comisión (10%):</span>
                    <span>Bs. {pago.comision_empresa}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Para el técnico:</span>
                    <span>Bs. {pago.monto_tecnico}</span>
                  </div>
                </div>
              </div>
            )}

            {pago && "estado" in pago && pago.estado === "pendiente" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">Tienes un pago pendiente. Completa el proceso en Stripe.</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={handlePagar}
                disabled={procesando || pagoCompletado}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pagar con Stripe
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> Serás redirigido a Stripe para completar el pago de forma segura.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

