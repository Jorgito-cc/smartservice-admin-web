import { useEffect, useState } from "react";
import {
  getCategoriasRequest,
  createCategoriaRequest,
  deleteCategoriaRequest,
  updateCategoriaRequest,
} from "../../../api/categoria";

import type { CategoriaType } from "../../../types/categoriaType";

export const Categoria = () => {
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para crear categoría
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados para editar
  const [editando, setEditando] = useState<CategoriaType | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  const cargarCategorias = async () => {
    try {
      const lista = await getCategoriasRequest();
      setCategorias(lista);
    } catch (err) {
      console.error("Error cargando categorías", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // ============================
  //   CREAR CATEGORÍA
  // ============================
  const crearCategoria = async () => {
    if (!nombre.trim()) return alert("El nombre es obligatorio");

    try {
      await createCategoriaRequest({ nombre, descripcion });
      setNombre("");
      setDescripcion("");
      cargarCategorias();
      alert("Categoría creada");
    } catch (error: any) {
      alert(error.response?.data?.msg || "Error creando categoría");
    }
  };

  // ============================
  //   ELIMINAR CATEGORÍA
  // ============================
  const eliminarCategoria = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;

    try {
      await deleteCategoriaRequest(id);
      cargarCategorias();
      alert("Categoría eliminada");
    } catch (err) {
      alert("Error eliminando categoría");
    }
  };

  // ============================
  //   ABRIR MODAL EDITAR
  // ============================
  const abrirEditar = (cat: CategoriaType) => {
    setEditando(cat);
    setEditNombre(cat.nombre);
    setEditDescripcion(cat.descripcion || "");
  };

  // ============================
  //   GUARDAR EDICIÓN
  // ============================
  const editarCategoria = async () => {
    if (!editando) return;

    try {
      await updateCategoriaRequest(editando.id_categoria, {
        nombre: editNombre,
        descripcion: editDescripcion,
      });

      setEditando(null);
      cargarCategorias();
      alert("Categoría actualizada");
    } catch (err) {
      alert("Error actualizando categoría");
    }
  };

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Categorías</h1>

      {/* ============================
          FORMULARIO CREAR
      ============================ */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Crear Categoría</h2>

        <div className="flex gap-3 mb-3">
          <input
            type="text"
            placeholder="Nombre"
            className="p-2 border rounded w-1/3"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            type="text"
            placeholder="Descripción"
            className="p-2 border rounded w-2/3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <button
            onClick={crearCategoria}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Crear
          </button>
        </div>
      </div>

      {/* ============================
          TABLA DE CATEGORÍAS
      ============================ */}
      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-gray-600">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id_categoria} className="border-b hover:bg-gray-50">
              <td className="p-3">{cat.id_categoria}</td>
              <td className="p-3">{cat.nombre}</td>
              <td className="p-3">{cat.descripcion}</td>

              <td className="p-3 flex gap-3">
                <button
                  onClick={() => abrirEditar(cat)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarCategoria(cat.id_categoria)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============================
          MODAL EDITAR
      ============================ */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 w-96 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Editar Categoría</h2>

            <input
              type="text"
              className="w-full p-2 border rounded mb-3"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
            />

            <input
              type="text"
              className="w-full p-2 border rounded mb-3"
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditando(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>

              <button
                onClick={editarCategoria}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
