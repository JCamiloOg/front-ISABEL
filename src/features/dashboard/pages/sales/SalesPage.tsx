import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faPlus,
  faArrowRotateRight,
  faEye,
  faUser,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { isAxiosError } from "axios";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";
import {
  addSalePayment,
  createSale,
  getAllSales,
  getSaleByID,
  updateStatusSale,
  type CashRegisterOption,
  type CreateSalePayload,
  type PaymentMethodOption,
  type SalePayload,
} from "./services/salesServices";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { SaleFormModal } from "./components/SaleFormModal";

export default function SalesPage() {
  const [sales, setSales] = useState<SalePayload[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegisterOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);

  // Modal Detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedSale, setSelectedSale] = useState<SalePayload | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Modal Nueva Venta
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("saleDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const calculateSaleTotal = useCallback((sale: SalePayload) => {
    const subtotal =
      sale.saleDetails?.reduce(
        (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
        0
      ) || 0;
    const discountPct = Number(sale.discount) || 0;
    const base = Math.max(0, subtotal - subtotal * (discountPct / 100));
    const vatPct = Number(sale.vat) || 0;
    return base + base * (vatPct / 100);
  }, []);

  // ── GET /sales ──
  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllSales();
      if (response.status === 200) {
        setSales(response.data.sales || []);
        setCashRegisters(response.data.cashRegisters || []);
        setPaymentMethods(response.data.paymentMethods || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las ventas.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── GET /sales/:idSale ──
  const fetchSaleByID = useCallback(async (idSale: string) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailModalOpen(true);
      const response = await getSaleByID(idSale);
      if (response.status === 200) {
        setSelectedSale(response.data.sales || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle de la venta.",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // ── POST /sales ──
  const handleCreateSale = async (payload: CreateSalePayload) => {
    try {
      setIsSaving(true);
      const res = await createSale(payload);
      if (res.status === 201) {
        Toast.fire({
          icon: "success",
          title: res.data?.message || "Venta registrada exitosamente",
        });
        setIsFormModalOpen(false);
        fetchSales();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al registrar la venta.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── POST /sales/payment/:idSale ──
  const handleAddPayment = async (
    idSale: string,
    payment: {
      cashRegisterId: number;
      userId: string;
      paymentMethodId: number;
      amount: number;
      notes?: string | null;
    }
  ) => {
    try {
      setIsSavingPayment(true);
      const res = await addSalePayment(idSale, payment);
      if (res.status === 201) {
        Toast.fire({
          icon: "success",
          title: res.data?.message || "Abono registrado exitosamente.",
        });
        await fetchSaleByID(idSale);
        fetchSales();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al registrar el abono.",
        });
      }
    } finally {
      setIsSavingPayment(false);
    }
  };

  // ── PATCH /sales/status/:idSale ──
  const handleCancelSale = (sale: SalePayload) => {
    if (sale.status === "Cancelada") return;

    MySwal.fire({
      title: "¿Cancelar venta?",
      text: `¿Seguro que deseas cancelar la factura #${sale.id.slice(0, 8).toUpperCase()}? Se reintegrará el stock al inventario.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar venta",
      cancelButtonText: "Volver",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await updateStatusSale(sale.id, "Cancelada");
          if (res.status === 200) {
            Toast.fire({
              icon: "success",
              title: res.data?.message || "Estado de la venta actualizado exitosamente!",
            });
            fetchSales();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            Toast.fire({
              icon: "error",
              title: error.response?.data?.message || "No se pudo cancelar la venta.",
            });
          }
        }
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSales();
  }, [fetchSales]);


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

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const idMatch = item.id.toLowerCase().includes(q);
      const customerName = item.customer
        ? `${item.customer.firstName} ${item.customer.lastName}`.toLowerCase()
        : "";
      const docMatch = item.customer?.identityDocument?.toLowerCase().includes(q) || false;

      return idMatch || customerName.includes(q) || docMatch;
    });
  }, [sales, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all");

  const sortedSales = useMemo(() => {
    if (!sortKey || !sortDir) return filteredSales;

    return [...filteredSales].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id.localeCompare(b.id);
      } else if (sortKey === "customer") {
        const nameA = a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : "";
        const nameB = b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "";
        cmp = nameA.localeCompare(nameB);
      } else if (sortKey === "saleDate") {
        cmp = new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime();
      } else if (sortKey === "total") {
        cmp = calculateSaleTotal(a) - calculateSaleTotal(b);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredSales, sortKey, sortDir, calculateSaleTotal]);

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedSales = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedSales.slice(start, start + itemsPerPage);
  }, [sortedSales, activePage, itemsPerPage]);

  const defaultSellerId = sales[0]?.seller?.identityDocument || "";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-royal text-white shadow-sm">
              <FontAwesomeIcon icon={faCashRegister} className="text-sm" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-app-text">
              Gestión de Ventas
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-app-muted">
            Registra ventas de contado o crédito, gestiona abonos en caja y controla el inventario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={faArrowRotateRight}
            onClick={fetchSales}
            disabled={isLoading}
            className="h-10 px-3 hover:border-brand-royal/40"
          >
            Actualizar
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={faPlus}
            onClick={() => setIsFormModalOpen(true)}
            className="h-10 px-4 shadow-sm"
          >
            Nueva Venta
          </Button>
        </div>
      </div>


      {/* ─── Tabla Principal ─── */}
      <Table>
        <Table.Header
          title="Historial de Ventas"
          description="Listado cronológico de facturación, modalidad y saldos"
          action={
            <Select
              id="filter-venta-estado"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "Entregada", label: "Entregadas" },
                { value: "Pendiente", label: "Pendientes" },
                { value: "Cancelada", label: "Canceladas" },
              ]}
              size="sm"
            />
          }
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código de factura, cliente o documento..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredSales.length} de {sales.length} ventas encontradas
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
                Factura / ID
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="customer"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Cliente
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="saleDate"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-32"
              >
                Fecha
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-28">
                Modalidad
              </th>
              <Table.SortableCell
                sortKey="total"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-right min-w-32"
              >
                Total Venta
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
                  <Table.Cell rounded="left" colSpan={7} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedSales.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={
                  hasActiveFilters
                    ? "No se encontraron ventas con los filtros seleccionados."
                    : "No hay ventas registradas en el sistema."
                }
              />
            ) : (
              paginatedSales.map((row) => {
                const customerName = row.customer
                  ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
                  : "Sin cliente";

                return (
                  <Table.Row key={row.id} onClick={() => fetchSaleByID(row.id)}>
                    <Table.Cell rounded="left">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                          #{row.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-app-muted truncate max-w-28">
                          {row.id}
                        </span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-44">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faUser} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-app-text truncate">
                            {customerName}
                          </span>
                          <span className="text-[10px] font-mono text-app-muted">
                            {row.customer?.identityDocument || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="text-xs text-app-muted">{formatDate(row.saleDate)}</span>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${row.isCredit
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                          }`}
                      >
                        {row.isCredit ? "Crédito" : "Contado"}
                      </span>
                    </Table.Cell>

                    <Table.Cell className="text-right">
                      <span className="font-mono text-xs font-black text-brand-royal dark:text-brand-sky">
                        {formatCurrency(calculateSaleTotal(row))}
                      </span>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      {row.status === "Entregada" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Entregada
                        </span>
                      )}
                      {row.status === "Pendiente" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pendiente
                        </span>
                      )}
                      {row.status === "Cancelada" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <span className="size-1.5 rounded-full bg-rose-500" />
                          Cancelada
                        </span>
                      )}
                    </Table.Cell>

                    <Table.Cell rounded="right" className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faEye}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchSaleByID(row.id);
                          }}
                          title="Ver Factura / Abonar"
                        />
                        {row.status !== "Cancelada" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={faBan}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelSale(row);
                            }}
                            title="Cancelar Venta"
                          />
                        )}
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
          totalItems={filteredSales.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle y Abonos */}
      <SaleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
        isLoading={isLoadingDetail}
        cashRegisters={cashRegisters}
        paymentMethods={paymentMethods}
        onAddPayment={handleAddPayment}
        isSavingPayment={isSavingPayment}
      />

      {/* Modal de Nueva Venta */}
      <SaleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        cashRegisters={cashRegisters}
        paymentMethods={paymentMethods}
        defaultSellerId={defaultSellerId}
        onSubmit={handleCreateSale}
        isLoading={isSaving}
      />
    </div>
  );
}