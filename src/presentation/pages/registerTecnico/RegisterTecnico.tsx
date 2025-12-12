import { useEffect, useState } from "react";
import { registerTecnicoRequest } from "../../../api/auth";
import { uploadImageCloudinary } from "../../../utils/uploadCloudinary";
import { getCategoriasRequest } from "../../../api/categoria";
import type { CategoriaType } from "../../../types/categoriaType";

export const RegisterTecnico = () => {
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    descripcion: "",
    ci: "",
    calificacion_promedio: 0,
    foto: null as File | null,
    foto_ci: null as File | null,
    rol: "tecnico",
    especialidades: [{ nombre: "", referencias: "", anio_experiencia: 0 }],
  });

  // =========================
  // CARGAR CATEGORÍAS
  // =========================
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await getCategoriasRequest();
        setCategorias(res);
      } catch (e) {
        console.error("Error cargando categorías", e);
      }
    };
    cargarCategorias();
  }, []);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEspecialidadChange = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const nuevas = [...form.especialidades];
    const fieldName = e.target.name as keyof (typeof nuevas)[number];
    (nuevas[index] as any)[fieldName] = e.target.value;
    setForm({ ...form, especialidades: nuevas });
  };

  const agregarEspecialidad = () => {
    setForm({
      ...form,
      especialidades: [
        ...form.especialidades,
        { nombre: "", referencias: "", anio_experiencia: 0 },
      ],
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.nombre.trim() || !form.apellido.trim()) {
      alert("Nombre y apellido son requeridos");
      return;
    }

    if (!form.email.trim()) {
      alert("Email es requerido");
      return;
    }

    if (!form.password || form.password.length < 6) {
      alert("Contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!form.ci.trim()) {
      alert("CI es requerido");
      return;
    }

    if (!form.descripcion.trim()) {
      alert("Descripción es requerida");
      return;
    }

    const calificacion = Number(form.calificacion_promedio);
    if (isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
      alert("Calificación debe estar entre 0 y 5");
      return;
    }

    try {
      let fotoUrl = "";
      let fotoCiUrl = "";

      if (form.foto instanceof File) {
        fotoUrl = await uploadImageCloudinary(form.foto);
      }

      if (form.foto_ci instanceof File) {
        fotoCiUrl = await uploadImageCloudinary(form.foto_ci);
      }

      // Filtrar especialidades vacías (solo enviar si tienen nombre)
      const especialidadesValidas = form.especialidades.filter(
        (e) => e.nombre.trim() !== ""
      );

      if (especialidadesValidas.length === 0) {
        alert("Por favor, agrega al menos una especialidad");
        return;
      }

      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        telefono: form.telefono.trim() || null,
        descripcion: form.descripcion.trim(),
        ci: form.ci.trim(),
        foto: fotoUrl || null,
        foto_ci: fotoCiUrl || null,
        rol: "tecnico" as const,
        calificacion_promedio: calificacion,
        especialidades: especialidadesValidas.map((e) => ({
          nombre: e.nombre.trim(),
          referencias: e.referencias.trim() || null,
          anio_experiencia: Number(e.anio_experiencia) || 0,
        })),
      };

      console.log("Enviando payload:", JSON.stringify(payload, null, 2));

      const res = await registerTecnicoRequest(payload);
      alert("Técnico registrado correctamente\n" + res.msg);
      // Limpiar formulario tras éxito
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        descripcion: "",
        ci: "",
        calificacion_promedio: 0,
        foto: null,
        foto_ci: null,
        rol: "tecnico",
        especialidades: [{ nombre: "", referencias: "", anio_experiencia: 0 }],
      });
    } catch (err: any) {
      console.error("Error completo:", err);
      const mensajeError =
        err?.response?.data?.error || err?.message || "Error desconocido";
      alert("Error registrando técnico:\n" + mensajeError);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Registrar Técnico</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="ci"
          placeholder="CI"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="calificacion_promedio"
          placeholder="Calificación Inicial (0-5)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <label>Foto del Técnico:</label>
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, foto: e.target.files?.[0] || null })
          }
        />

        <label>Foto del CI:</label>
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, foto_ci: e.target.files?.[0] || null })
          }
        />

        <h3 className="font-bold">Especialidades</h3>

        {form.especialidades.map((esp, index) => (
          <div key={index} className="border p-3 rounded mb-2">
            <select
              name="nombre"
              className="w-full p-2 border rounded mb-2"
              value={esp.nombre}
              onChange={(e) => handleEspecialidadChange(index, e)}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="referencias"
              placeholder="Referencias"
              onChange={(e) => handleEspecialidadChange(index, e)}
              className="w-full p-2 border rounded mb-2"
            />

            <input
              type="number"
              name="anio_experiencia"
              placeholder="Años experiencia"
              onChange={(e) => handleEspecialidadChange(index, e)}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={agregarEspecialidad}
          className="bg-gray-500 text-white p-2 rounded mb-4"
        >
          + Agregar especialidad
        </button>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Registrar Técnico
        </button>
      </form>
    </div>
  );
};
