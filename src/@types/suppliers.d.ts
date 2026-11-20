// ============================================================================
// 3. MÓDULO DE PROVEEDORES
// ============================================================================

import type { DocumentType } from './Users';
import type { Purchase } from './purchases';

/** Clasificación de proveedores (ej. Mayorista Nacional, Importador Directo, Fabricante) */
export interface SupplierCategory {
  id: number;
  name: string;
  description: string;
}

export interface SupplierCategoryWithRelations extends SupplierCategory {
  suppliers?: SupplierCategoryAssignmentWithRelations[];
}

/** Proveedores de mercancía nacionales o internacionales */
export interface Supplier {
  document: string;
  documentTypeId: number;
  supplierType: string;
  businessName: string;
  isImported: boolean;
  phone: string;
  email: string;
  address?: string | null;
  status: string;
}

export interface SupplierWithRelations extends Supplier {
  documentType?: DocumentType;
  categories?: SupplierCategoryAssignmentWithRelations[];
  purchases?: Purchase[];
}

/** Relación muchos a muchos entre proveedores y sus categorías */
export interface SupplierCategoryAssignment {
  supplierCategoryId: number;
  supplierId: string;
}

export interface SupplierCategoryAssignmentWithRelations extends SupplierCategoryAssignment {
  supplierCategory?: SupplierCategory;
  supplier?: Supplier;
}
