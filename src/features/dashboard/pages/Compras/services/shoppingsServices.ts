import type { ProductWithRelations, Purchase, PurchaseDetail, PurchaseWithRelations, Supplier } from "../../../../../@types";
import api from "../../../../../app/api/api";


export async function getAllPurchases() {
    return await api.get<
        {
            message: string;
            shoppings: Omit<PurchaseWithRelations, "purchaseDetails">[]
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

export async function createPurchase(data: {
    purchaseInfo: Omit<Purchase, 'status' | 'deliveryDate'>,
    purchaseDetails: Omit<PurchaseDetail, 'id' | "purchaseId">[]
}
) {
    return await api.post<{ message: string }>("/shoppings", data);
}

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



