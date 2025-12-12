import { useEffect, useState, useRef } from "react";
import { getAuditoriaLogs } from "../../../api/auditoria";
import type { AuditoriaLog } from "../../../types/auditoriaLogType";
import { Bar, Pie, Line } from "react-chartjs-2";
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

export const BitacoraAnalisis = () => {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const loadLogs = async () => {
    try {
      const data = await getAuditoriaLogs();
      setLogs(data);
    } catch (e) {
      console.error("Error cargando auditoría:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Contar acciones por tipo
  const accionesPorTipo = {
    POST: logs.filter((l) => l.accion.startsWith("POST")).length,
    PUT: logs.filter((l) => l.accion.startsWith("PUT")).length,
    PATCH: logs.filter((l) => l.accion.startsWith("PATCH")).length,
    DELETE: logs.filter((l) => l.accion.startsWith("DELETE")).length,
    GET: logs.filter((l) => l.accion.startsWith("GET")).length,
  };

  // Contar acciones por recurso
  const recursosMap: { [key: string]: string } = {
    "/api/solicitudes": "Solicitudes",
    "/api/categorias": "Categorías",
    "/api/usuarios": "Usuarios",
    "/api/servicios": "Servicios",
    "/api/pagos": "Pagos",
    "/api/calificaciones": "Calificaciones",
    "/api/ofertas": "Ofertas",
    "/api/chat": "Mensajes",
  };

  const accionesPorRecurso: { [key: string]: number } = {};
  logs.forEach((log) => {
    for (const [ruta, nombre] of Object.entries(recursosMap)) {
      if (log.accion.includes(ruta)) {
        accionesPorRecurso[nombre] = (accionesPorRecurso[nombre] || 0) + 1;
        break;
      }
    }
  });

  // Contar acciones por usuario
  const accionesPorUsuario: { [key: string]: number } = {};
  logs.forEach((log) => {
    const nombre = `${log.Usuario?.nombre} ${log.Usuario?.apellido}`;
    accionesPorUsuario[nombre] = (accionesPorUsuario[nombre] || 0) + 1;
  });

  // Logs por hora
  const logsPorHora: { [key: string]: number } = {};
  logs.forEach((log) => {
    const fecha = new Date(log.fecha);
    const hora = fecha.getHours().toString().padStart(2, "0");
    const key = `${hora}:00`;
    logsPorHora[key] = (logsPorHora[key] || 0) + 1;
  });

  // Datos para gráficos
  const tiposData = {
    labels: Object.keys(accionesPorTipo),
    datasets: [
      {
        label: "Cantidad de Acciones",
        data: Object.values(accionesPorTipo),
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(168, 85, 247, 0.6)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(168, 85, 247, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const recursosData = {
    labels: Object.keys(accionesPorRecurso),
    datasets: [
      {
        label: "Acciones por Recurso",
        data: Object.values(accionesPorRecurso),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const usuariosData = {
    labels: Object.keys(accionesPorUsuario).slice(0, 5),
    datasets: [
      {
        label: "Top 5 Usuarios",
        data: Object.values(accionesPorUsuario).slice(0, 5),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const horasData = {
    labels: Object.keys(logsPorHora).sort(),
    datasets: [
      {
        label: "Acciones por Hora",
        data: Object.keys(logsPorHora)
          .sort()
          .map((k) => logsPorHora[k]),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const exportarPDF = async () => {
    if (!contentRef.current) return;

    try {
      setExporting(true);

      // Capturar el contenido como imagen
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      // Crear documento PDF
      const doc = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calcular dimensiones
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Agregar título
      doc.setFontSize(16);
      doc.text("Reporte de Auditoría", 10, 10);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, 10, 17);

      position = 25;

      // Agregar imagen(s)
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 40;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 40;
      }

      doc.save(
        `reporte_auditoria_${new Date().toISOString().split("T")[0]}.pdf`
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
          📊 Análisis de Auditoría
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
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Acciones</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Creaciones</p>
          <p className="text-2xl font-bold">{accionesPorTipo.POST}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Actualizaciones</p>
          <p className="text-2xl font-bold">
            {accionesPorTipo.PUT + accionesPorTipo.PATCH}
          </p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Eliminaciones</p>
          <p className="text-2xl font-bold">{accionesPorTipo.DELETE}</p>
        </div>
      </div>

      {/* Contenedor para exportar */}
      <div
        ref={contentRef}
        className="bg-white p-8 rounded-lg shadow-lg space-y-8"
      >
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tipos de Acciones */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Acciones por Tipo
            </h2>
            <Bar data={tiposData} options={{ responsive: true }} />
          </div>

          {/* Acciones por Recurso */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Acciones por Recurso
            </h2>
            <Pie data={recursosData} options={{ responsive: true }} />
          </div>

          {/* Top Usuarios */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Top 5 Usuarios Más Activos
            </h2>
            <Bar data={usuariosData} options={{ responsive: true }} />
          </div>

          {/* Acciones por Hora */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Actividad por Hora
            </h2>
            <Line data={horasData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Resumen de Estadísticas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Resumen de Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Acciones Crear (POST)</p>
              <p className="text-2xl font-bold text-green-600">
                {accionesPorTipo.POST}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Acciones Actualizar</p>
              <p className="text-2xl font-bold text-blue-600">
                {accionesPorTipo.PUT + accionesPorTipo.PATCH}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Acciones Eliminar</p>
              <p className="text-2xl font-bold text-red-600">
                {accionesPorTipo.DELETE}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Acciones Consultar</p>
              <p className="text-2xl font-bold text-purple-600">
                {accionesPorTipo.GET}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
