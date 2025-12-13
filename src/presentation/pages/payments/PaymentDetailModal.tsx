import {
  FaTimes,
  FaCreditCard,
  FaQrcode,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa";
import jsPDF from "jspdf";

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

  const descargarComprobante = async () => {
    try {
      const doc = new jsPDF();
      let yPos = 10;

      // Título
      doc.setFontSize(16);
      doc.text("COMPROBANTE DE PAGO", 105, yPos, { align: "center" });

      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Comprobante #${payment.id_pago}`, 105, yPos, {
        align: "center",
      });

      yPos += 15;

      // Tabla de datos principales
      const tableData1 = [
        ["Concepto", "Valor"],
        [
          "Monto Total",
          `Bs. ${parseFloat(payment.monto_total.toString()).toFixed(2)}`,
        ],
        ["Cliente", clienteNombre],
        ["Técnico", tecnicoNombre],
        [
          "Fecha",
          payment.fecha_pago
            ? new Date(payment.fecha_pago).toLocaleDateString("es-BO")
            : "N/A",
        ],
        ["Estado", (payment.estado || "N/A").toUpperCase()],
        [
          "Método de Pago",
          payment.metodo_pago
            ? payment.metodo_pago.charAt(0).toUpperCase() +
              payment.metodo_pago.slice(1)
            : "Tarjeta",
        ],
      ];

      doc.setFontSize(10);
      doc.rect(14, yPos - 5, 182, 50);
      doc.text("Información Principal", 15, yPos);

      yPos += 6;
      tableData1.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], 20, yPos);
        doc.text(row[1], 150, yPos, { align: "right" });
        yPos += 6;
      });

      yPos += 10;

      // Tabla de desglose
      const tableData2 = [
        ["Concepto", "Monto (Bs.)"],
        [
          "Comisión del Sistema",
          parseFloat(payment.comision_empresa.toString()).toFixed(2),
        ],
        [
          "Monto Técnico",
          parseFloat(payment.monto_tecnico.toString()).toFixed(2),
        ],
        ["TOTAL", parseFloat(payment.monto_total.toString()).toFixed(2)],
      ];

      doc.rect(14, yPos - 5, 182, 28);
      doc.setFont("helvetica", "bold");
      doc.text("Desglose de Pago", 15, yPos);

      yPos += 6;
      tableData2.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
        } else if (index === tableData2.length - 1) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], 20, yPos);
        doc.text(row[1], 150, yPos, { align: "right" });
        yPos += 6;
      });

      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Documento generado automáticamente", 105, yPos, {
        align: "center",
      });

      // Generar PDF como blob y descargar
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comprobante-pago-${payment.id_pago}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al descargar el comprobante");
    }
  };

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
          <button
            onClick={descargarComprobante}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
          >
            📥 Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
