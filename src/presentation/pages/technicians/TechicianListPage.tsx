import { useState } from "react";
import { FaStar, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Technician {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  status: "Aprobado" | "Pendiente" | "Vependedor";
}

const techniciansData: Technician[] = [
  { id: 1, name: "Jorge Sanchez", specialty: "Carpintero", rating: 4.7, status: "Aprobado" },
  { id: 2, name: "Ana Morales", specialty: "Electricista", rating: 3.9, status: "Pendiente" },
  { id: 3, name: "Luis Pérez", specialty: "Empresaria", rating: 4.5, status: "Vependedor" },
  { id: 4, name: "Luis Pérez", specialty: "Plomero", rating: 4.1, status: "Aprobado" },
];

export const TechnicianListPage = () => {
  const [search, setSearch] = useState("");

  const filteredTechnicians = techniciansData.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Gestión de Técnicos
        </h2>

        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar técnico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left border-collapse overflow-hidden">
          <thead className="bg-gradient-to-r from-indigo-100 to-fuchsia-100 dark:from-slate-800 dark:to-slate-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Especialidad</th>
              <th className="px-5 py-3 font-semibold">Calificación</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((tech) => (
                <tr
                  key={tech.id}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-indigo-50/40 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {tech.name}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                    {tech.specialty}
                  </td>
                  <td className="px-5 py-3 flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(tech.rating)
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-slate-600"
                        }
                      />
                    ))}
                    <span className="ml-1 text-gray-600 dark:text-gray-300">
                      {tech.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tech.status === "Aprobado"
                          ? "bg-green-100 text-green-700"
                          : tech.status === "Pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {tech.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      to={`/admin/technicians/${tech.id}`}
                      className="text-indigo-600 hover:text-fuchsia-600 font-medium transition"
                    >
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 dark:text-gray-400 py-6"
                >
                  No se encontraron técnicos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
