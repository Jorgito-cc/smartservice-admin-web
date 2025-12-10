import { useState, useEffect } from "react";
import { FaStar, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { obtenerTecnicos } from "../../../api/tecnicos";
import type { TecnicoUsuario } from "../../../types/tecnicoType";

export const TechnicianListPage = () => {
  const [tecnicos, setTecnicos] = useState<TecnicoUsuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      const data = await obtenerTecnicos();
      setTecnicos(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando técnicos:", err);
      setError("Error al cargar los técnicos");
      setTecnicos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTechnicians = tecnicos.filter((t) =>
    `${t.nombre} ${t.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  const getRating = (calificacion: string | number | null | undefined): number => {
    if (!calificacion) return 0;
    const value = typeof calificacion === "string" ? parseFloat(calificacion) : calificacion;
    return isNaN(value) ? 0 : value;
  };

  const getEstadoLabel = (estado: boolean): string => {
    return estado ? "Activo" : "Inactivo";
  };

  const getEstadoColor = (estado: boolean): string => {
    return estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Cargando técnicos...</p>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left border-collapse overflow-hidden">
          <thead className="bg-gradient-to-r from-indigo-100 to-fuchsia-100 dark:from-slate-800 dark:to-slate-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Teléfono</th>
              <th className="px-5 py-3 font-semibold">Calificación</th>
              <th className="px-5 py-3 font-semibold">Disponibilidad</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {filteredTechnicians.length > 0 ? (
              filteredTechnicians.map((tech) => (
                <tr
                  key={tech.id_usuario}
                  className="border-b border-gray-200 dark:border-slate-700 hover:bg-indigo-50/40 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {tech.nombre} {tech.apellido}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                    {tech.email}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                    {tech.telefono || "N/A"}
                  </td>
                  <td className="px-5 py-3 flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.round(getRating(tech.Tecnico?.calificacion_promedio))
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-slate-600"
                        }
                      />
                    ))}
                    <span className="ml-1 text-gray-600 dark:text-gray-300">
                      {getRating(tech.Tecnico?.calificacion_promedio).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tech.Tecnico?.disponibilidad
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {tech.Tecnico?.disponibilidad ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(
                        tech.estado
                      )}`}
                    >
                      {getEstadoLabel(tech.estado)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      to={`/admin/technicians/${tech.id_usuario}`}
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
                  colSpan={7}
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
