import api from "../../../../../app/api/api";

// ── Enums de Prisma ──
export type TypeResolution =
  | "Cambiar_mismo_producto"
  | "Devolver_dinero"
  | "Cambiar_otra_referencia";

export const TYPE_RESOLUTION_OPTIONS: { value: TypeResolution; label: string }[] = [
  { value: "Cambiar_mismo_producto", label: "Cambiar por el mismo producto" },
  { value: "Devolver_dinero", label: "Devolver dinero" },
  { value: "Cambiar_otra_referencia", label: "Cambiar por otra referencia" },
];

export const TYPE_RESOLUTION_LABELS: Record<string, string> = {
  Cambiar_mismo_producto: "Cambiar por el mismo producto",
  Devolver_dinero: "Devolver dinero",
  Cambiar_otra_referencia: "Cambiar por otra referencia",
};

export type ReasonsReturn =
  | "Talla_equivocada"
  | "Color_equivocado"
  | "Producto_dañado"
  | "Producto_defectuoso"
  | "Producto_no_corresponde";

export const REASONS_RETURN_OPTIONS: { value: ReasonsReturn; label: string }[] = [
  { value: "Talla_equivocada", label: "Talla equivocada" },
  { value: "Color_equivocado", label: "Color equivocado" },
  { value: "Producto_dañado", label: "Producto dañado" },
  { value: "Producto_defectuoso", label: "Producto defectuoso" },
  { value: "Producto_no_corresponde", label: "Producto no corresponde" },
];

export const REASONS_RETURN_LABELS: Record<string, string> = {
  Talla_equivocada: "Talla equivocada",
  Color_equivocado: "Color equivocado",
  Producto_dañado: "Producto dañado",
  Producto_defectuoso: "Producto defectuoso",
  Producto_no_corresponde: "Producto no corresponde",
};

// ── GET /returns (Resumen por venta con conteo) ──
export interface SaleReturnSummaryItem {
  id: string; // ID de la venta
  lastRequestDate: string | Date;
  totalReturns: number;
  pendingReturns: number;
}

// ── Entidades detalladas para GET /returns/:idSale ──
export interface ReturnUser {
  identityDocument: string;
  firstName: string;
  lastName?: string | null;
  email?: string;
  phone?: string;
}

export interface ReturnProduct {
  id: number;
  name: string;
  sku: string | null;
  image?: string | null;
}

export interface ReturnColor {
  id: number;
  name: string;
  hex?: string;
}

export interface ReturnSize {
  id: number;
  sizeNumber: string;
  gender?: string;
  internationalSize?: string;
}

export interface ReturnVariant {
  id: number;
  size?: ReturnSize;
  productColor?: {
    color?: ReturnColor;
    product?: ReturnProduct;
  };
}

export interface SaleReturnExchangeItem {
  id: number;
  saleReturnId: string;
  variantId: number;
  quantity: number;
  unitPrice: number | string;
  variant?: ReturnVariant;
}

export interface SaleReturnDetailItem {
  id: string;
  saleId: string;
  variantId: number;
  userId: string;
  quantity: number;
  reason: ReasonsReturn | string;
  details?: string | null;
  refundAmount?: number | string;
  returnToStock?: boolean;
  typeResolution: TypeResolution | string;
  status: "Pendiente" | "Aprobada" | "Rechazada" | string;
  requestDate: string | Date;
  resolutionDate?: string | Date | null;
  rejectionReason?: string | null;
  user?: ReturnUser;
  variant?: ReturnVariant;
  exchangeItems?: SaleReturnExchangeItem[];
}

export interface SaleReturnByIDPayload {
  id: string;
  seller?: ReturnUser | null;
  customer?: ReturnUser | null;
  saleReturns: SaleReturnDetailItem[];
}

export interface ExchangeItemInput {
  variantId: number;
  quantity: number;
  unitPrice?: number;
}

export interface CreateSaleReturnItem {
  saleId: string;
  variantId: number;
  quantity: number;
  reason: ReasonsReturn | string;
  details?: string;
  typeResolution: TypeResolution | string;
  returnToStock?: boolean;
  exchangeItems?: ExchangeItemInput[];
}

export interface ReturnPaymentInput {
  cashRegisterId: number;
  paymentMethodId: number;
  amount: number;
  receipt?: string;
  notes?: string;
}

export interface ApproveSaleReturnBody {
  status?: "Aprobada" | "Rechazada";
  rejectionReason?: string;
  returnToStock?: boolean;
  payments?: ReturnPaymentInput[];
}

export interface SaleOptionItem {
  id: string;
  customer?: {
    identityDocument: string;
    firstName: string;
    lastName: string;
  };
  saleDetails: {
    quantity: number;
    variant: {
      id: number;
      size?: {
        id: number;
        sizeNumber?: string;
        size?: string;
      };
      productColor: {
        product: {
          id?: number;
          sku: string | null;
          name: string;
        };
        color: {
          id: number;
          name: string;
          hex?: string;
        };
        colorImages: {
          id: number;
          productColorId?: number;
          image?: string | null;
          imageUrl?: string | null;
        }[];
      };
    };
  }[];
  _count?: {
    customer?: number;
    seller?: number;
    saleDetails?: number;
    payments?: number;
    saleReturns?: number;
  };
}

// ── Servicios API ──

export async function getAllReturns() {
  return api.get<{
    message: string;
    saleReturns: SaleReturnSummaryItem[];
  }>("/returns");
}

export async function getReturnByID(idSale: string) {
  return api.get<{
    message: string;
    saleReturns: SaleReturnByIDPayload;
  }>(`/returns/${idSale}`);
}

export async function createSaleReturn(items: CreateSaleReturnItem[]) {
  return api.post<{ message: string }>("/returns", {
    items,
  });
}

export async function resolveReturn(
  data: ApproveSaleReturnBody,
  idSaleReturn: string
) {
  return api.put<{ message: string }>(`/returns/${idSaleReturn}`, data);
}

export async function getSales(search?: string) {
  return api.get<{ sales: SaleOptionItem[] }>("/returns/sales", {
    params: search ? { search } : undefined,
  });
}
