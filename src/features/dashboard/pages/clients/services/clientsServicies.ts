import api from "../../../../../app/api/api";

export interface ClientRecord {
  identityDocument: string;
  documentType: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
  totalOrders: number;
}

export interface ClientDetailMetrics {
  totalOrders: number;
  purchaseVolume: number;
  lastMonthSalesTotal: number;
  lastPurchaseDate: string | null;
}

export interface ClientDetailRecord {
  identityDocument: string;
  documentType: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
  createdAt: string;
  metrics: ClientDetailMetrics;
}

export interface CreateClientDTO {
  identityDocument: string;
  documentTypeId: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  address?: string;
  password?: string;
  status?: boolean;
}

export interface UpdateClientDTO {
  documentTypeId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: boolean;
}

export async function getClients() {
  return await api.get<{
    message: string;
    clients: ClientRecord[];
  }>("/clients");
}

export async function getClientById(identityDocument: string) {
  return await api.get<{
    message: string;
    client: ClientDetailRecord;
  }>(`/clients/${encodeURIComponent(identityDocument)}`);
}

export async function createClient(data: CreateClientDTO) {
  return await api.post<{
    message: string;
    client: Omit<ClientRecord, "totalOrders">;
  }>("/clients", data);
}

export async function updateClient(identityDocument: string, data: UpdateClientDTO) {
  return await api.put<{
    message: string;
    client: Omit<ClientRecord, "totalOrders">;
  }>(`/clients/${encodeURIComponent(identityDocument)}`, data);
}

export async function deleteClient(identityDocument: string) {
  return await api.delete<{
    message: string;
  }>(`/clients/${encodeURIComponent(identityDocument)}`);
}
