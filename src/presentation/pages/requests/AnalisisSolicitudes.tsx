import { useEffect, useState, useRef } from "react";
import {
  listarTodasSolicitudes,
  type Solicitud,
} from "../../../api/solicitudes";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

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

type Status =
  | "pendiente"
  | "con_ofertas"
  | "asignado"
  | "en_proceso"
  | "completado"
  | "cancelado";

const statusMap: Record<Status, string> = {
  pendiente: "Pendiente",
  con_ofertas: "Con Ofertas",
  asignado: "Asignado",
  en_proceso: "En Proceso",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const AnalisisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const cargarSolicitudes = async () => {
    try {
      const data = await listarTodasSolicitudes();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // Contar por estado
  const solicitudesPorEstado: Record<Status, number> = {
    pendiente: 0,
    con_ofertas: 0,
    asignado: 0,
    en_proceso: 0,
    completado: 0,
    cancelado: 0,
  };

  solicitudes.forEach((s) => {
    solicitudesPorEstado[s.estado as Status]++;
  });

  // Contar por categoría
  const solicitudesPorCategoria: { [key: string]: number } = {};
  solicitudes.forEach((s) => {
    const categoria = s.Categoria?.nombre || "Sin categoría";
    solicitudesPorCategoria[categoria] =
      (solicitudesPorCategoria[categoria] || 0) + 1;
  });

  // Solicitudes por fecha (últimos 7 días)
  const solicitudesPorFecha: { [key: string]: number } = {};
  const hoy = new Date();
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toLocaleDateString("es-BO");
    solicitudesPorFecha[fechaStr] = 0;
  }

  solicitudes.forEach((s) => {
    const fechaStr = new Date(s.fecha_publicacion).toLocaleDateString("es-BO");
    if (solicitudesPorFecha[fechaStr] !== undefined) {
      solicitudesPorFecha[fechaStr]++;
    }
  });

  // Datos para gráficos
  const estadoData = {
    labels: Object.keys(statusMap).map((k) => statusMap[k as Status]),
    datasets: [
      {
        label: "Solicitudes por Estado",
        data: Object.keys(statusMap).map(
          (k) => solicitudesPorEstado[k as Status]
        ),
        backgroundColor: [
          "rgba(245, 158, 11, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(99, 102, 241, 0.6)",
          "rgba(168, 85, 247, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(245, 158, 11, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoriaData = {
    labels: Object.keys(solicitudesPorCategoria).slice(0, 8),
    datasets: [
      {
        label: "Top Categorías",
        data: Object.values(solicitudesPorCategoria).slice(0, 8),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const fechaData = {
    labels: Object.keys(solicitudesPorFecha),
    datasets: [
      {
        label: "Solicitudes por Día",
        data: Object.values(solicitudesPorFecha),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Porcentaje de solicitudes completadas
  const completadas = solicitudesPorEstado.completado;
  const total = solicitudes.length;
  const porcentajeCompletado = total > 0 ? (completadas / total) * 100 : 0;

  const completadoData = {
    labels: ["Completadas", "Pendientes"],
    datasets: [
      {
        label: "Tasa de Finalización",
        data: [porcentajeCompletado, 100 - porcentajeCompletado],
        backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(209, 213, 219, 0.6)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(209, 213, 219, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const exportarPDF = async () => {
    if (!contentRef.current) return;

    try {
      setExporting(true);

      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const doc = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      doc.setFontSize(16);
      doc.text("Reporte de Análisis de Solicitudes", 10, 10);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, 10, 17);

      position = 25;

      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 40;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 40;
      }

      doc.save(
        `reporte_solicitudes_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("Error al exportar el PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          📊 Análisis de Solicitudes
        </h1>
        <button
          onClick={exportarPDF}
          disabled={exporting}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          {exporting ? (
            <>
              <FaSpinner className="animate-spin" /> Exportando...
            </>
          ) : (
            <>
              <FaFilePdf /> Exportar PDF
            </>
          )}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Solicitudes</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Pendientes</p>
          <p className="text-2xl font-bold">{solicitudesPorEstado.pendiente}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Completadas</p>
          <p className="text-2xl font-bold">{completadas}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Canceladas</p>
          <p className="text-2xl font-bold">{solicitudesPorEstado.cancelado}</p>
        </div>
      </div>

      {/* Contenedor para exportar */}
      <div
        ref={contentRef}
        className="bg-white p-8 rounded-lg shadow-lg space-y-8"
      >
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes por Estado */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Solicitudes por Estado
            </h2>
            <Pie data={estadoData} options={{ responsive: true }} />
          </div>

          {/* Top Categorías */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Top Categorías
            </h2>
            <Bar data={categoriaData} options={{ responsive: true }} />
          </div>

          {/* Solicitudes por Fecha */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Solicitudes Últimos 7 Días
            </h2>
            <Line data={fechaData} options={{ responsive: true }} />
          </div>

          {/* Tasa de Finalización */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Tasa de Finalización
            </h2>
            <Doughnut data={completadoData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Resumen de Estadísticas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Resumen de Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{total}</p>
            </div>
            <div>
              <p className="text-gray-600">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {solicitudesPorEstado.pendiente}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Con Ofertas</p>
              <p className="text-2xl font-bold text-indigo-600">
                {solicitudesPorEstado.con_ofertas}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Asignado</p>
              <p className="text-2xl font-bold text-purple-600">
                {solicitudesPorEstado.asignado}
              </p>
            </div>
            <div>
              <p className="text-gray-600">En Proceso</p>
              <p className="text-2xl font-bold text-indigo-500">
                {solicitudesPorEstado.en_proceso}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Completado</p>
              <p className="text-2xl font-bold text-green-600">{completadas}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Categorías */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Demanda por Categoría
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 text-left">Categoría</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(solicitudesPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([categoria, cantidad]) => (
                    <tr key={categoria} className="border-b hover:bg-gray-50">
                      <td className="p-2">{categoria}</td>
                      <td className="p-2 text-center font-bold">{cantidad}</td>
                      <td className="p-2 text-right text-gray-600">
                        {((cantidad / total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
