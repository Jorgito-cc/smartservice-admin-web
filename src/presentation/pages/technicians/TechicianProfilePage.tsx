import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaStar, FaCrown, FaClock, FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import { obtenerTecnicoPorId } from "../../../api/tecnicos";
import type { TecnicoUsuario } from "../../../types/tecnicoType";

export const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tecnico, setTecnico] = useState<TecnicoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      cargarTecnico();
    }
  }, [id]);

  const cargarTecnico = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await obtenerTecnicoPorId(parseInt(id, 10));
        setTecnico(data);
        setError(null);
      }
    } catch (err) {
      console.error("Error cargando técnico:", err);
      setError("Error al cargar el perfil del técnico");
      setTecnico(null);
    } finally {
      setLoading(false);
    }
  };

  const getRating = (calificacion: string | number | null | undefined): number => {
    if (!calificacion) return 0;
    const value = typeof calificacion === "string" ? parseFloat(calificacion) : calificacion;
    return isNaN(value) ? 0 : value;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <p className="text-gray-600 dark:text-gray-300">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !tecnico) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <button
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-2 text-indigo-600 hover:text-fuchsia-600 font-medium mb-4 transition"
        >
          <FaArrowLeft />
          Volver
        </button>
        <p className="text-red-600 dark:text-red-400">{error || "Técnico no encontrado"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 p-6">
      
      {/* 🔙 Botón de retroceso */}
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-indigo-600 hover:text-fuchsia-600 font-medium mb-4 transition"
      >
        <FaArrowLeft />
        Volver
      </button>

      {/* 📋 Tarjeta del técnico */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 w-full max-w-lg border border-indigo-100/70 dark:border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={
                tecnico.foto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Avatar técnico"
              className="w-28 h-28 rounded-full shadow-md border-4 border-indigo-200 dark:border-slate-700 object-cover"
            />
            <span
              className={`absolute -bottom-2 right-2 text-white text-xs px-2 py-1 rounded-full font-semibold ${
                tecnico.estado
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {tecnico.estado ? "Activo" : "Inactivo"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            {tecnico.nombre} {tecnico.apellido}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {tecnico.Tecnico?.descripcion || "Técnico profesional"}
          </p>

          <div className="flex items-center mt-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < Math.round(getRating(tecnico.Tecnico?.calificacion_promedio))
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-slate-600"
                }
              />
            ))}
            <span className="ml-2 font-semibold text-gray-700 dark:text-gray-200">
              {getRating(tecnico.Tecnico?.calificacion_promedio).toFixed(2)} / 5.0
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          <div className="py-3 flex items-center gap-3">
            <FaPhoneAlt className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Teléfono:</span>{" "}
              {tecnico.telefono || "N/A"}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaEnvelope className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Email:</span> {tecnico.email}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaCrown className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">CI:</span> {tecnico.ci || "No registrado"}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaClock className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Disponibilidad:</span>{" "}
              {tecnico.Tecnico?.disponibilidad ? "Disponible" : "No disponible"}
            </p>
          </div>

          {tecnico.foto_ci && (
            <div className="py-3">
              <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Foto de CI:
              </p>
              <img
                src={tecnico.foto_ci}
                alt="Foto CI"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600"
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition">
            Ver Historial de Servicios
          </button>
        </div>
      </div>
    </div>
  );
};
