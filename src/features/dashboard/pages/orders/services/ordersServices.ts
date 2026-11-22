import api from "../../../../../app/api/api";

export interface OrderCustomer {
    identityDocument: string;
    firstName: string;
    lastName: string;
}

export interface OrdersPayload {
    id: string;
    status: string;
    vat: number | string;
    customer: OrderCustomer | null;
    saleDetails?: OrderSaleDetail[];
    total: number;
}

export interface OrderProduct {
    id: number;
    sku?: string | null;
    name: string;
    productCategoryId?: number;
    brandId?: number;
    shoeTypeId?: number;
    purchasePrice?: number | string;
    salePrice?: number | string;
    isPublic?: boolean;
    gender?: string;
    status?: string;
}

export interface OrderColor {
    id: number;
    name: string;
    hex: string;
}

export interface OrderColorImage {
    id: number;
    productColorId: number;
    image?: string | null;
}

export interface OrderProductColor {
    id: number;
    productId: number;
    colorId: number;
    image?: string | null;
    status?: string;
    color?: OrderColor;
    product?: OrderProduct;
    colorImages?: OrderColorImage[];
}

export interface OrderSize {
    id: number;
    sizeNumber: string;
    gender: string;
    internationalSize: string;
}

export interface OrderVariant {
    id: number;
    productColorId: number;
    sizeId: number;
    currentStock: number;
    discount?: number | string | null;
    status: string;
    size?: OrderSize;
    productColor?: OrderProductColor;
}

export interface OrderSaleDetail {
    id: number;
    saleId: string;
    variantId: number;
    quantity: number;
    unitPrice: number | string;
    variant?: OrderVariant;
}

export interface OrdersPayloadByID {
    id: string;
    userId: string;
    saleDate: string | Date;
    discount: number | string;
    vat: number | string;
    status: string;
    customer: OrderCustomer | null;
    saleDetails: OrderSaleDetail[];
}

export async function getAllOrders() {
    return await api.get<{ message: string; orders: OrdersPayload[] }>("/orders");
}

export async function getOrderByID(id: string) {
    return await api.get<{ message: string; orders: OrdersPayloadByID }>(`/orders/${id}`);
}

export async function updateStatusOrder(id: string, status: string) {
    return await api.patch<{ message: string }>(`/orders/status/${id}`, { status });
}
