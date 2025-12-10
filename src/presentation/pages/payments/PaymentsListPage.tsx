import { useState, useEffect } from "react";
import { FaSpinner, FaFilePdf, FaEye, FaCreditCard, FaQrcode, FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PaymentDetailModal from "./PaymentDetailModal";
import { listarTodosPagos, type PagoServicio } from "../../../api/pago";

type Pago = PagoServicio;

export const PaymentsListPage = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [filteredPagos, setFilteredPagos] = useState<Pago[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedMetodo, setSelectedMetodo] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  useEffect(() => {
    cargarPagos();
  }, []);

  useEffect(() => {
    filtrarPagos();
  }, [selectedEstado, selectedMetodo, searchTerm, pagos]);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarTodosPagos();
      setPagos(data);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setError("Error al cargar los pagos. Por favor, intenta de nuevo.");
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPagos = () => {
    let filtered = pagos;

    // Filtrar por estado
    if (selectedEstado !== "todos") {
      filtered = filtered.filter((p) => p.estado === selectedEstado);
    }

    // Filtrar por método de pago
    if (selectedMetodo !== "todos") {
      filtered = filtered.filter((p) => p.metodo_pago === selectedMetodo);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.id_pago.toString().includes(searchTerm) ||
          p.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.ServicioAsignado?.Tecnico?.Usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPagos(filtered);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Pagos - SmartService", 14, 22);

    // Fecha
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30);

    // Estadísticas
    const totalPagos = filteredPagos.length;
    const totalIngresos = filteredPagos
      .filter((p) => p.estado === "pagado")
      .reduce((sum, p) => sum + parseFloat(p.monto_total.toString()), 0);
    const totalComision = filteredPagos
      .filter((p) => p.estado === "pagado")
      .reduce((sum, p) => sum + parseFloat(p.comision_empresa.toString()), 0);

    doc.setFontSize(10);
    doc.text(`Total Pagos: ${totalPagos}`, 14, 38);
    doc.text(`Ingresos Totales: Bs. ${totalIngresos.toFixed(2)}`, 14, 44);
    doc.text(`Comisión Empresa (10%): Bs. ${totalComision.toFixed(2)}`, 14, 50);

    // Tabla
    const tableData = filteredPagos.map((p) => [
      p.id_pago,
      `${p.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.nombre || "N/A"} ${p.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.apellido || ""
      }`,
      `${p.ServicioAsignado?.Tecnico?.Usuario?.nombre || "N/A"} ${p.ServicioAsignado?.Tecnico?.Usuario?.apellido || ""
      }`,
      `Bs. ${parseFloat(p.monto_total.toString()).toFixed(2)}`,
      p.metodo_pago || "tarjeta",
      p.estado,
      p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-BO") : "N/A",
    ]);

    autoTable(doc, {
      startY: 58,
      head: [["ID", "Cliente", "Técnico", "Monto", "Método", "Estado", "Fecha"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`pagos_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "bg-green-100 text-green-700";
      case "pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "fallido":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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

  const totalIngresos = filteredPagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + parseFloat(p.monto_total.toString()), 0);

  const totalComision = filteredPagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + parseFloat(p.comision_empresa.toString()), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Gestión de Pagos
        </h2>
        <button
          onClick={exportarPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaFilePdf /> Exportar PDF
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Ingresos Totales</p>
          <p className="text-2xl font-bold">Bs. {totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Comisión Empresa (10%)</p>
          <p className="text-2xl font-bold">Bs. {totalComision.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Pagos</p>
          <p className="text-2xl font-bold">{filteredPagos.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          title="Filtrar por estado"
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="fallido">Fallido</option>
        </select>

        <select
          title="Filtrar por método de pago"
          value={selectedMetodo}
          onChange={(e) => setSelectedMetodo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="todos">Todos los métodos</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="qr">QR</option>
          <option value="efectivo">Efectivo</option>
          <option value="movil">Móvil</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por ID, cliente o técnico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Técnico</th>
              <th className="px-4 py-3">Monto Total</th>
              <th className="px-4 py-3">Comisión</th>
              <th className="px-4 py-3">Monto Técnico</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPagos.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron pagos
                </td>
              </tr>
            ) : (
              filteredPagos.map((pago) => (
                <tr
                  key={pago.id_pago}
                  className="border-b dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 font-medium">#{pago.id_pago}</td>
                  <td className="px-4 py-3">
                    {pago.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.nombre}{" "}
                    {pago.ServicioAsignado?.SolicitudServicio?.Cliente?.Usuario?.apellido}
                  </td>
                  <td className="px-4 py-3">
                    {pago.ServicioAsignado?.Tecnico?.Usuario?.nombre}{" "}
                    {pago.ServicioAsignado?.Tecnico?.Usuario?.apellido}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    Bs. {parseFloat(pago.monto_total.toString()).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    Bs. {parseFloat(pago.comision_empresa.toString()).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    Bs. {parseFloat(pago.monto_tecnico.toString()).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center">
                      {getMetodoIcon(pago.metodo_pago || "tarjeta")}
                      {getMetodoLabel(pago.metodo_pago || "tarjeta")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${getEstadoColor(
                        pago.estado
                      )}`}
                    >
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-BO") : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedPago(pago)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition inline-flex items-center gap-1"
                    >
                      <FaEye /> Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedPago && (
        <PaymentDetailModal
          payment={selectedPago as any}
          onClose={() => setSelectedPago(null)}
        />
      )}
    </div>
  );
};
