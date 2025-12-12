import { useEffect, useState } from "react";
import {
  getAllUsuariosRequest,
  activarTecnicoRequest,
  desactivarTecnicoRequest,
} from "../../../api/usuarios";
import { AnalisisUsuarios } from "./AnalisisUsuarios";

import type { UsuarioType } from "../../../types/usuarioType";

export const ListarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lista" | "analisis">("lista");

  const cargarUsuarios = async () => {
    try {
      const data = await getAllUsuariosRequest();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // 🔥 ACTIVAR TÉCNICO
  const activar = async (id: number) => {
    try {
      await activarTecnicoRequest(id);
      cargarUsuarios();
    } catch (err) {
      console.error("Error activando técnico:", err);
    }
  };

  // 🔥 DESACTIVAR TÉCNICO
  const desactivar = async (id: number) => {
    try {
      await desactivarTecnicoRequest(id);
      cargarUsuarios();
    } catch (err) {
      console.error("Error desactivando técnico:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Cargando usuarios...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">👥 Gestión de Usuarios</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("lista")}
          className={`px-4 py-2 font-semibold transition ${
            String(activeTab) === "lista"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
          }`}
        >
          📋 Usuarios Registrados
        </button>
        <button
          onClick={() => setActiveTab("analisis")}
          className={`px-4 py-2 font-semibold transition ${
            String(activeTab) === "analisis"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
          }`}
        >
          📊 Análisis Usuarios
        </button>
      </div>

      {/* Contenido de Tabs */}
      {String(activeTab) === "lista" ? (
        <>
          <table className="min-w-full bg-white border rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-600">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Info Extra</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.id_usuario}</td>
                  <td className="p-3">
                    {u.nombre} {u.apellido}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        u.rol === "admin"
                          ? "bg-red-600"
                          : u.rol === "tecnico"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.estado ? "Activo" : "Deshabilitado"}
                  </td>
                  <td className="p-3">
                    {u.rol === "cliente" && (
                      <p>Preferencia: {u.Cliente?.preferencia || "N/A"}</p>
                    )}

                    {u.rol === "tecnico" && (
                      <p>
                        Desc: {u.Tecnico?.descripcion || "N/A"} <br />
                        Calificación:{" "}
                        {u.Tecnico?.calificacion_promedio ?? "N/A"} <br />
                        Disponible: {u.Tecnico?.disponibilidad ? "Sí" : "No"}
                      </p>
                    )}

                    {u.rol === "admin" && <p>Administrador del sistema</p>}
                  </td>
                  <td className="p-3">
                    {u.rol === "tecnico" && (
                      <div className="flex gap-2">
                        {u.estado ? (
                          <button
                            onClick={() => desactivar(u.id_usuario)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => activar(u.id_usuario)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <AnalisisUsuarios />
      )}
    </div>
  );
};
