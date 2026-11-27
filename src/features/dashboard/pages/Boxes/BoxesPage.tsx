import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVault,
  faPlus,
  faArrowRotateRight,
  faChartPie,
  faEye,
  faPenToSquare,
  faBuildingColumns,
  faMoneyBillWave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { Switcher } from "../../components/Switcher";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CashRegister, CashRegisterWithRelations } from "../../../../@types/cash-registers";
import {
  createBox,
  deleteBox,
  getAllBoxes,
  getBoxById,
  updateBox,
  type BoxPayload,
} from "./services/boxesServices";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { BoxDetailModal } from "./components/BoxDetailModal";
import { BoxFormModal } from "./components/BoxFormModal";

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<CashRegister[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para el modal de detalle por ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedBox, setSelectedBox] = useState<CashRegisterWithRelations | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);

  // Estado para el modal de creación y edición
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [onSubmitLoading, setOnSubmitLoading] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const formatCurrency = (amount: number | string | undefined | null) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const findBoxes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllBoxes();

      if (response.status === 200) {
        setBoxes(response.data.Boxes || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las cajas.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findBoxByID = useCallback(async (id: number | string) => {
    try {
      const response = await getBoxById(id);

      if (response.status === 200) {
        setSelectedBox(response.data.Boxes || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los detalles de la caja.",
          text: "Por favor, intenta nuevamente",
        });
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    findBoxes();
  }, [findBoxes]);

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
    setTypeFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredBoxes = useMemo(() => {
    return boxes.filter((item) => {
      // Filtro de estado
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;

      // Filtro de tipo
      if (typeFilter !== "all") {
        const itemType = (item.registerType || "").toLowerCase();
        if (typeFilter === "banco" && !itemType.includes("banc") && !itemType.includes("cuenta")) return false;
        if (typeFilter === "efectivo" && (itemType.includes("banc") || itemType.includes("cuenta"))) return false;
      }

      // Búsqueda por ID, nombre o detalles
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const idMatch = String(item.id).toLowerCase().includes(q);
        const nameMatch = (item.name || "").toLowerCase().includes(q);
        const detailsMatch = (item.details || "").toLowerCase().includes(q);
        const typeMatch = (item.registerType || "").toLowerCase().includes(q);

        return idMatch || nameMatch || detailsMatch || typeMatch;
      }

      return true;
    });
  }, [boxes, statusFilter, typeFilter, searchTerm]);

  // Ordenación
  const sortedBoxes = useMemo(() => {
    if (!sortKey || !sortDir) return filteredBoxes;

    return [...filteredBoxes].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        cmp = Number(a.id) - Number(b.id);
      } else if (sortKey === "name") {
        cmp = (a.name || "").localeCompare(b.name || "");
      } else if (sortKey === "registerType") {
        cmp = (a.registerType || "").localeCompare(b.registerType || "");
      } else if (sortKey === "currentBalance") {
        cmp = (Number(a.currentBalance) || 0) - (Number(b.currentBalance) || 0);
      } else if (sortKey === "status") {
        cmp = (a.status === b.status ? 0 : a.status ? 1 : -1);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredBoxes, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedBoxes.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedBoxes = useMemo(
    () => sortedBoxes.slice(startIndex, startIndex + itemsPerPage),
    [sortedBoxes, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

  // Manejadores de acciones
  const handleViewDetail = async (box: CashRegister) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    await findBoxByID(box.id);
    setIsLoadingDetail(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBox(null);
  };

  const handleToggleStatus = async (box: CashRegister, nextChecked: boolean) => {
    const actionText = nextChecked ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿${nextChecked ? "Activar" : "Desactivar"} caja?`,
      html: `¿Estás seguro de que deseas ${actionText} la caja <b>"${box.name}"</b> (#${box.id})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await updateBox(box.id, { status: nextChecked });

        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: nextChecked ? "Caja activada" : "Caja desactivada",
            text: `La caja #${box.id} ahora está ${nextChecked ? "activa" : "inactiva"}.`,
          });
          await findBoxes();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: `Error al ${actionText} la caja.`,
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  const handleDeleteBox = async (box: CashRegister) => {
    const balance = Number(box.currentBalance) || 0;
    const purchasesCount = box._count?.purchases ?? 0;

    // Validación preventiva: no se puede eliminar si tiene dinero o compras asociadas
    if (balance > 0 || purchasesCount > 0) {
      const razones: string[] = [];
      if (balance > 0) {
        razones.push(`tiene un saldo disponible de <b>${formatCurrency(balance)}</b>`);
      }
      if (purchasesCount > 0) {
        razones.push(`tiene <b>${purchasesCount}</b> compra(s) asociada(s)`);
      }

      await MySwal.fire({
        title: "No se puede eliminar",
        html: `La caja <b>"${box.name}"</b> no puede ser eliminada porque ${razones.join(" y ")}.<br/><span class="text-xs text-app-muted mt-2 inline-block">Para proteger la trazabilidad contable y patrimonial, puedes inactivar la caja usando el interruptor de estado.</span>`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar caja o cuenta?",
      html: `¿Estás seguro de que deseas eliminar permanentemente la caja <b>"${box.name}"</b> (#${box.id})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteBox(box.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Caja eliminada",
            text: res.data.message || "La caja fue eliminada exitosamente.",
          });
          await findBoxes();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar caja",
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedBox(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleEdit = async (box: CashRegister) => {
    setIsLoadingEdit(true);
    setFormMode("edit");
    setIsFormModalOpen(true);
    await findBoxByID(box.id);
    setIsLoadingEdit(false);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedBox(null);
    setFormMode("create");
  };

  const handleFormSubmit = async (data: BoxPayload, onClose: () => void) => {
    try {
      setOnSubmitLoading(true);
      let res;
      if (formMode === "create") {
        res = await createBox(data);
      } else {
        res = await updateBox(selectedBox!.id, data);
      }

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || (formMode === "create" ? "Caja registrada exitosamente" : "Caja actualizada"),
        });
        await findBoxes();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al guardar caja",
          text: error.response?.data?.message || "Error de conexión con el servidor",
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
              <FontAwesomeIcon icon={faVault} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Cajas Menores y Cuentas
              </h1>
              <p className="text-sm text-app-muted">
                Supervisa fondos disponibles, registra cuentas bancarias o cajas físicas y controla su operatividad
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
            onClick={findBoxes}
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
            Nueva Caja
          </Button>
        </div>
      </div>

      {/* Tabla Principal con formato compuesto Table */}
      <Table>
        <Table.Header
          title="Cajas Menores y Cuentas Registradas"
          description="Listado patrimonial de fondos con trazabilidad a compras, ventas y gastos operativos"
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-caja-tipo"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Tipos" },
                  { value: "efectivo", label: "Efectivo" },
                  { value: "banco", label: "Bancos / Digital" },
                ]}
                size="sm"
              />

              <Select
                id="filter-caja-estado"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "active", label: "Cajas Activas" },
                  { value: "inactive", label: "Cajas Inactivas" },
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
            placeholder="Buscar por ID, nombre, tipo o detalles de la caja..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredBoxes.length} de {boxes.length} cajas encontradas
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
                className="w-24"
              >
                ID
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Nombre de la Caja
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="registerType"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-48"
              >
                Tipo de Cuenta
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="currentBalance"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-right w-44"
              >
                Saldo Disponible
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Detalles / Observaciones
              </th>
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
            ) : paginatedBoxes.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={
                  hasActiveFilters
                    ? "No se encontraron cajas con los filtros seleccionados."
                    : "No hay cajas ni cuentas registradas en el sistema actualmente."
                }
              />
            ) : (
              paginatedBoxes.map((row) => {
                const isBank = (row.registerType || "").toLowerCase().includes("banc") || (row.registerType || "").toLowerCase().includes("cuenta");

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => handleViewDetail(row)}
                  >
                    {/* ID */}
                    <Table.Cell rounded="left">
                      <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky hover:underline">
                        #{row.id}
                      </span>
                    </Table.Cell>

                    {/* Nombre */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-40">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={isBank ? faBuildingColumns : faMoneyBillWave} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-xs text-app-text truncate"
                            title={row.name}
                          >
                            {row.name}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Tipo */}
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${isBank
                          ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                      >
                        <FontAwesomeIcon icon={isBank ? faBuildingColumns : faMoneyBillWave} className="text-[10px]" />
                        {row.registerType}
                      </span>
                    </Table.Cell>

                    {/* Saldo Disponible */}
                    <Table.Cell className="text-right">
                      <span className="font-extrabold text-xs text-brand-royal dark:text-brand-sky font-mono">
                        {formatCurrency(row.currentBalance)}
                      </span>
                    </Table.Cell>

                    {/* Detalles */}
                    <Table.Cell>
                      <span
                        className="text-xs text-app-muted truncate max-w-xs block"
                        title={row.details}
                      >
                        {row.details || "Sin observaciones"}
                      </span>
                    </Table.Cell>

                    {/* Estado con Switcher */}
                    <Table.Cell className="text-center">
                      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <Switcher
                          checked={Boolean(row.status)}
                          onChange={(checked) => handleToggleStatus(row, checked)}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
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
                          title="Editar Caja"
                          className="hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrash}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBox(row);
                          }}
                          title={
                            (Number(row.currentBalance) || 0) > 0 || (row._count?.purchases ?? 0) > 0
                              ? "No se puede eliminar: tiene saldo o compras asociadas"
                              : "Eliminar Caja"
                          }
                          className={
                            (Number(row.currentBalance) || 0) > 0 || (row._count?.purchases ?? 0) > 0
                              ? "opacity-40 text-app-muted hover:bg-transparent cursor-not-allowed"
                              : "hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
                          }
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
          totalItems={filteredBoxes.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle Completo de la Caja */}
      <BoxDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        box={selectedBox}
        isLoading={isLoadingDetail}
      />

      {/* Modal Unificado de Creación y Edición */}
      <BoxFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        onSubmitLoading={onSubmitLoading}
        box={selectedBox}
        onSubmit={handleFormSubmit}
        isLoading={isLoadingEdit}
      />
    </div>
  );
}
