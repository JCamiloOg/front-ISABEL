import type { SupplierCategoryWithRelations } from "../../../../../@types/suppliers";
import api from "../../../../../app/api/api";

interface SupplierCategoryResponse {
  message: string;
  suppliersCategory?: SupplierCategoryWithRelations | SupplierCategoryWithRelations[];
}

export interface SupplierCategoryFormData {
  name: string;
  description: string;
}

// GET /api/category-supplier
// Solicita la colección completa de categorías con sus proveedores asociados.
export async function getSupplierCategories() {
  return api.get<SupplierCategoryResponse>("/category-supplier");
}

// GET /api/category-supplier/:id
// Solicita una sola categoría para mostrarla en el modal de detalle.
export async function getSupplierCategoryById(id: number) {
  return api.get<SupplierCategoryResponse>(`/category-supplier/${id}`);
}

// POST /api/category-supplier
// Envía los datos de una nueva categoría al backend.
export async function createSupplierCategory(data: SupplierCategoryFormData) {
  return api.post<SupplierCategoryResponse>("/category-supplier", data);
}

// PUT /api/category-supplier/:id
// Actualiza una categoría existente sin cambiar su identificador.
export async function updateSupplierCategory(
  id: number,
  data: SupplierCategoryFormData,
) {
  return api.put<SupplierCategoryResponse>(
    `/category-supplier/${id}`,
    data,
  );
}

// DELETE /api/category-supplier/:id
// Solicita la eliminación de una categoría por su identificador.
export async function deleteSupplierCategory(id: number) {
  return api.delete<{ message: string }>(`/category-supplier/${id}`);
}
