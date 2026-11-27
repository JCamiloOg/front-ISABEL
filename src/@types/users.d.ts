// ============================================================================
// 1. MÓDULO DE SEGURIDAD Y USUARIOS
// ============================================================================

import type { Sale } from './sales';
import type { Payment } from './sales';
import type { SaleReturn } from './sales';
import type { Expense } from './cash-registers';
import type { Supplier } from './suppliers';

/** Roles del sistema (ej. Administrador, Vendedor, Bodeguero, Cliente) */
export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface LoggedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  role: string;
  status: boolean;
}

export interface RoleWithRelations extends Role {
  users?: User[];
  rolePrivileges?: RolePrivilege[];
}

/** Módulos funcionales del sistema (ej. 'Users', 'Sales', 'Products', 'CashRegisters') */
export interface Permission {
  id: number;
  name: string;
}

export interface PermissionWithRelations extends Permission {
  privileges?: Privilege[];
}

/** Acciones permitidas dentro de cada módulo (ej. 'Create', 'Read', 'Update', 'Delete', 'Approve') */
export interface Privilege {
  id: number;
  permissionId: number;
  name: string;
}

export interface PrivilegeWithRelations extends Privilege {
  permission?: Permission;
  rolePrivileges?: RolePrivilege[];
}

/** Tabla pivote que asigna privilegios específicos a cada rol */
export interface RolePrivilege {
  id: number;
  roleId: number;
  privilegeId: number;
}

export interface RolePrivilegeWithRelations extends RolePrivilege {
  role?: Role;
  privilege?: Privilege;
}

/** Catálogo de tipos de documento de identidad (ej. CC, NIT, CE, Pasaporte) */
export interface DocumentType {
  id: number;
  documentType: string;
}

export interface DocumentTypeWithRelations extends DocumentType {
  users?: User[];
  suppliers?: Supplier[];
}

/** Usuarios del sistema: empleados internos y clientes registrados */
export interface User {
  identityDocument: string;
  documentTypeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
  password?: string | null;
  roleId?: number | null;
  status: string;
  createdAt: string | Date;
}

export interface UserWithRelations extends User {
  documentType?: DocumentType;
  role?: Role | null;
  salesAsCustomer?: Sale[];
  salesAsSeller?: Sale[];
  payments?: Payment[];
  saleReturns?: SaleReturn[];
  expenses?: Expense[];
}
