import api from "../../../../../app/api/api";

export interface PrivilegeOption {
  id: number;
  permissionId: number;
  name: "Read" | "Create" | "Update" | "Delete" | "Approve" | string;
}

export interface PermissionCatalogItem {
  id: number;
  name: string;
  privileges: PrivilegeOption[];
}

export interface RolePayload {
  id: number;
  name: string;
  description: string;
  _count: {
    users: number;
  };
  rolePrivileges: {
    privilegeId: number;
  }[];
}

export interface RolePayloadByID {
  id: number;
  name: string;
  description: string;
  _count: {
    users: number;
  };
  rolePrivileges: {
    privilegeId: number;
    privilege: {
      id: number;
      name: string;
      permissionId: number;
      permission: {
        id: number;
        name: string;
      };
    };
  }[];
}

export interface RoleFormPayload {
  roleInfo: {
    name: string;
    description: string;
  };
  privilegeIds: number[];
}

export async function getAllRoles() {
  return await api.get<{
    message: string;
    roles: RolePayload[];
    permissions: PermissionCatalogItem[];
  }>("/roles");
}

export async function getRoleByID(idRole: number) {
  return await api.get<{
    message: string;
    roles: RolePayloadByID;
  }>(`/roles/${idRole}`);
}

export async function createRole(payload: RoleFormPayload) {
  return await api.post<{ message: string }>("/roles", payload);
}

export async function updateRole(idRole: number, payload: RoleFormPayload) {
  return await api.put<{ message: string }>(`/roles/${idRole}`, payload);
}

export async function deleteRole(idRole: number) {
  return await api.delete<{ message: string }>(`/roles/${idRole}`);
}