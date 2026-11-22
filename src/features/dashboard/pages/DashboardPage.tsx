import { useEffect, useState } from "react";
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
import { Toast } from "../../../shared/utils/alerts";
import {
  getGananciaNetaMes,
  getGananciasSeisMeses,
  getGastosMes,
  getPedidosPendientes,
  getProductosMasStock,
  getProductosMenosStock,
  getProductosMenosVendidos,
  getProductoMasVendido,
  getTopClientes,
  getTopDeudores,
  getVentasActuales,
  getVentasVsGastos,
  type DashboardPeriodo,
  type GananciaNetaMes,
  type GananciaSeisMeses,
  type GastosMes,
  type ProductoStock,
  type ProductoVendido,
  type VentasActuales,
  type VentasVsGastos,
  type ClienteTop,
  type DeudorTop,
} from "../services/dashboardService";

const periodoApi: Record<"Día" | "Mes" | "Año", DashboardPeriodo> = {
  Día: "dia",
  Mes: "mes",
  Año: "anio",
};

const formatearDinero = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(valor);

const formatearMes = (mes: string) => {
  const [anio, numeroMes] = mes.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(anio, numeroMes - 1, 1)));
};

function MensajeGrafica({ children }: { children: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-app-muted" role="status">
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [periodoVentas, setPeriodoVentas] = useState<"Día" | "Mes" | "Año">("Mes");
  const [mostrarBanner, setMostrarBanner] = useState(true);
  const [ventas, setVentas] = useState<VentasActuales | null>(null);
  const [gastos, setGastos] = useState<GastosMes | null>(null);
  const [gananciaNeta, setGananciaNeta] = useState<GananciaNetaMes | null>(null);
  const [gananciasSeisMeses, setGananciasSeisMeses] = useState<GananciaSeisMeses[] | null>(null);
  const [ventasVsGastos, setVentasVsGastos] = useState<VentasVsGastos[] | null>(null);
  const [productosMasStock, setProductosMasStock] = useState<ProductoStock[] | null>(null);
  const [productosMenosStock, setProductosMenosStock] = useState<ProductoStock[] | null>(null);
  const [clientesTop, setClientesTop] = useState<ClienteTop[] | null>(null);
  const [deudoresTop, setDeudoresTop] = useState<DeudorTop[] | null>(null);
  const [pedidosPendientes, setPedidosPendientes] = useState<number | null>(null);
  const [productoMasVendido, setProductoMasVendido] = useState<ProductoVendido | null | undefined>(undefined);
  const [productosMenosVendidos, setProductosMenosVendidos] = useState<ProductoVendido[] | undefined>(undefined);

  useEffect(() => {
    let activo = true;

    const cargar = async <T,>(
      nombre: string,
      solicitud: Promise<{ data: T }>,
      guardar: (data: T) => void,
    ): Promise<string | null> => {
      try {
        const { data } = await solicitud;
        if (activo) guardar(data);
        return null;
      } catch (error) {
        console.error(`No se pudieron obtener ${nombre} del dashboard`, error);
        return nombre;
      }
    };

    void Promise.all([
      cargar("los gastos", getGastosMes(), (data) => setGastos(data.gastos)),
      cargar("la ganancia neta", getGananciaNetaMes(), (data) => setGananciaNeta(data.ganancia)),
      cargar("las ganancias de seis meses", getGananciasSeisMeses(), (data) => setGananciasSeisMeses(data.ganancias)),
      cargar("las ventas y gastos", getVentasVsGastos(), (data) => setVentasVsGastos(data.ventasVsGastos)),
      cargar("los productos con más stock", getProductosMasStock(), (data) => setProductosMasStock(data.productos)),
      cargar("los productos con menos stock", getProductosMenosStock(), (data) => setProductosMenosStock(data.productos)),
      cargar("los clientes principales", getTopClientes(), (data) => setClientesTop(data.topClientes)),
      cargar("los clientes deudores", getTopDeudores(), (data) => setDeudoresTop(data.topDeudores)),
      cargar("las compras pendientes", getPedidosPendientes(), (data) => setPedidosPendientes(data.pedidosPendientes)),
      cargar("el producto más vendido", getProductoMasVendido(), (data) => setProductoMasVendido(data.producto)),
      cargar("los productos menos vendidos", getProductosMenosVendidos(), (data) => setProductosMenosVendidos(data.productos)),
    ]).then((fallos) => {
      const fallosCarga = fallos.filter((fallo): fallo is string => fallo !== null);
      if (activo && fallosCarga.length > 0) {
        void Toast.fire({
          icon: "error",
          title: "No se pudieron obtener algunos datos",
          text: fallosCarga.join(", "),
        });
      }
    });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    getVentasActuales(periodoApi[periodoVentas])
      .then(({ data }) => {
        if (activo) setVentas(data.ventas);
      })
      .catch((error: unknown) => {
        console.error("No se pudieron obtener las ventas del dashboard", error);
        if (activo) {
          void Toast.fire({
            icon: "error",
            title: "No se pudieron obtener las ventas",
            text: "Intenta de nuevo más tarde.",
          });
        }
      });

    return () => {
      activo = false;
    };
  }, [periodoVentas]);

  const tooltipStyle = {
    backgroundColor: "var(--color-app-surface, #1e293b)",
    borderColor: "var(--color-app-border, #334155)",
    color: "var(--color-app-text, #f8fafc)",
    borderRadius: "0.75rem",
    fontSize: "12px",
  };

  const formatearMillones = (val: number) =>
    val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;
  const datosFinancieros = ventasVsGastos && gananciasSeisMeses
    ? ventasVsGastos.flatMap((item) => {
      const ganancia = gananciasSeisMeses.find(({ mes }) => mes === item.anio_mes);
      return ganancia
        ? [{
          mes: formatearMes(item.anio_mes),
          ventas: item.total_ventas,
          gastos: item.total_gastos,
          ganancia: ganancia.ganancia_neta,
        }]
        : [];
    })
    : null;
  const datosProductosMasStock = productosMasStock?.map(({ producto, stock_total }) => ({ producto, stock: stock_total })) ?? null;
  const datosProductosMenosStock = productosMenosStock?.map(({ producto, stock_total }) => ({ producto, stock: stock_total })) ?? null;
  const datosClientesMasDeben = deudoresTop?.map(({ nombre, apellido, deuda_pendiente }) => ({
    cliente: `${nombre} ${apellido}`,
    deuda: deuda_pendiente,
  })) ?? null;
  const datosClientesMasCompran = clientesTop?.map(({ nombre, apellido, total_comprado }) => ({
    cliente: `${nombre} ${apellido}`,
    total: total_comprado,
  })) ?? null;
  const gananciaActualSeisMeses = gananciasSeisMeses?.[gananciasSeisMeses.length - 1];
  const margenNeto = gananciaActualSeisMeses && gananciaActualSeisMeses.total_ingresos !== 0
    ? (gananciaActualSeisMeses.ganancia_neta / gananciaActualSeisMeses.total_ingresos) * 100
    : null;

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
                {ventas ? formatearDinero(ventas.ingresos_totales) : "—"}
              </span>
              <span className="text-xs text-app-muted">
                {ventas ? `${ventas.cantidad_ventas} ventas en el periodo` : "Datos no disponibles"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex w-fit gap-1 rounded-xl border border-app-border bg-app-surface-alt p-1 text-xs">
            {(["Día", "Mes", "Año"] as const).map((periodo) => (
              <button
                key={periodo}
                type="button"
                onClick={() => setPeriodoVentas(periodo)}
                className={`rounded-lg px-3 py-1 font-bold transition-colors cursor-pointer ${periodoVentas === periodo
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
                {gananciaNeta ? formatearDinero(gananciaNeta.ganancia_neta_actual) : "—"}
              </span>
              <span className="text-xs text-app-muted">
                {gananciaNeta
                  ? `${gananciaNeta.porcentaje_incremento >= 0 ? "+" : ""}${gananciaNeta.porcentaje_incremento.toFixed(1)}% vs mes anterior`
                  : "Cargando ganancia…"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            Margen neto:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {margenNeto === null ? "—" : `${margenNeto.toFixed(1)}%`}
            </strong>
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
              <span className="text-3xl font-black tracking-tight text-app-text">
                {gastos ? formatearDinero(gastos.total_gastos) : "—"}
              </span>
              <span className="text-xs text-app-muted">egresos del mes</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-app-muted">Compras de mercancía y gastos operativos</p>
        </div>

        {/* KPI 4 (Simple): Pedidos Pendientes [Cristian Stiwar Cardona] */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-app-muted">Compras Pendientes</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-app-text">
                {pedidosPendientes ?? "—"}
              </span>
              <span className="text-xs text-app-muted">compras por recibir</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Estado pendiente
            </span>
            <span className="text-xs text-app-muted">Por recibir</span>
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
              title={productoMasVendido?.producto}
            >
              {productoMasVendido === undefined ? "—" : productoMasVendido?.producto ?? "Sin ventas"}
            </p>
          </div>
          <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {productoMasVendido === undefined
              ? "Datos no disponibles"
              : productoMasVendido
                ? `${productoMasVendido.total_unidades_vendidas} unidades vendidas`
                : "No hay ventas registradas"}
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
              title={productosMenosVendidos?.[0]?.producto}
            >
              {productosMenosVendidos === undefined
                ? "—"
                : productosMenosVendidos[0]?.producto ?? "Sin productos"}
            </p>
          </div>
          <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {productosMenosVendidos === undefined
              ? "Datos no disponibles"
              : productosMenosVendidos[0]
                ? `${productosMenosVendidos[0].total_unidades_vendidas} unidades vendidas`
                : "No hay productos registrados"}
          </p>
        </div>
      </div>

      {/* --- BANNER DE ALERTA OPERATIVA --- */}
      {mostrarBanner && pedidosPendientes !== null && pedidosPendientes > 0 && (
        <div className="rounded-2xl border border-amber-500/30 border-l-4 border-l-amber-500 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm" />
            </span>
            <div>
              <p className="text-sm font-bold text-app-text">Compras pendientes de recibir</p>
              <p className="text-xs text-app-muted">
                Tienes {pedidosPendientes} {pedidosPendientes === 1 ? "compra pendiente" : "compras pendientes"} por recibir.
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
            {datosFinancieros === null ? (
              <MensajeGrafica>No se pudieron cargar los datos de la gráfica.</MensajeGrafica>
            ) : datosFinancieros.length === 0 ? (
              <MensajeGrafica>No hay datos financieros para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFinancieros} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [formatearDinero(value), String(name ?? '')];
                  }}
                />
                <Bar dataKey="ventas" name="Ventas" fill="#2B62D9" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="gastos" name="Gastos" fill="#52A5E8" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
            )}
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
            {gananciasSeisMeses === null ? (
              <MensajeGrafica>No se pudieron cargar los datos de la gráfica.</MensajeGrafica>
            ) : gananciasSeisMeses.length === 0 ? (
              <MensajeGrafica>No hay datos financieros para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={gananciasSeisMeses.map(({ mes, ganancia_neta }) => ({
                  mes: formatearMes(mes),
                  ganancia: ganancia_neta,
                }))}
                margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
              >
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [formatearDinero(value), String(name ?? '')];
                  }}
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
            )}
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
            {datosProductosMasStock === null ? (
              <MensajeGrafica>No se pudieron cargar los productos.</MensajeGrafica>
            ) : datosProductosMasStock.length === 0 ? (
              <MensajeGrafica>No hay productos para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosProductosMasStock}
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [String(value), String(name ?? '')];
                  }}
                />
                <Bar dataKey="stock" name="Stock" fill="#2B62D9" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            )}
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
            {datosProductosMenosStock === null ? (
              <MensajeGrafica>No se pudieron cargar los productos.</MensajeGrafica>
            ) : datosProductosMenosStock.length === 0 ? (
              <MensajeGrafica>No hay productos para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosProductosMenosStock}
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [String(value), String(name ?? '')];
                  }}
                />
                <Bar dataKey="stock" name="Stock" fill="#F43F5E" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            )}
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
            {datosClientesMasDeben === null ? (
              <MensajeGrafica>No se pudieron cargar los clientes deudores.</MensajeGrafica>
            ) : datosClientesMasDeben.length === 0 ? (
              <MensajeGrafica>No hay deudas pendientes para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosClientesMasDeben}
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [formatearDinero(value), String(name ?? '')];
                  }}
                />
                <Bar dataKey="deuda" name="Deuda" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            )}
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
            {datosClientesMasCompran === null ? (
              <MensajeGrafica>No se pudieron cargar los clientes principales.</MensajeGrafica>
            ) : datosClientesMasCompran.length === 0 ? (
              <MensajeGrafica>No hay compras registradas para mostrar.</MensajeGrafica>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosClientesMasCompran}
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
                  formatter={(value, name) => {
                    if (typeof value !== 'number') {
                      return [String(value ?? ''), String(name ?? '')];
                    }
                    return [formatearDinero(value), String(name ?? '')];
                  }}
                />
                <Bar dataKey="total" name="Compras" fill="#10B981" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}