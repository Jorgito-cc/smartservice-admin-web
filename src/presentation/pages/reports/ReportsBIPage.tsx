import { useState, useEffect, useRef } from "react";
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
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import { FaSpinner, FaFilePdf, FaFileExcel } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  getKPIs,
  getServiciosPorCategoria,
  getIngresosPorPeriodo,
  getTecnicosTop,
  getInterpretacionInteligente,
  getAconsejadorInteligente,
  type KPIs,
  type ServicioPorCategoria,
  type Ingreso,
  type TecnicoTop,
} from "../../../api/reportes";
import { getAllUsuariosRequest } from "../../../api/usuarios";
import {
  listarTodasSolicitudes,
  type Solicitud,
} from "../../../api/solicitudes";
import { listarTodosPagos, type PagoServicio } from "../../../api/pago";
import { getCategoriasRequest } from "../../../api/categoria";
import { getAuditoriaLogs } from "../../../api/auditoria";
import type { AuditoriaLog } from "../../../types/auditoriaLogType";
import type { CategoriaType } from "../../../types/categoriaType";

// Registrar componentes de Chart.js
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

export const ReportsBIPage = () => {
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Estados para KPIs
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [serviciosPorCategoria, setServiciosPorCategoria] = useState<
    ServicioPorCategoria[]
  >([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [tecnicosTop, setTecnicosTop] = useState<TecnicoTop[]>([]);

  // Estados para nuevas secciones
  const [bitacora, setBitacora] = useState<AuditoriaLog[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [pagos, setPagos] = useState<PagoServicio[]>([]);
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);

  // Estados de exportación
  const [exportingBitacora, setExportingBitacora] = useState(false);
  const [exportingUsuarios, setExportingUsuarios] = useState(false);
  const [exportingSolicitudes, setExportingSolicitudes] = useState(false);
  const [exportingPagos, setExportingPagos] = useState(false);
  const [exportingCategorias, setExportingCategorias] = useState(false);

  // Refs para exportación
  const contentRefBitacora = useRef<HTMLDivElement>(null);
  const contentRefUsuarios = useRef<HTMLDivElement>(null);
  const contentRefSolicitudes = useRef<HTMLDivElement>(null);
  const contentRefPagos = useRef<HTMLDivElement>(null);
  const contentRefCategorias = useRef<HTMLDivElement>(null);

  // Estados para análisis inteligente
  const [interpretacion, setInterpretacion] = useState<string | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<string | null>(null);
  const [loadingInterpretacion, setLoadingInterpretacion] = useState(false);
  const [loadingRecomendaciones, setLoadingRecomendaciones] = useState(false);

  // Estado para detalles de bitácora
  const [selectedBitacoraDetalles, setSelectedBitacoraDetalles] = useState<
    string | null
  >(null);

  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    setFechaHasta(hoy.toISOString().split("T")[0]);
    setFechaDesde(hace30Dias.toISOString().split("T")[0]);

    cargarTodosDatos();
  }, []);

  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      cargarTodosDatos();
    }
  }, [fechaDesde, fechaHasta]);

  // ==================== FUNCIONES DE FORMATO ====================

  const formatearAccion = (accion: string): string => {
    const metodoMap: { [key: string]: string } = {
      POST: "➕ Crear",
      PUT: "✏️ Actualizar",
      PATCH: "🔧 Modificar",
      DELETE: "🗑️ Eliminar",
      GET: "👁️ Consultar",
    };

    const [metodo, ...ruta] = accion.split(" ");
    const rutaCompleta = ruta.join(" ");

    const recursos: { [key: string]: string } = {
      "/api/solicitudes": "Solicitud",
      "/api/categorias": "Categoría",
      "/api/usuarios": "Usuario",
      "/api/servicios": "Servicio",
      "/api/pagos": "Pago",
      "/api/calificaciones": "Calificación",
      "/api/ofertas": "Oferta",
      "/api/chat": "Mensaje",
    };

    let recurso = "Registro";
    for (const [ruta, nombre] of Object.entries(recursos)) {
      if (rutaCompleta.includes(ruta)) {
        recurso = nombre;
        break;
      }
    }

    const metodoFormato = metodoMap[metodo] || metodo;
    return `${metodoFormato} ${recurso}`;
  };

  const formatearDetalles = (detallesJson: string): string => {
    try {
      const detalles = JSON.parse(detallesJson);
      const resumen = [];

      if (detalles.statusCode) {
        resumen.push(`Status: ${detalles.statusCode}`);
      }

      if (detalles.body && typeof detalles.body === "object") {
        const campos = Object.keys(detalles.body).length;
        resumen.push(`${campos} campo(s) modificado(s)`);
      }

      if (detalles.params && Object.keys(detalles.params).length > 0) {
        resumen.push(`Parámetros: ${Object.keys(detalles.params).join(", ")}`);
      }

      return resumen.length > 0 ? resumen.join(" | ") : "Sin detalles";
    } catch {
      return detallesJson.substring(0, 80) + "...";
    }
  };

  const cargarTodosDatos = async () => {
    try {
      setLoading(true);

      const [
        kpisRes,
        categoriasRes,
        ingresosRes,
        tecnicosRes,
        bitacoraRes,
        usuariosRes,
        solicitudesRes,
        pagosRes,
        categoriasListRes,
      ] = await Promise.all([
        getKPIs(),
        getServiciosPorCategoria(),
        getIngresosPorPeriodo(),
        getTecnicosTop(),
        getAuditoriaLogs(),
        getAllUsuariosRequest(),
        listarTodasSolicitudes(),
        listarTodosPagos(),
        getCategoriasRequest(),
      ]);

      setKpis(kpisRes);
      setServiciosPorCategoria(categoriasRes);
      setIngresos(ingresosRes);
      setTecnicosTop(tecnicosRes);
      setBitacora(Array.isArray(bitacoraRes) ? bitacoraRes : []);
      setUsuarios(Array.isArray(usuariosRes) ? usuariosRes : []);
      setSolicitudes(Array.isArray(solicitudesRes) ? solicitudesRes : []);
      setPagos(Array.isArray(pagosRes) ? pagosRes : []);
      setCategorias(Array.isArray(categoriasListRes) ? categoriasListRes : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const generarInterpretacion = async () => {
    try {
      setLoadingInterpretacion(true);
      const resultado = await getInterpretacionInteligente(
        fechaDesde,
        fechaHasta
      );
      setInterpretacion(resultado.interpretacion);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingInterpretacion(false);
    }
  };

  const generarRecomendaciones = async () => {
    try {
      setLoadingRecomendaciones(true);
      const resultado = await getAconsejadorInteligente(fechaDesde, fechaHasta);
      setRecomendaciones(resultado.recomendaciones);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingRecomendaciones(false);
    }
  };

  // ==================== EXPORTACIONES ====================

  const exportarPDFTablas = (
    titulo: string,
    datos: any[][],
    headers: string[]
  ) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(titulo, 10, 10);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, 10, 20);

    autoTable(doc, {
      startY: 25,
      head: [headers],
      body: datos,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(
      `${titulo.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const exportarExcel = (titulo: string, datos: any[][], headers: string[]) => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...datos]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, titulo);
    XLSX.writeFile(
      wb,
      `${titulo.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const exportarPDFGraficos = async (
    contentRef: React.RefObject<HTMLDivElement | null>,
    titulo: string,
    setExporting: (value: boolean) => void
  ) => {
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

      doc.setFontSize(16);
      doc.text(titulo, 10, 10);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, 10, 17);

      let position = 25;
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

      let heightLeft = imgHeight;
      while (heightLeft > pdfHeight - 40) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 40;
      }

      doc.save(
        `${titulo}_grafico_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error exportando:", error);
    } finally {
      setExporting(false);
    }
  };

  // ==================== KPIs Y DASHBOARD PRINCIPAL ====================

  const totalServicios = kpis?.total_servicios || 0;
  const serviciosCompletados = kpis?.servicios_completados || 0;
  const porcentajeCompletado =
    totalServicios > 0
      ? ((serviciosCompletados / totalServicios) * 100).toFixed(2)
      : 0;

  const totalIngresos = ingresos.reduce(
    (sum, i) => sum + (Number(i.total) || 0),
    0
  );
  const comisionEmpresa = ingresos.reduce(
    (sum, i) => sum + (Number(i.comision) || 0),
    0
  );
  const totalPagado = pagos
    .filter((p) => p.estado === "pagado")
    .reduce((sum, p) => sum + (Number(p.monto_total) || 0), 0);
  const totalPendiente = pagos
    .filter((p) => p.estado === "pendiente")
    .reduce((sum, p) => sum + (Number(p.monto_total) || 0), 0);

  // Gráfica de ingresos en el tiempo
  const ingresosAgrupados: Record<string, { total: number; comision: number }> =
    {};
  ingresos.forEach((i) => {
    const fecha = i.fecha
      ? new Date(i.fecha).toLocaleDateString("es-BO")
      : "Sin fecha";
    if (!ingresosAgrupados[fecha]) {
      ingresosAgrupados[fecha] = { total: 0, comision: 0 };
    }
    ingresosAgrupados[fecha].total += Number(i.total) || 0;
    ingresosAgrupados[fecha].comision += Number(i.comision) || 0;
  });

  const chartIngresos = {
    labels: Object.keys(ingresosAgrupados).sort(),
    datasets: [
      {
        label: "Ingresos Totales",
        data: Object.keys(ingresosAgrupados)
          .sort()
          .map((f) => Math.max(0, ingresosAgrupados[f].total || 0)),
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Comisión Empresa",
        data: Object.keys(ingresosAgrupados)
          .sort()
          .map((f) => Math.max(0, ingresosAgrupados[f].comision || 0)),
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // ==================== BITÁCORA ====================

  const datosBitacora = bitacora.map((b) => [
    new Date(b.fecha).toLocaleString("es-BO"),
    b.Usuario?.nombre || "Desconocido",
    b.accion,
    b.accion,
    b.detalles || "N/A",
  ]);

  const datosBitacoraAcciones = Object.entries(
    bitacora.reduce(
      (acc, b) => ({ ...acc, [b.accion]: (acc[b.accion] || 0) + 1 }),
      {} as Record<string, number>
    )
  ).map((e) => [e[0], e[1].toString()]);

  const chartBitacora = {
    labels: Object.keys(
      bitacora.reduce((acc, b) => ({ ...acc, [b.accion]: true }), {})
    ),
    datasets: [
      {
        label: "Acciones en Bitácora",
        data: Object.values(
          bitacora.reduce(
            (acc, b) => ({ ...acc, [b.accion]: (acc[b.accion] || 0) + 1 }),
            {} as Record<string, number>
          )
        ),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  // ==================== USUARIOS ====================

  const datosUsuarios = usuarios.map((u) => [
    u.nombre || "N/A",
    u.email || "N/A",
    u.rol || "N/A",
    u.estado ? "Activo" : "Inactivo",
    u.Tecnico?.disponibilidad ? "Sí" : "No",
    u.Tecnico?.calificacion_promedio
      ? Number(u.Tecnico.calificacion_promedio).toFixed(1)
      : "N/A",
  ]);

  const usuariosPorRol = {
    admin: usuarios.filter((u) => u.rol === "admin").length,
    tecnico: usuarios.filter((u) => u.rol === "tecnico").length,
    cliente: usuarios.filter((u) => u.rol === "cliente").length,
  };

  const chartUsuariosRol = {
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

  // ==================== SOLICITUDES ====================

  const datosSolicitudes = solicitudes.map((s) => [
    s.id_solicitud?.toString() || "N/A",
    s.Categoria?.nombre || "N/A",
    s.estado || "N/A",
    new Date(s.fecha_publicacion).toLocaleDateString("es-BO"),
    s.precio_ofrecido?.toString() || "N/A",
  ]);

  const solicitudesPorEstado: Record<string, number> = {};
  solicitudes.forEach((s) => {
    solicitudesPorEstado[s.estado || "Sin estado"] =
      (solicitudesPorEstado[s.estado || "Sin estado"] || 0) + 1;
  });

  const chartSolicitudes = {
    labels: Object.keys(solicitudesPorEstado),
    datasets: [
      {
        label: "Solicitudes por Estado",
        data: Object.values(solicitudesPorEstado),
        backgroundColor: [
          "rgba(245, 158, 11, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgba(245, 158, 11, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // ==================== PAGOS ====================

  const datosPagos = pagos.map((p) => [
    p.id_pago?.toString() || "N/A",
    p.monto_total?.toString() || "N/A",
    p.metodo_pago || "N/A",
    p.estado || "N/A",
    p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-BO") : "N/A",
  ]);

  const pagosPorEstado: Record<string, number> = {};
  pagos.forEach((p) => {
    pagosPorEstado[p.estado || "Sin estado"] =
      (pagosPorEstado[p.estado || "Sin estado"] || 0) + 1;
  });

  const chartPagos = {
    labels: Object.keys(pagosPorEstado),
    datasets: [
      {
        label: "Pagos por Estado",
        data: Object.values(pagosPorEstado),
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

  // ==================== CATEGORÍAS ====================

  const datosCategorias = categorias.map((c) => [
    c.id_categoria?.toString() || "N/A",
    c.nombre || "N/A",
    c.descripcion || "N/A",
  ]);

  const chartCategorias = {
    labels: categorias.map((c) => c.nombre),
    datasets: [
      {
        label: "Categorías",
        data: categorias.map(() => 1),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Reportes e Inteligencia de Negocios
      </h1>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={cargarTodosDatos}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          Aplicar
        </button>
      </div>

      {/* ==================== KPIS PRINCIPALES ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Total Servicios</div>
          <div className="text-3xl font-bold">{totalServicios}</div>
          <div className="text-xs opacity-75 mt-1">
            {serviciosCompletados} completados ({porcentajeCompletado}%)
          </div>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Ingresos Totales</div>
          <div className="text-3xl font-bold">
            Bs. {Number(totalIngresos || 0).toFixed(2)}
          </div>
          <div className="text-xs opacity-75 mt-1">Período seleccionado</div>
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Usuarios</div>
          <div className="text-3xl font-bold">{usuarios.length}</div>
          <div className="text-xs opacity-75 mt-1">
            {usuarios.filter((u) => u.rol === "cliente").length} clientes,{" "}
            {usuarios.filter((u) => u.rol === "tecnico").length} técnicos
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Comisión Empresa</div>
          <div className="text-3xl font-bold">
            Bs. {Number(comisionEmpresa || 0).toFixed(2)}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {totalIngresos > 0
              ? ((comisionEmpresa / totalIngresos) * 100).toFixed(1)
              : 0}
            % de ingresos
          </div>
        </div>
      </div>

      {/* ==================== RESUMEN DE PAGOS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border-l-4 border-green-600">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Total Pagado
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            Bs. {Number(totalPagado || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {pagos.filter((p) => p.estado === "pagado").length} pagos
            completados
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border-l-4 border-orange-600">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Total Pendiente
          </div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            Bs. {Number(totalPendiente || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {pagos.filter((p) => p.estado === "pendiente").length} pagos
            pendientes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Comisión Empresa
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            Bs. {Number(comisionEmpresa || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Ganancia neta del período
          </div>
        </div>
      </div>

      {/* ==================== GRÁFICA DE INGRESOS EN EL TIEMPO ==================== */}
      {ingresos.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">📈 Ingresos en el Tiempo</h2>
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <Line
              data={chartIngresos}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" as const },
                  title: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `Bs. ${value}` },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* ==================== BITÁCORA ==================== */}
      {bitacora.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">📋 Análisis de Bitácora</h2>

          {/* Estadísticas de Bitácora */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Total Acciones</p>
              <p className="text-3xl font-bold">{bitacora.length}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Creaciones</p>
              <p className="text-3xl font-bold">
                {bitacora.filter((l) => l.accion.startsWith("POST")).length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Actualizaciones</p>
              <p className="text-3xl font-bold">
                {bitacora.filter((l) => l.accion.startsWith("PUT")).length +
                  bitacora.filter((l) => l.accion.startsWith("PATCH")).length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Eliminaciones</p>
              <p className="text-3xl font-bold">
                {bitacora.filter((l) => l.accion.startsWith("DELETE")).length}
              </p>
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() =>
                exportarPDFTablas("Reporte Bitácora", datosBitacora, [
                  "Fecha",
                  "Usuario",
                  "Acción",
                  "Recurso",
                  "Detalles",
                ])
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilePdf /> PDF (Tabla)
            </button>
            <button
              onClick={() =>
                exportarExcel("Reporte Bitácora", datosBitacora, [
                  "Fecha",
                  "Usuario",
                  "Acción",
                  "Recurso",
                  "Detalles",
                ])
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() =>
                exportarPDFGraficos(
                  contentRefBitacora,
                  "Reporte Bitácora",
                  setExportingBitacora
                )
              }
              disabled={exportingBitacora}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {exportingBitacora ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaFilePdf />
              )}{" "}
              PDF (Gráfico)
            </button>
          </div>

          {/* Gráficos */}
          <div
            ref={contentRefBitacora}
            className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Acciones por Tipo */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Acciones por Tipo
                </h3>
                <Bar
                  data={{
                    labels: ["POST", "PUT", "PATCH", "DELETE", "GET"],
                    datasets: [
                      {
                        label: "Cantidad de Acciones",
                        data: [
                          bitacora.filter((l) => l.accion.startsWith("POST"))
                            .length,
                          bitacora.filter((l) => l.accion.startsWith("PUT"))
                            .length,
                          bitacora.filter((l) => l.accion.startsWith("PATCH"))
                            .length,
                          bitacora.filter((l) => l.accion.startsWith("DELETE"))
                            .length,
                          bitacora.filter((l) => l.accion.startsWith("GET"))
                            .length,
                        ],
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
                  }}
                  options={{ responsive: true }}
                />
              </div>

              {/* Acciones por Recurso */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Acciones por Recurso
                </h3>
                <Pie
                  data={{
                    labels: Object.keys(
                      bitacora.reduce((acc, log) => {
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
                        for (const [ruta, nombre] of Object.entries(
                          recursosMap
                        )) {
                          if (log.accion.includes(ruta)) {
                            acc[nombre] = (acc[nombre] || 0) + 1;
                            break;
                          }
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    ),
                    datasets: [
                      {
                        label: "Acciones por Recurso",
                        data: Object.values(
                          bitacora.reduce((acc, log) => {
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
                            for (const [ruta, nombre] of Object.entries(
                              recursosMap
                            )) {
                              if (log.accion.includes(ruta)) {
                                acc[nombre] = (acc[nombre] || 0) + 1;
                                break;
                              }
                            }
                            return acc;
                          }, {} as Record<string, number>)
                        ),
                        backgroundColor: [
                          "rgba(54, 162, 235, 0.6)",
                          "rgba(75, 192, 192, 0.6)",
                          "rgba(255, 206, 86, 0.6)",
                          "rgba(153, 102, 255, 0.6)",
                          "rgba(255, 159, 64, 0.6)",
                          "rgba(201, 203, 207, 0.6)",
                          "rgba(54, 162, 235, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                        ],
                        borderColor: [
                          "rgba(54, 162, 235, 1)",
                          "rgba(75, 192, 192, 1)",
                          "rgba(255, 206, 86, 1)",
                          "rgba(153, 102, 255, 1)",
                          "rgba(255, 159, 64, 1)",
                          "rgba(201, 203, 207, 1)",
                          "rgba(54, 162, 235, 1)",
                          "rgba(75, 192, 192, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{ responsive: true }}
                />
              </div>
            </div>

            {/* Resumen de Estadísticas */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Resumen de Estadísticas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acciones Crear (POST)
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {bitacora.filter((l) => l.accion.startsWith("POST")).length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acciones Actualizar
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {bitacora.filter((l) => l.accion.startsWith("PUT")).length +
                      bitacora.filter((l) => l.accion.startsWith("PATCH"))
                        .length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acciones Eliminar
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      bitacora.filter((l) => l.accion.startsWith("DELETE"))
                        .length
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acciones Consultar
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {bitacora.filter((l) => l.accion.startsWith("GET")).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de Detalle */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Detalle de Acciones
              </h3>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-full border-collapse">
                  <thead className="bg-indigo-600 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Acción
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Resumen
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">
                        Ver Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {bitacora.slice(0, 20).map((b, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {new Date(b.fecha).toLocaleString("es-BO")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {b.Usuario?.nombre} {b.Usuario?.apellido}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {b.Usuario?.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {formatearAccion(b.accion)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {formatearDetalles(b.detalles)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setSelectedBitacoraDetalles(b.detalles)
                            }
                            className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                            title="Ver detalles completos"
                          >
                            🔍 Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bitacora.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No hay registros de auditoría disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== USUARIOS ==================== */}
      {usuarios.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">👥 Análisis de Usuarios</h2>

          {/* Botones de exportación */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() =>
                exportarPDFTablas("Reporte Usuarios", datosUsuarios, [
                  "Nombre",
                  "Email",
                  "Rol",
                  "Estado",
                  "Disponible",
                  "Calificación",
                ])
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilePdf /> PDF (Tabla)
            </button>
            <button
              onClick={() =>
                exportarExcel("Reporte Usuarios", datosUsuarios, [
                  "Nombre",
                  "Email",
                  "Rol",
                  "Estado",
                  "Disponible",
                  "Calificación",
                ])
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() =>
                exportarPDFGraficos(
                  contentRefUsuarios,
                  "Reporte Usuarios",
                  setExportingUsuarios
                )
              }
              disabled={exportingUsuarios}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {exportingUsuarios ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaFilePdf />
              )}{" "}
              PDF (Gráfico)
            </button>
          </div>

          {/* Gráfico */}
          <div ref={contentRefUsuarios} className="bg-gray-50 p-4 rounded-lg">
            <Pie data={chartUsuariosRol} />

            <div className="mt-6">
              <h3 className="font-bold mb-2">Detalle de Usuarios</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Email</th>
                      <th className="border p-2">Rol</th>
                      <th className="border p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.slice(0, 10).map((u, i) => (
                      <tr key={i} className="border">
                        <td className="border p-2">{u.nombre}</td>
                        <td className="border p-2">{u.email}</td>
                        <td className="border p-2">{u.rol}</td>
                        <td className="border p-2">
                          {u.estado ? "Activo" : "Inactivo"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CATEGORÍAS ==================== */}
      {categorias.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">📂 Gestión de Categorías</h2>

          {/* Botones de exportación */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() =>
                exportarPDFTablas("Reporte Categorías", datosCategorias, [
                  "ID",
                  "Nombre",
                  "Descripción",
                ])
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilePdf /> PDF (Tabla)
            </button>
            <button
              onClick={() =>
                exportarExcel("Reporte Categorías", datosCategorias, [
                  "ID",
                  "Nombre",
                  "Descripción",
                ])
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() =>
                exportarPDFGraficos(
                  contentRefCategorias,
                  "Reporte Categorías",
                  setExportingCategorias
                )
              }
              disabled={exportingCategorias}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {exportingCategorias ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaFilePdf />
              )}{" "}
              PDF (Gráfico)
            </button>
          </div>

          {/* Gráfico */}
          <div ref={contentRefCategorias} className="bg-gray-50 p-4 rounded-lg">
            <Pie data={chartCategorias} />

            <div className="mt-6">
              <h3 className="font-bold mb-2">Detalle de Categorías</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((c) => (
                      <tr key={c.id_categoria} className="border">
                        <td className="border p-2">{c.id_categoria}</td>
                        <td className="border p-2">{c.nombre}</td>
                        <td className="border p-2">{c.descripcion || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SOLICITUDES ==================== */}
      {solicitudes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            📝 Análisis de Solicitudes
          </h2>

          {/* Botones de exportación */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() =>
                exportarPDFTablas("Reporte Solicitudes", datosSolicitudes, [
                  "ID",
                  "Categoría",
                  "Estado",
                  "Fecha",
                  "Presupuesto",
                ])
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilePdf /> PDF (Tabla)
            </button>
            <button
              onClick={() =>
                exportarExcel("Reporte Solicitudes", datosSolicitudes, [
                  "ID",
                  "Categoría",
                  "Estado",
                  "Fecha",
                  "Presupuesto",
                ])
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() =>
                exportarPDFGraficos(
                  contentRefSolicitudes,
                  "Reporte Solicitudes",
                  setExportingSolicitudes
                )
              }
              disabled={exportingSolicitudes}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {exportingSolicitudes ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaFilePdf />
              )}{" "}
              PDF (Gráfico)
            </button>
          </div>

          {/* Gráfico */}
          <div
            ref={contentRefSolicitudes}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <Doughnut data={chartSolicitudes} />

            <div className="mt-6">
              <h3 className="font-bold mb-2">Detalle de Solicitudes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Categoría</th>
                      <th className="border p-2">Estado</th>
                      <th className="border p-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.slice(0, 10).map((s) => (
                      <tr key={s.id_solicitud} className="border">
                        <td className="border p-2">{s.id_solicitud}</td>
                        <td className="border p-2">
                          {s.Categoria?.nombre || "N/A"}
                        </td>
                        <td className="border p-2">{s.estado}</td>
                        <td className="border p-2">
                          {new Date(s.fecha_publicacion).toLocaleDateString(
                            "es-BO"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGOS ==================== */}
      {pagos.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">💰 Reportes BI - Pagos</h2>

          {/* Estadísticas de Pagos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Total Pagado</p>
              <p className="text-3xl font-bold">
                Bs.{" "}
                {Number(
                  pagos
                    .filter((p) => p.estado === "pagado")
                    .reduce(
                      (sum, p) => sum + (Number(p.monto_total) || 0),
                      0
                    ) || 0
                ).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Total Pendiente</p>
              <p className="text-3xl font-bold">
                Bs.{" "}
                {Number(
                  pagos
                    .filter((p) => p.estado === "pendiente")
                    .reduce(
                      (sum, p) => sum + (Number(p.monto_total) || 0),
                      0
                    ) || 0
                ).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <p className="text-sm opacity-90">Comisión Empresa</p>
              <p className="text-3xl font-bold">
                Bs.{" "}
                {Number(
                  pagos
                    .filter((p) => p.estado === "pagado")
                    .reduce(
                      (sum, p) => sum + (Number(p.comision_empresa) || 0),
                      0
                    ) || 0
                ).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() =>
                exportarPDFTablas("Reporte Pagos", datosPagos, [
                  "ID",
                  "Monto",
                  "Método",
                  "Estado",
                  "Fecha",
                ])
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilePdf /> PDF (Tabla)
            </button>
            <button
              onClick={() =>
                exportarExcel("Reporte Pagos", datosPagos, [
                  "ID",
                  "Monto",
                  "Método",
                  "Estado",
                  "Fecha",
                ])
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={() =>
                exportarPDFGraficos(
                  contentRefPagos,
                  "Reporte Pagos",
                  setExportingPagos
                )
              }
              disabled={exportingPagos}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {exportingPagos ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaFilePdf />
              )}{" "}
              PDF (Gráfico)
            </button>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pagos por Método */}
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Pagos por Método
              </h3>
              <Pie
                data={{
                  labels: ["Tarjeta", "QR", "Efectivo", "Móvil"],
                  datasets: [
                    {
                      label: "Cantidad de Pagos",
                      data: [
                        pagos.filter(
                          (p) =>
                            (p.metodo_pago || "").toLowerCase() === "tarjeta"
                        ).length,
                        pagos.filter(
                          (p) => (p.metodo_pago || "").toLowerCase() === "qr"
                        ).length,
                        pagos.filter(
                          (p) =>
                            (p.metodo_pago || "").toLowerCase() === "efectivo"
                        ).length,
                        pagos.filter(
                          (p) => (p.metodo_pago || "").toLowerCase() === "movil"
                        ).length,
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
                }}
              />
            </div>

            {/* Pagos por Estado */}
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Pagos por Estado
              </h3>
              <Bar
                data={{
                  labels: ["Pagado", "Pendiente", "Fallido"],
                  datasets: [
                    {
                      label: "Cantidad",
                      data: [
                        pagos.filter((p) => p.estado === "pagado").length,
                        pagos.filter((p) => p.estado === "pendiente").length,
                        pagos.filter((p) => p.estado === "fallido").length,
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
                }}
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

          {/* Ingresos por Día */}
          {pagos.filter((p) => p.estado === "pagado" && p.fecha_pago).length >
            0 && (
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Ingresos por Día
              </h3>
              <Line
                data={{
                  labels: Object.keys(
                    pagos
                      .filter((p) => p.estado === "pagado" && p.fecha_pago)
                      .reduce((acc, p) => {
                        const fecha = new Date(
                          p.fecha_pago!
                        ).toLocaleDateString("es-BO");
                        acc[fecha] =
                          (acc[fecha] || 0) + (Number(p.monto_total) || 0);
                        return acc;
                      }, {} as Record<string, number>)
                  ),
                  datasets: [
                    {
                      label: "Ingresos Diarios",
                      data: Object.values(
                        pagos
                          .filter((p) => p.estado === "pagado" && p.fecha_pago)
                          .reduce((acc, p) => {
                            const fecha = new Date(
                              p.fecha_pago!
                            ).toLocaleDateString("es-BO");
                            acc[fecha] =
                              (acc[fecha] || 0) + (Number(p.monto_total) || 0);
                            return acc;
                          }, {} as Record<string, number>)
                      ),
                      borderColor: "rgb(75, 192, 192)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      tension: 0.4,
                    },
                  ],
                }}
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

          {/* Tabla de Detalle de Pagos */}
          <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg">
            <h3 className="font-bold mb-4 text-lg">
              Resumen de Métodos de Pago
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-200 dark:bg-slate-700">
                  <tr>
                    <th className="border p-2 text-left">Método</th>
                    <th className="border p-2 text-left">Cantidad</th>
                    <th className="border p-2 text-left">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border hover:bg-gray-100 dark:hover:bg-slate-700">
                    <td className="border p-2">Tarjeta</td>
                    <td className="border p-2">
                      {
                        pagos.filter(
                          (p) =>
                            (p.metodo_pago || "").toLowerCase() === "tarjeta"
                        ).length
                      }
                    </td>
                    <td className="border p-2">
                      {pagos.length > 0
                        ? (
                            (pagos.filter(
                              (p) =>
                                (p.metodo_pago || "").toLowerCase() ===
                                "tarjeta"
                            ).length /
                              pagos.length) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="border hover:bg-gray-100 dark:hover:bg-slate-700">
                    <td className="border p-2">QR</td>
                    <td className="border p-2">
                      {
                        pagos.filter(
                          (p) => (p.metodo_pago || "").toLowerCase() === "qr"
                        ).length
                      }
                    </td>
                    <td className="border p-2">
                      {pagos.length > 0
                        ? (
                            (pagos.filter(
                              (p) =>
                                (p.metodo_pago || "").toLowerCase() === "qr"
                            ).length /
                              pagos.length) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="border hover:bg-gray-100 dark:hover:bg-slate-700">
                    <td className="border p-2">Efectivo</td>
                    <td className="border p-2">
                      {
                        pagos.filter(
                          (p) =>
                            (p.metodo_pago || "").toLowerCase() === "efectivo"
                        ).length
                      }
                    </td>
                    <td className="border p-2">
                      {pagos.length > 0
                        ? (
                            (pagos.filter(
                              (p) =>
                                (p.metodo_pago || "").toLowerCase() ===
                                "efectivo"
                            ).length /
                              pagos.length) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="border hover:bg-gray-100 dark:hover:bg-slate-700">
                    <td className="border p-2">Móvil</td>
                    <td className="border p-2">
                      {
                        pagos.filter(
                          (p) => (p.metodo_pago || "").toLowerCase() === "movil"
                        ).length
                      }
                    </td>
                    <td className="border p-2">
                      {pagos.length > 0
                        ? (
                            (pagos.filter(
                              (p) =>
                                (p.metodo_pago || "").toLowerCase() === "movil"
                            ).length /
                              pagos.length) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ANÁLISIS INTELIGENTE ==================== */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🧠 Análisis Inteligente</h2>

        <div className="flex gap-4 mb-4">
          <button
            onClick={generarInterpretacion}
            disabled={loadingInterpretacion}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {loadingInterpretacion ? (
              <FaSpinner className="animate-spin" />
            ) : (
              "💡"
            )}{" "}
            Interpretación
          </button>
          <button
            onClick={generarRecomendaciones}
            disabled={loadingRecomendaciones}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {loadingRecomendaciones ? (
              <FaSpinner className="animate-spin" />
            ) : (
              "🎯"
            )}{" "}
            Recomendaciones
          </button>
        </div>

        {interpretacion && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Interpretación</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {interpretacion}
            </p>
          </div>
        )}

        {recomendaciones && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Recomendaciones</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {recomendaciones}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalles de Bitácora */}
      {selectedBitacoraDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
              <h3 className="text-lg font-semibold">Detalles Completos</h3>
              <button
                onClick={() => setSelectedBitacoraDetalles(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {(() => {
                try {
                  const parsed = JSON.parse(selectedBitacoraDetalles);
                  return (
                    <div className="space-y-4">
                      {parsed.statusCode && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                            Status Code
                          </h4>
                          <p className="text-sm mt-1 font-mono">
                            {parsed.statusCode}
                          </p>
                        </div>
                      )}

                      {parsed.body && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                            Datos Enviados
                          </h4>
                          <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(parsed.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      {parsed.params &&
                        Object.keys(parsed.params).length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                              Parámetros
                            </h4>
                            <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                              {JSON.stringify(parsed.params, null, 2)}
                            </pre>
                          </div>
                        )}

                      {parsed.query && Object.keys(parsed.query).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                            Query
                          </h4>
                          <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(parsed.query, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                } catch {
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No se pudo parsear los detalles
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
