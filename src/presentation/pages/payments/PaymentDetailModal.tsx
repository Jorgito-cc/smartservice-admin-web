import {
  FaTimes,
  FaCreditCard,
  FaQrcode,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa";

interface PaymentDetailModalProps {
  payment: {
    id_pago: number;
    monto_total: number;
    comision_empresa: number;
    monto_tecnico: number;
    estado: string;
    metodo_pago?: string;
    fecha_pago: string | null;
    ServicioAsignado?: {
      id_servicio?: number;
      id_solicitud?: number;
      id_tecnico?: number;
      SolicitudServicio?: {
        Cliente?: {
          Usuario?: {
            nombre: string;
            apellido: string;
          };
        };
      };
      Tecnico?: {
        Usuario?: {
          nombre: string;
          apellido: string;
          email: string;
          foto?: string;
        };
      };
    };
  };
  onClose: () => void;
}

export default function PaymentDetailModal({
  payment,
  onClose,
}: PaymentDetailModalProps) {
  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case "tarjeta":
        return <FaCreditCard className="inline mr-1" />;
      case "qr":
        return <FaQrcode className="inline mr-1" />;
      case "efectivo":
        return <FaMoneyBillWave className="inline mr-1" />;
      case "movil":
        return <FaMobileAlt className="inline mr-1" />;
      default:
        return <FaCreditCard className="inline mr-1" />;
    }
  };

  const getMetodoLabel = (metodo: string) => {
    switch (metodo) {
      case "tarjeta":
        return "Tarjeta";
      case "qr":
        return "QR";
      case "efectivo":
        return "Efectivo";
      case "movil":
        return "Móvil";
      default:
        return "Tarjeta";
    }
  };

  const clienteNombre = `${
    payment.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.nombre ||
    "N/A"
  } ${
    payment.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.apellido ||
    ""
  }`;
  const tecnicoNombre = `${
    payment.ServicioAsignado?.Tecnico?.Usuario?.nombre || "N/A"
  } ${payment.ServicioAsignado?.Tecnico?.Usuario?.apellido || ""}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-96 relative border border-indigo-100/70 dark:border-slate-700 animate-fade-in">
        {/* Cerrar */}
        <button
          onClick={onClose}
          title="Cerrar modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-5 text-center">
          Detalle de Pago #{payment.id_pago}
        </h2>

        <div className="text-gray-700 dark:text-gray-300 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Monto Total:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Bs. {parseFloat(payment.monto_total.toString()).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{clienteNombre}</span>
          </div>
          <div className="flex justify-between">
            <span>Técnico:</span>
            <span>{tecnicoNombre}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>
              {payment.fecha_pago
                ? new Date(payment.fecha_pago).toLocaleDateString("es-BO")
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estado:</span>
            <span className="font-semibold capitalize">{payment.estado}</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión del Sistema:</span>
            <span>
              Bs. {parseFloat(payment.comision_empresa.toString()).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monto Técnico:</span>
            <span>
              Bs. {parseFloat(payment.monto_tecnico.toString()).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Método de Pago:</span>
            <span className="flex items-center">
              {getMetodoIcon(payment.metodo_pago || "tarjeta")}
              {getMetodoLabel(payment.metodo_pago || "tarjeta")}
            </span>
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