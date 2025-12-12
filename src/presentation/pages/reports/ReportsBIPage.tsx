import { useState, useEffect } from "react";
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
import {
  FaSpinner,
  FaFilePdf,
  FaChartBar,
  FaChartPie,
  FaChartLine,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getKPIs,
  getServiciosPorCategoria,
  getIngresosPorPeriodo,
  getTecnicosTop,
  getInterpretacionInteligente,
  getAconsejadorInteligente,
  getExplicarGraficoIngresos,
  type KPIs,
  type ServicioPorCategoria,
  type Ingreso,
  type TecnicoTop,
} from "../../../api/reportes";

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
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [serviciosPorCategoria, setServiciosPorCategoria] = useState<
    ServicioPorCategoria[]
  >([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [tecnicosTop, setTecnicosTop] = useState<TecnicoTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Nuevos estados para análisis inteligente
  const [interpretacion, setInterpretacion] = useState<string | null>(null);
  const [recomendaciones, setRecomendaciones] = useState<string | null>(null);
  const [loadingInterpretacion, setLoadingInterpretacion] = useState(false);
  const [loadingRecomendaciones, setLoadingRecomendaciones] = useState(false);

  // Estados para explicación de gráfico
  const [explicacionIngresos, setExplicacionIngresos] = useState<string | null>(
    null
  );
  const [loadingExplicacion, setLoadingExplicacion] = useState(false);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    setFechaHasta(hoy.toISOString().split("T")[0]);
    setFechaDesde(hace30Dias.toISOString().split("T")[0]);

    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpisRes, categoriasRes, ingresosRes, tecnicosRes] =
        await Promise.all([
          getKPIs(),
          getServiciosPorCategoria(),
          getIngresosPorPeriodo(),
          getTecnicosTop(),
        ]);

      setKpis(kpisRes);
      setServiciosPorCategoria(categoriasRes);
      setIngresos(ingresosRes);
      setTecnicosTop(tecnicosRes);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      setError("Error al cargar los reportes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Generar Interpretación Inteligente
  const generarInterpretacion = async () => {
    try {
      setLoadingInterpretacion(true);
      const resultado = await getInterpretacionInteligente(
        fechaDesde,
        fechaHasta
      );
      setInterpretacion(resultado.interpretacion);
    } catch (error) {
      console.error("Error generando interpretación:", error);
      setInterpretacion(
        "Error al generar la interpretación. Intenta de nuevo."
      );
    } finally {
      setLoadingInterpretacion(false);
    }
  };

  // Generar Recomendaciones
  const generarRecomendaciones = async () => {
    try {
      setLoadingRecomendaciones(true);
      const resultado = await getAconsejadorInteligente(fechaDesde, fechaHasta);
      setRecomendaciones(resultado.recomendaciones);
    } catch (error) {
      console.error("Error generando recomendaciones:", error);
      setRecomendaciones(
        "Error al generar las recomendaciones. Intenta de nuevo."
      );
    } finally {
      setLoadingRecomendaciones(false);
    }
  };

  // Generar Explicación del Gráfico de Ingresos
  const generarExplicacionGrafico = async () => {
    try {
      setLoadingExplicacion(true);
      const resultado = await getExplicarGraficoIngresos(
        fechaDesde,
        fechaHasta
      );
      setExplicacionIngresos(resultado.explicacion);
    } catch (error) {
      console.error("Error generando explicación:", error);
      setExplicacionIngresos(
        "Error al generar la explicación del gráfico. Intenta de nuevo."
      );
    } finally {
      setLoadingExplicacion(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text("Reporte BI - SmartService", 14, 22);

    // Fecha
    doc.setFontSize(11);
    doc.text(`Período: ${fechaDesde} a ${fechaHasta}`, 14, 32);
    doc.text(`Generado: ${new Date().toLocaleString("es-BO")}`, 14, 38);

    // KPIs
    doc.setFontSize(14);
    doc.text("Indicadores Clave (KPIs)", 14, 50);

    if (kpis) {
      const kpiData = [
        ["Total Servicios", kpis.total_servicios.toString()],
        ["Servicios Completados", kpis.servicios_completados.toString()],
        ["Tasa de Completación", `${kpis.tasa_completacion}%`],
        ["Ingresos Totales", `Bs. ${kpis.total_ingresos}`],
        ["Total Clientes", kpis.total_clientes.toString()],
        ["Total Técnicos", kpis.total_tecnicos.toString()],
      ];

      autoTable(doc, {
        startY: 56,
        head: [["Indicador", "Valor"]],
        body: kpiData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
      });
    }

    // Servicios por Categoría
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Servicios por Categoría", 14, 22);

    const categoriaData = serviciosPorCategoria.map((c) => [
      c.categoria,
      c.total.toString(),
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["Categoría", "Total"]],
      body: categoriaData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Top Técnicos
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Top 10 Técnicos", 14, 22);

    const tecnicoData = tecnicosTop.map((t) => [
      `${t.nombre} ${t.apellido}`,
      t.total_servicios.toString(),
      t.calificacion.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["Técnico", "Servicios", "Calificación"]],
      body: tecnicoData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`reporte_bi_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Configuración de gráficos
  const categoriaChartData = {
    labels: serviciosPorCategoria.map((c) => c.categoria),
    datasets: [
      {
        label: "Servicios",
        data: serviciosPorCategoria.map((c) => c.total),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const ingresosChartData = {
    labels: ingresos.map((i) => new Date(i.fecha).toLocaleDateString("es-BO")),
    datasets: [
      {
        label: "Ingresos Totales",
        data: ingresos.map((i) => i.total),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
      {
        label: "Comisión Empresa",
        data: ingresos.map((i) => i.comision),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const tecnicosChartData = {
    labels: tecnicosTop.map((t) => `${t.nombre} ${t.apellido}`),
    datasets: [
      {
        label: "Servicios Completados",
        data: tecnicosTop.map((t) => t.total_servicios),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Reportes e Inteligencia de Negocios
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
          onClick={cargarDatos}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Total Servicios</p>
            <p className="text-4xl font-bold">{kpis.total_servicios}</p>
            <p className="text-xs mt-2">
              {kpis.servicios_completados} completados ({kpis.tasa_completacion}
              %)
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Ingresos Totales</p>
            <p className="text-4xl font-bold">
              Bs. {parseFloat(kpis.total_ingresos).toFixed(2)}
            </p>
            <p className="text-xs mt-2">Período seleccionado</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Usuarios</p>
            <p className="text-4xl font-bold">
              {kpis.total_clientes + kpis.total_tecnicos}
            </p>
            <p className="text-xs mt-2">
              {kpis.total_clientes} clientes, {kpis.total_tecnicos} técnicos
            </p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios por Categoría */}
        {serviciosPorCategoria.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FaChartPie className="text-indigo-600 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Servicios por Categoría
              </h3>
            </div>
            <Pie data={categoriaChartData} />
          </div>
        )}

        {/* Top Técnicos */}
        {tecnicosTop.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FaChartBar className="text-indigo-600 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Top 10 Técnicos
              </h3>
            </div>
            <Bar
              data={tecnicosChartData}
              options={{
                indexAxis: "y" as const,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Ingresos en el Tiempo */}
      {ingresos.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-indigo-600 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Ingresos en el Tiempo
              </h3>
            </div>
            <button
              onClick={generarExplicacionGrafico}
              disabled={loadingExplicacion}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-semibold"
            >
              {loadingExplicacion ? (
                <>
                  <FaSpinner className="animate-spin" /> Analizando...
                </>
              ) : (
                <>🔍 Explicar con IA</>
              )}
            </button>
          </div>
          <Line
            data={ingresosChartData}
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

          {/* Explicación del Gráfico */}
          {explicacionIngresos && (
            <div className="mt-6 p-4 bg-teal-50 dark:bg-slate-800 rounded-lg border-l-4 border-teal-500">
              <h4 className="font-semibold text-teal-900 dark:text-teal-200 mb-2 flex items-center gap-2">
                🤖 Análisis IA del Gráfico
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {explicacionIngresos}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabla de Técnicos */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Detalle de Técnicos Destacados
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left">Técnico</th>
                <th className="px-4 py-3 text-left">Servicios</th>
                <th className="px-4 py-3 text-left">Calificación</th>
              </tr>
            </thead>
            <tbody>
              {tecnicosTop.map((tecnico) => (
                <tr
                  key={tecnico.id_tecnico}
                  className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    {tecnico.foto ? (
                      <img
                        src={tecnico.foto}
                        alt={tecnico.nombre}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {tecnico.nombre[0]}
                          {tecnico.apellido[0]}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">
                      {tecnico.nombre} {tecnico.apellido}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {tecnico.total_servicios} servicios
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(tecnico.calificacion) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600">
                        {tecnico.calificacion.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================ */}
      {/* 🧠 SECCIÓN DE ANÁLISIS INTELIGENTE */}
      {/* ============================================ */}

      <div className="mt-10 pt-10 border-t-2 border-gray-300 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          🧠 Análisis Inteligente del Negocio
        </h2>

        {/* Botones de Análisis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={generarInterpretacion}
            disabled={loadingInterpretacion}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition font-semibold shadow-md"
          >
            {loadingInterpretacion ? (
              <>
                <FaSpinner className="animate-spin" /> Generando...
              </>
            ) : (
              <>💡 Generar Interpretación Inteligente</>
            )}
          </button>

          <button
            onClick={generarRecomendaciones}
            disabled={loadingRecomendaciones}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition font-semibold shadow-md"
          >
            {loadingRecomendaciones ? (
              <>
                <FaSpinner className="animate-spin" /> Generando...
              </>
            ) : (
              <>🎯 Generar Recomendaciones</>
            )}
          </button>
        </div>

        {/* Sección 1: Interpretación Inteligente */}
        {interpretacion && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg shadow-lg mb-6 border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
              📊 Interpretación Inteligente del Negocio
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {interpretacion}
            </p>
          </div>
        )}

        {/* Sección 2: Aconsejador Inteligente */}
        {recomendaciones && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-4 flex items-center gap-2">
              🎯 Aconsejador Inteligente - Recomendaciones
            </h3>
            <div className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
              <div className="whitespace-pre-wrap leading-relaxed">
                {recomendaciones}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje si no hay análisis */}
        {!interpretacion && !recomendaciones && (
          <div className="bg-yellow-50 dark:bg-slate-800 border-l-4 border-yellow-400 p-6 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              💡 Usa los botones arriba para generar análisis automáticos
              basados en IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
