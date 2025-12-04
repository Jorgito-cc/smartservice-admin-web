import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { crearSolicitud } from "../../../api/solicitud";
import { getCategoriasRequest } from "../../../api/categoria";
import { uploadImageCloudinary } from "../../../utils/uploadCloudinary";
import { useAuth } from "../../../context/AuthContext";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { CategoriaType } from "../../../types/categoriaType";

export const CrearSolicitudPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [direccion, setDireccion] = useState("");

  const [formData, setFormData] = useState({
    id_categoria: 0,
    descripcion: "",
    ubicacion_texto: "",
    precio_ofrecido: undefined as number | undefined,
    lat: -17.3935,
    lon: -66.1570,
    fotos: [] as string[],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =============================
  // CARGAR GOOGLE MAPS
  // =============================
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = {
    width: "100%",
    height: "250px",
    borderRadius: "10px",
  };

  const cargarCategorias = async () => {
    const data = await getCategoriasRequest();
    setCategorias(data);
  };

  useEffect(() => {
    cargarCategorias();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }));
      },
      () => {
        console.warn("No se obtuvo ubicación");
      }
    );
  }, []);

  const reverseGeocode = async (lat: number, lon: number) => {
    const GEOCODE_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

    const res = await fetch(GEOCODE_URL);
    const data = await res.json();

    if (data.results.length > 0) {
      const dir = data.results[0].formatted_address;
      setDireccion(dir);
      setFormData((prev) => ({
        ...prev,
        ubicacion_texto: dir,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let fotosUrls: string[] = [];

      for (const f of files) {
        const url = await uploadImageCloudinary(f);
        fotosUrls.push(url);
      }

      const payload = {
        ...formData,
        fotos: fotosUrls,
      };

      const response = await crearSolicitud(payload);

      navigate(`/cliente/solicitud/${response.solicitud.id_solicitud}/chat`);

    } catch (err: any) {
      setError(err.response?.data?.msg || "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-5">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Solicitud</h1>

      {error && <p className="bg-red-200 text-red-700 p-3 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-4">

        {/* CATEGORÍA */}
        <div>
          <label className="font-medium">Categoría *</label>
          <select
            name="id_categoria"
            onChange={(e) =>
              setFormData({ ...formData, id_categoria: Number(e.target.value) })
            }
            value={formData.id_categoria}
            className="w-full p-2 border rounded"
            required
          >
            <option value={0}>Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* DESCRIPCIÓN */}
        <textarea
          name="descripcion"
          placeholder="Describe tu problema..."
          required
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          className="w-full p-2 border rounded"
        />

        {/* PRECIO OFRECIDO */}
        <input
          type="number"
          name="precio_ofrecido"
          placeholder="Precio ofrecido (opcional)"
          onChange={(e) =>
            setFormData({
              ...formData,
              precio_ofrecido: Number(e.target.value),
            })
          }
          className="w-full p-2 border rounded"
        />

        {/* MAPA GOOGLE */}
        <div>
          <label className="font-semibold">Ubicación en el mapa</label>

          {!isLoaded ? (
            <p>Cargando mapa...</p>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: formData.lat, lng: formData.lon }}
              zoom={15}
              onClick={(e) => {
                const lat = e.latLng?.lat()!;
                const lon = e.latLng?.lng()!;
                setFormData({ ...formData, lat, lon });
                reverseGeocode(lat, lon);
              }}
            >
              <Marker
                position={{ lat: formData.lat, lng: formData.lon }}
                draggable
                onDragEnd={(e) => {
                  const lat = e.latLng?.lat()!;
                  const lon = e.latLng?.lng()!;
                  setFormData({ ...formData, lat, lon });
                  reverseGeocode(lat, lon);
                }}
              />
            </GoogleMap>
          )}

          <p className="text-sm text-gray-700 mt-1">
            Dirección estimada: <strong>{direccion || "Mové el pin"}</strong>
          </p>
        </div>

        {/* FOTOS */}
        <div>
          <label>Fotos del problema:</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
        >
          {loading ? "Publicando..." : "Publicar Solicitud"}
        </button>
      </form>
    </div>
  );
};
