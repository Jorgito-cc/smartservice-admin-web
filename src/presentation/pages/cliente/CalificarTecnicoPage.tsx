import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { crearCalificacion } from "../../../api/calificacion";
import { obtenerServicio } from "../../../api/servicio";
import { obtenerPagoPorServicio } from "../../../api/pago";
import { FaStar, FaSpinner, FaCheckCircle } from "react-icons/fa";

export const CalificarTecnicoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<any>(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [hoverPuntuacion, setHoverPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

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

      // Verificar que el servicio esté completado y pagado
      if (servicioData.estado !== "completado") {
        alert("Solo puedes calificar servicios completados");
        navigate(-1);
        return;
      }

      if (pagoData && "estado" in pagoData && pagoData.estado !== "pagado") {
        alert("Debes pagar el servicio antes de calificar");
        navigate(-1);
        return;
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      alert("Por favor, selecciona una calificación");
      return;
    }

    if (!id) return;

    try {
      setEnviando(true);
      await crearCalificacion(Number(id), puntuacion, comentario);
      setEnviado(true);
      setTimeout(() => {
        navigate("/cliente");
      }, 2000);
    } catch (error: any) {
      console.error("Error enviando calificación:", error);
      alert(error.response?.data?.msg || "Error al enviar la calificación");
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaCheckCircle className="text-6xl text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">¡Calificación Enviada!</h2>
        <p className="text-gray-600">Gracias por tu opinión</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Calificar Técnico</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calificación con estrellas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              ¿Cómo calificarías el servicio?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <button
                  key={estrella}
                  type="button"
                  onClick={() => setPuntuacion(estrella)}
                  onMouseEnter={() => setHoverPuntuacion(estrella)}
                  onMouseLeave={() => setHoverPuntuacion(0)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-4xl transition-colors ${
                      estrella <= (hoverPuntuacion || puntuacion)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {puntuacion > 0 && (
              <p className="text-center mt-2 text-gray-600">
                {puntuacion === 1 && "Muy malo"}
                {puntuacion === 2 && "Malo"}
                {puntuacion === 3 && "Regular"}
                {puntuacion === 4 && "Bueno"}
                {puntuacion === 5 && "Excelente"}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu opinión sobre el servicio..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={enviando || puntuacion === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Calificación"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

