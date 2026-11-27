import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faArrowRotateRight,
  faBoxOpen,
  faEye,
  faLayerGroup,
  faPenToSquare,
  faPlus,
  faTags,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import CategoriesCreateModal from "./categories/components/categoriesCreateModal";
import CategoriesUpdateModal from "./categories/components/catogoriesUpdateModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  type CategoryRecord,
  type CreateProductCategoryDTO,
  type UpdateProductCategoryDTO,
} from "./categories/services/categoriesServices";

export default function CategoriaProduct() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Petición GET: Obtener Categorías ──
  const loadCategories = useCallback(async () => {
    const response = await getCategories();
    if (response.status === 200) {
      return {
        categories: response.data.categories || [],
        nextId: response.data.nextId ?? null,
      };
    }
    return null;
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadCategories();
      if (data) {
        setCategories(data.categories);
        setNextId(data.nextId);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las categorías.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadCategories]);

  useEffect(() => {
    let active = true;
    loadCategories()
      .then((data) => {
        if (active && data) {
          setCategories(data.categories);
          setNextId(data.nextId);
        }
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener las categorías.",
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
  }, [loadCategories]);

  // ── Petición GET: Detalle de Categoría por ID ──
  const handleViewDetail = async (categoryItem: CategoryRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedCategory(null);

    try {
      const response = await getCategoryById(categoryItem.id);
      if (response.status === 200) {
        setSelectedCategory(response.data.category || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle de la categoría.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCategory(null);
  };

  // ── Petición POST: Crear Categoría ──
  const handleCreateCategory = async (
    data: CreateProductCategoryDTO,
    onClose: () => void
  ) => {
    try {
      setIsCreating(true);
      const res = await createCategory(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Categoría creada exitosamente",
        });
        await fetchCategories();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear categoría",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Categoría ──
  const handleOpenEditModal = (categoryItem: CategoryRecord) => {
    setCategoryToEdit(categoryItem);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleUpdateCategory = async (
    id: number,
    data: UpdateProductCategoryDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateCategory(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Categoría actualizada exitosamente",
        });
        await fetchCategories();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar categoría",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición DELETE: Eliminar Categoría ──
  const handleDeleteCategory = async (categoryItem: CategoryRecord) => {
    if (categoryItem.productsCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `La categoría <b>"${categoryItem.name}"</b> tiene <b>${categoryItem.productsCount}</b> producto(s) asociado(s) en el catálogo.`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar categoría?",
      html: `¿Estás seguro de que deseas eliminar permanentemente la categoría <b>"${categoryItem.name}"</b> (#${categoryItem.id})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteCategory(categoryItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Categoría eliminada",
            text: res.data.message || "La categoría fue eliminada exitosamente.",
          });
          await fetchCategories();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar categoría",
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
    setCurrentPage(1);
  };

  // Filtrado
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase().trim();
    return categories.filter(
      (item) =>
        String(item.id).includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  // Ordenación
  const sortedCategories = useMemo(() => {
    if (!sortKey || !sortDir) return filteredCategories;

    return [...filteredCategories].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "productsCount") {
        cmp = a.productsCount - b.productsCount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredCategories, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedCategories = useMemo(
    () => sortedCategories.slice(startIndex, startIndex + itemsPerPage),
    [sortedCategories, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faLayerGroup} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Categorías de Producto
            </h1>
            <p className="text-sm text-app-muted">
              Clasificación de líneas de calzado según su uso y estilo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchCategories}
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
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Categorías del Catálogo"
          description="Listado maestro de categorías y productos asociados en inventario"
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar categoría por ID, nombre o descripción..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredCategories.length} de {categories.length} categorías encontradas
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
                Categoría
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Descripción
              </th>
              <Table.SortableCell
                sortKey="productsCount"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Productos
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
            ) : paginatedCategories.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={
                  hasActiveFilters
                    ? "No se encontraron categorías con la búsqueda actual."
                    : "No hay categorías registradas en el catálogo."
                }
              />
            ) : (
              paginatedCategories.map((row) => (
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

                  {/* Nombre de la categoría */}
                  <Table.Cell className="max-w-[200px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                        <FontAwesomeIcon icon={faTags} className="text-xs" />
                      </span>
                      <span
                        className="font-bold text-xs text-app-text truncate"
                        title={row.name}
                      >
                        {row.name}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Descripción */}
                  <Table.Cell className="max-w-[280px]">
                    <span
                      className="text-xs text-app-muted truncate block"
                      title={row.description}
                    >
                      {row.description || "Sin descripción"}
                    </span>
                  </Table.Cell>

                  {/* Productos asociados */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 dark:border-brand-sky/25 px-2.5 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-[11px]" />
                      {row.productsCount}{" "}
                      {row.productsCount === 1 ? "producto" : "productos"}
                    </span>
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
                        title="Editar Categoría"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(row);
                        }}
                        title={
                          row.productsCount > 0
                            ? "No se puede eliminar: tiene productos asociados"
                            : "Eliminar Categoría"
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
          totalItems={filteredCategories.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Categoría */}
      <CategoriesCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nextId={nextId}
        onSubmit={handleCreateCategory}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Categoría */}
      <CategoriesUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        categoryItem={categoryToEdit}
        onSubmit={handleUpdateCategory}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle de Categoría */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle de Categoría"
        description={
          selectedCategory
            ? `Información completa de la categoría "${selectedCategory.name}"`
            : "Consultando detalle de la categoría..."
        }
        icon={faLayerGroup}
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
            <div className="h-24 bg-app-border/40 rounded-xl" />
          </div>
        ) : !selectedCategory ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información de la categoría solicitada.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  <FontAwesomeIcon icon={faTags} className="text-xl" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                    Categoría #{selectedCategory.id}
                  </span>
                  <h3 className="text-lg font-black text-app-text truncate">
                    {selectedCategory.name}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 dark:border-brand-sky/25 px-3 py-1.5 text-xs font-bold text-brand-royal dark:text-brand-sky shrink-0">
                <FontAwesomeIcon icon={faBoxOpen} className="text-[11px]" />
                {selectedCategory.productsCount}{" "}
                {selectedCategory.productsCount === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-2">
                <FontAwesomeIcon
                  icon={faAlignLeft}
                  className="text-brand-royal dark:text-brand-sky"
                />
                Descripción
              </span>
              <p className="text-sm text-app-text leading-relaxed">
                {selectedCategory.description || "Sin descripción registrada."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
