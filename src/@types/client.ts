export type DocumentType = 'CC' | 'CE' | 'NIT' | 'PASAPORTE';
export type ClientStatus = 'Activo' | 'Inactivo';

export interface CommercialHistory {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  status: ClientStatus;
  commercialHistory: CommercialHistory;
  createdAt: string;
}

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'commercialHistory'>;