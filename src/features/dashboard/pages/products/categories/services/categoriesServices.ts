import api from "../../../../../../app/api/api";

export interface CategoryRecord {
  id: number;
  name: string;
  description: string;
  productsCount: number;
}

export interface CreateProductCategoryDTO {
  name: string;
  description: string;
}

export interface UpdateProductCategoryDTO {
  name?: string;
  description?: string;
}

export async function getCategories(search?: string) {
  return await api.get<{
    message: string;
    nextId: number;
    categories: CategoryRecord[];
  }>("/products/categories", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
}

export async function getNextCategoryId() {
  return await api.get<{
    message: string;
    nextId: number;
  }>("/products/categories/next-id");
}

export async function getCategoryById(id: number) {
  return await api.get<{
    message: string;
    category: CategoryRecord;
  }>(`/products/categories/${id}`);
}

export async function createCategory(data: CreateProductCategoryDTO) {
  return await api.post<{
    message: string;
    category: Omit<CategoryRecord, "productsCount">;
  }>("/products/categories", data);
}

export async function updateCategory(id: number, data: UpdateProductCategoryDTO) {
  return await api.put<{
    message: string;
    category: Omit<CategoryRecord, "productsCount">;
  }>(`/products/categories/${id}`, data);
}

export async function deleteCategory(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/categories/${id}`);
}
