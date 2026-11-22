import api from "../../../app/api/api";

export type DashboardPeriodo = "dia" | "mes" | "anio";

export interface VentasActuales {
  periodo: string;
  cantidad_ventas: number;
  ingresos_totales: number;
}

export interface GastosMes {
  mes: string;
  total_gastos: number;
}

export interface GananciaNetaMes {
  mes_actual: string;
  ganancia_neta_actual: number;
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

export function getVentasActuales(periodo: DashboardPeriodo) {
  return api.get<{ message: string; ventas: VentasActuales }>("/dashboard/ventas-actuales", {
    params: { periodo },
  });
}

export function getGastosMes() {
  return api.get<{ message: string; gastos: GastosMes }>("/dashboard/gastos-mes");
}

export function getGananciaNetaMes() {
  return api.get<{ message: string; ganancia: GananciaNetaMes }>("/dashboard/ganancia-neta-mes");
}

export function getGananciasSeisMeses() {
  return api.get<{ message: string; ganancias: GananciaSeisMeses[] }>("/dashboard/ganancias-6-meses");
}

export function getVentasVsGastos() {
  return api.get<{ message: string; ventasVsGastos: VentasVsGastos[] }>("/dashboard/ventas-vs-gastos");
}

export function getProductosMasStock() {
  return api.get<{ message: string; productos: ProductoStock[] }>("/dashboard/productos-mas-stock");
}

export function getProductosMenosStock() {
  return api.get<{ message: string; productos: ProductoStock[] }>("/dashboard/productos-menos-stock");
}

export function getTopClientes() {
  return api.get<{ message: string; topClientes: ClienteTop[] }>("/dashboard/top-clientes");
}

export function getTopDeudores() {
  return api.get<{ message: string; topDeudores: DeudorTop[] }>("/dashboard/top-deudores");
}

export function getPedidosPendientes() {
  return api.get<{ message: string; pedidosPendientes: number }>("/dashboard/pedidos-pendientes");
}

export function getProductoMasVendido() {
  return api.get<{ message: string; producto: ProductoVendido | null }>("/dashboard/producto-mas-vendido");
}

export function getProductosMenosVendidos() {
  return api.get<{ message: string; productos: ProductoVendido[] }>("/dashboard/productos-menos-vendidos");
}
