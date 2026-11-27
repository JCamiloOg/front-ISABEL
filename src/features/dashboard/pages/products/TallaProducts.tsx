import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBoxOpen,
  faEye,
  faGlobe,
  faMars,
  faPenToSquare,
  faPlus,
  faRulerCombined,
  faTrash,
  faVenus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import SizesCreateModal from "./sizes/components/SizesCreateModal";
import SizesUpdateModal from "./sizes/components/SizesUpdateModal";
import {
  createSize,
  deleteSize,
  getSizeById,
  getSizes,
  updateSize,
  type CreateSizeDTO,
  type SizeRecord,
  type UpdateSizeDTO,
} from "./sizes/services/SizesServices";

const isFemaleGender = (gender: string): boolean => {
  const lower = gender.trim().toLowerCase();
  return lower === "femenino" || lower === "mujer";
};

const formatGenderLabel = (gender: string): string => {
  const lower = gender.trim().toLowerCase();
  if (lower === "femenino" || lower === "mujer") return "Femenino";
  if (lower === "masculino" || lower === "hombre") return "Masculino";
  return gender;
};

export default function TallaProducts() {
  const [sizes, setSizes] = useState<SizeRecord[]>([]);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [sizeToEdit, setSizeToEdit] = useState<SizeRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<SizeRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Filtros, búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Petición GET: Obtener Tallas ──
  const loadSizes = useCallback(async () => {
    const response = await getSizes();
    if (response.status === 200) {
      return {
        sizes: response.data.sizes || [],
        nextId: response.data.nextId ?? null,
      };
    }
    return null;
  }, []);

  const fetchSizes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadSizes();
      if (data) {
        setSizes(data.sizes);
        setNextId(data.nextId);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las tallas.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadSizes]);

  useEffect(() => {
    let active = true;
    loadSizes()
      .then((data) => {
        if (active && data) {
          setSizes(data.sizes);
          setNextId(data.nextId);
        }
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener las tallas.",
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
  }, [loadSizes]);

  // ── Petición GET: Detalle de la Talla por ID ──
  const handleViewDetail = async (sizeItem: SizeRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedSize(null);

    try {
      const response = await getSizeById(sizeItem.id);
      if (response.status === 200) {
        setSelectedSize(response.data.size || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle de la talla.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSize(null);
  };

  // ── Petición POST: Crear Talla ──
  const handleCreateSize = async (data: CreateSizeDTO, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createSize(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Talla creada exitosamente",
        });
        await fetchSizes();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear talla",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Talla ──
  const handleOpenEditModal = (sizeItem: SizeRecord) => {
    setSizeToEdit(sizeItem);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSizeToEdit(null);
  };

  const handleUpdateSize = async (
    id: number,
    data: UpdateSizeDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateSize(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Talla actualizada exitosamente",
        });
        await fetchSizes();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar talla",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición DELETE: Eliminar Talla ──
  const handleDeleteSize = async (sizeItem: SizeRecord) => {
    if (sizeItem.variantsCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `La talla <b>"${sizeItem.sizeNumber}"</b> (${formatGenderLabel(sizeItem.gender)}) tiene <b>${sizeItem.variantsCount}</b> variante(s) asociada(s) en el inventario.`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar talla?",
      html: `¿Estás seguro de que deseas eliminar permanentemente la talla <b>"${sizeItem.sizeNumber}"</b> (${formatGenderLabel(sizeItem.gender)})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteSize(sizeItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Talla eliminada",
            text: res.data.message || "La talla fue eliminada exitosamente.",
          });
          await fetchSizes();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar talla",
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
    setGenderFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredSizes = useMemo(() => {
    return sizes.filter((item) => {
      if (genderFilter === "Masculino" && isFemaleGender(item.gender)) return false;
      if (genderFilter === "Femenino" && !isFemaleGender(item.gender)) return false;

      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        return (
          String(item.id).includes(q) ||
          item.sizeNumber.toLowerCase().includes(q) ||
          item.internationalSize.toLowerCase().includes(q) ||
          item.gender.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [sizes, genderFilter, searchTerm]);

  // Ordenación
  const sortedSizes = useMemo(() => {
    if (!sortKey || !sortDir) return filteredSizes;

    return [...filteredSizes].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "sizeNumber") {
        cmp = a.sizeNumber.localeCompare(b.sizeNumber, undefined, { numeric: true });
      } else if (sortKey === "internationalSize") {
        cmp = a.internationalSize.localeCompare(b.internationalSize);
      } else if (sortKey === "gender") {
        cmp = a.gender.localeCompare(b.gender);
      } else if (sortKey === "variantsCount") {
        cmp = a.variantsCount - b.variantsCount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredSizes, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedSizes.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedSizes = useMemo(
    () => sortedSizes.slice(startIndex, startIndex + itemsPerPage),
    [sortedSizes, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || genderFilter !== "all";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faRulerCombined} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Gestión de Tallas
            </h1>
            <p className="text-sm text-app-muted">
              Catálogo de tallas locales y conversiones internacionales por género
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchSizes}
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
            Nueva Talla
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Tallas del Catálogo"
          description="Listado maestro de tallas locales, equivalencias internacionales y variantes asociadas"
          action={
            <Select
              id="filter-size-gender"
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Género: Todos" },
                { value: "Masculino", label: "Masculino" },
                { value: "Femenino", label: "Femenino" },
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
            placeholder="Buscar talla por ID, número, talla internacional o género..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredSizes.length} de {sizes.length} tallas encontradas
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
                sortKey="sizeNumber"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Talla
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="internationalSize"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Internacional
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="gender"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Género
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="variantsCount"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Variantes
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
                  <Table.Cell rounded="left" colSpan={6} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedSizes.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron tallas con los filtros seleccionados."
                    : "No hay tallas registradas en el catálogo."
                }
              />
            ) : (
              paginatedSizes.map((row) => {
                const isFemale = isFemaleGender(row.gender);

                return (
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

                    {/* Número de Talla */}
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                          <FontAwesomeIcon icon={faRulerCombined} className="text-xs" />
                        </span>
                        <span className="font-bold text-xs text-app-text">
                          Talla {row.sizeNumber}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Talla Internacional */}
                    <Table.Cell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-app-surface-alt border border-app-border px-2.5 py-1 font-mono text-xs font-semibold text-app-text">
                        <FontAwesomeIcon
                          icon={faGlobe}
                          className="text-[10px] text-brand-royal dark:text-brand-sky"
                        />
                        {row.internationalSize}
                      </span>
                    </Table.Cell>

                    {/* Género */}
                    <Table.Cell className="text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          isFemale
                            ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            : "border-brand-royal/25 bg-brand-royal/10 text-brand-royal dark:border-brand-sky/25 dark:bg-brand-sky/15 dark:text-brand-sky"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={isFemale ? faVenus : faMars}
                          className="text-[10px]"
                        />
                        {formatGenderLabel(row.gender)}
                      </span>
                    </Table.Cell>

                    {/* Variantes asociadas */}
                    <Table.Cell className="text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 dark:border-brand-sky/25 px-2.5 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-[11px]" />
                        {row.variantsCount}{" "}
                        {row.variantsCount === 1 ? "variante" : "variantes"}
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
                          title="Editar Talla"
                          className="hover:text-brand-royal dark:hover:text-brand-sky"
                        />

                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrash}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSize(row);
                          }}
                          title={
                            row.variantsCount > 0
                              ? "No se puede eliminar: tiene variantes asociadas"
                              : "Eliminar Talla"
                          }
                          className={
                            row.variantsCount > 0
                              ? "opacity-40 text-app-muted hover:bg-transparent cursor-not-allowed"
                              : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
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
          totalItems={filteredSizes.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Talla */}
      <SizesCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nextId={nextId}
        onSubmit={handleCreateSize}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Talla */}
      <SizesUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        sizeItem={sizeToEdit}
        onSubmit={handleUpdateSize}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle de Talla */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle de Talla"
        description={
          selectedSize
            ? `Información y equivalencia de la talla ${selectedSize.sizeNumber}`
            : "Consultando detalle de la talla..."
        }
        icon={faRulerCombined}
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
            <div className="grid grid-cols-2 gap-3.5">
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
            </div>
          </div>
        ) : !selectedSize ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información de la talla solicitada.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  <FontAwesomeIcon icon={faRulerCombined} className="text-xl" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                    Talla #{selectedSize.id}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <h3 className="text-lg font-black text-app-text">
                      Talla {selectedSize.sizeNumber}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        isFemaleGender(selectedSize.gender)
                          ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "border-brand-royal/25 bg-brand-royal/10 text-brand-royal dark:border-brand-sky/25 dark:bg-brand-sky/15 dark:text-brand-sky"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isFemaleGender(selectedSize.gender) ? faVenus : faMars}
                        className="text-[10px]"
                      />
                      {formatGenderLabel(selectedSize.gender)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Equivalencia Internacional
                </span>
                <p className="font-mono text-sm font-bold text-app-text">
                  {selectedSize.internationalSize}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Variantes Asociadas
                </span>
                <p className="text-sm font-bold text-brand-royal dark:text-brand-sky">
                  {selectedSize.variantsCount}{" "}
                  {selectedSize.variantsCount === 1 ? "variante" : "variantes"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
