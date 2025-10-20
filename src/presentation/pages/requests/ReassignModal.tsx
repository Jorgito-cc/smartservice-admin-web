import { FaTimes, FaStar } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ReassignModalProps {
  request: {
    id: number;
    client: string;
    technician: string;
    service: string;
  };
  onClose: () => void;
}

// 🧠 Definimos el esquema Zod
const reassignSchema = z.object({
  newTechnician: z.string().min(1, "Selecciona un técnico"),
  comment: z.string().optional(),
});

// 🔹 Inferimos el tipo de datos
type ReassignFormData = z.infer<typeof reassignSchema>;

export default function ReassignModal({ request, onClose }: ReassignModalProps) {
  // 🪄 Inicializamos react-hook-form con zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReassignFormData>({
    resolver: zodResolver(reassignSchema),
  });

  // 🧾 Evento al enviar formulario
  const onSubmit = (data: ReassignFormData) => {
    console.log("📦 Payload enviado:", {
      requestId: request.id,
      client: request.client,
      previousTechnician: request.technician,
      newTechnician: data.newTechnician,
      comment: data.comment || "(sin comentario)",
    });

    alert(`✅ Solicitud #${request.id} reasignada a ${data.newTechnician}`);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-96 relative border border-indigo-100/70 dark:border-slate-700">
        {/* 🔹 Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
          Reasignar Técnico
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <input
              value={request.client}
              readOnly
              className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Servicio + Técnico actual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Servicio
              </label>
              <input
                value={request.service}
                readOnly
                className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Técnico Actual
              </label>
              <div className="flex items-center justify-between border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 bg-gray-50 dark:bg-slate-800">
                <span>{request.technician}</span>
                <FaStar className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Nuevo técnico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nuevo Técnico
            </label>
            <select
              {...register("newTechnician")}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
            >
              <option value="">Seleccionar...</option>
              <option value="Ana Morales">Ana Morales ⭐⭐⭐⭐</option>
              <option value="Luis Pérez">Luis Pérez ⭐⭐⭐⭐</option>
            </select>
            {errors.newTechnician && (
              <p className="text-red-600 text-sm mt-1">
                {errors.newTechnician.message}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comentario (opcional)
            </label>
            <textarea
              {...register("comment")}
              rows={2}
              placeholder="Motivo del cambio..."
              className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            Reasignar
          </button>
        </form>
      </div>
    </div>
  );
}
