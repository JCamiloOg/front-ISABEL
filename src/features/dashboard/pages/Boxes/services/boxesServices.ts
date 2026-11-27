import type { CashRegister, CashRegisterWithRelations } from "../../../../../@types/cash-registers";
import api from "../../../../../app/api/api";

export interface BoxPayload {
  name: string;
  registerType: string;
  currentBalance?: number;
  details: string;
  status?: boolean;
}

export async function getAllBoxes() {
  return await api.get<{
    message: string;
    Boxes: CashRegister[];
  }>("/boxes");
}

export async function getBoxById(idBox: number | string) {
  return await api.get<{
    message: string;
    Boxes: CashRegisterWithRelations;
  }>(`/boxes/${idBox}`);
}

export async function createBox(data: BoxPayload) {
  return await api.post<{ message: string }>("/boxes/create", data);
}

export async function updateBox(idBox: number | string, data: Partial<BoxPayload>) {
  return await api.put<{ message: string }>(`/boxes/${idBox}`, data);
}

export async function deleteBox(idBox: number | string) {
  return await api.delete<{ message: string }>(`/boxes/${idBox}`);
}
