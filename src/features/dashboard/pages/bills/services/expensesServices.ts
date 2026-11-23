import type { Expense, ExpenseWithRelations } from "../../../../../@types";
import api from "../../../../../app/api/api";

export interface ExpensePayload {
  concept: string;
  amount: number;
  date: string;
  userId: string;
  cashRegisterId: number;
}

export async function getAllExpenses() {
  return await api.get<{
    message: string;
    Expenses: Expense[];
  }>("/expenses");
}

export async function getExpenseById(idExpenses: number | string) {
  return await api.get<{
    message: string;
    Expenses: ExpenseWithRelations;
  }>(`/expenses/${idExpenses}`);
}

export async function createExpense(data: ExpensePayload) {
  return await api.post<{ message: string }>("/expenses/create", data);
}

export async function updateExpense(idExpenses: number | string, data: Partial<ExpensePayload>) {
  return await api.put<{ message: string }>(`/expenses/${idExpenses}`, data);
}

export async function deleteExpense(idExpenses: number | string) {
  return await api.delete<{ message: string }>(`/expenses/${idExpenses}`);
}
