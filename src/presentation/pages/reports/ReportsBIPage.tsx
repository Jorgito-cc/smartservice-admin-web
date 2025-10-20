import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const ReportsBIPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Semanal");

  // 🔹 Datos estáticos simulados
  const ingresosPorZona = [
    { zona: "Zona 1", ingresos: 480 },
    { zona: "Zona 2", ingresos: 260 },
    { zona: "Zona 3", ingresos: 180 },
  ];

  const clientesRecurrentes = [
    { cliente: "Cliente A", cantidad: 40 },
    { cliente: "Cliente B", cantidad: 30 },
    { cliente: "Cliente C", cantidad: 25 },
    { cliente: "Cliente D", cantidad: 20 },
  ];

  const tecnicosDestacados = [
    { name: "Luis Gómez", value: 70 },
    { name: "Otros", value: 30 },
  ];

  const COLORS = ["#3B82F6", "#A5B4FC"];

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-indigo-100/70 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Reportes BI
        </h2>

        {/* Selector temporal */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
        >
          <option>Semanal</option>
          <option>Mensual</option>
          <option>Trimestral</option>
        </select>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos por zona */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-gray-800 dark:text-gray-100 font-semibold mb-3">
            Ingresos por Zona
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ingresosPorZona}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zona" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Clientes recurrentes */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-gray-800 dark:text-gray-100 font-semibold mb-3">
            Clientes Recurrentes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clientesRecurrentes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cliente" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Técnicos destacados */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm md:col-span-2 lg:col-span-1">
          <h3 className="text-gray-800 dark:text-gray-100 font-semibold mb-3">
            Técnicos Destacados
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={tecnicosDestacados}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {tecnicosDestacados.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Botón de descarga */}
      <div className="flex justify-end mt-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition">
          Descargar Informe
        </button>
      </div>
    </div>
  );
};
