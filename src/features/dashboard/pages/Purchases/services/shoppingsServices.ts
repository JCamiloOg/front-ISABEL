import type { CashRegister } from "../../../../../@types/cash-registers";
import type { ProductWithRelations } from "../../../../../@types/products";
import type { Purchase, PurchaseDetail, PurchaseWithRelations } from "../../../../../@types/purchases";
import type { Supplier } from "../../../../../@types/suppliers";
import api from "../../../../../app/api/api";


export async function getAllPurchases() {
    return await api.get<
        {
            message: string;
            shoppings: Omit<PurchaseWithRelations, "purchaseDetails">[]
            cashRegister: Pick<CashRegister, "name" | "id" | "currentBalance">[]
        }
    >("/shoppings");
}

export async function getPurchaseByID(id: string) {
    return await api.get<
        {
            message: string;
            shoppings: PurchaseWithRelations
        }
    >(`/shoppings/${id}`);
}

export interface PurchasePaymentInput {
    id?: number
    cashRegisterId: number;
    amount: number;
}

export async function createPurchase(data: {
    purchaseInfo: Omit<Purchase, 'status' | 'deliveryDate' | "id" | "cashRegisterId"> & { id?: string },
    purchaseDetails: Omit<PurchaseDetail, 'id' | "purchaseId">[],
    purchasePayments: PurchasePaymentInput[]
}
) {
    return await api.post<{ message: string }>("/shoppings", data);
}

export async function updatePurchase(id: string, data: {
    purchaseInfo: Omit<Purchase, 'status' | 'deliveryDate' | "id">,
}) {
    return await api.put<{ message: string }>(`/shoppings/${id}`, data);
}

export async function changePaymentsInfo(data: PurchasePaymentInput[], id: string) {
    return api.put<{ message: string }>(`/shoppings/payment-info/${id}`, {
        purchasePayments: data
    });
}

export async function deletePaymentInfo(id: number) {
    return api.delete<{ message: string }>(`/shoppings/delete-payment/${id}`);
}


export async function addVariantShopping(data: Omit<PurchaseDetail, "id" | "purchaseId">, purchaseId: string) {
    return await api.post<{ message: string }>(`/shoppings/add-variant/${purchaseId}`, {
        variant: data
    });
}

export async function updateVariantInShopping(data: Omit<PurchaseDetail, "id" | "purchaseId">, purchaseId: string, idVariantShopping: number) {
    return await api.put<{ message: string }>(`/shoppings/update-variant/${purchaseId}/${idVariantShopping}`, {
        variant: data
    });
}

export async function updatePurchaseStatus(purchaseId: string, status: 'Pendiente' | 'Recibida' | 'Cancelada') {
    return await api.patch<{ message: string }>(`/shoppings/status/${purchaseId}`, {
        status
    });
}

export async function deleteVariantInShopping(purchaseId: string, idVariantShopping: number) {
    return await api.delete<{ message: string }>(`/shoppings/delete-variant/${purchaseId}/${idVariantShopping}`);
}



// Momentaneo
export async function getProducts(search: string) {
    return api.get<{ products: ProductWithRelations[] }>("/shoppings/products", {
        params: {
            search
        }
    });
}

export async function getSupplier(search: string) {
    return api.get<{ suppliers: Supplier[] }>("/shoppings/suppliers", {
        params: {
            search
        }
    });
}



