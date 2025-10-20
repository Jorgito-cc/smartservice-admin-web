import { useState } from "react";
import PaymentDetailModal from "./PaymentDetailModal";

interface Payment {
  id: number;
  client: string;
  technician: string;
  type: "Comisión" | "Suscripción";
  date: string;
  amount: number;
}

const payments: Payment[] = [
  { id: 1001, client: "Ana Pérez", technician: "José López", type: "Comisión", date: "05/07/2023", amount: 120 },
  { id: 1002, client: "Luis Gómez", technician: "María Flores", type: "Suscripción", date: "04/07/2023", amount: 100 },
  { id: 1003, client: "Alejandro", technician: "Ricardo Díaz", type: "Comisión", date: "03/07/2023", amount: 150 },
  { id: 1004, client: "Laura Rivas", technician: "Jorge Sánchez", type: "Suscripción", date: "02/07/2023", amount: 250 },
];

export const PaymentsListPage = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestión de Pagos y Comisiones
      </h2>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
              >
                <td className="px-4 py-3 font-medium">{p.id}</td>
                <td className="px-4 py-3">{p.client}</td>
                <td className="px-4 py-3">{p.technician}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3">{p.date}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  {p.type === "Comisión" ? (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition">
                      Reasignar
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-1.5 rounded-md font-medium"
                    >
                      Bs. {p.amount}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón reporte */}
      <div className="flex justify-end mt-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">
          Generar Reporte
        </button>
      </div>

      {/* Modal de Detalle */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};
