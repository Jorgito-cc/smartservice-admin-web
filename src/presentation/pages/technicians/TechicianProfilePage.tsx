import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaStar, FaCrown, FaClock, FaArrowLeft } from "react-icons/fa";

export const TechnicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const technician = {
    id,
    name: "Jorge Sanchez",
    specialty: "Carpintero",
    phone: "+59175841285",
    email: "jorge@gmail.com",
    premium: true,
    experience: "3 años",
    status: "Aprobado",
    rating: 4.7,
  };

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
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Avatar técnico"
              className="w-28 h-28 rounded-full shadow-md border-4 border-indigo-200 dark:border-slate-700"
            />
            <span className="absolute -bottom-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
              {technician.status}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">
            {technician.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{technician.specialty}</p>

          <div className="flex items-center mt-2 text-yellow-500">
            <FaStar />
            <span className="ml-1 font-semibold text-gray-700 dark:text-gray-200">
              {technician.rating.toFixed(1)} / 5.0
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          <div className="py-3 flex items-center gap-3">
            <FaPhoneAlt className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Teléfono:</span> {technician.phone}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaEnvelope className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Email:</span> {technician.email}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaCrown
              className={`${
                technician.premium ? "text-yellow-500" : "text-gray-400"
              }`}
            />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Categoría Premium:</span>{" "}
              {technician.premium ? "Sí" : "No"}
            </p>
          </div>

          <div className="py-3 flex items-center gap-3">
            <FaClock className="text-indigo-500" />
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Antigüedad:</span>{" "}
              {technician.experience}
            </p>
          </div>
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
