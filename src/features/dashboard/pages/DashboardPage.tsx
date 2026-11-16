import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faSackDollar,
  faArrowTrendUp,
  faBoxOpen,
  faMoneyBillWave,
  faTrophy,
  faArrowTrendDown,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Datos Consolidados (Últimos 6 meses: Jun - Nov 2026) ---
const dataFinanzas6Meses = [
  { mes: "Jun", ventas: 7200000, gastos: 3800000, ganancia: 3400000 },
  { mes: "Jul", ventas: 7850000, gastos: 4100000, ganancia: 3750000 },
  { mes: "Ago", ventas: 8400000, gastos: 4300000, ganancia: 4100000 },
  { mes: "Sep", ventas: 8100000, gastos: 4150000, ganancia: 3950000 },
  { mes: "Oct", ventas: 8950000, gastos: 4450000, ganancia: 4500000 },
  { mes: "Nov", ventas: 9400000, gastos: 4600000, ganancia: 4800000 },
];

// --- Gráfica: Productos con más Stock (Top 10) ---
const dataProductosMasStock = [
  { producto: "Air Force 1 '07", stock: 68 },
  { producto: "Adidas Samba OG", stock: 59 },
  { producto: "Nike Dunk Low", stock: 54 },
  { producto: "Vans Old Skool", stock: 49 },
  { producto: "Puma Palermo", stock: 45 },
  { producto: "Converse Chuck 70", stock: 41 },
  { producto: "New Balance 550", stock: 38 },
  { producto: "Jordan 1 Low", stock: 35 },
  { producto: "Adidas Campus 00s", stock: 32 },
  { producto: "Nike Air Max 90", stock: 29 },
];

// --- Gráfica: Productos con menos Stock (Top 10) ---
const dataProductosMenosStock = [
  { producto: "Jordan 4 Military", stock: 2 },
  { producto: "Nike Vomero 5", stock: 3 },
  { producto: "Adidas Gazelle Bold", stock: 4 },
  { producto: "Jordan 1 High Taxi", stock: 4 },
  { producto: "New Balance 9060", stock: 5 },
  { producto: "Puma Suede XL", stock: 6 },
  { producto: "Nike Cortez Leather", stock: 7 },
  { producto: "Vans Knu Skool", stock: 7 },
  { producto: "Converse Run Star", stock: 8 },
  { producto: "Adidas Forum Low", stock: 9 },
];

// --- Gráfica: Clientes que más deben (Top 10) ---
const dataClientesMasDeben = [
  { cliente: "Carlos Mendoza", deuda: 1450000 },
  { cliente: "Andrés Morales", deuda: 1180000 },
  { cliente: "Laura Gómez", deuda: 960000 },
  { cliente: "Jorge Castaño", deuda: 840000 },
  { cliente: "Sofía Restrepo", deuda: 790000 },
  { cliente: "Mateo Jiménez", deuda: 650000 },
  { cliente: "Camila Duarte", deuda: 580000 },
  { cliente: "Felipe Cardona", deuda: 510000 },
  { cliente: "Daniela Ortiz", deuda: 430000 },
  { cliente: "Sebastián Gil", deuda: 390000 },
];

// --- Gráfica: Clientes que más compran (Top 10) ---
const dataClientesMasCompran = [
  { cliente: "Valentina Cruz", total: 4280000 },
  { cliente: "Alejandro Ríos", total: 3890000 },
  { cliente: "María Fernández", total: 3420000 },
  { cliente: "Natalia Vargas", total: 2950000 },
  { cliente: "Juan Pablo Díaz", total: 2710000 },
  { cliente: "Carolina Mejía", total: 2480000 },
  { cliente: "Santiago Torres", total: 2190000 },
  { cliente: "Paula Andrea Ruiz", total: 1940000 },
  { cliente: "David Quintero", total: 1780000 },
  { cliente: "Mariana Salazar", total: 1620000 },
];

export default function DashboardPage() {
  const [periodoVentas, setPeriodoVentas] = useState<"Día" | "Mes" | "Año">("Mes");
  const [mostrarBanner, setMostrarBanner] = useState(true);

  const datosVentas = {
    Día: { valor: "$850K", porcentaje: "5.2%", comparativa: "ayer" },
    Mes: { valor: "$9.4M", porcentaje: "21.1%", comparativa: "mes anterior" },
    Año: { valor: "$112.5M", porcentaje: "14.3%", comparativa: "año anterior" },
  };
  const ventaActual = datosVentas[periodoVentas];

  const tooltipStyle = {
    backgroundColor: "var(--color-app-surface, #1e293b)",
    borderColor: "var(--color-app-border, #334155)",
    color: "var(--color-app-text, #f8fafc)",
    borderRadius: "0.75rem",
    fontSize: "12px",
  };

  const formatearMillones = (val: number) =>
    val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;

  const formatearMoneda = (val: number) => `$${val.toLocaleString("es-CO")}`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal (Patrón ISABEL unificado) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={faChartLine} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Tablero de Control
            </h1>
            <p className="text-sm text-app-muted">
              Medición ejecutiva de ventas, rentabilidad, inventario y cartera — Paradise Shoes
            </p>
          </div>
        </div>
      </div>

      {/* --- BLOQUE DE 6 KPIs (Patrón de tarjetas ejecutivas) --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* KPI 1 (Compuesta): Ventas por Día / Mes / Año [Esteban Lezcano] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Ventas</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
                <FontAwesomeIcon icon={faSackDollar} className="text-xs" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-app-text">
                {ventaActual.valor}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +{ventaActual.porcentaje} vs {ventaActual.comparativa}
              </span>
            </div>
          </div>

          <div className="mt-3 flex w-fit gap-1 rounded-xl border border-app-border bg-app-surface-alt p-1 text-xs">
            {(["Día", "Mes", "Año"] as const).map((periodo) => (
              <button
                key={periodo}
                type="button"
                onClick={() => setPeriodoVentas(periodo)}
                className={`rounded-lg px-3 py-1 font-bold transition-colors cursor-pointer ${
                  periodoVentas === periodo
                    ? "bg-brand-royal text-white shadow-xs"
                    : "text-app-muted hover:bg-app-surface hover:text-app-text"
                }`}
              >
                {periodo}
              </button>
            ))}
          </div>
        </div>

        {/* KPI 2 (Compuesta): Ganancias Netas [Juan Camilo Osorio] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Ganancias Netas</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-xs" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                $4.8M
              </span>
              <span className="text-xs text-app-muted">de $9.4M ingresos</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            Margen neto: <strong className="text-emerald-600 dark:text-emerald-400">51.0%</strong> (+6.6% vs mes anterior)
          </p>
        </div>

        {/* KPI 3 (Simple): Gastos [Juan Camilo Osorio] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Gastos</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-app-text">$4.6M</span>
              <span className="text-xs text-app-muted">egresos del mes</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-app-muted">Compras de mercancía y gastos operativos</p>
        </div>

        {/* KPI 4 (Simple): Pedidos Pendientes [Cristian Stiwar Cardona] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Pedidos Pendientes</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-app-text">3</span>
              <span className="text-xs text-app-muted">órdenes por despachar</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              En alistamiento
            </span>
            <span className="text-xs text-app-muted">Bodega central</span>
          </div>
        </div>

        {/* KPI 5 (Simple): Producto más vendido [Heiler Arteaga] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Producto Más Vendido</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <FontAwesomeIcon icon={faTrophy} className="text-xs" />
              </span>
            </div>
            <p
              className="mt-2.5 text-lg font-extrabold tracking-tight text-app-text truncate"
              title="Nike Air Force 1 '07 White"
            >
              Nike Air Force 1 '07 White
            </p>
          </div>
          <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            47 pares vendidos este mes
          </p>
        </div>

        {/* KPI 6 (Simple): Producto menos vendido [Heiler Arteaga] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Producto Menos Vendido</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <FontAwesomeIcon icon={faArrowTrendDown} className="text-xs" />
              </span>
            </div>
            <p
              className="mt-2.5 text-lg font-extrabold tracking-tight text-app-text truncate"
              title="Jordan 4 Retro Military Olive"
            >
              Jordan 4 Retro Military Olive
            </p>
          </div>
          <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
            2 pares vendidos este mes
          </p>
        </div>
      </div>

      {/* --- BANNER DE ALERTA OPERATIVA --- */}
      {mostrarBanner && (
        <div className="rounded-2xl border border-amber-500/30 border-l-4 border-l-amber-500 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm" />
            </span>
            <div>
              <p className="text-sm font-bold text-app-text">Atención en bodega y caja</p>
              <p className="text-xs text-app-muted">
                Tienes 2 comprobantes de transferencia pendientes por validar y 3 pedidos en alistamiento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMostrarBanner(false)}
            className="rounded-lg p-1.5 text-app-muted hover:bg-app-surface-alt hover:text-app-text transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* --- FILA 1 DE GRÁFICAS: VENTAS Y GASTOS (6 MESES) + GANANCIAS (6 MESES) --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfica 1 (Comparativa Doble): Ventas y Gastos (Últimos 6 meses) [Heiler Arteaga] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Ventas y Gastos (Últimos 6 meses)
              </h3>
              <p className="text-xs text-app-muted">
                Comparativa mensual de ingresos frente a egresos operativos
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-app-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2B62D9]" /> Ventas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#52A5E8]" /> Gastos
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFinanzas6Meses} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickFormatter={formatearMillones}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => formatearMoneda(value)}
                />
                <Bar dataKey="ventas" name="Ventas" fill="#2B62D9" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="gastos" name="Gastos" fill="#52A5E8" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Ganancias (Últimos 6 meses) [Juan Camilo Osorio] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Ganancias (Últimos 6 meses)
              </h3>
              <p className="text-xs text-app-muted">
                Evolución mensual de utilidad neta consolidada
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Utilidad Neta
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataFinanzas6Meses} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickFormatter={formatearMillones}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatearMoneda(value), "Ganancia Neta"]}
                />
                <Area
                  type="monotone"
                  dataKey="ganancia"
                  name="Ganancia Neta"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gradGanancia)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FILA 2 DE GRÁFICAS: STOCK DE PRODUCTOS (TOP 10 MÁS Y TOP 10 MENOS) [Cristian Stiwar Cardona] --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfica 3: Productos con más Stock (Top 10) */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Productos con más Stock (Top 10)
              </h3>
              <p className="text-xs text-app-muted">
                Referencias con mayor disponibilidad física en bodega
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-xs font-bold text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              Alta existencia
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataProductosMasStock}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis
                  type="category"
                  dataKey="producto"
                  width={125}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value} pares`, "Stock Actual"]}
                />
                <Bar dataKey="stock" name="Stock" fill="#2B62D9" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 4: Productos con menos Stock (Top 10) */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Productos con menos Stock (Top 10)
              </h3>
              <p className="text-xs text-app-muted">
                Referencias críticas próximas a agotarse
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-rose-100/90 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              Bajo stock
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataProductosMenosStock}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis
                  type="category"
                  dataKey="producto"
                  width={125}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value} pares`, "Stock Actual"]}
                />
                <Bar dataKey="stock" name="Stock" fill="#F43F5E" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FILA 3 DE GRÁFICAS: CLIENTES (TOP 10 QUE MÁS DEBEN Y TOP 10 QUE MÁS COMPRAN) [Esteban Lezcano] --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfica 5: Clientes que más deben (Top 10) */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Clientes que más deben (Top 10)
              </h3>
              <p className="text-xs text-app-muted">
                Cartera pendiente en ventas a crédito sin abono total
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-100/90 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Cartera crédito
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataClientesMasDeben}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  tickFormatter={formatearMillones}
                />
                <YAxis
                  type="category"
                  dataKey="cliente"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatearMoneda(value), "Saldo Pendiente"]}
                />
                <Bar dataKey="deuda" name="Deuda" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 6: Clientes que más compran (Top 10) */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-app-text">
                Clientes que más compran (Top 10)
              </h3>
              <p className="text-xs text-app-muted">
                Ranking histórico por volumen acumulado de compras
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Clientes top
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataClientesMasCompran}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  tickFormatter={formatearMillones}
                />
                <YAxis
                  type="category"
                  dataKey="cliente"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatearMoneda(value), "Total Comprado"]}
                />
                <Bar dataKey="total" name="Compras" fill="#10B981" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}