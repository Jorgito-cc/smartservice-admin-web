import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPagoPorServicio, crearCheckout, type PagoServicio } from "../../../api/pago";
import { obtenerServicio } from "../../../api/servicio";
import { FaCreditCard, FaCheckCircle, FaTimes, FaSpinner, FaQrcode, FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";

export const PagoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<any>(null);
  const [pago, setPago] = useState<PagoServicio | { estado: "sin_registro" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "qr" | "efectivo" | "movil">("tarjeta");

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
      const resultado = await crearCheckout(Number(id), metodoPago);

      // Si es pago con tarjeta, redirigir a Stripe
      if (metodoPago === "tarjeta" && resultado.url) {
        window.location.href = resultado.url;
      } else {
        // Para otros métodos, mostrar confirmación
        alert(resultado.msg || "Pago registrado. Pendiente de confirmación del administrador.");
        navigate("/cliente");
      }
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
  const servicioCompletado = servicio?.estado === "completado";

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
                <p className="text-sm text-gray-600 mt-2">Método: {pago.metodo_pago || "tarjeta"}</p>
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

            {!servicioCompletado && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-medium">⏳ El pago estará disponible cuando el técnico marque el servicio como completado.</p>
                <p className="text-orange-700 text-sm mt-2">Estado actual: <span className="font-semibold capitalize">{servicio.estado.replace("_", " ")}</span></p>
              </div>
            )}

            {pago && "estado" in pago && pago.estado === "pendiente" && servicioCompletado && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">Tienes un pago pendiente. Completa el proceso o selecciona otro método.</p>
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Método de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${metodoPago === "tarjeta" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}>
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="tarjeta"
                    checked={metodoPago === "tarjeta"}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="mr-3"
                  />
                  <FaCreditCard className="text-2xl text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold">Tarjeta</p>
                    <p className="text-xs text-gray-600">Pago con Stripe</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${metodoPago === "qr" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}>
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="qr"
                    checked={metodoPago === "qr"}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="mr-3"
                  />
                  <FaQrcode className="text-2xl text-purple-600 mr-3" />
                  <div>
                    <p className="font-semibold">QR</p>
                    <p className="text-xs text-gray-600">Código QR</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${metodoPago === "efectivo" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}>
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="efectivo"
                    checked={metodoPago === "efectivo"}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="mr-3"
                  />
                  <FaMoneyBillWave className="text-2xl text-green-600 mr-3" />
                  <div>
                    <p className="font-semibold">Efectivo</p>
                    <p className="text-xs text-gray-600">Pago en efectivo</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${metodoPago === "movil" ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}>
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="movil"
                    checked={metodoPago === "movil"}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="mr-3"
                  />
                  <FaMobileAlt className="text-2xl text-orange-600 mr-3" />
                  <div>
                    <p className="font-semibold">Móvil</p>
                    <p className="text-xs text-gray-600">Pago móvil</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handlePagar}
                disabled={procesando || pagoCompletado || !servicioCompletado}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!servicioCompletado ? (
                  <>
                    ⏳ Esperando que el técnico complete el trabajo
                  </>
                ) : procesando ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {metodoPago === "tarjeta" ? <FaCreditCard /> :
                      metodoPago === "qr" ? <FaQrcode /> :
                        metodoPago === "efectivo" ? <FaMoneyBillWave /> :
                          <FaMobileAlt />}
                    {metodoPago === "tarjeta" ? "Pagar con Stripe" : `Confirmar Pago con ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}`}
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

            {servicioCompletado && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> {metodoPago === "tarjeta"
                    ? "Serás redirigido a Stripe para completar el pago de forma segura."
                    : "Tu pago quedará pendiente hasta que el administrador lo confirme."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
