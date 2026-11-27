import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faPlus,
  faArrowRotateRight,
  faChartPie,
  faBuilding,
  faUserTie,
  faGlobe,
  // faPhone,
  // faEnvelope,
  faEye,
  faPenToSquare,
  faTrash,
  // faTag,
  // faCircleCheck,
  // faBan,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { Switcher } from "../../components/Switcher";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Supplier, SupplierWithRelations } from "../../../../@types/suppliers";
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  type CreateSupplierData,
  type UpdateSupplierData,
} from "./services/suppliersServices";
import {
  getSupplierCategories,
  type SupplierCategoryRecord,
} from "./services/suppliersCategoryServices";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import { SupplierDetailModal } from "./components/SupplierDetailModal";
import { SupplierFormModal } from "./components/SupplierFormModal";

export function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categoriesList, setCategoriesList] = useState<SupplierCategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de Detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithRelations | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);

  // Modal de Formulario (Creación y Edición)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [onSubmitLoading, setOnSubmitLoading] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("businessName");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const findData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resSuppliers, resCats] = await Promise.all([
        getAllSuppliers(),
        getSupplierCategories(),
      ]);

      if (resSuppliers.status === 200) {
        setSuppliers(resSuppliers.data.Supplier || []);
      }

      if (resCats.status === 200) {
        setCategoriesList(resCats.data.suppliersCategory || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los proveedores.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findSupplierByID = useCallback(async (id: string) => {
    try {
      const res = await getSupplierById(id);
      if (res.status === 200) {
        setSelectedSupplier(res.data.Supplier || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener la información del proveedor.",
          text: "Por favor, intenta nuevamente",
        });
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line 
    findData();
  }, [findData]);

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
    setOriginFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((item) => {
      // Estado
      if (statusFilter === "active" && item.status !== "Active" && item.status !== "Activo") return false;
      if (statusFilter === "inactive" && (item.status === "Active" || item.status === "Activo")) return false;

      // Tipo de persona
      if (typeFilter !== "all" && item.supplierType !== typeFilter) return false;

      // Origen
      if (originFilter === "imported" && !item.isImported) return false;
      if (originFilter === "national" && item.isImported) return false;

      // Búsqueda
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const docMatch = (item.document || "").toLowerCase().includes(q);
        const nameMatch = (item.businessName || "").toLowerCase().includes(q);
        const emailMatch = (item.email || "").toLowerCase().includes(q);
        const phoneMatch = (item.phone || "").toLowerCase().includes(q);

        return docMatch || nameMatch || emailMatch || phoneMatch;
      }

      return true;
    });
  }, [suppliers, statusFilter, typeFilter, originFilter, searchTerm]);

  // Ordenación
  const sortedSuppliers = useMemo(() => {
    if (!sortKey || !sortDir) return filteredSuppliers;

    return [...filteredSuppliers].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "document") {
        cmp = (a.document || "").localeCompare(b.document || "");
      } else if (sortKey === "businessName") {
        cmp = (a.businessName || "").localeCompare(b.businessName || "");
      } else if (sortKey === "supplierType") {
        cmp = (a.supplierType || "").localeCompare(b.supplierType || "");
      } else if (sortKey === "status") {
        cmp = (a.status || "").localeCompare(b.status || "");
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredSuppliers, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedSuppliers.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedSuppliers = useMemo(
    () => sortedSuppliers.slice(startIndex, startIndex + itemsPerPage),
    [sortedSuppliers, startIndex, itemsPerPage]
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" || statusFilter !== "all" || typeFilter !== "all" || originFilter !== "all";

  // Acciones
  const handleViewDetail = async (supplier: Supplier) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    await findSupplierByID(supplier.document);
    setIsLoadingDetail(false);
  };

  const handleOpenCreateModal = () => {
    setSelectedSupplier(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const handleEdit = async (supplier: Supplier) => {
    setIsLoadingEdit(true);
    setFormMode("edit");
    setIsFormModalOpen(true);
    await findSupplierByID(supplier.document);
    setIsLoadingEdit(false);
  };

  const handleToggleStatus = async (supplier: Supplier, nextChecked: boolean) => {
    const nextStatus = nextChecked ? "Active" : "Inactive";
    const actionText = nextChecked ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿${nextChecked ? "Activar" : "Desactivar"} proveedor?`,
      html: `¿Estás seguro de que deseas ${actionText} a <b>"${supplier.businessName}"</b> (NIT: ${supplier.document})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await updateSupplier(supplier.document, {
          supplierInfo: { status: nextStatus },
        });

        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: nextChecked ? "Proveedor activado" : "Proveedor inactivado",
            text: res.data.message || `El proveedor fue ${nextChecked ? "activado" : "inactivado"} exitosamente.`,
          });
          await findData();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: `Error al ${actionText} proveedor.`,
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    // Validación preventiva: no dejar eliminar si tiene compras asociadas
    const purchasesCount = supplier._count?.purchases ?? 0;
    if (purchasesCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `El proveedor <b>"${supplier.businessName}"</b> tiene <b>${purchasesCount}</b> compra(s) asociada(s).<br/><span class="text-xs text-app-muted mt-2 inline-block">Para proteger el histórico contable y de inventario, puedes inactivarlo usando el interruptor de estado.</span>`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar proveedor?",
      html: `¿Estás seguro de que deseas eliminar permanentemente a <b>"${supplier.businessName}"</b> (NIT: ${supplier.document})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteSupplier(supplier.document);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Proveedor eliminado",
            text: res.data.message || "El proveedor fue eliminado exitosamente.",
          });
          await findData();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar proveedor.",
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  const handleFormSubmit = async (data: CreateSupplierData | UpdateSupplierData, onClose: () => void) => {
    try {
      setOnSubmitLoading(true);
      let res;
      if (formMode === "create") {
        res = await createSupplier(data as CreateSupplierData);
      } else {
        res = await updateSupplier(selectedSupplier!.document, data as UpdateSupplierData);
      }

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || (formMode === "create" ? "Proveedor creado" : "Proveedor actualizado"),
        });
        await findData();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al guardar proveedor",
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
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faIndustry} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Proveedores
              </h1>
              <p className="text-sm text-app-muted">
                Directorio comercial de personas naturales y jurídicas para abastecimiento de calzado e insumos
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
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Tabla Principal con formato compuesto Table */}
      <Table>
        <Table.Header
          title="Directorio de Proveedores"
          description="Directorio comercial de suministros con trazabilidad a órdenes de compra"
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                id="filter-proveedor-tipo"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Tipos" },
                  { value: "Jurídica", label: "Jurídica" },
                  { value: "Natural", label: "Natural" },
                ]}
                size="sm"
              />

              <Select
                id="filter-proveedor-origen"
                value={originFilter}
                onChange={(e) => {
                  setOriginFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Orígenes" },
                  { value: "national", label: "Nacionales" },
                  { value: "imported", label: "Importados" },
                ]}
                size="sm"
              />

              <Select
                id="filter-proveedor-estado"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Todos los Estados" },
                  { value: "active", label: "Activos" },
                  { value: "inactive", label: "Inactivos" },
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
            placeholder="Buscar por NIT / Documento, razón social, correo o teléfono..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredSuppliers.length} de {suppliers.length} proveedores encontrados
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
                sortKey="document"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-36"
              >
                NIT / Doc.
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="businessName"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Razón Social / Proveedor
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="supplierType"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-32"
              >
                Tipo
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider w-40">
                Contacto
              </th>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-28">
                Origen
              </th>
              <Table.SortableCell
                sortKey="status"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-32"
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
            ) : paginatedSuppliers.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={
                  hasActiveFilters
                    ? "No se encontraron proveedores con los filtros seleccionados."
                    : "No hay proveedores registrados en el sistema actualmente."
                }
              />
            ) : (
              paginatedSuppliers.map((row) => {
                const isCompany = row.supplierType === "Jurídica" || row.supplierType === "Empresa";
                const isActive = row.status === "Active" || row.status === "Activo";

                return (
                  <Table.Row
                    key={row.document}
                    onClick={() => handleViewDetail(row)}
                  >
                    {/* Documento */}
                    <Table.Cell rounded="left">
                      <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky hover:underline">
                        {row.document}
                      </span>
                    </Table.Cell>

                    {/* Razón Social */}
                    <Table.Cell>
                      <div className="flex items-center gap-2.5 min-w-44">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={isCompany ? faBuilding : faUserTie} className="text-xs" />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-xs text-app-text truncate"
                            title={row.businessName}
                          >
                            {row.businessName}
                          </span>
                          <span className="text-[10px] text-app-muted truncate" title={row.address || ""}>
                            {row.address || "Sin dirección"}
                          </span>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Tipo */}
                    <Table.Cell>
                      <span className="text-xs font-medium text-app-text">
                        {row.supplierType}
                      </span>
                    </Table.Cell>

                    {/* Contacto */}
                    <Table.Cell>
                      <div className="flex flex-col text-xs text-app-text">
                        <span className="font-medium truncate max-w-36" title={row.email}>
                          {row.email}
                        </span>
                        <span className="text-[10px] text-app-muted font-mono">
                          {row.phone}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Origen */}
                    <Table.Cell className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.isImported
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                          }`}
                      >
                        {row.isImported && <FontAwesomeIcon icon={faGlobe} className="text-[9px]" />}
                        {row.isImported ? "Importado" : "Nacional"}
                      </span>
                    </Table.Cell>

                    {/* Estado con Switcher */}
                    <Table.Cell className="text-center">
                      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <Switcher
                          checked={isActive}
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
                          title="Editar Proveedor"
                          className="hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-royal/10 dark:hover:bg-brand-sky/15"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrash}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(row);
                          }}
                          title={
                            (row._count?.purchases ?? 0) > 0
                              ? "No se puede eliminar: tiene compras asociadas"
                              : "Eliminar Proveedor"
                          }
                          className={
                            (row._count?.purchases ?? 0) > 0
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
          totalItems={filteredSuppliers.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Detalle */}
      <SupplierDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
        isLoading={isLoadingDetail}
      />

      {/* Modal de Formulario */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSupplier(null);
        }}
        mode={formMode}
        supplier={selectedSupplier}
        categoriesList={categoriesList}
        onSubmit={handleFormSubmit}
        isLoading={isLoadingEdit}
        onSubmitLoading={onSubmitLoading}
      />
    </div>
  );
}

export default ProveedoresPage;
