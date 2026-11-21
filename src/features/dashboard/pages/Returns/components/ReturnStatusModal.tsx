import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faBan,
  faSliders,
  faFloppyDisk,
  faXmark,
  faTriangleExclamation,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { SaleReturnWithRelations } from "../../../../../@types";

export type ReturnResolutionStatus = "Aprobada" | "Rechazada";

type ReturnListItem = Omit<
  SaleReturnWithRelations,
  "user" | "rejectionReason" | "resolutionDate" | "saleId" | "userId" | "variantId"
>;

interface ReturnStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleReturn: ReturnListItem | SaleReturnWithRelations | null;
  onUpdateStatus: (
    returnId: string,
    status: ReturnResolutionStatus,
    rejectReason?: string
  ) => Promise<void> | void;
  isLoading?: boolean;
}

export function ReturnStatusModal({
  isOpen,
  onClose,
  saleReturn,
  onUpdateStatus,
  isLoading = false,
}: ReturnStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReturnResolutionStatus>("Aprobada");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (saleReturn?.status) {
      const s = saleReturn.status.trim().toLowerCase();
      if (s.includes("rechaz") || s === "rejected") {
        // eslint-disable-next-line
        setSelectedStatus("Rechazada");
      } else {
        setSelectedStatus("Aprobada");
      }
      setRejectReason("");
      setError("");
    }
  }, [saleReturn, isOpen]);

  if (!isOpen || !saleReturn) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (selectedStatus === "Rechazada" && (!rejectReason.trim() || rejectReason.trim().length < 5)) {
      setError("Debes ingresar un motivo de rechazo de al menos 5 caracteres.");
      return;
    }

    await onUpdateStatus(saleReturn.id, selectedStatus, rejectReason.trim() || undefined);
  };

  const product = saleReturn.variant?.productColor?.product;
  const productColor = saleReturn.variant?.productColor;
  const size = saleReturn.variant?.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Estado de Devolución"
      description={`Resolución del caso para la devolución #${saleReturn.id.slice(0, 8)}`}
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
            loadingText="Guardando..."
            disabled={isLoading}
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
        {/* Resumen del caso seleccionado */}
        <div className="p-3.5 rounded-2xl bg-app-surface-alt/70 border border-app-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Producto:</span>
            <strong className="text-app-text font-bold truncate max-w-55" title={product?.name}>
              {product?.name || "Calzado en garantía"}
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Variante / Talla:</span>
            <span className="text-app-text font-medium">
              {productColor?.color?.name || "Color estándar"} • Talla {size?.size || size?.sizeNumber || "—"} ({saleReturn.quantity} {saleReturn.quantity === 1 ? "par" : "pares"})
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app-border/60">
            <span className="text-app-muted">Estado Actual:</span>
            <span className="font-semibold text-app-text capitalize">{saleReturn.status}</span>
          </div>
        </div>

        {/* Selección Tipo Radio de los 2 Estados */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider block">
            Selecciona la resolución del caso *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción Aceptada / Aprobada */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${selectedStatus === "Aprobada"
                ? "border-emerald-500 bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-500/15 shadow-2xs ring-1 ring-emerald-500/30"
                : "border-app-border bg-app-surface hover:border-emerald-500/40 hover:bg-app-surface-alt/60"
                }`}
            >
              <input
                type="radio"
                name="resolutionStatus"
                value="Aprobada"
                checked={selectedStatus === "Aprobada"}
                onChange={() => {
                  setSelectedStatus("Aprobada");
                  setError("");
                }}
                className="mt-0.5 size-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-app-text">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-xs" />
                  <span>Aceptada</span>
                </div>
                <p className="text-[11px] text-app-muted leading-tight">
                  Se valida la garantía y reingresa el calzado al inventario.
                </p>
              </div>
            </label>

            {/* Opción Rechazada */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${selectedStatus === "Rechazada"
                ? "border-rose-500 bg-rose-500/10 dark:border-rose-400 dark:bg-rose-500/15 shadow-2xs ring-1 ring-rose-500/30"
                : "border-app-border bg-app-surface hover:border-rose-500/40 hover:bg-app-surface-alt/60"
                }`}
            >
              <input
                type="radio"
                name="resolutionStatus"
                value="Rechazada"
                checked={selectedStatus === "Rechazada"}
                onChange={() => setSelectedStatus("Rechazada")}
                className="mt-0.5 size-4 text-rose-600 focus:ring-rose-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-app-text">
                  <FontAwesomeIcon icon={faBan} className="text-rose-500 text-xs" />
                  <span>Rechazada</span>
                </div>
                <p className="text-[11px] text-app-muted leading-tight">
                  No aplica garantía ni cambio. Requiere motivo de rechazo.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Textarea Condicional: Motivo del Rechazo */}
        {selectedStatus === "Rechazada" && (
          <div className="space-y-1.5 animate-fadeIn pt-1">
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCommentDots} className="text-rose-500 text-xs" />
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Motivo del Rechazo *
              </label>
            </div>
            <Textarea
              id="rejectReason"
              placeholder="Explica detalladamente por qué se rechaza la solicitud de devolución (ej. daño por mal uso, plazo vencido, producto no adquirido en la tienda)..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (error) setError("");
              }}
              error={error}
              rows={3}
              maxLength={255}
            />
          </div>
        )}

        {/* Aviso de Advertencia */}
        <div className="p-3 rounded-xl bg-app-surface-alt border border-app-border/80 flex items-start gap-2.5 text-xs text-app-muted">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500 mt-0.5 shrink-0" />
          <span>
            Esta acción actualizará la fecha de resolución del caso con la hora actual del sistema.
          </span>
        </div>
      </form>
    </Modal>
  );
}

export default ReturnStatusModal;
