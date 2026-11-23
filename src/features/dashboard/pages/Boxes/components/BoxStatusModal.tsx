import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSliders,
  faXmark,
  faFloppyDisk,
  faCircleCheck,
  faBan,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { CashRegister } from "../../../../../@types";

interface BoxStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: CashRegister | null;
  onToggleStatus: (boxId: number, newStatus: boolean) => Promise<void> | void;
  isLoading?: boolean;
}

export function BoxStatusModal({
  isOpen,
  onClose,
  box,
  onToggleStatus,
  isLoading = false,
}: BoxStatusModalProps) {
  if (!isOpen || !box) return null;

  const currentStatus = box.status;
  const nextStatus = !currentStatus;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onToggleStatus(box.id, nextStatus);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Estado de la Caja"
      description={`Actualiza la disponibilidad operativa para ${box.name} (#${box.id})`}
      icon={faSliders}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} type="button">
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>

          <Button
            variant={nextStatus ? "primary" : "outline"}
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className={!nextStatus ? "border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20" : ""}
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            {isLoading
              ? "Actualizando..."
              : nextStatus
              ? "Activar Caja"
              : "Desactivar Caja"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-app-border bg-app-surface flex items-start gap-3">
          <span className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <div className="text-xs space-y-1">
            <p className="font-bold text-app-text">
              ¿Estás seguro de que deseas {nextStatus ? "activar" : "desactivar"} esta caja?
            </p>
            <p className="text-app-muted">
              {nextStatus
                ? "La caja volverá a estar disponible para registrar cobros de ventas, pagos a compras y gastos operativos."
                : "Al pausar o desactivar la caja, no podrá ser seleccionada en nuevas compras o egresos."}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-app-border bg-app-bg flex items-center justify-between">
          <span className="text-xs font-semibold text-app-muted">Nuevo Estado:</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              nextStatus
                ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
            }`}
          >
            <FontAwesomeIcon icon={nextStatus ? faCircleCheck : faBan} className="text-[10px]" />
            {nextStatus ? "Activa / Habilitada" : "Inactiva / Pausada"}
          </span>
        </div>
      </div>
    </Modal>
  );
}
