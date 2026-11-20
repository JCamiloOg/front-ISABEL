export type SupplierDocumentType = "NIT" | "Cédula";

export type SupplierType = "Natural" | "Jurídico";

export type SupplierStatus = "Activo" | "Inactivo";

export interface SupplierCategory {
  id: number;
  name: string;
  description?: string;
  badgeColor?: string;
}

export interface Supplier {
  id: string;
  documentType: SupplierDocumentType;
  documentNumber: string;
  businessName: string;
  supplierType: SupplierType;
  isImported: boolean;
  categories: SupplierCategory[];
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;
  status: SupplierStatus;
  registrationDate: string;
}

export interface SupplierForm {
  documentType: SupplierDocumentType;
  documentNumber: string;
  businessName: string;
  supplierType: SupplierType;
  isImported: boolean;
  categoryIds?: number[];
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;
}

export type SupplierFormErrors = Partial<
  Record<
    | "documentType"
    | "documentNumber"
    | "businessName"
    | "supplierType"
    | "categories"
    | "phone"
    | "email"
    | "address",
    string
  >
>;

