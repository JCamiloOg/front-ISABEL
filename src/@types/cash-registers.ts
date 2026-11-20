// ============================================================================
// 6. GESTIÓN DE CAJAS Y GASTOS
// ============================================================================

import type { User } from './users';
import type { Purchase } from './purchases';
import type { Payment } from './sales';

/** Cajas físicas y cuentas bancarias/digitales donde ingresa y egresa dinero */
export interface CashRegister {
  id: number;
  name: string;
  registerType: string;
  currentBalance: number | string;
  details: string;
  status: boolean;
}

export interface CashRegisterWithRelations extends CashRegister {
  purchases?: Purchase[];
  payments?: Payment[];
  expenses?: Expense[];
}

/** Registro de gastos operativos descontados de una caja específica */
export interface Expense {
  id: number;
  concept: string;
  amount: number | string;
  date: string | Date;
  userId: string;
  cashRegisterId: number;
}

export interface ExpenseWithRelations extends Expense {
  user?: User;
  cashRegister?: CashRegister;
}
