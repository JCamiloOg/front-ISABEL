import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faArrowLeft,
  faArrowRotateRight,
  faUser,
  faUserTie,
  faShirt,
  faSliders,
  faCalendarDay,
  faBoxesStacked,
  faMagnifyingGlass,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import {
  getReturnByID,
  resolveReturn,
  REASONS_RETURN_LABELS,
  TYPE_RESOLUTION_LABELS,
  type ApproveSaleReturnBody,
  type SaleReturnByIDPayload,
  type SaleReturnDetailItem,
} from "./services/salesReturnsServices";
import ReturnStatusModal from "./components/ReturnStatusModal";

export default function SaleReturnDetailPage() {
  const { idSale } = useParams({ strict: false }) as { idSale?: string };
  const navigate = useNavigate();

  const [saleData, setSaleData] = useState<SaleReturnByIDPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal para resolver devolución individual (Aprobada / Rechazada)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetReturn, setStatusTargetReturn] = useState<SaleReturnDetailItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchDetail = useCallback(async () => {
    if (!idSale) return;
    try {
      setIsLoading(true);
      const response = await getReturnByID(idSale);
      if (response.status === 200) {
        setSaleData(response.data.saleReturns || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al cargar la venta y devoluciones.",
          text: "Verifica el identificador de venta e intenta de nuevo.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [idSale]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchDetail();
  }, [fetchDetail]);

  const handleApproveReturn = async (
    returnId: string,
    payload: ApproveSaleReturnBody
  ) => {
    try {
      setIsUpdatingStatus(true);
      const res = await resolveReturn(payload, returnId);
      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data?.message || "Devolución aprobada y liquidada exitosamente.",
        });
        setIsStatusModalOpen(false);
        setStatusTargetReturn(null);
        fetchDetail();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al procesar la devolución.",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Error inesperado al resolver la devolución.",
        });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const normalizeStatus = (
    status?: string | null
  ): "Aprobada" | "Pendiente" | "Rechazada" => {
    if (!status) return "Pendiente";
    const s = status.trim().toLowerCase();
    if (s.includes("aprob") || s.includes("acept") || s.includes("complet") || s === "approved") {
      return "Aprobada";
    }
    if (s.includes("rechaz") || s.includes("anul") || s === "rejected") {
      return "Rechazada";
    }
    return "Pendiente";
  };

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

  const allReturns = useMemo(() => saleData?.saleReturns || [], [saleData]);

  // Métricas de la venta
  const metrics = useMemo(() => {
    let aprobadas = 0;
    let pendientes = 0;
    let rechazadas = 0;
    let totalItemsReturned = 0;

    allReturns.forEach((r) => {
      const st = normalizeStatus(r.status);
      if (st === "Aprobada") aprobadas++;
      else if (st === "Pendiente") pendientes++;
      else if (st === "Rechazada") rechazadas++;
      totalItemsReturned += Number(r.quantity) || 0;
    });

    return {
      total: allReturns.length,
      aprobadas,
      pendientes,
      rechazadas,
      totalItemsReturned,
    };
  }, [allReturns]);

  // Filtrado y búsqueda
  const filteredReturns = useMemo(() => {
    return allReturns.filter((item) => {
      const normStatus = normalizeStatus(item.status);
      if (statusFilter !== "all" && normStatus !== statusFilter) {
        return false;
      }

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();

      const idMatch = item.id.toLowerCase().includes(q);
      const reasonLabel = (REASONS_RETURN_LABELS[item.reason] || item.reason).toLowerCase();
      const resolutionLabel = (TYPE_RESOLUTION_LABELS[item.typeResolution] || item.typeResolution).toLowerCase();
      const detailsMatch = item.details?.toLowerCase().includes(q) || false;
      const prodName = item.variant?.productColor?.product?.name?.toLowerCase() || "";
      const prodSku = item.variant?.productColor?.product?.sku?.toLowerCase() || "";
      const userDoc = item.user?.identityDocument?.toLowerCase() || "";
      const userName = `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.toLowerCase();

      return (
        idMatch ||
        reasonLabel.includes(q) ||
        resolutionLabel.includes(q) ||
        detailsMatch ||
        prodName.includes(q) ||
        prodSku.includes(q) ||
        userDoc.includes(q) ||
        userName.includes(q)
      );
    });
  }, [allReturns, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all");

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const customerName = saleData?.customer
    ? `${saleData.customer.firstName} ${saleData.customer.lastName || ""}`.trim()
    : "Cliente General";
  const sellerName = saleData?.seller
    ? `${saleData.seller.firstName} ${saleData.seller.lastName || ""}`.trim()
    : "Vendedor no especificado";

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* ─── Encabezado y Navegación de Regreso ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-start sm:items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            icon={faArrowLeft}
            onClick={() => navigate({ to: "/dashboard/returns" })}
            className="size-10 p-0 rounded-xl hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15 text-app-muted hover:text-brand-royal dark:hover:text-brand-sky shrink-0"
            title="Volver al listado general"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-royal text-white shadow-sm">
                <FontAwesomeIcon icon={faRotateLeft} className="text-sm" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-app-text">
                Devoluciones de Venta #{idSale?.slice(0, 8) || "..."}
              </h1>
              {idSale && (
                <span className="font-mono text-xs text-app-muted bg-app-surface-alt px-2.5 py-1 rounded-lg border border-app-border">
                  UUID: {idSale}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-app-muted">
              Gestión visual de cada artículo devuelto, motivo, resolución y dictamen de garantías.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={faArrowRotateRight}
            onClick={fetchDetail}
            disabled={isLoading}
            className="h-10 px-3 hover:border-brand-royal/40"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Resumen de Venta / Cliente ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta Cliente */}
        <div className="p-5 rounded-2xl border border-app-border bg-app-surface shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-app-border/70 mb-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-sm">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-app-muted">
                Información del Cliente
              </p>
              <h3 className="text-sm font-extrabold text-app-text">{customerName}</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-app-muted">Documento / Cédula:</span>
              <span className="font-mono font-semibold text-app-text">
                {saleData?.customer?.identityDocument || "Sin documento"}
              </span>
            </div>
            {saleData?.customer?.email && (
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Correo electrónico:</span>
                <span className="text-app-text font-medium">{saleData.customer.email}</span>
              </div>
            )}
            {saleData?.customer?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Teléfono de contacto:</span>
                <span className="text-app-text font-medium">{saleData.customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta Vendedor & Resumen */}
        <div className="p-5 rounded-2xl border border-app-border bg-app-surface shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-app-border/70 mb-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-sm">
              <FontAwesomeIcon icon={faUserTie} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-app-muted">
                Venta y Trazabilidad
              </p>
              <h3 className="text-sm font-extrabold text-app-text">{sellerName}</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-app-muted">Documento Vendedor:</span>
              <span className="font-mono font-semibold text-app-text">
                {saleData?.seller?.identityDocument || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-muted">Artículos Devueltos:</span>
              <span className="inline-flex items-center gap-1 font-bold text-brand-royal dark:text-brand-sky">
                {metrics.totalItemsReturned} unidades en reclamo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-app-muted">Estado de Solicitudes:</span>
              <span className="font-semibold text-app-text">
                {metrics.pendientes > 0
                  ? `${metrics.pendientes} pendientes de resolución`
                  : "Todas las solicitudes han sido resueltas"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sección de Tarjetas de Artículos Devueltos ─── */}
      <div className="space-y-4">
        {/* Barra de Filtro y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-app-border bg-app-surface shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
              <FontAwesomeIcon icon={faBoxesStacked} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-app-text">
                Artículos en Devolución ({filteredReturns.length})
              </h2>
              <p className="text-[11px] text-app-muted">
                Tarjetas detalladas de cada solicitud con opciones de resolución inmediata
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Buscar por producto, motivo o detalles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-xs" />}
                size="sm"
              />
            </div>
            <div className="w-44">
              <Select
                id="filter-status-cards"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "Pendiente", label: "Pendientes" },
                  { value: "Aprobada", label: "Aprobadas" },
                  { value: "Rechazada", label: "Rechazadas" },
                ]}
                size="sm"
              />
            </div>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                icon={faArrowRotateRight}
                onClick={handleResetFilters}
                title="Restablecer filtros"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Listado de Tarjetas */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="p-6 rounded-2xl border border-app-border bg-app-surface animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="size-16 rounded-xl bg-app-border/70 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-app-border/70 rounded w-3/4" />
                    <div className="h-3 bg-app-border/60 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-app-surface-alt rounded-xl" />
                <div className="h-9 bg-app-border/70 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-surface p-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky mb-3">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-lg" />
            </div>
            <h4 className="text-sm font-bold text-app-text">
              {hasActiveFilters
                ? "No se encontraron devoluciones con los filtros aplicados"
                : "No hay solicitudes de devolución registradas para esta venta"}
            </h4>
            <p className="mt-1 text-xs text-app-muted max-w-sm mx-auto">
              {hasActiveFilters
                ? "Prueba cambiando el término de búsqueda o seleccionando otro estado."
                : "Cuando se registren garantías o cambios sobre esta venta, se listarán en este espacio."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReturns.map((item) => {
              const normStatus = normalizeStatus(item.status);
              const variant = item.variant;
              const productColor = variant?.productColor;
              const product = productColor?.product;
              const color = productColor?.color;
              const size = variant?.size;

              const reasonLabel = REASONS_RETURN_LABELS[item.reason] || item.reason;
              const resolutionLabel = TYPE_RESOLUTION_LABELS[item.typeResolution] || item.typeResolution;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-royal/40 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-4">
                    {/* Header de la Tarjeta: ID + Estado + Cantidad */}
                    <div className="flex items-start justify-between gap-2 border-b border-app-border/60 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                          Devolución #{item.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-app-muted">
                          <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
                          <span>{formatDate(item.requestDate)}</span>
                        </div>
                      </div>

                      {/* Badge de Estado (solo interactivo si está Pendiente) */}
                      {normStatus === "Pendiente" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusTargetReturn(item);
                            setIsStatusModalOpen(true);
                          }}
                          title="Haz clic para resolver el estado"
                          className="group inline-flex items-center gap-1.5 rounded-full outline-none transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:bg-amber-500/20">
                            <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
                            Pendiente
                          </span>
                        </button>
                      ) : normStatus === "Aprobada" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs" />
                          Aprobada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <span className="size-1.5 rounded-full bg-rose-500 shadow-xs" />
                          Rechazada
                        </span>
                      )}
                    </div>

                    {/* Información del Producto */}
                    <div className="flex items-start gap-3.5">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-16 rounded-xl object-cover border border-app-border shrink-0 bg-app-surface-alt shadow-2xs"
                        />
                      ) : (
                        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-lg">
                          <FontAwesomeIcon icon={faShirt} />
                        </span>
                      )}

                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-app-text truncate" title={product?.name}>
                          {product?.name || `Variante #${item.variantId}`}
                        </h4>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          {product?.sku && (
                            <span className="font-mono text-app-muted text-[11px] bg-app-surface-alt px-1.5 py-0.5 rounded border border-app-border/80">
                              SKU: {product.sku}
                            </span>
                          )}

                          {color && (
                            <span className="inline-flex items-center gap-1.5 text-app-text font-medium text-[11px]">
                              {color.hex && (
                                <span
                                  className="size-2.5 rounded-full border border-black/15 shrink-0"
                                  style={{ backgroundColor: color.hex }}
                                />
                              )}
                              {color.name}
                            </span>
                          )}

                          {size && (
                            <span className="font-mono font-bold text-app-text text-[11px] bg-app-surface-alt px-1.5 py-0.5 rounded border border-app-border/80">
                              Talla {size.sizeNumber}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center justify-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-xs font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                            {item.quantity} {item.quantity === 1 ? "unidad a devolver" : "unidades a devolver"}
                          </span>
                          {item.refundAmount !== undefined && (
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              Saldo a favor: {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(item.refundAmount) || 0)}
                            </span>
                          )}
                          {item.returnToStock !== undefined && (
                            <span className="inline-flex items-center justify-center rounded-full bg-app-surface-alt px-2.5 py-0.5 text-[11px] font-medium text-app-muted border border-app-border">
                              {item.returnToStock ? "Reingresa a stock" : "Merma / Dañado"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bloque Motivo & Resolución */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80 mb-0.5">
                          Motivo Declarado
                        </span>
                        <span className="font-semibold">{reasonLabel}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700/80 dark:text-blue-400/80 mb-0.5">
                          Resolución Solicitada
                        </span>
                        <span className="font-semibold">{resolutionLabel}</span>
                      </div>
                    </div>

                    {/* Detalles adicionales ingresados por el cliente o vendedor */}
                    {item.details && (
                      <div className="p-3 rounded-xl bg-app-surface-alt/70 border border-app-border/80 text-xs text-app-text">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-app-muted uppercase tracking-wider mb-1">
                          <FontAwesomeIcon icon={faQuoteLeft} className="text-[10px]" />
                          <span>Detalles y Especificaciones</span>
                        </div>
                        <p className="text-app-text leading-relaxed">{item.details}</p>
                      </div>
                    )}

                    {/* Motivo de Rechazo en caso de no ser aceptada */}
                    {normStatus === "Rechazada" && item.rejectionReason && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-800 dark:text-rose-300">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-0.5">
                          Justificación del Rechazo
                        </span>
                        <p className="italic">{item.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer de la tarjeta con acción de cambio de estado */}
                  <div className="pt-3 border-t border-app-border/70 flex items-center justify-between">
                    <div className="text-[11px] text-app-muted">
                      {item.user && (
                        <span>Registrado por: <strong className="text-app-text">{item.user.firstName}</strong></span>
                      )}
                    </div>

                    {normStatus === "Pendiente" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={faSliders}
                        onClick={() => {
                          setStatusTargetReturn(item);
                          setIsStatusModalOpen(true);
                        }}
                        className="hover:border-brand-royal text-brand-royal dark:text-brand-sky hover:bg-brand-royal/10"
                      >
                        Resolver Devolución
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-app-muted">
                        {item.resolutionDate
                          ? `Resuelta el ${formatDate(item.resolutionDate)}`
                          : "Solicitud procesada"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Cambio / Resolución de Estado */}
      <ReturnStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTargetReturn(null);
        }}
        saleReturn={statusTargetReturn}
        onApproveReturn={handleApproveReturn}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
