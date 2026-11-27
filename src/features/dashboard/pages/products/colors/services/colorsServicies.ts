import api from "../../../../../../app/api/api";

export interface ColorRecord {
  id: number;
  color: string;
  hex: string;
  productsCount: number;
}

export interface CreateColorDTO {
  color: string;
  hex: string;
}

export interface UpdateColorDTO {
  color?: string;
  hex?: string;
}

export async function getColors(search?: string) {
  return await api.get<{
    message: string;
    nextId: number;
    colors: ColorRecord[];
  }>("/products/colors", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
}

export async function getNextColorId() {
  return await api.get<{
    message: string;
    nextId: number;
  }>("/products/colors/next-id");
}

export async function getColorById(id: number) {
  return await api.get<{
    message: string;
    color: ColorRecord;
  }>(`/products/colors/${id}`);
}

export async function createColor(data: CreateColorDTO) {
  return await api.post<{
    message: string;
    color: Omit<ColorRecord, "productsCount">;
  }>("/products/colors", data);
}

export async function updateColor(id: number, data: UpdateColorDTO) {
  return await api.put<{
    message: string;
    color: Omit<ColorRecord, "productsCount">;
  }>(`/products/colors/${id}`, data);
}

export async function deleteColor(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/colors/${id}`);
}
