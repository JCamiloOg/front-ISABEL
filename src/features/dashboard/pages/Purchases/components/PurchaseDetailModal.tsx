import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faBuilding,
  faCashRegister,
  faCalendarDay,
  faBoxesStacked,
  faReceipt,
  faTag,
  faCircleCheck,
  faClock,
  faBan,
  faPhone,
  faEnvelope,
  faLocationDot,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { PurchaseWithRelations } from "../../../../../@types";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseWithRelations | null;
  isLoading: boolean;
}

export function PurchaseDetailModal({
  isOpen,
  onClose,
  purchase,
  isLoading,
}: PurchaseDetailModalProps) {
  // Normalizador de estados
  const normalizeStatus = (status?: string | null): "Completada" | "Pendiente" | "Cancelada" => {
    if (!status) return "Pendiente";
    const s = status.trim().toLowerCase();
    if (s.includes("completad") || s.includes("recibid") || s.includes("entregad") || s === "completed") {
      return "Completada";
    }
    if (s.includes("cancelad") || s.includes("anulad") || s === "cancelled") {
      return "Cancelada";
    }
    return "Pendiente";
  };

  const status = normalizeStatus(purchase?.status);

  // Cálculos de totales y cantidades
  const details = purchase?.purchaseDetails || [];
  const totalItems = details.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const subtotal = details.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
    0
  );
  const vatPercentage = Number(purchase?.vat) || 0;
  const vatAmount = subtotal * (vatPercentage / 100);
  const grandTotal = subtotal + vatAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        purchase ? `Orden de Compra #${purchase.id.slice(0, 8)}` : "Detalle de Compra"
      }
      description="Consulta detallada de la compra, proveedor, afectación a caja y desglose de artículos"
      icon={faReceipt}
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
          <p className="text-sm font-semibold text-app-muted">Cargando detalles de la compra...</p>
        </div>
      ) : !purchase ? (
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
          {/* Fila superior: Estado + Tarjetas de Resumen Rápido */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-app-surface-alt/70 border border-app-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-app-muted">Estado de la Orden:</span>
              {status === "Completada" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  Completada / Recibida
                </span>
              )}
              {status === "Pendiente" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                  Pendiente de Entrega
                </span>
              )}
              {status === "Cancelada" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                  Cancelada / Anulada
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-app-muted">
                UUID: <strong className="font-mono text-app-text">{purchase.id}</strong>
              </span>
            </div>
          </div>

          {/* Bloque de Información: Proveedor + Datos de Orden/Caja */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta Proveedor */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                    <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Información del Proveedor
                  </h4>
                </div>

                <h3 className="text-base font-extrabold text-app-text">
                  {purchase.supplier?.businessName || "Proveedor no asignado"}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-app-muted">
                  <div className="flex items-center justify-between">
                    <span>Documento / NIT:</span>
                    <strong className="font-mono text-app-text">
                      {purchase.supplier?.document || "No registrado"}
                    </strong>
                  </div>

                  {purchase.supplier?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                        Teléfono:
                      </span>
                      <span className="text-app-text font-medium">{purchase.supplier.phone}</span>
                    </div>
                  )}

                  {purchase.supplier?.email && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                        Correo:
                      </span>
                      <span className="text-app-text font-medium truncate max-w-50" title={purchase.supplier.email}>
                        {purchase.supplier.email}
                      </span>
                    </div>
                  )}

                  {purchase.supplier?.address && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faLocationDot} className="text-[10px]" />
                        Dirección:
                      </span>
                      <span className="text-app-text font-medium">{purchase.supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta Caja y Fechas */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <FontAwesomeIcon icon={faCashRegister} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Caja y Registro
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-app-muted block">Cajas / Cuentas Afectadas:</span>
                    {(purchase).purchasePayments && (purchase).purchasePayments.length > 0 ? (
                      <div className="space-y-1.5">
                        {(purchase).purchasePayments.map((pay, idx: number) => (
                          <div
                            key={pay.id || idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-app-surface-alt/70 border border-app-border/70 text-xs"
                          >
                            <span className="font-semibold text-app-text">
                              {pay.cashRegister?.name || `Caja #${pay.cashRegisterId}`}
                            </span>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {formatCurrency(Number(pay.amount) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <strong className="text-app-text font-bold">
                        {purchase.cashRegister?.name || "Caja Principal"}
                      </strong>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-app-muted flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
                      Fecha de Orden:
                    </span>
                    <strong className="text-app-text font-medium">
                      {purchase.orderDate
                        ? new Date(purchase.orderDate).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "Sin fecha registrada"}
                    </strong>
                  </div>

                  {purchase.deliveryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-app-muted flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                        Fecha de Entrega:
                      </span>
                      <strong className="text-app-text font-medium">
                        {new Date(purchase.deliveryDate).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-app-muted flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                      Tasa de IVA Aplicada:
                    </span>
                    <span className="inline-block rounded-md border border-app-border bg-app-surface-alt px-2 py-0.5 text-xs font-bold text-app-text">
                      {vatPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Artículos Comprados (Detalles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-brand-royal dark:text-brand-sky text-sm" />
                <h4 className="text-sm font-bold text-app-text">
                  Artículos de la Compra ({details.length})
                </h4>
              </div>
              <span className="text-xs text-app-muted">
                Total Unidades: <strong className="text-app-text">{totalItems} pares/und</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-app-border bg-app-surface-alt/75 text-app-muted uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Producto / Variante</th>
                    <th className="py-3 px-4 text-center">Talla</th>
                    <th className="py-3 px-4 text-center">Cantidad</th>
                    <th className="py-3 px-4 text-right">Precio Unitario</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/70">
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-app-muted">
                        <FontAwesomeIcon icon={faCartShopping} className="text-xl mb-2 text-app-muted/50" />
                        <p>No se encontraron líneas de detalle para esta compra.</p>
                      </td>
                    </tr>
                  ) : (
                    details.map((item, idx) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unitPrice) || 0;
                      const lineTotal = qty * price;
                      const variant = item.variant;
                      const imageUrl =
                        variant?.productColor?.colorImages?.[0]?.image ||
                        variant?.productColor?.image ||
                        null;

                      return (
                        <tr key={item.id || idx} className="hover:bg-app-surface-alt/50 transition-colors">
                          <td className="py-3 px-4 text-app-muted font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail con imagen o placeholder estilizado */}
                              <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-app-border bg-app-surface-alt shadow-2xs group">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={variant?.productColor?.product?.name || "Calzado"}
                                    className="h-full w-full object-cover object-center transition-transform duration-200 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                      // Fallback suave en caso de url rota
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.parentElement?.classList.add("fallback-active");
                                    }}
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                                    <FontAwesomeIcon icon={faImage} className="text-sm opacity-60" />
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-app-text truncate max-w-56" title={variant?.productColor?.product?.name}>
                                  {variant?.productColor?.product?.name || "Calzado sin nombre"}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-app-muted mt-0.5">
                                  <span className="font-mono font-semibold text-brand-royal dark:text-brand-sky">
                                    SKU: {variant?.productColor?.product?.sku || item.variantId || "N/A"}
                                  </span>
                                  {variant?.productColor?.color?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        {variant.productColor.color.hex && (
                                          <span
                                            className="size-2 rounded-full border border-black/10 inline-block shrink-0"
                                            style={{ backgroundColor: variant.productColor.color.hex }}
                                          />
                                        )}
                                        {variant.productColor.color.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block rounded-md border border-app-border bg-app-surface-alt px-2 py-0.5 text-[11px] font-bold text-app-text">
                              {variant?.size?.sizeNumber || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-app-text">
                            {qty}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-app-text">
                            {formatCurrency(price)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-brand-royal dark:text-brand-sky">
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen Financiero de la Orden */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-72 rounded-2xl border border-app-border bg-app-surface-alt/80 p-4 space-y-2">
                <div className="flex justify-between text-xs text-app-muted">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-app-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-app-muted">
                  <span>IVA ({vatPercentage}%):</span>
                  <span className="font-semibold text-app-text">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="border-t border-app-border pt-2 flex justify-between text-sm font-extrabold text-app-text">
                  <span>Total General:</span>
                  <span className="text-brand-royal dark:text-brand-sky font-black">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
