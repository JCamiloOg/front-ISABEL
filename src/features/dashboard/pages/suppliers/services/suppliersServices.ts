import type { Supplier, SupplierWithRelations } from "../../../../../@types";
import api from "../../../../../app/api/api";

export interface CreateSupplierData {
  supplierInfo: Omit<Supplier, "status">;
  categories: number[];
}

export interface UpdateSupplierData {
  supplierInfo: Partial<Omit<Supplier, "document">>;
}

export async function getAllSuppliers() {
  return await api.get<{
    message: string;
    Supplier: Supplier[];
  }>("/supplier");
}

export async function getSupplierById(idSupplier: string) {
  return await api.get<{
    message: string;
    Supplier: SupplierWithRelations;
  }>(`/supplier/${idSupplier}`);
}

export async function createSupplier(data: CreateSupplierData) {
  return await api.post<{ message: string }>("/supplier/create", data);
}

export async function updateSupplier(idSupplier: string, data: UpdateSupplierData) {
  return await api.put<{ message: string }>(`/supplier/${idSupplier}`, data);
}

export async function deleteSupplier(idSupplier: string) {
  return await api.delete<{ message: string }>(`/supplier/${idSupplier}`);
}
