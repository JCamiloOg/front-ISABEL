import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faReceipt,
  faUser,
  faBan,
  faCircleCheck,
  faClock,
  faTruck,
  faBoxOpen,
  faImage,
  faTag,
  faRulerCombined,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { OrdersPayloadByID } from "../services/ordersServices";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrdersPayloadByID | null;
  isLoading: boolean;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  isLoading,
}: OrderDetailModalProps) {
  // Normalizador de estados de pedido
  const normalizeStatus = (status?: string | null): "Pendiente" | "En Preparación" | "Enviado" | "Entregado" | "Cancelado" => {
    if (!status) return "Pendiente";
    const s = status.trim().toLowerCase();
    if (s.includes("entregad") || s.includes("completad") || s === "completed" || s === "delivered") {
      return "Entregado";
    }
    if (s.includes("enviad") || s === "shipped") {
      return "Enviado";
    }
    if (s.includes("preparaci") || s === "preparing" || s === "in preparation") {
      return "En Preparación";
    }
    if (s.includes("cancelad") || s.includes("anulad") || s === "cancelled") {
      return "Cancelado";
    }
    return "Pendiente";
  };

  const status = normalizeStatus(order?.status);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const details = order?.saleDetails || [];
  const totalItems = details.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const subtotal = details.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
    0
  );
  const vatPercentage = Number(order?.vat) || 0;
  const vatAmount = subtotal * (vatPercentage / 100);
  const discountAmount = Number(order?.discount) || 0;
  const grandTotal = Math.max(0, subtotal + vatAmount - discountAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Pedido #${order.id.slice(0, 8)}` : "Detalle del Pedido"}
      description="Consulta detallada de la orden de venta online, cliente y artículos solicitados"
      icon={faBoxesStacked}
      size="2xl"
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
          <p className="text-sm font-semibold text-app-muted">Cargando detalles del pedido...</p>
        </div>
      ) : !order ? (
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
              <span className="text-xs font-semibold text-app-muted">Estado del Pedido:</span>
              {status === "Entregado" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  Entregado / Completado
                </span>
              )}
              {status === "Enviado" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <FontAwesomeIcon icon={faTruck} className="text-[11px]" />
                  Enviado / En camino
                </span>
              )}
              {status === "En Preparación" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-[11px]" />
                  En Preparación
                </span>
              )}
              {status === "Pendiente" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                  Pendiente
                </span>
              )}
              {status === "Cancelado" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                  Cancelado
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-app-muted">
                UUID: <strong className="font-mono text-app-text">{order.id}</strong>
              </span>
            </div>
          </div>

          {/* Bloque de Información: Cliente + Resumen Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta de Cliente */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Información del Cliente
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">Nombre:</span>
                    <strong className="text-app-text font-bold">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
                        : "Cliente General / No registrado"}
                    </strong>
                  </div>
                  {order.customer?.identityDocument && (
                    <div className="flex items-center justify-between">
                      <span className="text-app-muted">Documento / Cédula:</span>
                      <span className="font-mono text-app-text font-semibold">
                        {order.customer.identityDocument}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">Canal:</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-blue-700 dark:text-blue-400 font-semibold">
                      Tienda Virtual / Pedido Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-app-border/70 flex items-center justify-between text-xs">
                <span className="text-app-muted">Total de Artículos:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-royal/10 px-2.5 py-0.5 font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                  {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
                </span>
              </div>
            </div>

            {/* Tarjeta Fechas y Resumen Financiero */}
            <div className="p-4 rounded-2xl border border-app-border bg-app-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-app-border/70 mb-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Totales e Impuestos
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  {order.saleDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-app-muted">Fecha de Creación:</span>
                      <span className="text-app-text font-medium">
                        {formatDate(order.saleDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">Subtotal Artículos:</span>
                    <span className="text-app-text font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted">IVA ({vatPercentage}%):</span>
                    <span className="text-app-text font-medium">
                      {formatCurrency(vatAmount)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Descuento aplicado:</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-app-border/70 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
                  Total Pedido:
                </span>
                <span className="text-lg font-black text-brand-royal dark:text-brand-sky">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de Artículos Solicitados con Relaciones Completas */}
          <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden shadow-xs">
            <div className="p-4 border-b border-app-border/70 flex items-center justify-between bg-app-surface-alt/20">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                  <FontAwesomeIcon icon={faBoxesStacked} />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text">
                    Artículos del Pedido ({details.length})
                  </h4>
                  <p className="text-[11px] text-app-muted">
                    Productos, tallas, colores e importes calculados
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-app-border/70 text-app-muted uppercase font-bold text-[10px] tracking-wider bg-app-surface-alt/40">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4 min-w-64">Producto & Referencia</th>
                    <th className="py-2.5 px-4 text-center min-w-28">Color</th>
                    <th className="py-2.5 px-4 text-center min-w-24">Talla</th>
                    <th className="py-2.5 px-4 text-center w-24">Cantidad</th>
                    <th className="py-2.5 px-4 text-right min-w-32">Precio Unitario</th>
                    <th className="py-2.5 px-4 text-right min-w-36">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/60">
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-app-muted">
                        No hay líneas de detalle registradas para este pedido.
                      </td>
                    </tr>
                  ) : (
                    details.map((detail, idx) => {
                      const qty = Number(detail.quantity) || 0;
                      const price = Number(detail.unitPrice) || 0;
                      const itemSubtotal = qty * price;

                      const variant = detail.variant;
                      const productColor = variant?.productColor;
                      const product = productColor?.product;
                      const color = productColor?.color;
                      const size = variant?.size;

                      // Imagen de referencia
                      const refImage =
                        productColor?.image ||
                        (productColor?.colorImages && productColor.colorImages.length > 0
                          ? productColor.colorImages[0].image
                          : null);

                      return (
                        <tr key={detail.id || idx} className="hover:bg-app-surface-alt/30 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-app-muted">
                            {idx + 1}
                          </td>

                          {/* Imagen + Nombre de Producto */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {refImage ? (
                                <img
                                  src={refImage}
                                  alt={product?.name || "Producto"}
                                  className="size-11 rounded-xl object-cover border border-app-border shadow-2xs shrink-0 bg-app-surface-alt"
                                />
                              ) : (
                                <div className="size-11 rounded-xl border border-dashed border-app-border bg-app-surface-alt/60 flex items-center justify-center text-app-muted shrink-0">
                                  <FontAwesomeIcon icon={faImage} className="text-sm" />
                                </div>
                              )}

                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-app-text truncate">
                                  {product?.name || `Variante #${detail.variantId}`}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {product?.sku && (
                                    <span className="font-mono text-[10px] text-app-muted">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-royal dark:text-brand-sky">
                                    <FontAwesomeIcon icon={faTag} className="text-[9px]" />
                                    Var #{detail.variantId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Color */}
                          <td className="py-3.5 px-4 text-center">
                            {color ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-app-surface-alt border border-app-border/70 text-[11px] font-medium text-app-text">
                                {color.hex && (
                                  <span
                                    className="size-3 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                )}
                                <span>{color.name}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-app-muted flex items-center justify-center gap-1">
                                <FontAwesomeIcon icon={faPalette} className="text-[10px]" />
                                N/A
                              </span>
                            )}
                          </td>

                          {/* Talla */}
                          <td className="py-3.5 px-4 text-center">
                            {size ? (
                              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-app-text px-2 py-0.5 rounded-md bg-app-surface-alt border border-app-border">
                                <FontAwesomeIcon icon={faRulerCombined} className="text-[10px] text-app-muted" />
                                {size.sizeNumber}
                              </span>
                            ) : (
                              <span className="text-[11px] text-app-muted">N/A</span>
                            )}
                          </td>

                          {/* Cantidad */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-xs font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                              {qty}
                            </span>
                          </td>

                          {/* Precio Unitario */}
                          <td className="py-3.5 px-4 text-right font-medium text-app-text">
                            {formatCurrency(price)}
                          </td>

                          {/* Subtotal calculado (quantity * unitPrice) */}
                          <td className="py-3.5 px-4 text-right font-bold text-brand-royal dark:text-brand-sky">
                            {formatCurrency(itemSubtotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default OrderDetailModal;
