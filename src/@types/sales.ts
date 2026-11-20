// ============================================================================
// 5. MÓDULO DE VENTAS Y PEDIDOS
// ============================================================================

import type { User } from './users';
import type { ProductVariant } from './products';
import type { CashRegister } from './cash-registers';

/** Encabezado de ventas y pedidos de clientes (ID en formato UUID) */
export interface Sale {
  id: string;
  customerId: string;
  userId: string;
  saleDate: string | Date;
  discount: number | string;
  isCredit: boolean;
  isDirectSale?: boolean | null;
  vat: number | string;
  status: string;
}

export interface SaleWithRelations extends Sale {
  customer?: User;
  seller?: User;
  saleDetails?: SaleDetailWithRelations[];
  payments?: Payment[];
  saleReturns?: SaleReturn[];
}

/** Líneas de detalle de variantes vendidas en cada transacción */
export interface SaleDetail {
  id: number;
  saleId: string;
  variantId: number;
  quantity: number;
  unitPrice: number | string;
}

export interface SaleDetailWithRelations extends SaleDetail {
  sale?: Sale;
  variant?: ProductVariant;
}

/** Medios de pago aceptados (ej. Efectivo, Transferencia, Nequi, Wompi, Tarjeta) */
export interface PaymentMethod {
  id: number;
  method: string;
}

export interface PaymentMethodWithRelations extends PaymentMethod {
  payments?: Payment[];
}

/** Abonos y pagos recibidos asociados a una venta (contado o crédito) */
export interface Payment {
  id: number;
  saleId: string;
  cashRegisterId: number;
  userId: string;
  paymentMethodId: number;
  amount: number | string;
  receipt?: string | null;
  paymentDate: string | Date;
  notes?: string | null;
}

export interface PaymentWithRelations extends Payment {
  sale?: Sale;
  cashRegister?: CashRegister;
  user?: User;
  paymentMethod?: PaymentMethod;
}

/** Solicitudes y resoluciones de devolución de mercancía vendida (ID en formato UUID) */
export interface SaleReturn {
  id: string;
  saleId: string;
  variantId: number;
  userId: string;
  quantity: number;
  reason: string;
  status: string;
  rejectionReason?: string | null;
  requestDate: string | Date;
  resolutionDate?: string | Date | null;
}

export interface SaleReturnWithRelations extends SaleReturn {
  sale?: Sale;
  variant?: ProductVariant;
  user?: User;
}
