import type { SaleReturn, SaleReturnWithRelations } from "../../../../../@types";
import api from "../../../../../app/api/api";


export async function getAllReturns() {
    return api.get<{
        saleReturns: Omit<SaleReturnWithRelations,
            "user" |
            "rejectionReason" |
            "resolutionDate" |
            "saleId" |
            "userId" |
            "variantId">[]
    }>("/returns");
}


export async function getReturnByID(id: string) {
    return api.get<{ saleReturns: SaleReturnWithRelations }>(`/returns/${id}`);
}


export async function createSaleReturn(data: Omit<SaleReturn, "id" | "rejectionReason" | "status" | "resolutionDate" | "userId">) {
    return api.post("/returns", {
        saleReturn: data
    });
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

export async function resolveReturn(data: Pick<SaleReturn, "status" | "rejectionReason">, id: string) {
    return api.put(`/returns/${id}`, data);
}

export async function getSales(search?: string) {
    return api.get<{ sales: SaleOptionItem[] }>("/returns/sales", {
        params: search ? { search } : undefined
    });
}
