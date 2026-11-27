import api from "../../../../../../app/api/api";

export interface ShoeTypeRecord {
  id: number;
  name: string;
  productsCount: number;
}

export interface CreateShoeTypeDTO {
  name: string;
}

export interface UpdateShoeTypeDTO {
  name: string;
}

export async function getShoeTypes(search?: string) {
  return await api.get<{
    message: string;
    nextId: number;
    shoeTypes: ShoeTypeRecord[];
  }>("/products/types", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
}

export async function getNextShoeTypeId() {
  return await api.get<{
    message: string;
    nextId: number;
  }>("/products/types/next-id");
}

export async function getShoeTypeById(id: number) {
  return await api.get<{
    message: string;
    shoeType: ShoeTypeRecord;
  }>(`/products/types/${id}`);
}

export async function createShoeType(data: CreateShoeTypeDTO) {
  return await api.post<{
    message: string;
    shoeType: Omit<ShoeTypeRecord, "productsCount">;
  }>("/products/types", data);
}

export async function updateShoeType(id: number, data: UpdateShoeTypeDTO) {
  return await api.put<{
    message: string;
    shoeType: Omit<ShoeTypeRecord, "productsCount">;
  }>(`/products/types/${id}`, data);
}

export async function deleteShoeType(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/types/${id}`);
}
