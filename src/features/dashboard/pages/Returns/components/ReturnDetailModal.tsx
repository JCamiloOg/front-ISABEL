import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faReceipt,
  faUser,
  faCalendarDay,
  faTag,
  faBan,
  faCircleCheck,
  faClock,
  faCommentDots,
  faShirt,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { SaleReturnWithRelations } from "../../../../../@types";

interface ReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleReturn: SaleReturnWithRelations | null;
  isLoading: boolean;
}

export function ReturnDetailModal({
  isOpen,
  onClose,
  saleReturn,
  isLoading,
}: ReturnDetailModalProps) {
  if (!isOpen) return null;

  // Normalizador de estados
  const normalizeStatus = (status?: string | null): "Aprobada" | "Pendiente" | "Rechazada" => {
    if (!status) return "Pendiente";
    const s = status.trim().toLowerCase();
    if (s.includes("aprob") || s.includes("acept") || s.includes("complet") || s === "approved") {
      return "Aprobada";
    }
    if (s.includes("rechaz") || s.includes("anul") || s.includes("cancel") || s === "rejected") {
      return "Rechazada";
    }
    return "Pendiente";
  };

  const status = normalizeStatus(saleReturn?.status);

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "No registrada";
    try {
      return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    } catch {
      return String(date);
    }
  };

  const variant = saleReturn?.variant;
  const product = variant?.productColor?.product;
  const productColor = variant?.productColor;
  const imageUrl = productColor?.colorImages?.[0]?.image;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        saleReturn ? `Devolución #${saleReturn.id.slice(0, 8)}` : "Detalle de Devolución"
      }
      description="Consulta detallada de la solicitud de devolución, estado, cliente y producto asociado"
      icon={faRotateLeft}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="size-10 rounded-full border-3 border-brand-royal/20 border-t-brand-royal animate-spin" />
          <p className="text-sm font-semibold text-app-muted">Cargando detalles de la devolución...</p>
        </div>
      ) : !saleReturn ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-3 border border-rose-200">
            <FontAwesomeIcon icon={faBan} className="text-lg" />
          </div>
          <p className="text-sm font-bold text-app-text">No se pudo cargar la información</p>
          <p className="mt-1 text-xs text-app-muted">
            Intenta nuevamente o contacta al administrador del sistema.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fila superior: Estado + UUID */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-app-surface-alt/70 border border-app-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-app-muted">Estado del Caso:</span>
              {status === "Aprobada" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  Aprobada / Procesada
                </span>
              )}
              {status === "Pendiente" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                  En Revisión / Pendiente
                </span>
              )}
              {status === "Rechazada" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                  Rechazada
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-app-muted">
                UUID: <strong className="font-mono text-app-text">{saleReturn.id}</strong>
              </span>
            </div>
          </div>

          {/* Tarjeta de Registro de la Devolución */}
          <div className="p-3.5 rounded-2xl border border-app-border bg-app-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                <FontAwesomeIcon icon={faUserTie} className="text-sm" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-app-muted">
                  Solicitud Registrada Por
                </p>
                <p className="text-sm font-extrabold text-app-text">
                  {saleReturn.user
                    ? `${saleReturn.user.firstName} ${saleReturn.user.lastName || ""}`.trim()
                    : "Usuario del sistema"}
                </p>
              </div>
            </div>

            {saleReturn.user?.identityDocument && (
              <div className="flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-mono text-app-muted border border-app-border">
                <span>Cédula:</span>
                <strong className="text-app-text">{saleReturn.user.identityDocument}</strong>
              </div>
            )}
          </div>

          {/* Bloque de Información: Venta/Cliente + Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta de Venta y Cliente */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                    <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Venta Asociada
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">Código Venta:</span>
                    <strong className="font-mono text-app-text">
                      #{saleReturn.sale?.id ? saleReturn.sale.id.slice(0, 8) : "N/A"}
                    </strong>
                  </div>
                  {saleReturn.sale?.saleDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-app-muted">Fecha de Venta:</span>
                      <span className="text-app-text font-medium">
                        {formatDate(saleReturn.sale.saleDate)}
                      </span>
                    </div>
                  )}
                  {saleReturn.sale?.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-app-muted">Estado de Venta:</span>
                      <span className="text-app-text font-semibold capitalize">
                        {saleReturn.sale.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Usuario solicitante o cliente */}
              <div className="mt-4 pt-3 border-t border-app-border/70 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <FontAwesomeIcon icon={faUserTie} className="text-app-muted" />
                  <span className="text-app-muted">Venta registrada por:</span>
                  <strong className="text-app-text font-medium">
                    {saleReturn.sale?.seller ? `${saleReturn.sale.seller.firstName} ${saleReturn.sale.seller.lastName || ""}`.trim() : "Usuario del sistema"}
                  </strong>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FontAwesomeIcon icon={faUser} className="text-app-muted" />
                  <span className="text-app-muted">Venta realizada por:</span>
                  <strong className="text-app-text font-medium">
                    {saleReturn.sale?.customer ? `${saleReturn.sale.customer.firstName} ${saleReturn.sale.customer.lastName || ""}`.trim() : "Usuario del sistema"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Tarjeta Fechas y Tiempos */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FontAwesomeIcon icon={faCalendarDay} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Cronología del Caso
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-app-muted block">Fecha de Solicitud:</span>
                    <strong className="text-app-text font-semibold">
                      {formatDate(saleReturn.requestDate)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-app-muted block">Fecha de Resolución:</span>
                    <strong className="text-app-text font-semibold">
                      {saleReturn.resolutionDate ? formatDate(saleReturn.resolutionDate) : "En proceso / Sin resolución"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-app-border/70 flex items-center justify-between text-xs">
                <span className="text-app-muted">Cantidad Solicitada:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-royal/10 px-2.5 py-0.5 font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                  {saleReturn.quantity} {saleReturn.quantity === 1 ? "unidad" : "unidades"}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque Motivo y Resolución */}
          <div className="p-4 rounded-2xl border border-app-border bg-app-surface space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FontAwesomeIcon icon={faCommentDots} className="text-xs" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                Motivo de la Solicitud
              </h4>
            </div>
            <p className="text-sm text-app-text bg-app-surface-alt/60 p-3.5 rounded-xl border border-app-border leading-relaxed">
              {saleReturn.reason || "Sin motivo especificado"}
            </p>

            {saleReturn.rejectionReason && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <FontAwesomeIcon icon={faBan} className="text-rose-500 text-xs" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Motivo del Rechazo
                  </span>
                </div>
                <p className="text-sm text-rose-900 dark:text-rose-200 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 leading-relaxed">
                  {saleReturn.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Bloque Producto y Variante */}
          <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
            <div className="p-4 border-b border-app-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <FontAwesomeIcon icon={faShirt} className="text-xs" />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                  Producto / Variante Retornada
                </h4>
              </div>
              <span className="text-xs font-medium text-app-muted">
                SKU: #{product?.sku}
              </span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-app-border bg-app-surface-alt flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product?.name || "Producto"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faShirt} className="text-xl text-app-muted" />
                )}
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="text-base font-extrabold text-app-text">
                  {product?.name || "Producto no encontrado"}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-app-muted">
                  {productColor?.color?.name && (
                    <span className="inline-flex items-center gap-1">
                      <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                      Color: <strong className="text-app-text">{productColor.color.name}</strong>
                    </span>
                  )}
                  {variant?.size?.sizeNumber && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-app-surface-alt px-2 py-0.5 border border-app-border font-bold text-app-text">
                      Talla: {variant.size.sizeNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-app-border sm:pl-6">
                <span className="text-xs text-app-muted block">Unidades</span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky">
                  {saleReturn.quantity}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
