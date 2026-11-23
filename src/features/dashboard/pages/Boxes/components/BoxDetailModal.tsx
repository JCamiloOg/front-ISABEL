import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVault,
  faBuildingColumns,
  faMoneyBillWave,
  faCircleCheck,
  faBan,
  faCalendarDay,
  faReceipt,
  faArrowUpRightFromSquare,
  faCartShopping,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import type { CashRegisterWithRelations } from "../../../../../@types";

interface BoxDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: CashRegisterWithRelations | null;
  isLoading: boolean;
}

export function BoxDetailModal({
  isOpen,
  onClose,
  box,
  isLoading,
}: BoxDetailModalProps) {
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

  const isBank = box?.registerType?.toLowerCase().includes("banc") || box?.registerType?.toLowerCase().includes("cuenta");
  const purchases = box?.purchases || [];
  const expenses = box?.expenses || [];
  const payments = box?.payments || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Caja o Cuenta"
      description={`Consulta información patrimonial, movimientos y estado de la caja #${box?.id || ""}`}
      icon={faVault}
      size="xl"
    >
      {isLoading ? (
        <div className="space-y-4 py-8 animate-pulse">
          <div className="h-20 bg-app-border/40 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-app-border/40 rounded-xl" />
            <div className="h-16 bg-app-border/40 rounded-xl" />
          </div>
          <div className="h-32 bg-app-border/40 rounded-2xl" />
        </div>
      ) : !box ? (
        <div className="py-12 text-center text-app-muted">
          No se encontró la información de la caja solicitada.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card con Saldo y Estado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky shadow-inner">
                <FontAwesomeIcon icon={isBank ? faBuildingColumns : faMoneyBillWave} className="text-2xl" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-app-text">{box.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      box.status
                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={box.status ? faCircleCheck : faBan} className="text-[10px]" />
                    {box.status ? "Operativa / Activa" : "Inactiva / Pausada"}
                  </span>
                </div>
                <p className="text-xs text-app-muted mt-0.5 font-medium">
                  Tipo: <strong className="text-app-text">{box.registerType}</strong>
                </p>
                {box.details && (
                  <p className="text-xs text-app-muted mt-1 italic">
                    "{box.details}"
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                Saldo Actual
              </span>
              <p className="text-2xl sm:text-3xl font-black text-brand-royal dark:text-brand-sky mt-0.5">
                {formatCurrency(box.currentBalance)}
              </p>
            </div>
          </div>

          {/* Estadísticas de Relaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                <span>Compras Asociadas</span>
                <FontAwesomeIcon icon={faCartShopping} className="text-brand-royal dark:text-brand-sky" />
              </div>
              <p className="text-xl font-bold text-app-text mt-2">{purchases.length}</p>
              <span className="text-[11px] text-app-muted">Egresos por inventario</span>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                <span>Gastos Operativos</span>
                <FontAwesomeIcon icon={faReceipt} className="text-amber-500" />
              </div>
              <p className="text-xl font-bold text-app-text mt-2">{expenses.length}</p>
              <span className="text-[11px] text-app-muted">Egresos registrados</span>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                <span>Cobros de Ventas</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-app-text mt-2">{payments.length}</p>
              <span className="text-[11px] text-app-muted">Ingresos recibidos</span>
            </div>
          </div>

          {/* Sección de Movimientos / Gastos Recientes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5">
              <FontAwesomeIcon icon={faInfoCircle} className="text-brand-royal dark:text-brand-sky" />
              Últimos Movimientos de Gastos Registrados
            </h4>

            {expenses.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-app-border text-xs text-app-muted">
                No hay registros de gastos operativos directamente ligados a esta caja todavía.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-app-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-app-bg text-app-muted uppercase font-bold border-b border-app-border">
                    <tr>
                      <th className="px-4 py-2.5">Concepto</th>
                      <th className="px-4 py-2.5">Fecha</th>
                      <th className="px-4 py-2.5 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border bg-app-surface">
                    {expenses.slice(0, 5).map((exp) => (
                      <tr key={exp.id}>
                        <td className="px-4 py-2.5 font-medium text-app-text">{exp.concept}</td>
                        <td className="px-4 py-2.5 text-app-muted">
                          {exp.date ? new Date(exp.date).toLocaleDateString("es-CO") : "Sin fecha"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                          - {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
