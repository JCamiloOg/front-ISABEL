import api from "../../../../../app/api/api";

export interface PrivilegePayload {
  id: number;
  permissionId: number;
  name: "Read" | "Create" | "Update" | "Delete" | "Approve" | string;
}

export interface PermissionPayload {
  id: number;
  name: string;
  privileges: PrivilegePayload[];
}

export async function getAllPermissions() {
  return await api.get<{
    message: string;
    permissions: PermissionPayload[];
  }>("/permissions");
}

export async function getPermissionByID(idPermission: number) {
  return await api.get<{
    message: string;
    permissions: PermissionPayload;
  }>(`/permissions/${idPermission}`);
}