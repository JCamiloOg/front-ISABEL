export type TipoCaja = "Efectivo" | "Cuenta Bancaria";

export interface Caja {
  id_caja: number;
  nombre: string;
  tipo_caja: TipoCaja;
  saldo_actual: number;
  estado: boolean;
  detalles?: string; // String completo para información complementaria (ej. "Bancolombia - Cta Ahorros: 934-281904-12")
}
