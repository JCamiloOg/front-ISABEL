import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faPlus,
  faArrowRotateRight,
  faChartPie,
  faCalendarDay,
  faMoneyBillWave,
  faBuildingColumns,
  faEye,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  type ExpensePayload,
} from "./services/expensesServices";
import { getAllBoxes } from "../Boxes/services/boxesServices";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { ExpenseDetailModal } from "./components/ExpenseDetailModal";
import { ExpenseFormModal } from "./components/ExpenseFormModal";
import type { CashRegister, Expense, ExpenseWithRelations } from "../../../../@types/cash-registers";

export default function BillsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para el modal de detalle por ID
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithRelations | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);

  // Estado para el modal de creación y edición
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [onSubmitLoading, setOnSubmitLoading] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cashRegisterFilter, setCashRegisterFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const formatCurrency = (amount: number | string | undefined | null) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const findData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resExpenses, resBoxes] = await Promise.all([
        getAllExpenses(),
        getAllBoxes(),
      ]);

      if (resExpenses.status === 200) {
        setExpenses(resExpenses.data.Expenses || []);
      }

      if (resBoxes.status === 200) {
        setCashRegisters(resBoxes.data.Boxes || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los gastos operativos.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findExpenseByID = useCallback(async (id: number | string) => {
    try {
      const response = await getExpenseById(id);

      if (response.status === 200) {
        setSelectedExpense(response.data.Expenses || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del gasto.",
          text: "Por favor, intenta nuevamente",
        });
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    findData();
  }, [findData]);

  // Mapa rápido de cajas para resolución de nombres
  const boxMap = useMemo(() => {
    const map = new Map<number, CashRegister>();
    cashRegisters.forEach((b) => map.set(b.id, b));
    return map;
  }, [cashRegisters]);

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
    setCashRegisterFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Filtro de caja
      if (cashRegisterFilter !== "all" && String(item.cashRegisterId) !== cashRegisterFilter) {
        return false;
      }

      // Búsqueda por ID, concepto o caja
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const idMatch = String(item.id).toLowerCase().includes(q);
        const conceptMatch = (item.concept || "").toLowerCase().includes(q);
        const userMatch = (item.userId || "").toLowerCase().includes(q);
        const boxName = boxMap.get(item.cashRegisterId)?.name?.toLowerCase() || "";
        const boxMatch = boxName.includes(q);
        const dateMatch = item.date ? new Date(item.date).toLocaleDateString().includes(q) : false;

        return idMatch || conceptMatch || userMatch || boxMatch || dateMatch;
      }

      return true;
    });
  }, [expenses, cashRegisterFilter, searchTerm, boxMap]);

  // Ordenación
  const sortedExpenses = useMemo(() => {
    if (!sortKey || !sortDir) return filteredExpenses;

    return [...filteredExpenses].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        cmp = Number(a.id) - Number(b.id);
      } else if (sortKey === "concept") {
        cmp = (a.concept || "").localeCompare(b.concept || "");
      } else if (sortKey === "amount") {
        cmp = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortKey === "date") {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        cmp = dateA - dateB;
      } else if (sortKey === "cashRegister") {
        const nameA = boxMap.get(a.cashRegisterId)?.name || "";
        const nameB = boxMap.get(b.cashRegisterId)?.name || "";
        cmp = nameA.localeCompare(nameB);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredExpenses, sortKey, sortDir, boxMap]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedExpenses.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedExpenses = useMemo(
    () => sortedExpenses.slice(startIndex, startIndex + itemsPerPage),
    [sortedExpenses, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || cashRegisterFilter !== "all";

  // Manejadores de acciones
  const handleViewDetail = async (expense: Expense) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    await findExpenseByID(expense.id);
    setIsLoadingDetail(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedExpense(null);
  };

  const handleOpenDeleteModal = async (expense: Expense) => {
    const result = await MySwal.fire({
      title: "¿Eliminar gasto operativo?",
      html: `¿Estás seguro de que deseas eliminar el egreso <b>"${expense.concept}"</b> por valor de <b>${formatCurrency(expense.amount)}</b>?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await handleDeleteExpense(expense.id);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      const res = await deleteExpense(expenseId);

      if (res.status === 200 || res.status === 204) {
        Toast.fire({
          icon: "success",
          title: "Gasto eliminado",
          text: `El egreso #${expenseId} ha sido removido exitosamente.`,
        });
        await findData();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al eliminar el gasto.",
          text: "Por favor, intenta nuevamente",
        });
      }
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedExpense(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleEdit = async (expense: Expense) => {
    setIsLoadingEdit(true);
    setFormMode("edit");
    setIsFormModalOpen(true);
    await findExpenseByID(expense.id);
    setIsLoadingEdit(false);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedExpense(null);
    setFormMode("create");
  };

  const handleFormSubmit = async (data: ExpensePayload, onClose: () => void) => {
    try {
      setOnSubmitLoading(true);
      let res;
      if (formMode === "create") {
        res = await createExpense(data);
      } else {
        res = await updateExpense(selectedExpense!.id, data);
      }

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || (formMode === "create" ? "Gasto registrado exitosamente" : "Gasto actualizado"),
        });
        await findData();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al guardar el gasto",
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
              <FontAwesomeIcon icon={faReceipt} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Gastos Operativos
              </h1>
              <p className="text-sm text-app-muted">
                Control de egresos, pagos de servicios, nómina y débitos vinculados a tus cajas y cuentas
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
            onClick={findData}
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
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Tabla Principal con formato compuesto Table */}
      <Table>
        <Table.Header
          title="Registro Cronológico de Gastos"
          description="Egresos descontados directamente de cajas y cuentas para la operación"
          action={
            <div className="flex items-center gap-2">
              <Select
                id="filter-gasto-caja"
                value={cashRegisterFilter}
                onChange={(e) => {
                  setCashRegisterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todas las Cajas" },
                  ...cashRegisters.map((b) => ({
                    value: String(b.id),
                    label: b.name,
                  })),
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
            placeholder="Buscar por ID, concepto, caja, fecha o responsable..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredExpenses.length} de {expenses.length} gastos encontrados
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
                sortKey="concept"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Concepto / Motivo
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="cashRegister"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-48"
              >
                Caja Afectada
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="date"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-40"
              >
                Fecha
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="amount"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-right w-40"
              >
                Valor
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
                  <Table.Cell rounded="left" colSpan={6} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedExpenses.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron gastos con los filtros seleccionados."
                    : "No hay gastos operativos registrados en el sistema actualmente."
                }
              />
            ) : (
              paginatedExpenses.map((row) => {
                const box = boxMap.get(row.cashRegisterId);
                const isBank = (box?.registerType || "").toLowerCase().includes("banc") ||
                  (box?.name || "").toLowerCase().includes("banc");
                const date = row.date ? new Date(row.date) : null;

                return (
                  <Table.Row
                    key={row.id}
                    onClick={() => handleViewDetail(row)}
                  >
                    {/* ID */}
                    <Table.Cell rounded="left">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                        #{row.id}
                      </span>
                    </Table.Cell>

                    {/* Concepto */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-44">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-xs text-app-text truncate"
                            title={row.concept}
                          >
                            {row.concept}
                          </span>
                          <span className="text-[10px] text-app-muted truncate">
                            Responsable: {row.userId}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Caja Afectada */}
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon
                          icon={isBank ? faBuildingColumns : faMoneyBillWave}
                          className="text-app-muted text-[11px]"
                        />
                        <span className="font-medium text-app-text truncate max-w-40" title={box?.name || `Caja #${row.cashRegisterId}`}>
                          {box?.name || `Caja #${row.cashRegisterId}`}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Fecha */}
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

                    {/* Valor */}
                    <Table.Cell className="text-right">
                      <span className="font-black text-xs text-rose-600 dark:text-rose-400 font-mono">
                        - {formatCurrency(row.amount)}
                      </span>
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
                          title="Editar Gasto"
                          className="hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrash}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(row);
                          }}
                          title="Eliminar Gasto"
                          className="hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
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
          totalItems={filteredExpenses.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle Completo del Gasto */}
      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        expense={selectedExpense}
        isLoading={isLoadingDetail}
      />

      {/* Modal Unificado de Creación y Edición */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        mode={formMode}
        onSubmitLoading={onSubmitLoading}
        expense={selectedExpense}
        cashRegisters={cashRegisters}
        onSubmit={handleFormSubmit}
        isLoading={isLoadingEdit}
      />
    </div>
  );
}
