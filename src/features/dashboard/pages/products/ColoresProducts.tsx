import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBoxOpen,
  faEye,
  faHashtag,
  faPalette,
  faPenToSquare,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import ColorsCreateModal from "./colors/components/colorsCreateModal";
import ColorsUpdateModal from "./colors/components/colorsUpdateModal";
import {
  createColor,
  deleteColor,
  getColorById,
  getColors,
  updateColor,
  type ColorRecord,
  type CreateColorDTO,
  type UpdateColorDTO,
} from "./colors/services/colorsServicies";

export default function ColoresProducts() {
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [colorToEdit, setColorToEdit] = useState<ColorRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<ColorRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Petición GET: Obtener Colores ──
  const loadColors = useCallback(async () => {
    const response = await getColors();
    if (response.status === 200) {
      return {
        colors: response.data.colors || [],
        nextId: response.data.nextId ?? null,
      };
    }
    return null;
  }, []);

  const fetchColors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadColors();
      if (data) {
        setColors(data.colors);
        setNextId(data.nextId);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los colores.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadColors]);

  useEffect(() => {
    let active = true;
    loadColors()
      .then((data) => {
        if (active && data) {
          setColors(data.colors);
          setNextId(data.nextId);
        }
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener los colores.",
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
  }, [loadColors]);

  // ── Petición GET: Detalle del Color por ID ──
  const handleViewDetail = async (colorItem: ColorRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedColor(null);

    try {
      const response = await getColorById(colorItem.id);
      if (response.status === 200) {
        setSelectedColor(response.data.color || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del color.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedColor(null);
  };

  // ── Petición POST: Crear Color ──
  const handleCreateColor = async (data: CreateColorDTO, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createColor(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Color creado exitosamente",
        });
        await fetchColors();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear color",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Color ──
  const handleOpenEditModal = (colorItem: ColorRecord) => {
    setColorToEdit(colorItem);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setColorToEdit(null);
  };

  const handleUpdateColor = async (
    id: number,
    data: UpdateColorDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateColor(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Color actualizado exitosamente",
        });
        await fetchColors();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar color",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición DELETE: Eliminar Color ──
  const handleDeleteColor = async (colorItem: ColorRecord) => {
    if (colorItem.productsCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `El color <b>"${colorItem.color}"</b> está asociado a <b>${colorItem.productsCount}</b> producto(s) en el inventario.`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar color?",
      html: `¿Estás seguro de que deseas eliminar permanentemente el color <b>"${colorItem.color}"</b> (${colorItem.hex})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteColor(colorItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Color eliminado",
            text: res.data.message || "El color fue eliminado exitosamente.",
          });
          await fetchColors();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar color",
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
  const filteredColors = useMemo(() => {
    if (!searchTerm.trim()) return colors;
    const q = searchTerm.toLowerCase().trim();
    return colors.filter(
      (item) =>
        String(item.id).includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.hex.toLowerCase().includes(q)
    );
  }, [colors, searchTerm]);

  // Ordenación
  const sortedColors = useMemo(() => {
    if (!sortKey || !sortDir) return filteredColors;

    return [...filteredColors].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "color") {
        cmp = a.color.localeCompare(b.color);
      } else if (sortKey === "hex") {
        cmp = a.hex.localeCompare(b.hex);
      } else if (sortKey === "productsCount") {
        cmp = a.productsCount - b.productsCount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredColors, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedColors.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedColors = useMemo(
    () => sortedColors.slice(startIndex, startIndex + itemsPerPage),
    [sortedColors, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faPalette} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Gestión de Colores
            </h1>
            <p className="text-sm text-app-muted">
              Paleta cromática oficial de referencia para variantes de calzado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchColors}
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
            Nuevo Color
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Paleta de Colores Registrados"
          description="Listado maestro de colores y códigos hexadecimales vinculados al inventario"
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar color por ID, nombre o código HEX..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredColors.length} de {colors.length} colores encontrados
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
                sortKey="color"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Color
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="hex"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Código HEX
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
            ) : paginatedColors.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={
                  hasActiveFilters
                    ? "No se encontraron colores con la búsqueda actual."
                    : "No hay colores registrados en el sistema."
                }
              />
            ) : (
              paginatedColors.map((row) => (
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

                  {/* Color (muestra visual + nombre) */}
                  <Table.Cell className="max-w-[220px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-8 w-8 shrink-0 rounded-lg border border-app-border shadow-xs"
                        style={{ backgroundColor: row.hex }}
                        title={row.hex}
                      />
                      <span
                        className="font-bold text-xs text-app-text truncate"
                        title={row.color}
                      >
                        {row.color}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Código HEX */}
                  <Table.Cell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-app-surface-alt border border-app-border px-2.5 py-1 font-mono text-xs font-semibold text-app-text uppercase">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-app-border"
                        style={{ backgroundColor: row.hex }}
                      />
                      {row.hex}
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
                        title="Editar Color"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColor(row);
                        }}
                        title={
                          row.productsCount > 0
                            ? "No se puede eliminar: asociado a productos"
                            : "Eliminar Color"
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
          totalItems={filteredColors.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Color */}
      <ColorsCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nextId={nextId}
        onSubmit={handleCreateColor}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Color */}
      <ColorsUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        colorItem={colorToEdit}
        onSubmit={handleUpdateColor}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle del Color */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle del Color"
        description={
          selectedColor
            ? `Información cromática y uso en inventario de "${selectedColor.color}"`
            : "Consultando detalle del color..."
        }
        icon={faPalette}
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
            <div className="h-24 bg-app-border/40 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3.5">
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
            </div>
          </div>
        ) : !selectedColor ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información del color solicitado.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className="h-14 w-14 shrink-0 rounded-2xl border border-app-border shadow-sm"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                    Color #{selectedColor.id}
                  </span>
                  <h3 className="text-lg font-black text-app-text truncate">
                    {selectedColor.color}
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon
                    icon={faHashtag}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Código HEX
                </span>
                <p className="font-mono text-sm font-bold text-app-text uppercase">
                  {selectedColor.hex}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Productos Asociados
                </span>
                <p className="text-sm font-bold text-brand-royal dark:text-brand-sky">
                  {selectedColor.productsCount}{" "}
                  {selectedColor.productsCount === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
