import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faPlus,
  faArrowRotateRight,
  faChartPie,
  faEye,
  faPenToSquare,
  faBuilding,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PurchaseWithRelations } from "../../../../@types";
import { createPurchase, getAllPurchases, getPurchaseByID, updatePurchase, updatePurchaseStatus } from "./services/shoppingsServices";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { PurchaseDetailModal } from "./components/PurchaseDetailModal";
import { PurchaseFormModal, type PurchaFormDataEdit, type PurchaseFormDataCreate } from "./components/PurchaseFormModal";
import { PurchaseStatusModal, type PurchaseStatus } from "./components/PurchaseStatusModal";
import type { CashRegister } from "../../../../@types";

export default function Purchases() {
  const [purchases, setPurchases] = useState<Omit<PurchaseWithRelations, "purchaseDetails">[]>([]);
  const [cashRegisters, setCashRegisters] = useState<Pick<CashRegister, "name" | "id" | "currentBalance">[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para el modal de detalle por ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithRelations | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);

  // Estado para el modal de cambio de estado
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [statusTargetPurchase, setStatusTargetPurchase] = useState<Omit<PurchaseWithRelations, "purchaseDetails"> | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Estado para el modal de creación y edición
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [onSubmitLoading, setOnSubmitLoading] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("orderDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const findPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllPurchases();

      if (response.status === 200) {
        setPurchases(response.data.shoppings || []);
        setCashRegisters(response.data.cashRegister || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las compras.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findPurchaseByID = useCallback(async (id: string) => {
    try {
      const response = await getPurchaseByID(id);

      if (response.status === 200) {
        setSelectedPurchase(response.data.shoppings || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los detalles de la compra.",
          text: "Por favor, intenta nuevamente",
        });
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    findPurchases();
  }, [findPurchases]);

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


  // Filtrado
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {

      // Filtro de estado
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Búsqueda por ID, proveedor o caja
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const idMatch = (item.id || "").toLowerCase().includes(q);
        const supplierMatch = (item.supplier?.businessName || "").toLowerCase().includes(q);
        const supplierDocMatch = (item.supplier?.document || "").toLowerCase().includes(q);
        const cashRegisterMatch = (item.cashRegister?.name || "").toLowerCase().includes(q);
        const dateMatch = item.orderDate ? new Date(item.orderDate).toLocaleDateString().includes(q) : false;

        return idMatch || supplierMatch || supplierDocMatch || cashRegisterMatch || dateMatch;
      }

      return true;
    });
  }, [purchases, statusFilter, searchTerm]);

  // Ordenación
  const sortedPurchases = useMemo(() => {
    if (!sortKey || !sortDir) return filteredPurchases;

    return [...filteredPurchases].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        cmp = (a.id || "").localeCompare(b.id || "");
      } else if (sortKey === "supplier") {
        const nameA = a.supplier?.businessName || "";
        const nameB = b.supplier?.businessName || "";
        cmp = nameA.localeCompare(nameB);
      } else if (sortKey === "orderDate") {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        cmp = dateA - dateB;
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredPurchases, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedPurchases.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedPurchases = useMemo(
    () => sortedPurchases.slice(startIndex, startIndex + itemsPerPage),
    [sortedPurchases, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

  // Manejadores de acciones
  const handleViewDetail = async (purchase: Omit<PurchaseWithRelations, "purchaseDetails">) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    // Peticion
    await findPurchaseByID(purchase.id);
    setIsLoadingDetail(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPurchase(null);
  };

  const handleOpenStatusModal = (purchase: Omit<PurchaseWithRelations, "purchaseDetails">) => {
    setStatusTargetPurchase(purchase);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setStatusTargetPurchase(null);
  };

  const handleUpdateStatus = async (purchaseId: string, newStatus: PurchaseStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await updatePurchaseStatus(purchaseId, newStatus);
      if (res.status === 200 || res.status === 204) {
        Toast.fire({
          icon: "success",
          title: "Estado actualizado",
          text: `La compra #${purchaseId.slice(0, 8)} ahora está ${newStatus}.`,
        });
        handleCloseStatusModal();
        await findPurchases();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al actualizar el estado.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedPurchase(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleEdit = async (purchase: Omit<PurchaseWithRelations, "purchaseDetails">) => {
    setIsLoadingEdit(true);
    setFormMode("edit");
    setIsFormModalOpen(true);
    await findPurchaseByID(purchase.id);
    setIsLoadingEdit(false);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedPurchase(null);
    setFormMode("create");
  };

  const handleFormSubmit = async (data: PurchaseFormDataCreate | PurchaFormDataEdit, onClose: () => void) => {
    try {
      setOnSubmitLoading(true);
      let res;
      if (formMode === "create") {
        res = await createPurchase(data as PurchaseFormDataCreate);

      } else {
        res = await updatePurchase(selectedPurchase!.id, data);
      }

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message,
        });
        await findPurchases();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al guardar",
          text: error.response?.data.message || "Error de conexión",
        });
      }
    } finally {
      setOnSubmitLoading(false);
    }
  };


  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Compras
              </h1>
              <p className="text-sm text-app-muted">
                Registro, consulta y seguimiento de compras vinculadas a caja y proveedor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faChartPie}
            className="hover:border-brand-royal dark:hover:border-brand-sky opacity-80"
          >
            Generar Reporte
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={findPurchases}
            disabled={isLoading}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            onClick={handleOpenCreateModal}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nueva Compra
          </Button>
        </div>
      </div>


      {/* Tabla Principal con formato compuesto Table */}
      <Table>
        <Table.Header
          title="Órdenes de Compra Registradas"
          description="Listado cronológico de compras a proveedores con trazabilidad a caja y control de estados"
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-compra-estado-header"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "Completada", label: "Completadas" },
                  { value: "Pendiente", label: "Pendientes" },
                  { value: "Cancelada", label: "Canceladas" },
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
            placeholder="Buscar por ID, proveedor, NIT o fecha..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredPurchases.length} de {purchases.length} compras encontradas
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
                sortKey="supplier"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Proveedor
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="orderDate"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Fecha de Orden
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
                  <Table.Cell rounded="left" colSpan={5} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedPurchases.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={
                  hasActiveFilters
                    ? "No se encontraron compras con los filtros seleccionados."
                    : "No hay compras registradas en el sistema actualmente."
                }
              />
            ) : (
              paginatedPurchases.map((row) => {
                const normStatus = row.status;
                const date = row.orderDate ? new Date(row.orderDate) : null;

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => handleViewDetail(row)}
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

                    {/* Proveedor */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-40">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-xs text-app-text truncate"
                            title={row.supplier?.businessName || "Sin proveedor"}
                          >
                            {row.supplier?.businessName || "Proveedor no asignado"}
                          </span>
                          <span className="text-[10px] font-mono text-app-muted">
                            {row.supplier?.document ? `NIT: ${row.supplier.document}` : "Sin documento"}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Fecha de Orden */}
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 text-xs text-app-text">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-app-muted text-[10px]" />
                        <span>
                          {date && !isNaN(date.getTime())
                            ? date.toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                            : "Sin fecha"}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Estado */}
                    <Table.Cell className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStatusModal(row);
                        }}
                        title="Haz clic para cambiar el estado"
                        className="group inline-flex items-center gap-1.5 rounded-full outline-none transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                      >
                        {normStatus === "Recibida" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs" />
                            Recibida
                          </span>
                        )}
                        {normStatus === "Cancelada" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-rose-500 shadow-xs" />
                            Cancelada
                          </span>
                        )}
                        {normStatus === "Pendiente" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                            <span className="size-1.5 rounded-full bg-amber-500 shadow-xs" />
                            Pendiente
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
                            handleViewDetail(row);
                          }}
                          title="Ver Detalle"
                          className="hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faPenToSquare}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                          }}
                          title="Editar Compra"
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
          totalItems={filteredPurchases.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle Completo de la Compra */}
      <PurchaseDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        purchase={selectedPurchase}
        isLoading={isLoadingDetail}
      />

      {/* Modal Unificado de Creación y Edición */}
      <PurchaseFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        onSubmitLoading={onSubmitLoading}
        purchase={selectedPurchase}
        onSubmit={handleFormSubmit}
        isLoading={isLoadingEdit}
        cashRegisters={cashRegisters}
      />

      {/* Modal de Cambio de Estado */}
      <PurchaseStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        purchase={statusTargetPurchase}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

