import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listarOfertasPorSolicitud, type Oferta } from "../../../api/oferta";
import { aceptarOferta } from "../../../api/servicio";
import { FaCheck, FaUser, FaDollarSign, FaStar } from "react-icons/fa";

export const ListaOfertasPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [aceptando, setAceptando] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      cargarOfertas();
    }
  }, [id]);

  const cargarOfertas = async () => {
    if (!id) return;
    try {
      const data = await listarOfertasPorSolicitud(Number(id));
      setOfertas(data);
    } catch (err) {
      console.error("Error cargando ofertas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptarOferta = async (idOferta: number) => {
    if (aceptando) return;

    setAceptando(idOferta);
    try {
      const response = await aceptarOferta(idOferta);
      navigate(`/cliente/servicio/${response.servicio.id_servicio}/chat`);
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error al aceptar oferta");
    } finally {
      setAceptando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando ofertas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ofertas Recibidas</h1>
        <p className="text-gray-600">Solicitud #{id}</p>
      </div>

      {ofertas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aún no hay ofertas para esta solicitud</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas
            .sort((a, b) => a.precio - b.precio)
            .map((oferta) => (
              <div
                key={oferta.id_oferta}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-indigo-500"
              >
                <div className="flex items-center mb-4">
                  {oferta.Usuario?.foto ? (
                    <img
                      src={oferta.Usuario.foto}
                      alt={`${oferta.Usuario.nombre} ${oferta.Usuario.apellido}`}
                      className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-indigo-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-indigo-600 text-xl" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {oferta.Usuario?.nombre} {oferta.Usuario?.apellido}
                    </h3>
                    <div className="flex items-center text-yellow-500 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(oferta.Tecnico?.calificacion_promedio || 0)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-2 text-gray-600">
                        {oferta.Tecnico?.calificacion_promedio?.toFixed(1) || "Sin calificar"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Precio ofrecido:</span>
                    <span className="text-2xl font-bold text-green-600 flex items-center">
                      <FaDollarSign className="mr-1" />
                      {oferta.precio} Bs.
                    </span>
                  </div>
                  {oferta.mensaje && (
                    <p className="text-gray-700 text-sm mt-2">{oferta.mensaje}</p>
                  )}
                </div>

                <button
                  onClick={() => handleAceptarOferta(oferta.id_oferta)}
                  disabled={aceptando === oferta.id_oferta}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition"
                >
                  <FaCheck className="mr-2" />
                  {aceptando === oferta.id_oferta ? "Aceptando..." : "Aceptar Oferta"}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

