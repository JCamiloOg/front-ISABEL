// ============================================================================
// 4. MÓDULO DE COMPRAS
// ============================================================================

import type { Supplier } from './suppliers';
import type { CashRegister } from './cash-registers';
import type { ProductVariant } from './products';

/** Encabezado de órdenes de compra a proveedores (ID en formato UUID) */
export interface Purchase {
  id: string;
  cashRegisterId: number;
  supplierId: string;
  orderDate: string | Date;
  status: string;
  deliveryDate?: string | Date | null;
  vat: number | string;
}

export interface PurchaseWithRelations extends Purchase {
  cashRegister?: CashRegister;
  supplier?: Supplier;
  purchaseDetails?: PurchaseDetailWithRelations[];
}

/** Líneas de detalle de productos adquiridos en cada orden de compra */
export interface PurchaseDetail {
  id: number;
  purchaseId: string;
  variantId: number;
  quantity: number;
  unitPrice: number | string;
}

export interface PurchaseDetailWithRelations extends PurchaseDetail {
  purchase?: Purchase;
  variant?: ProductVariant;
}
