import type { Caja, Almacen, TipoCaja } from "./types";

export const STORAGE_KEY = "isabel.gastos.v1";
export const FILAS_POR_PAGINA = 5;
export const MAX_DIGITOS = 12;

export const TIPOS_CAJA: TipoCaja[] = ["Cuenta bancaria", "Efectivo"];

export const CONCEPTOS_INICIALES: string[] = [
  "Salarios",
  "Servicios",
  "Arriendo",
  "Mantenimiento",
  "Otros",
];

export const CAJAS_INICIALES: Caja[] = [
  { id: "caja-inicial-1", nombre: "Cuenta bancaria 1", tipo: "Cuenta bancaria", saldo: 2000000 },
  { id: "caja-inicial-2", nombre: "Cuenta bancaria 2", tipo: "Cuenta bancaria", saldo: 1500000 },
  { id: "caja-inicial-3", nombre: "Efectivo", tipo: "Efectivo", saldo: 500000 },
];

export const ALMACEN_INICIAL: Almacen = {
  cajas: CAJAS_INICIALES,
  gastos: [],
  conceptos: CONCEPTOS_INICIALES,
};

