import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faAward,
  faBan,
  faBoxOpen,
  faCircleCheck,
  faEye,
  faPenToSquare,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { Switcher } from "../../components/Switcher";
import BrandsCreateModal from "./brands/components/brandsCreateModal";
import BrandsUpdateModal from "./brands/components/brandsUpdateModal";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
  updateBrandStatus,
  type BrandRecord,
  type CreateBrandDTO,
  type UpdateBrandDTO,
} from "./brands/services/brandsServices";

export default function MarcaProducts() {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [brandToEdit, setBrandToEdit] = useState<BrandRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Filtros, búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Petición GET: Obtener Marcas ──
  const loadBrands = useCallback(async () => {
    const response = await getBrands();
    if (response.status === 200) {
      return {
        brands: response.data.brands || [],
        nextId: response.data.nextId ?? null,
      };
    }
    return null;
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadBrands();
      if (data) {
        setBrands(data.brands);
        setNextId(data.nextId);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las marcas.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadBrands]);

  useEffect(() => {
    let active = true;
    loadBrands()
      .then((data) => {
        if (active && data) {
          setBrands(data.brands);
          setNextId(data.nextId);
        }
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener las marcas.",
            text: "Por favor, intenta nuevamente",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadBrands]);

  // ── Petición GET: Detalle de la Marca por ID ──
  const handleViewDetail = async (brandItem: BrandRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedBrand(null);

    try {
      const response = await getBrandById(brandItem.id);
      if (response.status === 200) {
        setSelectedBrand(response.data.brand || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle de la marca.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBrand(null);
  };

  // ── Petición POST: Crear Marca ──
  const handleCreateBrand = async (data: CreateBrandDTO, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createBrand(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Marca creada exitosamente",
        });
        await fetchBrands();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear marca",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Marca ──
  const handleOpenEditModal = (brandItem: BrandRecord) => {
    setBrandToEdit(brandItem);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setBrandToEdit(null);
  };

  const handleUpdateBrand = async (
    id: number,
    data: UpdateBrandDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateBrand(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Marca actualizada exitosamente",
        });
        await fetchBrands();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar marca",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición PATCH: Cambiar Estado de la Marca ──
  const handleToggleStatus = async (brandItem: BrandRecord, nextChecked: boolean) => {
    const actionText = nextChecked ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿${nextChecked ? "Activar" : "Desactivar"} marca?`,
      html: `¿Estás seguro de que deseas ${actionText} la marca <b>"${brandItem.name}"</b> (#${brandItem.id})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await updateBrandStatus(brandItem.id);

        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: nextChecked ? "Marca activada" : "Marca desactivada",
            text:
              res.data.message ||
              `La marca ahora está ${nextChecked ? "activa" : "inactiva"}.`,
          });
          await fetchBrands();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: `Error al ${actionText} marca`,
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  // ── Petición DELETE: Eliminar Marca ──
  const handleDeleteBrand = async (brandItem: BrandRecord) => {
    if (brandItem.productsCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `La marca <b>"${brandItem.name}"</b> tiene <b>${brandItem.productsCount}</b> producto(s) asociado(s) en el catálogo.<br/><span class="text-xs text-app-muted mt-2 inline-block">Puedes desactivarla usando el interruptor de estado.</span>`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar marca?",
      html: `¿Estás seguro de que deseas eliminar permanentemente la marca <b>"${brandItem.name}"</b> (#${brandItem.id})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteBrand(brandItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Marca eliminada",
            text: res.data.message || "La marca fue eliminada exitosamente.",
          });
          await fetchBrands();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar marca",
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

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
  const filteredBrands = useMemo(() => {
    return brands.filter((item) => {
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;

      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        return (
          String(item.id).includes(q) ||
          item.name.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [brands, statusFilter, searchTerm]);

  // Ordenación
  const sortedBrands = useMemo(() => {
    if (!sortKey || !sortDir) return filteredBrands;

    return [...filteredBrands].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "productsCount") {
        cmp = a.productsCount - b.productsCount;
      } else if (sortKey === "status") {
        cmp = a.status === b.status ? 0 : a.status ? 1 : -1;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredBrands, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedBrands.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedBrands = useMemo(
    () => sortedBrands.slice(startIndex, startIndex + itemsPerPage),
    [sortedBrands, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faAward} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Marcas de Producto
            </h1>
            <p className="text-sm text-app-muted">
              Gestión de fabricantes y sellos comerciales de calzado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchBrands}
            disabled={isLoading}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nueva Marca
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Marcas del Catálogo"
          description="Listado maestro de marcas, estado operativo y productos asociados"
          action={
            <Select
              id="filter-brand-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "active", label: "Activas" },
                { value: "inactive", label: "Inactivas" },
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
            placeholder="Buscar marca por ID o nombre comercial..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredBrands.length} de {brands.length} marcas encontradas
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
                className="w-20"
              >
                ID
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Marca
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="productsCount"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Productos
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="status"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Estado
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider">
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
            ) : paginatedBrands.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={
                  hasActiveFilters
                    ? "No se encontraron marcas con los filtros seleccionados."
                    : "No hay marcas registradas en el catálogo."
                }
              />
            ) : (
              paginatedBrands.map((row) => (
                <Table.Row
                  key={row.id}
                  onClick={() => handleViewDetail(row)}
                >
                  {/* ID */}
                  <Table.Cell rounded="left" className="whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                      #{row.id}
                    </span>
                  </Table.Cell>

                  {/* Nombre de la marca */}
                  <Table.Cell className="max-w-[240px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                        <FontAwesomeIcon icon={faAward} className="text-xs" />
                      </span>
                      <span
                        className="font-bold text-xs text-app-text truncate"
                        title={row.name}
                      >
                        {row.name}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Productos asociados */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 dark:border-brand-sky/25 px-2.5 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-[11px]" />
                      {row.productsCount}{" "}
                      {row.productsCount === 1 ? "producto" : "productos"}
                    </span>
                  </Table.Cell>

                  {/* Estado */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switcher
                        checked={Boolean(row.status)}
                        onChange={(checked) => handleToggleStatus(row, checked)}
                        size="sm"
                        showLabel={true}
                      />
                    </div>
                  </Table.Cell>

                  {/* Acciones */}
                  <Table.Cell rounded="right" className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faEye}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(row);
                        }}
                        title="Ver Detalle"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faPenToSquare}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(row);
                        }}
                        title="Editar Marca"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrand(row);
                        }}
                        title={
                          row.productsCount > 0
                            ? "No se puede eliminar: tiene productos asociados"
                            : "Eliminar Marca"
                        }
                        className={
                          row.productsCount > 0
                            ? "opacity-40 text-app-muted hover:bg-transparent cursor-not-allowed"
                            : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                        }
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredBrands.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Marca */}
      <BrandsCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nextId={nextId}
        onSubmit={handleCreateBrand}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Marca */}
      <BrandsUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        brandItem={brandToEdit}
        onSubmit={handleUpdateBrand}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle de Marca */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle de Marca"
        description={
          selectedBrand
            ? `Información comercial y productos asociados a "${selectedBrand.name}"`
            : "Consultando detalle de la marca..."
        }
        icon={faAward}
        size="md"
        footer={
          <div className="flex w-full justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={faXmark}
              onClick={handleCloseDetailModal}
            >
              Cerrar
            </Button>
          </div>
        }
      >
        {isLoadingDetail ? (
          <div className="space-y-4 py-6 animate-pulse">
            <div className="h-20 bg-app-border/40 rounded-2xl" />
            <div className="h-16 bg-app-border/40 rounded-xl" />
          </div>
        ) : !selectedBrand ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información de la marca solicitada.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  <FontAwesomeIcon icon={faAward} className="text-xl" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                    Marca #{selectedBrand.id}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <h3 className="text-lg font-black text-app-text truncate">
                      {selectedBrand.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        selectedBrand.status
                          ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={selectedBrand.status ? faCircleCheck : faBan}
                        className="text-[10px]"
                      />
                      {selectedBrand.status ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-brand-royal dark:text-brand-sky"
                />
                Productos Asociados
              </span>
              <span className="text-sm font-bold text-brand-royal dark:text-brand-sky">
                {selectedBrand.productsCount}{" "}
                {selectedBrand.productsCount === 1 ? "producto" : "productos"}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
