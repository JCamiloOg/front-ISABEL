import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faPlus,
  faArrowRotateRight,
  // faBan,
  // faBuilding,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { isAxiosError } from "axios";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import Table from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import {
  createSupplierCategory,
  deleteSupplierCategory,
  getSupplierCategories,
  updateSupplierCategory,
  type SupplierCategoryData,
  type SupplierCategoryRecord,
} from "./services/suppliersCategoryServices";

const showLoadError = (error: unknown) => {
  Toast.fire({
    icon: "error",
    title: isAxiosError(error)
      ? error.response?.data?.message || "Error al obtener las categorías."
      : "Error al obtener las categorías.",
    text: "Por favor, intenta nuevamente.",
  });
};

export default function CategoriaProveedor() {
  const [categories, setCategories] = useState<SupplierCategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<SupplierCategoryRecord | null>(null);
  const [formData, setFormData] = useState<SupplierCategoryData>({ name: "", description: "" });
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSupplierCategories();
      setCategories(response.data.suppliersCategory);
    } catch (error) {
      showLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getSupplierCategories()
      .then((response) => {
        if (isCurrent) setCategories(response.data.suppliersCategory);
      })
      .catch((error: unknown) => {
        if (isCurrent) showLoadError(error);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return categories.filter((category) => {
      const supplierCount = category.suppliers?.length ?? 0;
      if (supplierFilter === "assigned" && supplierCount === 0) return false;
      if (supplierFilter === "unassigned" && supplierCount > 0) return false;
      if (!query) return true;

      return (
        category.name.toLocaleLowerCase().includes(query) ||
        category.description.toLocaleLowerCase().includes(query) ||
        (category.suppliers ?? []).some(({ supplier }) =>
          [supplier.businessName, supplier.document, supplier.email].some((value) =>
            value.toLocaleLowerCase().includes(query),
          ),
        )
      );
    });
  }, [categories, searchTerm, supplierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedCategories = useMemo(
    () => filteredCategories.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage),
    [filteredCategories, activePage, itemsPerPage],
  );

  // const categoriesWithSuppliers = categories.filter((category) => (category.suppliers?.length ?? 0) > 0).length;
  // const categoriesWithoutSuppliers = categories.length - categoriesWithSuppliers;

  const resetFilters = () => {
    setSearchTerm("");
    setSupplierFilter("all");
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setCategoryToEdit(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: SupplierCategoryRecord) => {
    setCategoryToEdit(category);
    setFormData({ name: category.name, description: category.description });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setCategoryToEdit(null);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    if (!data.name) {
      setFormError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setIsSaving(true);
      const response = categoryToEdit
        ? await updateSupplierCategory(categoryToEdit.id, data)
        : await createSupplierCategory(data);

      Toast.fire({
        icon: "success",
        title: response.data.message,
      });
      setIsModalOpen(false);
      setCategoryToEdit(null);
      setCurrentPage(1);
      await loadCategories();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: isAxiosError(error)
          ? error.response?.data?.message || "Error al guardar la categoría."
          : "Error al guardar la categoría.",
        text: "Por favor, revisa los datos e intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: SupplierCategoryRecord) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar categoría?",
      text: `Se eliminará "${category.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await deleteSupplierCategory(category.id);
      Toast.fire({ icon: "success", title: response.data.message });
      setCurrentPage(1);
      await loadCategories();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: isAxiosError(error)
          ? error.response?.data?.message || "Error al eliminar la categoría."
          : "Error al eliminar la categoría.",
        text: "Por favor, intenta nuevamente.",
      });
    }
  };

  const hasActiveFilters = searchTerm.trim() !== "" || supplierFilter !== "all";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faTags} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Categorías de Proveedor
              </h1>
              <p className="text-sm text-app-muted">
                Clasificación de proveedores comerciales de mercancía e insumos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={resetFilters}
          >
            Restablecer
          </Button>

          <Button
            variant="primary"
            icon={faPlus}
            onClick={openCreateModal}
          >
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* ─── Métricas ─── */}
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"> */}
      {/* <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Categorías</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faTags} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-app-text mt-2">{categories.length}</p>
          <p className="mt-1 text-xs text-app-muted">Clasificaciones registradas</p>
        </div>  */}

      {/* <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Con proveedores</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faBuilding} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{categoriesWithSuppliers}</p>
          <p className="mt-1 text-xs text-app-muted">Con proveedores asociados</p>
        </div> */}

      {/* <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Sin proveedores</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{categoriesWithoutSuppliers}</p>
          <p className="mt-1 text-xs text-app-muted">Disponibles para asignar</p>
        </div> */}
      {/* </div> */}

      {/* ─── Tabla Principal (mismo formato que ColoresProducts) ─── */}
      <Table>
        <Table.Header
          title="Categorías Registradas"
          description="Listado maestro de categorías y proveedores asociados"
        />

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Table.Search
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre o descripción..."
            />
          </div>
          <div>
            <Select
              options={[
                { value: "all", label: "Proveedores: Todos" },
                { value: "assigned", label: "Con proveedores" },
                { value: "unassigned", label: "Sin proveedores" },
              ]}
              value={supplierFilter}
              onChange={(event) => {
                setSupplierFilter(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
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
              onClick={resetFilters}
            >
              Restablecer filtros
            </Button>
          </div>
        )}

        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <th className="px-4 py-3 font-bold select-none text-left text-app-muted text-xs uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 font-bold select-none text-left text-app-muted text-xs uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider">
                Proveedores
              </th>
              <th className="px-4 py-3 font-bold select-none text-right text-app-muted text-xs uppercase tracking-wider">
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
            ) : paginatedCategories.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="py-10 text-center text-sm text-app-muted">
                  <p className="font-semibold text-app-text">
                    {categories.length === 0 ? "No hay categorías registradas" : "Sin coincidencias"}
                  </p>
                  <p className="text-xs mt-1">
                    {categories.length === 0
                      ? "Crea una categoría para comenzar a clasificar proveedores."
                      : "Prueba con otro término de búsqueda o cambia los filtros."}
                  </p>
                </Table.Cell>
              </Table.Row>
            ) : (
              paginatedCategories.map((category) => (
                <Table.Row key={category.id}>
                  <Table.Cell rounded="left">
                    <span className="font-semibold text-app-text">{category.name}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="block max-w-md text-app-muted">
                      {category.description || "Sin descripción"}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <span className="text-app-muted">
                      <strong className="text-app-text">{category.suppliers?.length ?? 0}</strong> asociados
                    </span>
                  </Table.Cell>
                  <Table.Cell rounded="right" className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={faPenToSquare}
                        onClick={() => openEditModal(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={faTrash}
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => void handleDelete(category)}
                        aria-label={`Eliminar ${category.name}`}
                      >
                        Eliminar
                      </Button>
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
          onPageChange={setCurrentPage}
          onPageSizeChange={(pageSize) => {
            setItemsPerPage(pageSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 10, 20]}
        />
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={categoryToEdit ? "Editar categoría" : "Nueva categoría"}
        description="Registra la clasificación que se asignará a los proveedores."
        icon={categoryToEdit ? faPenToSquare : faTags}
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSaving}>Cancelar</Button>
            <Button
              variant="primary"
              type="submit"
              form="supplier-category-form"
              isLoading={isSaving}
              loadingText="Guardando..."
            >
              {categoryToEdit ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </>
        }
      >
        <form id="supplier-category-form" className="space-y-4 pt-2" onSubmit={handleSubmit}>
          <Input
            label="Nombre *"
            value={formData.name}
            onChange={(event) => {
              setFormData((previous) => ({ ...previous, name: event.target.value }));
              if (formError) setFormError("");
            }}
            placeholder="Ej. Distribuidor mayorista"
            maxLength={80}
            error={formError}
            autoFocus
          />
          <div className="flex flex-col">
            <label htmlFor="supplier-category-description" className="mb-2 text-xs font-bold uppercase tracking-wider text-app-text">
              Descripción
            </label>
            <textarea
              id="supplier-category-description"
              value={formData.description}
              onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Describe brevemente esta categoría"
              rows={4}
              maxLength={255}
              className="isabel-input resize-y rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
