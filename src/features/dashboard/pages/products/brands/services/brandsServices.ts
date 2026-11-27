import api from "../../../../../../app/api/api";

export interface BrandRecord {
  id: number;
  name: string;
  status: boolean;
  productsCount: number;
}

export interface CreateBrandDTO {
  name: string;
  status?: boolean;
}

export interface UpdateBrandDTO {
  name?: string;
  status?: boolean;
}

export async function getBrands(params?: { search?: string; status?: string }) {
  return await api.get<{
    message: string;
    nextId: number;
    brands: BrandRecord[];
  }>("/products/brands", {
    params:
      params && (params.search?.trim() || params.status?.trim())
        ? {
            ...(params.search?.trim() ? { search: params.search.trim() } : {}),
            ...(params.status?.trim() ? { status: params.status.trim() } : {}),
          }
        : undefined,
  });
}

export async function getNextBrandId() {
  return await api.get<{
    message: string;
    nextId: number;
  }>("/products/brands/next-id");
}

export async function getBrandById(id: number) {
  return await api.get<{
    message: string;
    brand: BrandRecord;
  }>(`/products/brands/${id}`);
}

export async function createBrand(data: CreateBrandDTO) {
  return await api.post<{
    message: string;
    brand: Omit<BrandRecord, "productsCount">;
  }>("/products/brands", data);
}

export async function updateBrand(id: number, data: UpdateBrandDTO) {
  return await api.put<{
    message: string;
    brand: Omit<BrandRecord, "productsCount">;
  }>(`/products/brands/${id}`, data);
}

export async function updateBrandStatus(id: number) {
  return await api.patch<{
    message: string;
    brand: Omit<BrandRecord, "productsCount">;
  }>(`/products/brands/status/${id}`);
}

export async function deleteBrand(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/brands/${id}`);
}
