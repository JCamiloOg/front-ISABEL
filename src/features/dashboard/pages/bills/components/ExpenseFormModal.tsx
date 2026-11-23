import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faPenToSquare,
  faPlus,
  faXmark,
  faFloppyDisk,
  faCalendarDay,
  faMoneyBillWave,
  faTag,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { CashRegisterSelector } from "../../../components/CashRegisterSelector";
import type { CashRegister, Expense, ExpenseWithRelations } from "../../../../../@types";
import type { ExpensePayload } from "../services/expensesServices";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  expense?: Expense | ExpenseWithRelations | null;
  cashRegisters: CashRegister[];
  onSubmit: (data: ExpensePayload, onClose: () => void) => Promise<void> | void;
  isLoading?: boolean;
  onSubmitLoading?: boolean;
}

export const COMMON_EXPENSE_CONCEPTS = [
  "Servicios Públicos (Luz, Agua, Gas)",
  "Arriendo / Alquiler",
  "Nómina / Sueldos y Honorarios",
  "Mantenimiento y Reparaciones",
  "Transporte y Domicilios",
  "Papelería y Suministros",
  "Publicidad y Mercadeo",
  "Impuestos y Retenciones",
  "Aseo y Limpieza",
  "Otros Gastos Operativos",
];

export function ExpenseFormModal({
  isOpen,
  onClose,
  mode,
  expense,
  cashRegisters,
  onSubmit,
  isLoading = false,
  onSubmitLoading = false,
}: ExpenseFormModalProps) {
  const [concept, setConcept] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [cashRegisterId, setCashRegisterId] = useState<number | string>("");
  const [userId, setUserId] = useState<string>("1000000000");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && expense) {
      setConcept(expense.concept || "");
      setAmount(String(expense.amount ?? ""));
      setDate(
        expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setCashRegisterId(expense.cashRegisterId || "");
      setUserId(expense.userId || "1000000000");
      setErrors({});
    } else if (mode === "create") {
      setConcept("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCashRegisterId(cashRegisters.length > 0 ? cashRegisters[0].id : "");
      setUserId("1000000000");
      setErrors({});
    }
  }, [mode, expense, isOpen, cashRegisters]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!concept.trim()) {
      errs.concept = "El concepto del gasto es obligatorio.";
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = "El monto debe ser un valor numérico mayor a 0.";
    }

    if (!date) {
      errs.date = "La fecha del gasto es obligatoria.";
    }

    if (!cashRegisterId) {
      errs.cashRegisterId = "Debes seleccionar la caja de donde saldrá el dinero.";
    }

    if (!userId.trim()) {
      errs.userId = "El documento del usuario responsable es obligatorio.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: ExpensePayload = {
      concept: concept.trim(),
      amount: Number(amount),
      date: new Date(date).toISOString(),
      cashRegisterId: Number(cashRegisterId),
      userId: userId.trim(),
    };

    await onSubmit(payload, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Registrar Nuevo Gasto" : "Editar Gasto Operativo"}
      description={
        mode === "create"
          ? "Registra un egreso que afectará el saldo disponible de la caja seleccionada"
          : `Actualiza la información del egreso #${expense?.id}`
      }
      icon={mode === "create" ? faPlus : faPenToSquare}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            {onSubmitLoading
              ? "Guardando..."
              : mode === "create"
              ? "Registrar Gasto"
              : "Guardar Cambios"}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 py-6 animate-pulse">
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-20 bg-app-border/50 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Concepto / Motivo del Gasto *
            </label>
            <Input
              placeholder="Ej. Pago de arriendo local, Papelería para bodega..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              error={errors.concept}
            />

            {/* Sugerencias rápidas */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMMON_EXPENSE_CONCEPTS.slice(0, 4).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setConcept(sug)}
                  className="rounded-md border border-app-border bg-app-surface px-2 py-0.5 text-[11px] text-app-muted hover:border-brand-sky hover:text-brand-royal dark:hover:text-brand-sky transition-colors"
                >
                  {sug.split("(")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Valor del Gasto ($ COP) *
              </label>
              <Input
                type="number"
                min="1"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Fecha de Pago *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
              />
            </div>
          </div>

          {/* Selector de Caja / Cuenta */}
          <div>
            <CashRegisterSelector
              cashRegisters={cashRegisters}
              value={cashRegisterId}
              onChange={(id) => setCashRegisterId(id)}
              label="Caja o Cuenta Afectada *"
              error={errors.cashRegisterId}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Cédula / NIT Responsable *
            </label>
            <Input
              placeholder="Documento del usuario responsable"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              error={errors.userId}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
