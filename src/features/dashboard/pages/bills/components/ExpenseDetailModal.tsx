import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faCalendarDay,
  faMoneyBillWave,
  faBuildingColumns,
  faUser,
  faTag,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import type { ExpenseWithRelations } from "../../../../../@types";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseWithRelations | null;
  isLoading: boolean;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  isLoading,
}: ExpenseDetailModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number | string | undefined | null) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isBank = expense?.cashRegister?.registerType?.toLowerCase().includes("banc") ||
    expense?.cashRegister?.name?.toLowerCase().includes("banc");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Gasto Operativo"
      description={`Consulta la información del egreso #${expense?.id || ""}`}
      icon={faReceipt}
      size="md"
    >
      {isLoading ? (
        <div className="space-y-4 py-8 animate-pulse">
          <div className="h-16 bg-app-border/40 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-app-border/40 rounded-xl" />
            <div className="h-12 bg-app-border/40 rounded-xl" />
          </div>
        </div>
      ) : !expense ? (
        <div className="py-12 text-center text-app-muted">
          No se encontró la información del gasto solicitado.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Card con Monto y Concepto */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-rose-500/5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner">
                <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
              </span>
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  Gasto #{expense.id}
                </span>
                <h3 className="text-lg font-black text-app-text mt-0.5">{expense.concept}</h3>
                <p className="text-xs text-app-muted flex items-center gap-1.5 mt-1">
                  <FontAwesomeIcon icon={faCalendarDay} className="text-[11px]" />
                  {expense.date ? new Date(expense.date).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "Sin fecha"}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                Monto Descontado
              </span>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>

          {/* Información Detallada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Caja afectada */}
            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-2">
                <FontAwesomeIcon icon={isBank ? faBuildingColumns : faMoneyBillWave} className="text-brand-royal dark:text-brand-sky" />
                Caja / Cuenta Afectada
              </span>
              <p className="text-sm font-bold text-app-text">
                {expense.cashRegister?.name || `Caja #${expense.cashRegisterId}`}
              </p>
              <p className="text-xs text-app-muted mt-0.5">
                ID de Caja: {expense.cashRegisterId}
              </p>
            </div>

            {/* Usuario que registró */}
            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-2">
                <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                Registrado Por
              </span>
              <p className="text-sm font-bold text-app-text">
                {expense.user ? `${expense.user.firstName || ""} ${expense.user.lastName || ""}`.trim() : "Usuario del sistema"}
              </p>
              <p className="text-xs font-mono text-app-muted mt-0.5">
                Documento: {expense.userId}
              </p>
            </div>
          </div>

          {/* Observaciones o aviso */}
          <div className="p-3.5 rounded-xl border border-app-border bg-app-bg text-xs text-app-muted flex items-center gap-2">
            <FontAwesomeIcon icon={faInfoCircle} className="text-brand-royal dark:text-brand-sky text-sm shrink-0" />
            <span>
              Este gasto fue debitado del saldo de la caja seleccionada y forma parte de la contabilidad operativa.
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
