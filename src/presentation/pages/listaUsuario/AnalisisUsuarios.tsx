import { useEffect, useState, useRef } from "react";
import { getAllUsuariosRequest } from "../../../api/usuarios";
import type { UsuarioType } from "../../../types/usuarioType";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
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

export const AnalisisUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const cargarUsuarios = async () => {
    try {
      const data = await getAllUsuariosRequest();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Contar por rol
  const usuariosPorRol = {
    admin: usuarios.filter((u) => u.rol === "admin").length,
    tecnico: usuarios.filter((u) => u.rol === "tecnico").length,
    cliente: usuarios.filter((u) => u.rol === "cliente").length,
  };

  // Contar por estado
  const usuariosPorEstado = {
    activos: usuarios.filter((u) => u.estado).length,
    deshabilitados: usuarios.filter((u) => !u.estado).length,
  };

  // Técnicos por rango de calificación
  const tecnicosPorCalificacion: { [key: string]: number } = {
    "Sin calificación": 0,
    "0-2 estrellas": 0,
    "2-3 estrellas": 0,
    "3-4 estrellas": 0,
    "4-5 estrellas": 0,
  };

  usuarios
    .filter((u) => u.rol === "tecnico")
    .forEach((u) => {
      const cal = u.Tecnico?.calificacion_promedio || 0;
      if (cal === 0) tecnicosPorCalificacion["Sin calificación"]++;
      else if (cal < 2) tecnicosPorCalificacion["0-2 estrellas"]++;
      else if (cal < 3) tecnicosPorCalificacion["2-3 estrellas"]++;
      else if (cal < 4) tecnicosPorCalificacion["3-4 estrellas"]++;
      else tecnicosPorCalificacion["4-5 estrellas"]++;
    });

  // Datos para gráficos
  const rolData = {
    labels: ["Administradores", "Técnicos", "Clientes"],
    datasets: [
      {
        label: "Usuarios por Rol",
        data: [
          usuariosPorRol.admin,
          usuariosPorRol.tecnico,
          usuariosPorRol.cliente,
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(34, 197, 94, 0.6)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const estadoData = {
    labels: ["Activos", "Deshabilitados"],
    datasets: [
      {
        label: "Usuarios por Estado",
        data: [usuariosPorEstado.activos, usuariosPorEstado.deshabilitados],
        backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(239, 68, 68, 0.6)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const calificacionData = {
    labels: Object.keys(tecnicosPorCalificacion),
    datasets: [
      {
        label: "Técnicos por Calificación",
        data: Object.values(tecnicosPorCalificacion),
        backgroundColor: [
          "rgba(107, 114, 128, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(16, 185, 129, 0.6)",
        ],
        borderColor: [
          "rgba(107, 114, 128, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Contar técnicos disponibles
  const tecnicosDisponibles = usuarios.filter(
    (u) => u.rol === "tecnico" && u.Tecnico?.disponibilidad
  ).length;
  const tecnicosNoDisponibles = usuariosPorRol.tecnico - tecnicosDisponibles;

  const disponibilidadData = {
    labels: ["Disponibles", "No Disponibles"],
    datasets: [
      {
        label: "Disponibilidad de Técnicos",
        data: [tecnicosDisponibles, tecnicosNoDisponibles],
        backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(239, 68, 68, 0.6)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
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
      doc.text("Reporte de Análisis de Usuarios", 10, 10);
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
        `reporte_usuarios_${new Date().toISOString().split("T")[0]}.pdf`
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
          📊 Análisis de Usuarios
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
          <p className="text-sm opacity-90">Total Usuarios</p>
          <p className="text-2xl font-bold">{usuarios.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Usuarios Activos</p>
          <p className="text-2xl font-bold">{usuariosPorEstado.activos}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Técnicos Disponibles</p>
          <p className="text-2xl font-bold">{tecnicosDisponibles}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Técnicos con Calif.</p>
          <p className="text-2xl font-bold">
            {
              usuarios.filter(
                (u) =>
                  u.rol === "tecnico" &&
                  (u.Tecnico?.calificacion_promedio || 0) > 0
              ).length
            }
          </p>
        </div>
      </div>

      {/* Contenedor para exportar */}
      <div
        ref={contentRef}
        className="bg-white p-8 rounded-lg shadow-lg space-y-8"
      >
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuarios por Rol */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Usuarios por Rol
            </h2>
            <Pie data={rolData} options={{ responsive: true }} />
          </div>

          {/* Usuarios por Estado */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Usuarios por Estado
            </h2>
            <Doughnut data={estadoData} options={{ responsive: true }} />
          </div>

          {/* Técnicos por Calificación */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Técnicos por Calificación
            </h2>
            <Bar data={calificacionData} options={{ responsive: true }} />
          </div>

          {/* Disponibilidad de Técnicos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Disponibilidad de Técnicos
            </h2>
            <Pie data={disponibilidadData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Resumen de Estadísticas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Resumen de Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {usuarios.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {usuariosPorRol.admin}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Técnicos</p>
              <p className="text-2xl font-bold text-indigo-600">
                {usuariosPorRol.tecnico}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-green-600">
                {usuariosPorRol.cliente}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-emerald-600">
                {usuariosPorEstado.activos}
              </p>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Técnicos */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Top Técnicos por Calificación
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Calificación</th>
                  <th className="p-2 text-left">Disponible</th>
                  <th className="p-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios
                  .filter((u) => u.rol === "tecnico")
                  .sort(
                    (a, b) =>
                      (b.Tecnico?.calificacion_promedio || 0) -
                      (a.Tecnico?.calificacion_promedio || 0)
                  )
                  .slice(0, 5)
                  .map((u) => (
                    <tr
                      key={u.id_usuario}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2">
                        {u.nombre} {u.apellido}
                      </td>
                      <td className="p-2">
                        <span className="text-yellow-600 font-bold">
                          ⭐{" "}
                          {(u.Tecnico?.calificacion_promedio || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-2">
                        {u.Tecnico?.disponibilidad ? (
                          <span className="text-green-600 font-bold">Sí</span>
                        ) : (
                          <span className="text-red-600 font-bold">No</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-white text-xs font-bold ${
                            u.estado ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {u.estado ? "Activo" : "Deshabilitado"}
                        </span>
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
