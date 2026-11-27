import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faBan,
  faSliders,
  faFloppyDisk,
  faXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Select } from "../../../../../shared/components/Inputs/Select";
import type { PurchaseWithRelations } from "../../../../../@types/purchases";

export type PurchaseStatus = "Pendiente" | "Recibida" | "Cancelada";

interface PurchaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Omit<PurchaseWithRelations, "purchaseDetails"> | PurchaseWithRelations | null;
  onUpdateStatus: (purchaseId: string, newStatus: PurchaseStatus) => Promise<void> | void;
  isLoading?: boolean;
}

export function PurchaseStatusModal({
  isOpen,
  onClose,
  purchase,
  onUpdateStatus,
  isLoading = false,
}: PurchaseStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus>("Pendiente");

  useEffect(() => {
    if (purchase?.status) {
      const s = purchase.status;
      if (s === "Recibida" || s === "Completada") {
        // eslint-disable-next-line
        setSelectedStatus("Recibida");
      } else if (s === "Cancelada") {
        setSelectedStatus("Cancelada");
      } else {
        setSelectedStatus("Pendiente");
      }
    }
  }, [purchase]);

  if (!isOpen || !purchase) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onUpdateStatus(purchase.id, selectedStatus);
  };

  const statusOptions: { value: PurchaseStatus; label: string; description: string; icon: typeof faCircleCheck; color: string; badgeCls: string }[] = [
    {
      value: "Pendiente",
      label: "Pendiente",
      description: "La orden fue emitida y está a la espera de despacho o arribo.",
      icon: faClock,
      color: "text-amber-500",
      badgeCls: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    {
      value: "Recibida",
      label: "Recibida",
      description: "Mercancía entregada, verificada e ingresada al inventario.",
      icon: faCircleCheck,
      color: "text-emerald-500",
      badgeCls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
    {
      value: "Cancelada",
      label: "Cancelada",
      description: "Orden anulada. No afecta stock ni movimientos posteriores.",
      icon: faBan,
      color: "text-rose-500",
      badgeCls: "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Estado de Compra"
      description={`Actualiza el estado operativo para la orden #${purchase.id.slice(0, 8)}`}
      icon={faSliders}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} type="button">
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Actualizando..."
            disabled={isLoading || selectedStatus === purchase.status}
            type="button"
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Estado
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Resumen de la orden seleccionada */}
        <div className="p-3.5 rounded-2xl bg-app-surface-alt/70 border border-app-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Proveedor:</span>
            <strong className="text-app-text font-bold">
              {purchase.supplier?.businessName || "No asignado"}
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Estado Actual:</span>
            <span className="font-semibold text-app-text">{purchase.status}</span>
          </div>
        </div>

        {/* Selector Desplegable */}
        <div>
          <Select
            label="Selecciona el nuevo estado *"
            id="modal-select-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PurchaseStatus)}
            options={[
              { value: "Pendiente", label: "Pendiente" },
              { value: "Recibida", label: "Recibida" },
              { value: "Cancelada", label: "Cancelada" },
            ]}
            size="md"
          />
        </div>

        {/* Tarjetas de Selección Rápida Visual */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider block">
            O elige directamente:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                    ? "border-brand-royal bg-brand-royal/10 dark:border-brand-sky dark:bg-brand-sky/15 shadow-2xs ring-1 ring-brand-royal/30"
                    : "border-app-border bg-app-surface hover:border-brand-royal/40 hover:bg-app-surface-alt/60"
                    }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${isSelected
                      ? "bg-brand-royal text-white dark:bg-brand-royal"
                      : "bg-app-surface-alt text-app-muted"
                      }`}
                  >
                    <FontAwesomeIcon icon={opt.icon} className="text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-app-text">{opt.label}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${opt.badgeCls}`}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-app-muted mt-0.5 leading-tight">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedStatus === "Cancelada" && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm shrink-0" />
            <span>Al cancelar la orden, no se registrarán existencias en el inventario.</span>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default PurchaseStatusModal;
