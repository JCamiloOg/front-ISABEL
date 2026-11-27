import api from "../../../../../app/api/api";

export interface SaleUserSummary {
  identityDocument: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string | null;
}

export interface CashRegisterOption {
  id: number;
  name: string;
  currentBalance: number | string;
}

export interface PaymentMethodOption {
  id: number;
  method: string;
}

export interface SalePaymentItem {
  id: number;
  amount: number | string;
  receipt?: string | null;
  paymentDate: string;
  notes?: string | null;
  cashRegister?: { id: number; name: string };
  paymentMethod?: { id: number; method: string };
  user?: SaleUserSummary;
}

export interface SaleDetailItem {
  id?: number;
  variantId?: number;
  quantity: number;
  unitPrice: number | string;
  variant?: {
    currentStock: number;
    discount?: number | string | null;
    size?: {
      id: number;
      sizeNumber: string;
      internationalSize: string;
    };
    productColor?: {
      image?: string | null;
      color?: { id: number; name: string; hex: string };
      product?: {
        id: number;
        sku?: string | null;
        name: string;
        gender?: string;
      };
    };
  };
}

export interface SalePayload {
  id: string;
  saleDate: string;
  discount: number | string;
  isCredit: boolean;
  isDirectSale: boolean;
  vat: number | string;
  status: "Pendiente" | "Entregada" | "Cancelada" | string;
  customer: SaleUserSummary | null;
  seller: SaleUserSummary | null;
  saleDetails: SaleDetailItem[];
  payments: SalePaymentItem[];
}

export interface ProductForSaleItem {
  id: number;
  sku?: string | null;
  name: string;
  salePrice: number | string;
  gender?: string;
  brand?: { id: number; name: string };
  image?: string | null;
  productColors: {
    id: number;
    color: { id: number; name: string; hex: string };
    productVariants: {
      id: number;
      currentStock: number;
      discount?: number | string | null;
      size: { id: number; sizeNumber: string; internationalSize: string };
    }[];
  }[];
}

export interface CreateSalePayload {
  saleInfo: {
    customerId: string;
    userId: string;
    discount: number;
    isCredit: boolean;
    isDirectSale: boolean;
    vat: number;
    status?: "Pendiente" | "Entregada" | "Cancelada";
  };
  saleDetails: {
    variantId: number;
    quantity: number;
    unitPrice: number;
  }[];
  initialPayment?: {
    cashRegisterId: number;
    userId: string;
    paymentMethodId: number;
    amount: number;
    receipt?: string | null;
    notes?: string | null;
  };
}

export async function getAllSales() {
  return await api.get<{
    message: string;
    sales: SalePayload[];
    cashRegisters: CashRegisterOption[];
    paymentMethods: PaymentMethodOption[];
  }>("/sales");
}

export async function getSaleByID(idSale: string) {
  return await api.get<{
    message: string;
    sales: SalePayload;
  }>(`/sales/${idSale}`);
}

export async function getCustomersForSale(search = "") {
  return await api.get<{
    customers: SaleUserSummary[];
  }>("/sales/customers", { params: { search } });
}

export async function getProductsForSale(search = "") {
  return await api.get<{
    products: ProductForSaleItem[];
  }>("/sales/products", { params: { search } });
}

export async function createSale(payload: CreateSalePayload) {
  return await api.post<{ message: string; saleId: string }>("/sales", payload);
}

export async function updateStatusSale(idSale: string, status: "Pendiente" | "Entregada" | "Cancelada") {
  return await api.patch<{ message: string }>(`/sales/status/${idSale}`, { status });
}

export async function addSalePayment(
  idSale: string,
  payment: {
    cashRegisterId: number;
    userId: string;
    paymentMethodId: number;
    amount: number;
    receipt?: string | null;
    notes?: string | null;
  }
) {
  return await api.post<{ message: string }>(`/sales/payment/${idSale}`, { payment });
}