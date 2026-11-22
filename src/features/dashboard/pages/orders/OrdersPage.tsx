import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faArrowRotateRight,
  faClock,
  faBoxOpen,
  faTruck,
  faCircleCheck,
  faEye,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllOrders,
  getOrderByID,
  updateStatusOrder,
  type OrdersPayload,
  type OrdersPayloadByID,
} from "./services/ordersServices";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { OrderStatusModal, type OrderStatus } from "./components/OrderStatusModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrdersPayload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de Detalle por ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdersPayloadByID | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Modal de Cambio de Estado
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [statusTargetOrder, setStatusTargetOrder] = useState<OrdersPayload | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  // Formateador de moneda en pesos colombianos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para calcular el total de un pedido cuando incluye detalles o desde el modal
  const calculateOrderTotal = useCallback((order: OrdersPayload) => {
    if (!order.saleDetails || order.saleDetails.length === 0) return null;
    const subtotal = order.saleDetails.reduce(
      (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
      0
    );
    const vatPercentage = Number(order.vat) || 0;
    const vatAmount = subtotal * (vatPercentage / 100);
    return Math.max(0, subtotal + vatAmount);
  }, []);

  // ── Petición GET: Todos los Pedidos ──
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllOrders();

      if (response.status === 200) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los pedidos.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Petición GET: Pedido por ID ──
  const fetchOrderByID = useCallback(async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailModalOpen(true);
      const response = await getOrderByID(id);

      if (response.status === 200) {
        const orderData = response.data.orders || null;
        setSelectedOrder(orderData);

        // Si el pedido vino con sus saleDetails, enriquecemos el registro en la lista local
        if (orderData && orderData.saleDetails) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderData.id ? { ...o, saleDetails: orderData.saleDetails } : o
            )
          );
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del pedido.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // ── Petición PATCH: Actualizar Estado del Pedido ──
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await updateStatusOrder(orderId, newStatus);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data?.message || `Estado actualizado a "${newStatus}"`,
        });
        setIsStatusModalOpen(false);
        setStatusTargetOrder(null);
        fetchOrders();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al actualizar el estado del pedido.",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Error inesperado al actualizar el pedido.",
        });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchOrders();
  }, [fetchOrders]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
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

  // Normalizador de estados
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

  // Métricas calculadas en vivo
  const metrics = useMemo(() => {
    let pendientes = 0;
    let preparacion = 0;
    let enviados = 0;
    let entregados = 0;
    let cancelados = 0;

    orders.forEach((o) => {
      const st = normalizeStatus(o.status);
      if (st === "Pendiente") pendientes++;
      else if (st === "En Preparación") preparacion++;
      else if (st === "Enviado") enviados++;
      else if (st === "Entregado") entregados++;
      else if (st === "Cancelado") cancelados++;
    });

    return {
      total: orders.length,
      pendientes,
      preparacion,
      enviados,
      entregados,
      cancelados,
    };
  }, [orders]);

  // Filtrado y Búsqueda
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      // Filtro de estado
      const normStatus = normalizeStatus(item.status);
      if (statusFilter !== "all" && normStatus !== statusFilter) {
        return false;
      }

      // Filtro de búsqueda
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const idMatch = item.id.toLowerCase().includes(q);
      const customerFirstName = item.customer?.firstName?.toLowerCase() || "";
      const customerLastName = item.customer?.lastName?.toLowerCase() || "";
      const fullName = `${customerFirstName} ${customerLastName}`.trim();
      const nameMatch = fullName.includes(q);
      const docMatch = item.customer?.identityDocument?.toLowerCase().includes(q) || false;

      return idMatch || nameMatch || docMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all");

  // Ordenación
  const sortedOrders = useMemo(() => {
    if (!sortKey || !sortDir) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        cmp = (a.id || "").localeCompare(b.id || "");
      } else if (sortKey === "customer") {
        const nameA = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.trim();
        const nameB = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.trim();
        cmp = nameA.localeCompare(nameB);
      } else if (sortKey === "vat") {
        const vatA = Number(a.vat) || 0;
        const vatB = Number(b.vat) || 0;
        cmp = vatA - vatB;
      } else if (sortKey === "total") {
        const totalA = calculateOrderTotal(a) ?? 0;
        const totalB = calculateOrderTotal(b) ?? 0;
        cmp = totalA - totalB;
      } else if (sortKey === "status") {
        const statusA = normalizeStatus(a.status);
        const statusB = normalizeStatus(b.status);
        cmp = statusA.localeCompare(statusB);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredOrders, sortKey, sortDir, calculateOrderTotal]);

  // Paginación
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedOrders.slice(start, start + itemsPerPage);
  }, [sortedOrders, activePage, itemsPerPage]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-royal text-white shadow-sm">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-sm" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-app-text">
              Gestión de Pedidos
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-app-muted">
            Monitorea el ciclo de entrega de ventas online, valida clientes y controla estados logísticos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={faArrowRotateRight}
            onClick={fetchOrders}
            disabled={isLoading}
            className="h-10 px-3 hover:border-brand-royal/40"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* ─── Métricas Superiores ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-royal/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Pedidos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">registrados</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Historial completo</p>
        </div>

        {/* Pendientes */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-amber-400/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Pendientes</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
              {metrics.pendientes}
            </span>
            <span className="text-xs text-app-muted">por atender</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Requieren revisión
          </p>
        </div>

        {/* En Preparación */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-sky-400/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">En Preparación</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-sky-600 dark:text-sky-400">
              {metrics.preparacion}
            </span>
            <span className="text-xs text-app-muted">en alistamiento</span>
          </div>
          <p className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-medium">
            Empacando producto
          </p>
        </div>

        {/* Enviados */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-indigo-400/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Enviados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faTruck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
              {metrics.enviados}
            </span>
            <span className="text-xs text-app-muted">en ruta</span>
          </div>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Hacia destino
          </p>
        </div>

        {/* Entregados */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Entregados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {metrics.entregados}
            </span>
            <span className="text-xs text-app-muted">completados</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Entregas finalizadas
          </p>
        </div>
      </div>

      {/* ─── Tabla Principal con formato compuesto Table ─── */}
      <Table>
        <Table.Header
          title="Pedidos de Clientes Registrados"
          description="Listado cronológico de órdenes virtuales con importes calculados, trazabilidad al cliente y control de estado"
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-pedido-estado-header"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "Pendiente", label: "Pendientes" },
                  { value: "En Preparación", label: "En Preparación" },
                  { value: "Enviado", label: "Enviados" },
                  { value: "Entregado", label: "Entregados" },
                  { value: "Cancelado", label: "Cancelados" },
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
            placeholder="Buscar por ID de pedido, cliente o cédula..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredOrders.length} de {orders.length} pedidos encontrados
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

              <Table.SortableCell
                sortKey="customer"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Cliente
              </Table.SortableCell>

              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Documento / Cédula
              </th>

              <Table.SortableCell
                sortKey="vat"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-24"
              >
                IVA (%)
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="total"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-right min-w-32"
              >
                Total Pedido
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="status"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-40"
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
                  <Table.Cell rounded="left" colSpan={7} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedOrders.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={
                  hasActiveFilters
                    ? "No se encontraron pedidos con los filtros seleccionados."
                    : "No hay pedidos registrados en el sistema actualmente."
                }
              />
            ) : (
              paginatedOrders.map((row) => {
                const normStatus = normalizeStatus(row.status);
                const customerName = row.customer
                  ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
                  : "Cliente General";

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => fetchOrderByID(row.id)}
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

                    {/* Cliente */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-44">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faUser} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-app-text truncate" title={customerName}>
                            {customerName}
                          </span>
                          <span className="text-[10px] text-app-muted">Pedido web</span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Documento / Cédula */}
                    <Table.Cell>
                      <span className="font-mono text-xs text-app-muted">
                        {row.customer?.identityDocument || "Sin documento"}
                      </span>
                    </Table.Cell>

                    {/* IVA */}
                    <Table.Cell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-md bg-app-surface-alt px-2 py-0.5 font-mono text-xs font-bold text-app-text border border-app-border">
                        {Number(row.vat) || 0}%
                      </span>
                    </Table.Cell>

                    {/* Total Calculado del Pedido */}
                    <Table.Cell className="text-right">

                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-black text-brand-royal dark:text-brand-sky">
                          {formatCurrency(row.total)}
                        </span>
                        <span className="text-[10px] text-app-muted">con IVA inc.</span>
                      </div>
                    </Table.Cell>

                    {/* Estado con selector / botón interactivo para abrir modal */}
                    <Table.Cell className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusTargetOrder(row);
                          setIsStatusModalOpen(true);
                        }}
                        title="Haz clic para cambiar el estado operativo"
                        className="group inline-flex items-center gap-1.5 rounded-full outline-none transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        {normStatus === "Entregado" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs" />
                            Entregado
                          </span>
                        )}
                        {normStatus === "Enviado" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-indigo-500 shadow-xs" />
                            Enviado
                          </span>
                        )}
                        {normStatus === "En Preparación" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-sky-500 shadow-xs" />
                            En Preparación
                          </span>
                        )}
                        {normStatus === "Pendiente" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
                            Pendiente
                          </span>
                        )}
                        {normStatus === "Cancelado" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-rose-500 shadow-xs" />
                            Cancelado
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
                            fetchOrderByID(row.id);
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
          totalItems={filteredOrders.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle Completo del Pedido */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        isLoading={isLoadingDetail}
      />

      {/* Modal de Cambio de Estado Operativo */}
      <OrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTargetOrder(null);
        }}
        order={statusTargetOrder}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
