import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBoxOpen,
  faCertificate,
  faEye,
  faPenToSquare,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import TypesCreateModal from "./types/components/TypesCreateModal";
import TypesUpdateModal from "./types/components/TypesUpdateModal";
import {
  createShoeType,
  deleteShoeType,
  getShoeTypeById,
  getShoeTypes,
  updateShoeType,
  type CreateShoeTypeDTO,
  type ShoeTypeRecord,
  type UpdateShoeTypeDTO,
} from "./types/services/TypesServices";

export default function TipoProducts() {
  const [shoeTypes, setShoeTypes] = useState<ShoeTypeRecord[]>([]);
  const [nextId, setNextId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [shoeTypeToEdit, setShoeTypeToEdit] = useState<ShoeTypeRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedShoeType, setSelectedShoeType] = useState<ShoeTypeRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ── Petición GET: Obtener Tipos de Calzado ──
  const loadShoeTypes = useCallback(async () => {
    const response = await getShoeTypes();
    if (response.status === 200) {
      return {
        shoeTypes: response.data.shoeTypes || [],
        nextId: response.data.nextId ?? null,
      };
    }
    return null;
  }, []);

  const fetchShoeTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadShoeTypes();
      if (data) {
        setShoeTypes(data.shoeTypes);
        setNextId(data.nextId);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los tipos de calzado.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadShoeTypes]);

  useEffect(() => {
    let active = true;
    loadShoeTypes()
      .then((data) => {
        if (active && data) {
          setShoeTypes(data.shoeTypes);
          setNextId(data.nextId);
        }
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener los tipos de calzado.",
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
  }, [loadShoeTypes]);

  // ── Petición GET: Detalle del Tipo de Calzado por ID ──
  const handleViewDetail = async (shoeTypeItem: ShoeTypeRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedShoeType(null);

    try {
      const response = await getShoeTypeById(shoeTypeItem.id);
      if (response.status === 200) {
        setSelectedShoeType(response.data.shoeType || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del tipo.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedShoeType(null);
  };

  // ── Petición POST: Crear Tipo de Calzado ──
  const handleCreateShoeType = async (data: CreateShoeTypeDTO, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createShoeType(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Tipo de calzado creado exitosamente",
        });
        await fetchShoeTypes();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear tipo de calzado",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Tipo de Calzado ──
  const handleOpenEditModal = (shoeTypeItem: ShoeTypeRecord) => {
    setShoeTypeToEdit(shoeTypeItem);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setShoeTypeToEdit(null);
  };

  const handleUpdateShoeType = async (
    id: number,
    data: UpdateShoeTypeDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateShoeType(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Tipo de calzado actualizado exitosamente",
        });
        await fetchShoeTypes();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar tipo de calzado",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición DELETE: Eliminar Tipo de Calzado ──
  const handleDeleteShoeType = async (shoeTypeItem: ShoeTypeRecord) => {
    if (shoeTypeItem.productsCount > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `El tipo de calzado <b>"${shoeTypeItem.name}"</b> tiene <b>${shoeTypeItem.productsCount}</b> producto(s) asociado(s) en el catálogo.`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar tipo de calzado?",
      html: `¿Estás seguro de que deseas eliminar permanentemente el tipo <b>"${shoeTypeItem.name}"</b> (#${shoeTypeItem.id})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteShoeType(shoeTypeItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Tipo de calzado eliminado",
            text: res.data.message || "El tipo de calzado fue eliminado exitosamente.",
          });
          await fetchShoeTypes();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar tipo de calzado",
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
  const filteredShoeTypes = useMemo(() => {
    if (!searchTerm.trim()) return shoeTypes;
    const q = searchTerm.toLowerCase().trim();
    return shoeTypes.filter(
      (item) =>
        String(item.id).includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [shoeTypes, searchTerm]);

  // Ordenación
  const sortedShoeTypes = useMemo(() => {
    if (!sortKey || !sortDir) return filteredShoeTypes;

    return [...filteredShoeTypes].sort((a, b) => {
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
  }, [filteredShoeTypes, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedShoeTypes.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedShoeTypes = useMemo(
    () => sortedShoeTypes.slice(startIndex, startIndex + itemsPerPage),
    [sortedShoeTypes, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faCertificate} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Tipos de Calzado
            </h1>
            <p className="text-sm text-app-muted">
              Clasificación por origen y gama del calzado comercializado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchShoeTypes}
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
            Nuevo Tipo
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Tipos de Calzado Registrados"
          description="Listado maestro de estilos y tipos de calzado vinculados al catálogo"
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar tipo de calzado por ID o nombre..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredShoeTypes.length} de {shoeTypes.length} tipos encontrados
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
                Tipo de Calzado
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
                  <Table.Cell rounded="left" colSpan={4} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedShoeTypes.length === 0 ? (
              <Table.Empty
                colSpan={4}
                message={
                  hasActiveFilters
                    ? "No se encontraron tipos de calzado con la búsqueda actual."
                    : "No hay tipos de zapato registrados en el catálogo."
                }
              />
            ) : (
              paginatedShoeTypes.map((row) => (
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

                  {/* Nombre */}
                  <Table.Cell className="max-w-[260px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                        <FontAwesomeIcon icon={faCertificate} className="text-xs" />
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
                        title="Editar Tipo"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteShoeType(row);
                        }}
                        title={
                          row.productsCount > 0
                            ? "No se puede eliminar: tiene productos asociados"
                            : "Eliminar Tipo"
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
          totalItems={filteredShoeTypes.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación */}
      <TypesCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nextId={nextId}
        onSubmit={handleCreateShoeType}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición */}
      <TypesUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        shoeTypeItem={shoeTypeToEdit}
        onSubmit={handleUpdateShoeType}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle de Tipo de Calzado"
        description={
          selectedShoeType
            ? `Información y productos asociados a "${selectedShoeType.name}"`
            : "Consultando detalle del tipo de calzado..."
        }
        icon={faCertificate}
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
        ) : !selectedShoeType ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información del tipo de calzado solicitado.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  <FontAwesomeIcon icon={faCertificate} className="text-xl" />
                </span>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                    Tipo #{selectedShoeType.id}
                  </span>
                  <h3 className="text-lg font-black text-app-text truncate">
                    {selectedShoeType.name}
                  </h3>
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
                {selectedShoeType.productsCount}{" "}
                {selectedShoeType.productsCount === 1 ? "producto" : "productos"}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
