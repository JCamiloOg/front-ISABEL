import api from "../../../../../app/api/api";

export interface DocumentTypeOption {
  id: number;
  documentType: string;
}

export interface RoleOption {
  id: number;
  name: string;
}

export interface UserPayload {
  identityDocument: string;
  documentTypeId: number;
  documentType: DocumentTypeOption;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  status: boolean;
  createdAt: string;
  roleId: number | null;
  role: RoleOption | null;
}

export interface UserPayloadByID extends UserPayload {
  role: {
    id: number;
    name: string;
    description: string;
  } | null;
}

export interface UserFormPayload {
  identityDocument: string;
  documentTypeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
  password?: string;
  roleId?: number | null;
}

export async function getAllUsers() {
  return await api.get<{
    message: string;
    users: UserPayload[];
    roles: RoleOption[];
    documentTypes: DocumentTypeOption[];
  }>("/users");
}

export async function getUserByID(identityDocument: string) {
  return await api.get<{
    message: string;
    users: UserPayloadByID;
  }>(`/users/${identityDocument}`);
}

export async function createUser(userInfo: UserFormPayload) {
  return await api.post<{ message: string }>("/users", { userInfo });
}

export async function updateUser(
  identityDocument: string,
  userInfo: Omit<UserFormPayload, "identityDocument">
) {
  return await api.put<{ message: string }>(`/users/${identityDocument}`, { userInfo });
}

export async function updateStatusUser(identityDocument: string, status: boolean) {
  return await api.patch<{ message: string }>(`/users/status/${identityDocument}`, { status });
}

export async function deleteUser(identityDocument: string) {
  return await api.delete<{ message: string }>(`/users/${identityDocument}`);
}