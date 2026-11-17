import type { Purchase, PurchaseWithRelations } from "../../../../../@types";
import api from "../../../../../app/api/api";


export async function getAllPurchases() {
    return await api.get<
        {
            message: string;
            shoppings: Purchase[]
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