import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearSolicitud } from "../../../api/solicitud";
import type { CrearSolicitudDTO } from "../../../api/solicitud";
import { getCategoriasRequest } from "../../../api/categoria";
import { initSocket } from "../../../utils/socket";
import { useAuth } from "../../../context/AuthContext";
import type { CategoriaType } from "../../../types/categoriaType";

export const CrearSolicitudPage = () => {
  const [formData, setFormData] = useState<CrearSolicitudDTO>({
    id_categoria: 0,
    descripcion: "",
    precio_ofrecido: undefined,
    ubicacion_texto: "",
    fotos: [],
  });
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await getCategoriasRequest();
      setCategorias(data);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id_categoria" || name === "precio_ofrecido" ? Number(value) || undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.id_categoria || !formData.descripcion) {
        setError("Categoría y descripción son requeridos");
        setLoading(false);
        return;
      }

      const response = await crearSolicitud({
        ...formData,
        id_categoria: formData.id_categoria,
      });

      // Inicializar Socket.IO si no está inicializado
      const token = localStorage.getItem("token");
      if (token && user?.id_usuario) {
        initSocket(token, user.id_usuario);
      }

      // Redirigir al chat grupal
      navigate(`/cliente/solicitud/${response.solicitud.id_solicitud}/chat`);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Solicitud</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            name="id_categoria"
            value={formData.id_categoria}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={0}>Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Ej: Quiero arreglar una puerta, ofrezco 40 Bs."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Ofrecido (Bs.)
          </label>
          <input
            type="number"
            name="precio_ofrecido"
            value={formData.precio_ofrecido || ""}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="Ej: 40.00 (opcional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            name="ubicacion_texto"
            value={formData.ubicacion_texto}
            onChange={handleChange}
            placeholder="Ej: Av. América Oeste, Cochabamba"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Publicando..." : "Publicar Solicitud"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/cliente")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

