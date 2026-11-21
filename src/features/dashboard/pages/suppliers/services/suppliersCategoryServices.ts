import api from "../../../../../app/api/api";

export interface SupplierCategoryRecord {
  id: number;
  name: string;
  description: string;
  suppliers?: {
    supplier: {
      document: string;
      businessName: string;
      email: string;
      phone: string;
      status: string;
    };
  }[];
}

export interface SupplierCategoryData {
  name: string;
  description: string;
}

export async function getSupplierCategories() {
  return api.get<{
    message: string;
    suppliersCategory: SupplierCategoryRecord[];
  }>("/category-supplier");
}

export async function createSupplierCategory(data: SupplierCategoryData) {
  return api.post<{
    message: string;
    suppliersCategory: SupplierCategoryRecord;
  }>("/category-supplier", data);
}

export async function updateSupplierCategory(id: number, data: SupplierCategoryData) {
  return api.put<{
    message: string;
    suppliersCategory: SupplierCategoryRecord;
  }>(`/category-supplier/${id}`, data);
}

export async function deleteSupplierCategory(id: number) {
  return api.delete<{ message: string }>(`/category-supplier/${id}`);
}
