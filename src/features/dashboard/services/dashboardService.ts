import api from "../../../app/api/api";

export type DashboardPeriodo = "dia" | "mes" | "anio";

export interface VentasActuales {
  periodo: string;
  cantidad_ventas: number;
  ingresos_totales: number;
}

/** `mes` trae la etiqueta del período: "YYYY-MM-DD" (día), "YYYY-MM" (mes) o "YYYY" (año) */
export interface GastosMes {
  mes: string;
  total_gastos: number;
}

/** `mes_actual` trae la etiqueta del período; `ingresos_actual` sirve para calcular el margen neto */
export interface GananciaNetaMes {
  mes_actual: string;
  ganancia_neta_actual: number;
  ingresos_actual: number;
  ganancia_neta_anterior: number;
  diferencia_monto: number;
  porcentaje_incremento: number;
}

export interface GananciaSeisMeses {
  mes: string;
  total_ingresos: number;
  total_costo_ventas: number;
  total_gastos: number;
  ganancia_bruta: number;
  ganancia_neta: number;
}

export interface VentasVsGastos {
  anio_mes: string;
  total_ventas: number;
  total_gastos: number;
}

export interface ProductoStock {
  id_producto: number;
  producto: string;
  marca: string;
  categoria: string;
  stock_total: number;
}

export interface ClienteTop {
  top: number;
  documento: string;
  nombre: string;
  apellido: string;
  cantidad_compras: number;
  total_comprado: number;
}

export interface DeudorTop {
  top: number;
  documento: string;
  nombre: string;
  apellido: string;
  total_comprado: number;
  deuda_pendiente: number;
}

export interface ProductoVendido {
  id_producto: number;
  producto: string;
  marca: string;
  total_unidades_vendidas: number;
}

/** Tarjetas que dependen del período (Ventas, Gastos, Ganancia neta) + compras pendientes */
export interface KpisDashboard {
  ventas: VentasActuales;
  gastos: GastosMes;
  ganancia: GananciaNetaMes;
  pedidosPendientes: number;
}

/** Gráficos y rankings que no dependen del período */
export interface ResumenDashboard {
  ganancias: GananciaSeisMeses[];
  ventasVsGastos: VentasVsGastos[];
  productosMasStock: ProductoStock[];
  productosMenosStock: ProductoStock[];
  topClientes: ClienteTop[];
  topDeudores: DeudorTop[];
  productoMasVendido: ProductoVendido | null;
  productosMenosVendidos: ProductoVendido[];
}

export interface PeriodosKpis {
  ventas: DashboardPeriodo;
  gastos: DashboardPeriodo;
  ganancia: DashboardPeriodo;
}

export function getKpis(periodos: PeriodosKpis) {
  return api.get<{ message: string } & KpisDashboard>("/dashboard/kpis", {
    params: periodos,
  });
}

export function getResumen() {
  return api.get<{ message: string } & ResumenDashboard>("/dashboard/resumen");
}
