import {
  FaTimes,
  FaCreditCard,
  FaQrcode,
  FaMoneyBillWave,
  FaMobileAlt,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const clienteNombre: string = `${
    payment.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.nombre ??
    "N/A"
  } ${
    payment.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.apellido ??
    ""
  }`;
  const tecnicoNombre: string = `${
    payment.ServicioAsignado?.Tecnico?.Usuario?.nombre ?? "N/A"
  } ${payment.ServicioAsignado?.Tecnico?.Usuario?.apellido ?? ""}`;

  const descargarComprobante = () => {
    try {
      // Crear documento PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      // Título
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("COMPROBANTE DE PAGO", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 10;

      // Número de comprobante
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(`Comprobante #${payment.id_pago}`, pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 12;

      // Tabla de información principal
      autoTable(pdf, {
        startY: yPosition,
        head: [["Concepto", "Valor"]],
        body: [
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
          ["Estado", (payment.estado ?? "N/A").toUpperCase()],
          [
            "Método de Pago",
            payment.metodo_pago
              ? payment.metodo_pago.charAt(0).toUpperCase() +
                payment.metodo_pago.slice(1)
              : "Tarjeta",
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 11,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 90, halign: "right" },
        },
        margin: { left: 10, right: 10 },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;

      // Tabla de desglose de pagos
      autoTable(pdf, {
        startY: yPosition,
        head: [["Concepto", "Monto (Bs.)"]],
        body: [
          [
            "Comisión del Sistema",
            parseFloat(payment.comision_empresa.toString()).toFixed(2),
          ],
          [
            "Monto Técnico",
            parseFloat(payment.monto_tecnico.toString()).toFixed(2),
          ],
          ["TOTAL", parseFloat(payment.monto_total.toString()).toFixed(2)],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 11,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 90, halign: "right" },
        },
        margin: { left: 10, right: 10 },
      });

      // Pie de página
      yPosition = (pdf as any).lastAutoTable.finalY + 20;
      pdf.setFontSize(8);
      pdf.setFont(undefined, "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Documento generado automáticamente", pageWidth / 2, yPosition, {
        align: "center",
      });

      pdf.setTextColor(0, 0, 0);
      pdf.text(
        `Fecha: ${new Date().toLocaleDateString("es-BO")}`,
        pageWidth / 2,
        yPosition + 5,
        { align: "center" }
      );

      // Descargar
      pdf.save(`comprobante-pago-${payment.id_pago}.pdf`);
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

        {/* Contenido visible del modal */}
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
