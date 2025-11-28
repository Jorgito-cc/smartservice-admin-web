import { useEffect, useState } from "react";
import { 
  getAllUsuariosRequest, 
  activarTecnicoRequest, 
  desactivarTecnicoRequest 
} from "../../../api/usuarios";

import type { UsuarioType } from "../../../types/usuarioType";

export const ListarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-semibold mb-4">Usuarios Registrados</h1>

      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-gray-600">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Rol</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Info Extra</th>
            <th className="p-3 text-left">Acciones</th> {/* 👉 NUEVA COLUMNA */}
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
              {/* ID */}
              <td className="p-3">{u.id_usuario}</td>

              {/* NOMBRE */}
              <td className="p-3">
                {u.nombre} {u.apellido}
              </td>

              {/* EMAIL */}
              <td className="p-3">{u.email}</td>

              {/* ROL */}
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

              {/* ESTADO */}
              <td className="p-3">
                {u.estado ? "Activo" : "Deshabilitado"}
              </td>

              {/* INFO EXTRA */}
              <td className="p-3">
                {u.rol === "cliente" && (
                  <p>
                    Preferencia: {u.Cliente?.preferencia || "N/A"}
                  </p>
                )}

                {u.rol === "tecnico" && (
                  <p>
                    Desc: {u.Tecnico?.descripcion || "N/A"} <br />
                    Calificación: {u.Tecnico?.calificacion_promedio ?? "N/A"} <br />
                    Disponible: {u.Tecnico?.disponibilidad ? "Sí" : "No"}
                  </p>
                )}

                {u.rol === "admin" && (
                  <p>Administrador del sistema</p>
                )}
              </td>

              {/* 🔥 ACCIONES PARA TÉCNICOS */}
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
    </div>
  );
};
