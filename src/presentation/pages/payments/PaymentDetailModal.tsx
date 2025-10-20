import { FaTimes } from "react-icons/fa";

interface PaymentDetailModalProps {
  payment: {
    id: number;
    client: string;
    technician: string;
    type: string;
    date: string;
    amount: number;
  };
  onClose: () => void;
}

export default function PaymentDetailModal({
  payment,
  onClose,
}: PaymentDetailModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-96 relative border border-indigo-100/70 dark:border-slate-700 animate-fade-in">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-5 text-center">
          Detalle de Pago
        </h2>

        <div className="text-gray-700 dark:text-gray-300 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Monto Total:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Bs. {payment.amount}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{payment.client}</span>
          </div>
          <div className="flex justify-between">
            <span>Técnico:</span>
            <span>{payment.technician}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>{payment.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Tipo de Pago:</span>
            <span>{payment.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión del Sistema:</span>
            <span>Bs. {(payment.amount * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Método de Pago:</span>
            <span>Tarjeta</span>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-200 font-medium px-4 py-2 rounded-md"
          >
            Cerrar
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition">
            Descargar comprobante
          </button>
        </div>
      </div>
    </div>
  );
}
