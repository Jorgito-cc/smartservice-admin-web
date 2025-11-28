import { useEffect, useState } from "react";
import { getAllUsuariosRequest } from "../../../api/usuarios";
import { activarTecnicoRequest, desactivarTecnicoRequest } from "../../../api/tecnicos";
import type { UsuarioType } from "../../../types/usuarioType";

export const GestionTecnicos = () => {
  const [tecnicos, setTecnicos] = useState<UsuarioType[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarTecnicos = async () => {
    try {
      const lista: UsuarioType[] = await getAllUsuariosRequest(); // YA ES ARRAY

      const filtrados = lista.filter((u: UsuarioType) => u.rol === "tecnico");
      setTecnicos(filtrados);

    } catch (err) {
      console.error("Error cargando técnicos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const activar = async (id: number) => {
    await activarTecnicoRequest(id);
    cargarTecnicos();
  };

  const desactivar = async (id: number) => {
    await desactivarTecnicoRequest(id);
    cargarTecnicos();
  };

  if (loading) return <p>Cargando técnicos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Técnicos</h1>

      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-gray-600">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Email</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>

        <tbody>
          {tecnicos.map((t) => (
            <tr key={t.id_usuario} className="border-b hover:bg-gray-50">
              <td className="p-3">{t.id_usuario}</td>
              <td className="p-3">{t.nombre} {t.apellido}</td>
              <td className="p-3">{t.email}</td>

              <td className="p-3">
                {t.estado ? (
                  <span className="text-green-600 font-semibold">Activo</span>
                ) : (
                  <span className="text-red-600 font-semibold">Deshabilitado</span>
                )}
              </td>

              <td className="p-3">
                {t.estado ? (
                  <button
                    onClick={() => desactivar(t.id_usuario)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => activar(t.id_usuario)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Activar
                  </button>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
