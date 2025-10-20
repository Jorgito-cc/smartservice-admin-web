import { useState } from "react";
import { FaClock } from "react-icons/fa";
import ReassignModal from "./ReassignModal";

type Status = "Pendiente" | "En curso" | "Finalizado";

interface Request {
  id: number;
  client: string;
  technician: string;
  service: string;
  date: string;
  status: Status;
}

const requests: Request[] = [
  { id: 1, client: "Carlos Gomez", technician: "Jorge Sanchez", service: "Plomería", date: "07/02/2023", status: "Pendiente" },
  { id: 2, client: "Laura Rivas", technician: "Ana Morales", service: "Electricidad", date: "07/02/2023", status: "En curso" },
  { id: 3, client: "David Ruiz", technician: "Luis Pérez", service: "Carpintería", date: "07/02/2023", status: "Pendiente" },
];

export const RequestListPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<Status>("Pendiente");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const filtered = requests.filter((r) => r.status === selectedStatus);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Gestión de Solicitudes</h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {(["Pendiente", "En curso", "Finalizado"] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStatus(s)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedStatus === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Técnico Asignado</th>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{r.client}</td>
                <td className="px-4 py-3">{r.technician}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      r.status === "Pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "En curso"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedRequest(r)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                  >
                    {r.status === "Pendiente" ? "Reasignar" : "Cancelar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <ReassignModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
