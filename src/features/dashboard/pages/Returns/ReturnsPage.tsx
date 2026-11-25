import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faPlus,
  faArrowRotateRight,
  faCircleCheck,
  faClock,
  faEye,
  faReceipt,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  getAllReturns,
  type SaleReturnSummaryItem,
} from "./services/salesReturnsServices";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import ReturnFormModal from "./components/ReturnFormModal";

export default function ReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<SaleReturnSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para el modal de creación múltiple
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("lastRequestDate");
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReturns();
  }, [fetchReturns]);

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


  // Filtrado y búsqueda
  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      // Filtro por estado de atención
      if (statusFilter === "pending" && item.pendingReturns === 0) return false;
      if (statusFilter === "completed" && item.pendingReturns > 0) return false;

      // Filtro de texto por ID de venta
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return item.id.toLowerCase().includes(q);
    });
  }, [returns, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all");

  // Ordenación
  const sortedReturns = useMemo(() => {
    if (!sortKey || !sortDir) return filteredReturns;

    return [...filteredReturns].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id.localeCompare(b.id);
      } else if (sortKey === "lastRequestDate") {
        const dateA = new Date(a.lastRequestDate).getTime() || 0;
        const dateB = new Date(b.lastRequestDate).getTime() || 0;
        cmp = dateA - dateB;
      } else if (sortKey === "totalReturns") {
        cmp = (a.totalReturns || 0) - (b.totalReturns || 0);
      } else if (sortKey === "pendingReturns") {
        cmp = (a.pendingReturns || 0) - (b.pendingReturns || 0);
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

  const goToDetail = (idSale: string) => {
    navigate({
      to: "/dashboard/returns/$idSale",
      params: { idSale },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-royal text-white shadow-sm">
              <FontAwesomeIcon icon={faRotateLeft} className="text-sm" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-app-text">
              Gestión de Devoluciones
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-app-muted">
            Monitorea solicitudes de cambio por venta facturada, revisa causas y resuelve cada garantía.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={faArrowRotateRight}
            onClick={fetchReturns}
            disabled={isLoading}
            className="h-10 px-3 hover:border-brand-royal/40"
          >
            Actualizar
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={faPlus}
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 shadow-xs"
          >
            Nueva Devolución
          </Button>
        </div>
      </div>


      {/* ─── Tabla Compuesta de Ventas con Devolución ─── */}
      <Table>
        <Table.Header
          title="Ventas con Solicitudes de Devolución"
          description="Listado agrupado por venta. Haz clic en cualquier registro para ingresar a la vista completa de detalles y resolver los casos."
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-status-header"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todas las Ventas" },
                  { value: "pending", label: "Con Pendientes" },
                  { value: "completed", label: "Totalmente Resueltas" },
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
            placeholder="Buscar por ID o código de la venta..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredReturns.length} de {returns.length} ventas con devolución
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
                className="w-48"
              >
                Venta / ID
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="lastRequestDate"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="min-w-44"
              >
                Última Solicitud
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="totalReturns"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-36"
              >
                Total Devoluciones
              </Table.SortableCell>

              <Table.SortableCell
                sortKey="pendingReturns"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-36"
              >
                Pendientes
              </Table.SortableCell>

              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-36">
                Estado
              </th>

              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-28">
                Acciones
              </th>
            </Table.Row>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, rIdx) => (
                <Table.Row key={`loading-${rIdx}`}>
                  <Table.Cell rounded="left" colSpan={6} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedReturns.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron ventas con devolución para los filtros seleccionados."
                    : "No hay registros de devoluciones en el sistema actualmente."
                }
              />
            ) : (
              paginatedReturns.map((row) => {
                const hasPending = row.pendingReturns > 0;

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => goToDetail(row.id)}
                    className="cursor-pointer"
                  >
                    {/* ID Venta */}
                    <Table.Cell rounded="left">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky hover:underline"
                            title={row.id}
                          >
                            Venta #{row.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-app-muted truncate max-w-36" title={row.id}>
                            {row.id}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Fecha de última solicitud */}
                    <Table.Cell>
                      <div className="flex items-center gap-2 text-xs text-app-text font-medium">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-app-muted text-[11px]" />
                        <span>{formatDate(row.lastRequestDate)}</span>
                      </div>
                    </Table.Cell>

                    {/* Total de devoluciones */}
                    <Table.Cell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-xs font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                        {row.totalReturns} {row.totalReturns === 1 ? "caso" : "casos"}
                      </span>
                    </Table.Cell>

                    {/* Devoluciones pendientes */}
                    <Table.Cell className="text-center">
                      {hasPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
                          {row.pendingReturns} pendiente{row.pendingReturns === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                          Al día
                        </span>
                      )}
                    </Table.Cell>

                    {/* Estado global de la venta */}
                    <Table.Cell className="text-center">
                      {hasPending ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                          Requiere atención
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                          Completada
                        </span>
                      )}
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
                            goToDetail(row.id);
                          }}
                          title="Ver detalle de devoluciones"
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

      {/* Modal de Creación Múltiple de Devoluciones */}
      <ReturnFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchReturns}
      />
    </div>
  );
}
