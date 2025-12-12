import { useState, useEffect, useCallback } from "react";
import {
  FaSpinner,
  FaFilePdf,
  FaChartPie,
  FaChartBar,
  FaChartLine,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { listarTodosPagos, type PagoServicio } from "../../../api/pago";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export const PaymentsBI = () => {
  const [pagos, setPagos] = useState<PagoServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const cargarPagos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listarTodosPagos();

      // Filtrar por fecha
      const pagosFiltrados = data.filter((p) => {
        if (!p.fecha_pago) return false;
        const fecha = new Date(p.fecha_pago);
        return fecha >= new Date(fechaDesde) && fecha <= new Date(fechaHasta);
      });

      setPagos(pagosFiltrados);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoading(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    setFechaHasta(hoy.toISOString().split("T")[0]);
    setFechaDesde(hace30Dias.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarPagos();
    }
  }, [fechaDesde, fechaHasta, cargarPagos]);

  // Calcular estadísticas
  const totalPagado = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + parseFloat(p.monto_total.toString()), 0);

  const totalPendiente = pagos
    .filter((p) => p.estado === "pendiente")
    .reduce((sum, p) => sum + parseFloat(p.monto_total.toString()), 0);

  const totalComision = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + parseFloat(p.comision_empresa.toString()), 0);

  // Pagos por método
  const pagosPorMetodo = {
    tarjeta: pagos.filter((p) => p.metodo_pago === "tarjeta").length,
    qr: pagos.filter((p) => p.metodo_pago === "qr").length,
    efectivo: pagos.filter((p) => p.metodo_pago === "efectivo").length,
    movil: pagos.filter((p) => p.metodo_pago === "movil").length,
  };

  // Pagos por estado
  const pagosPorEstado = {
    pagado: pagos.filter((p) => p.estado === "pagado").length,
    pendiente: pagos.filter((p) => p.estado === "pendiente").length,
    fallido: pagos.filter((p) => p.estado === "fallido").length,
  };

  // Ingresos por día
  const ingresosPorDia: { [key: string]: number } = {};
  pagos
    .filter((p) => p.estado === "pagado" && p.fecha_pago)
    .forEach((p) => {
      const fecha = new Date(p.fecha_pago!).toLocaleDateString("es-BO");
      ingresosPorDia[fecha] =
        (ingresosPorDia[fecha] || 0) + parseFloat(p.monto_total.toString());
    });

  const metodoPieData = {
    labels: ["Tarjeta", "QR", "Efectivo", "Móvil"],
    datasets: [
      {
        label: "Cantidad de Pagos",
        data: [
          pagosPorMetodo.tarjeta,
          pagosPorMetodo.qr,
          pagosPorMetodo.efectivo,
          pagosPorMetodo.movil,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const estadoBarData = {
    labels: ["Pagado", "Pendiente", "Fallido"],
    datasets: [
      {
        label: "Cantidad",
        data: [
          pagosPorEstado.pagado,
          pagosPorEstado.pendiente,
          pagosPorEstado.fallido,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(251, 146, 60, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 146, 60, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const ingresoLineData = {
    labels: Object.keys(ingresosPorDia),
    datasets: [
      {
        label: "Ingresos Diarios",
        data: Object.values(ingresosPorDia),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Pagos - Análisis", 14, 22);

    // Período
    doc.setFontSize(11);
    doc.text(`Período: ${fechaDesde} al ${fechaHasta}`, 14, 30);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-BO")}`, 14, 36);

    // Estadísticas
    doc.setFontSize(12);
    doc.text("Resumen de Estadísticas", 14, 46);

    const statsData = [
      ["Total Pagado", `Bs. ${totalPagado.toFixed(2)}`],
      ["Total Pendiente", `Bs. ${totalPendiente.toFixed(2)}`],
      ["Comisión Empresa", `Bs. ${totalComision.toFixed(2)}`],
      ["Total Transacciones", pagos.length.toString()],
      ["Pagos Completados", pagosPorEstado.pagado.toString()],
      ["Pagos Pendientes", pagosPorEstado.pendiente.toString()],
    ];

    autoTable(doc, {
      startY: 52,
      head: [["Concepto", "Valor"]],
      body: statsData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Tabla de métodos de pago
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Pagos por Método", 14, 22);

    const metodoData = [
      ["Tarjeta", pagosPorMetodo.tarjeta.toString()],
      ["QR", pagosPorMetodo.qr.toString()],
      ["Efectivo", pagosPorMetodo.efectivo.toString()],
      ["Móvil", pagosPorMetodo.movil.toString()],
    ];

    autoTable(doc, {
      startY: 28,
      head: [["Método", "Cantidad"]],
      body: metodoData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`reporte_pagos_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Reportes BI - Pagos
        </h1>
        <button
          onClick={exportarPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FaFilePdf /> Exportar PDF
        </button>
      </div>

      {/* Filtros de Fecha */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Desde
          </label>
          <input
            type="date"
            title="Fecha desde"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hasta
          </label>
          <input
            type="date"
            title="Fecha hasta"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={cargarPagos}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Pagado</p>
          <p className="text-2xl font-bold">Bs. {totalPagado.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Pendiente</p>
          <p className="text-2xl font-bold">Bs. {totalPendiente.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Comisión Empresa</p>
          <p className="text-2xl font-bold">Bs. {totalComision.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos por Método */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <FaChartPie className="text-indigo-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Pagos por Método
            </h3>
          </div>
          <Pie data={metodoPieData} />
        </div>

        {/* Pagos por Estado */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <FaChartBar className="text-indigo-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Pagos por Estado
            </h3>
          </div>
          <Bar
            data={estadoBarData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Ingresos en el Tiempo */}
      {Object.keys(ingresosPorDia).length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-indigo-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Ingresos por Día
            </h3>
          </div>
          <Line
            data={ingresoLineData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}

      {/* Tabla de Resumen */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Resumen de Métodos de Pago
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Cantidad</th>
                <th className="px-4 py-3 text-left">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3">Tarjeta</td>
                <td className="px-4 py-3">{pagosPorMetodo.tarjeta}</td>
                <td className="px-4 py-3">
                  {pagos.length > 0
                    ? ((pagosPorMetodo.tarjeta / pagos.length) * 100).toFixed(2)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3">QR</td>
                <td className="px-4 py-3">{pagosPorMetodo.qr}</td>
                <td className="px-4 py-3">
                  {pagos.length > 0
                    ? ((pagosPorMetodo.qr / pagos.length) * 100).toFixed(2)
                    : 0}
                  %
                </td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3">Efectivo</td>
                <td className="px-4 py-3">{pagosPorMetodo.efectivo}</td>
                <td className="px-4 py-3">
                  {pagos.length > 0
                    ? ((pagosPorMetodo.efectivo / pagos.length) * 100).toFixed(
                        2
                      )
                    : 0}
                  %
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">Móvil</td>
                <td className="px-4 py-3">{pagosPorMetodo.movil}</td>
                <td className="px-4 py-3">
                  {pagos.length > 0
                    ? ((pagosPorMetodo.movil / pagos.length) * 100).toFixed(2)
                    : 0}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
