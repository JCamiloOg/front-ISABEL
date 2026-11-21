import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faPlus,
  faArrowRotateRight,
  faCircleCheck,
  faClock,
  faBan,
  faEye,
  faReceipt,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SaleReturnWithRelations } from "../../../../@types";
import { getAllReturns, getReturnByID, resolveReturn } from "./services/salesReturnsServices";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { ReturnDetailModal } from "./components/ReturnDetailModal";
import ReturnFormModal from "./components/ReturnFormModal";
import ReturnStatusModal, { type ReturnResolutionStatus } from "./components/ReturnStatusModal";

type ReturnListItem = Omit<
  SaleReturnWithRelations,
  "user" | "rejectionReason" | "resolutionDate" | "saleId" | "userId" | "variantId"
>;

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para el modal de detalle por ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedReturn, setSelectedReturn] = useState<SaleReturnWithRelations | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Estado para el modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Estado para el modal de cambio de estado
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [statusTargetReturn, setStatusTargetReturn] = useState<ReturnListItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("requestDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const fetchReturns = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllReturns();

      if (response.status === 200) {
        setReturns(response.data.saleReturns || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las devoluciones.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReturnByID = useCallback(async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailModalOpen(true);
      const response = await getReturnByID(id);

      if (response.status === 200) {
        setSelectedReturn(response.data.saleReturns || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los detalles de la devolución.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleOpenStatusModal = (item: ReturnListItem) => {
    setStatusTargetReturn(item);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (
    returnId: string,
    newStatus: ReturnResolutionStatus,
    rejectReason?: string
  ) => {
    try {
      setIsUpdatingStatus(true);
      const res = await resolveReturn(
        {
          status: newStatus,
          rejectionReason: rejectReason,
        },
        returnId
      );

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: `Devolución ${newStatus.toLowerCase()} exitosamente`,
        });
        setIsStatusModalOpen(false);
        setStatusTargetReturn(null);
        fetchReturns();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al actualizar el estado.",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Error inesperado al cambiar de estado.",
        });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchReturns();
  }, [fetchReturns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };


  // Cálculo de Métricas en vivo (siguiendo estilo Purchases)
  const metrics = useMemo(() => {
    const total = returns.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    returns.forEach((r) => {
      const st = r.status;
      if (st === "Pendiente") pending++;
      else if (st === "Aprobada") approved++;
      else if (st === "Rechazada") rejected++;
    });

    return { total, pending, approved, rejected };
  }, [returns]);

  // Filtrado y Búsqueda
  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      // Filtro de estado
      const normStatus = item.status;
      if (statusFilter !== "all" && normStatus !== statusFilter) {
        return false;
      }

      // Filtro de búsqueda
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const idMatch = item.id.toLowerCase().includes(q);
      const reasonMatch = item.reason ? item.reason.toLowerCase().includes(q) : false;
      const productNameMatch = item.variant?.productColor?.product?.name
        ?.toLowerCase()
        .includes(q);
      const skuMatch = item.variant?.productColor?.product?.sku?.toLowerCase().includes(q);
      const colorMatch = item.variant?.productColor?.color?.name?.toLowerCase().includes(q);
      const sizeMatch = item.variant?.size?.size?.toString().toLowerCase().includes(q);
      const saleIdMatch = item.sale?.id ? item.sale.id.toLowerCase().includes(q) : false;

      return (
        idMatch ||
        reasonMatch ||
        productNameMatch ||
        skuMatch ||
        colorMatch ||
        sizeMatch ||
        saleIdMatch
      );
    });
  }, [returns, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all");

  const sortedReturns = useMemo(() => {
    if (!sortKey || !sortDir) return filteredReturns;

    return [...filteredReturns].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        cmp = (a.id || "").localeCompare(b.id || "");
      } else if (sortKey === "requestDate") {
        const dateA = a.requestDate ? new Date(a.requestDate).getTime() : 0;
        const dateB = b.requestDate ? new Date(b.requestDate).getTime() : 0;
        cmp = dateA - dateB;
      } else if (sortKey === "quantity") {
        const qtyA = Number(a.quantity) || 0;
        const qtyB = Number(b.quantity) || 0;
        cmp = qtyA - qtyB;
      } else if (sortKey === "status") {
        const statusA = a.status || "";
        const statusB = b.status || "";
        cmp = statusA.localeCompare(statusB);
      } else if (sortKey === "product") {
        const productA = a.variant?.productColor?.product?.name || "";
        const productB = b.variant?.productColor?.product?.name || "";
        cmp = productA.localeCompare(productB);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredReturns, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.ceil(sortedReturns.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedReturns = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedReturns.slice(start, start + itemsPerPage);
  }, [sortedReturns, activePage, itemsPerPage]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRotateLeft} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Devoluciones
              </h1>
              <p className="text-sm text-app-muted">
                Registro, revisión y resolución de garantías y cambios de producto
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={() => fetchReturns()}
            disabled={isLoading}
          >
            Refrescar
          </Button>
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nueva Devolución
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Métricas (Estilo idéntico a Compras) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Devoluciones */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Solicitudes</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">solicitudes</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Registros totales de garantías y cambios
          </p>
        </div>

        {/* Aprobadas */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Devoluciones Aprobadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.approved}
            </span>
            <span className="text-xs text-app-muted">aprobadas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Garantías procesadas y validadas
          </p>
        </div>

        {/* Pendientes / En Revisión */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">En Revisión</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.pending}
            </span>
            <span className="text-xs text-app-muted">pendientes</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Requieren revisión y respuesta
          </p>
        </div>

        {/* Rechazadas */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Devoluciones Rechazadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.rejected}
            </span>
            <span className="text-xs text-app-muted">rechazadas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Desestimadas con motivo registrado
          </p>
        </div>
      </div>

      {/* ─── Tabla Principal con formato compuesto Table (idéntico a Purchases) ─── */}
      <Table>
        <Table.Header
          title="Solicitudes de Devolución Registradas"
          description="Listado cronológico de devoluciones con trazabilidad a venta, producto y control de estados"
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-devolucion-estado-header"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "Aprobada", label: "Aprobadas" },
                  { value: "Pendiente", label: "En Revisión" },
                  { value: "Rechazada", label: "Rechazadas" },
                ]}
                size="sm"
              />
            </div>
          }
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por ID, venta, producto, motivo..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredReturns.length} de {returns.length} devoluciones encontradas
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faArrowRotateRight}
              onClick={handleResetFilters}
            >
              Restablecer filtros
            </Button>
          </div>
        )}

        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <Table.SortableCell
                sortKey="id"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-36"
              >
                Código / ID
              </Table.SortableCell>

              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Venta Asociada
              </th>

              <Table.SortableCell
                sortKey="product"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Producto / Variante
              </Table.SortableCell>

              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Motivo
              </th>

              <Table.SortableCell
                sortKey="requestDate"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Fecha Solicitud
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="status"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-36"
              >
                Estado
              </Table.SortableCell>

              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-28">
                Acciones
              </th>
            </Table.Row>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, rIdx) => (
                <Table.Row key={`loading-${rIdx}`}>
                  <Table.Cell rounded="left" colSpan={9} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedReturns.length === 0 ? (
              <Table.Empty
                colSpan={9}
                message={
                  hasActiveFilters
                    ? "No se encontraron devoluciones con los filtros seleccionados."
                    : "No hay devoluciones registradas en el sistema actualmente."
                }
              />
            ) : (
              paginatedReturns.map((row) => {
                const normStatus = row.status;
                const reqDate = row.requestDate ? new Date(row.requestDate) : null;
                const variant = row.variant;
                const product = variant?.productColor?.product;
                const productColor = variant?.productColor;
                const imageUrl = productColor?.colorImages?.[0]?.image;

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => fetchReturnByID(row.id)}
                  >
                    {/* Código / ID */}
                    <Table.Cell rounded="left">
                      <div className="flex flex-col">
                        <span
                          className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky hover:underline"
                          title={row.id}
                        >
                          #{row.id.slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-app-muted truncate max-w-28" title={row.id}>
                          {row.id}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Venta Asociada */}
                    <Table.Cell>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono font-bold text-xs text-app-text truncate">
                            {row.sale?.id ? `#${row.sale.id.slice(0, 8)}` : "Sin venta asociada"}
                          </span>
                          <span className="text-[10px] text-app-muted">
                            {row.sale?.saleDate
                              ? new Date(row.sale.saleDate).toLocaleDateString("es-CO", {
                                month: "short",
                                day: "numeric",
                              })
                              : "Venta directa"}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Producto / Variante */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-44">
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-app-border bg-app-surface-alt flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product?.name || "Producto"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faRotateLeft} className="text-xs text-app-muted" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-xs text-app-text truncate max-w-50"
                            title={product?.name || "Producto no asignado"}
                          >
                            {product?.name || "Producto no asignado"}
                          </span>
                          <span className="text-[10px] text-app-muted truncate max-w-50">
                            {productColor?.color?.name || "Color estándar"}
                            {product?.sku ? ` • ${variant?.size?.sizeNumber}` : ""}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Motivo */}
                    <Table.Cell>
                      <span
                        className="text-xs text-app-muted truncate block max-w-45"
                        title={row.reason || "Sin motivo registrado"}
                      >
                        {row.reason || "Sin motivo"}
                      </span>
                    </Table.Cell>

                    {/* Fecha Solicitud */}
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 text-xs text-app-text">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-app-muted text-[10px]" />
                        <span>
                          {reqDate && !isNaN(reqDate.getTime())
                            ? reqDate.toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "Sin fecha"}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Estado con botón interactivo idéntico a Compras para abrir el modal */}
                    <Table.Cell className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStatusModal(row);
                        }}
                        disabled={normStatus !== "Pendiente"}
                        title="Haz clic para cambiar el estado"
                        className="group inline-flex items-center gap-1.5 rounded-full outline-none transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {normStatus === "Aprobada" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs" />
                            Aprobada
                          </span>
                        )}
                        {normStatus === "Rechazada" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-rose-500 shadow-xs" />
                            Rechazada
                          </span>
                        )}
                        {normStatus === "Pendiente" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
                            En Revisión
                          </span>
                        )}
                      </button>
                    </Table.Cell>

                    {/* Acciones */}
                    <Table.Cell rounded="right" className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faEye}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchReturnByID(row.id);
                          }}
                          title="Ver Detalle"
                          className="hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15"
                        />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredReturns.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle Completo de la Devolución */}
      <ReturnDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReturn(null);
        }}
        saleReturn={selectedReturn}
        isLoading={isLoadingDetail}
      />

      {/* Modal de Creación de Devolución */}
      <ReturnFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchReturns()}
      />

      {/* Modal de Cambio de Estado / Resolución */}
      <ReturnStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTargetReturn(null);
        }}
        saleReturn={statusTargetReturn}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
