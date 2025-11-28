import { useState } from "react";
import { registerTecnicoRequest } from "../../../api/auth";
import { uploadImageCloudinary } from "../../../utils/uploadCloudinary";

export const RegisterTecnico = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    descripcion: "",
    foto: null as File | null,
    rol: "tecnico",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let fotoUrl = "";

      if (form.foto instanceof File) {
        fotoUrl = await uploadImageCloudinary(form.foto);
      }

      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        telefono: form.telefono,
        descripcion: form.descripcion,
        rol: form.rol,
        foto: fotoUrl,
      };

      const res = await registerTecnicoRequest(payload);

      alert("Técnico registrado correctamente\n" + res.msg);

      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        descripcion: "",
        foto: null,
        rol: "tecnico",
      });

    } catch (err) {
      console.error(err);
      alert("Error registrando técnico");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Registrar Técnico</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="w-full p-2 border rounded" required />

        <input type="text" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" className="w-full p-2 border rounded" required />

        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo" className="w-full p-2 border rounded" required />

        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" className="w-full p-2 border rounded" required />

        <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="w-full p-2 border rounded" />

        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="w-full p-2 border rounded" />

        <input type="file" name="foto" onChange={(e) => setForm({ ...form, foto: e.target.files?.[0] ?? null })} className="w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Registrar Técnico
        </button>
      </form>
    </div>
  );
};
