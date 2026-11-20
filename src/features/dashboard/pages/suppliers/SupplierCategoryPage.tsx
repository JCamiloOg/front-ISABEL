import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faEye,
  faMagnifyingGlass,
  faPlus,
  faTags,
  faUserSlash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import type { SupplierCategoryWithRelations } from "../../../../@types/suppliers";
import { Button } from "../../../../shared/components/Button";
import Table, { type TableColumn } from "../../../../shared/components/Table";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import SupplierCategoryDetailModal from "./components/SupplierCategoryDetailModal";
import {
  getSupplierCategories,
  getSupplierCategoryById,
  createSupplierCategory,
  updateSupplierCategory,
  deleteSupplierCategory,
  type SupplierCategoryFormData,
} from "./services/supplierCategoryServices";
import SupplierCategoryFormModal from "./components/SupplierCategoryFormModal";

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function SupplierCategoryPage() {
  const [categories, setCategories] = useState<SupplierCategoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SupplierCategoryWithRelations | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const detailRequestId = useRef(0);

  // Estado compartido por los formularios de creación y edición.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] =
    useState<SupplierCategoryWithRelations | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSupplierCategories();
      const result = response.data.suppliersCategory;
      if (!Array.isArray(result)) {
        throw new Error("La respuesta de categorías no tiene el formato esperado.");
      }
      setCategories(result);
    } catch (error) {
      void Toast.fire({
        icon: "error",
        title: getErrorMessage(error, "No se pudieron cargar las categorías."),
        text: "Por favor, intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCategoryDetails = async (id: number) => {
    const requestId = ++detailRequestId.current;
    setIsDetailOpen(true);
    setSelectedCategory(null);
    setIsDetailLoading(true);

    try {
      const response = await getSupplierCategoryById(id);
      const result = response.data.suppliersCategory;
      if (!result || Array.isArray(result)) {
        throw new Error("La respuesta de la categoría no tiene el formato esperado.");
      }
      if (requestId === detailRequestId.current) {
        setSelectedCategory(result);
      }
    } catch (error) {
      if (requestId === detailRequestId.current) {
        void Toast.fire({
          icon: "error",
          title: getErrorMessage(
            error,
            "No se pudieron cargar los detalles de la categoría.",
          ),
          text: "Por favor, intenta nuevamente.",
        });
      }
    } finally {
      if (requestId === detailRequestId.current) {
        setIsDetailLoading(false);
      }
    }
  };

  const closeDetails = () => {
    detailRequestId.current += 1;
    setIsDetailOpen(false);
    setSelectedCategory(null);
    setIsDetailLoading(false);
  };

  // Abre el formulario vacío. categoryToEdit = null identifica el modo crear.
  const openCreateForm = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  // Abre el formulario con el registro seleccionado para el modo editar.
  const openEditForm = (category: SupplierCategoryWithRelations) => {
    closeDetails();
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  // Envía POST al crear o PUT al editar, según categoryToEdit.
  const saveCategory = async (data: SupplierCategoryFormData) => {
    setIsSaving(true);
    try {
      if (categoryToEdit) {
        await updateSupplierCategory(categoryToEdit.id, data);
        void Toast.fire({
          icon: "success",
          title: "Categoría actualizada",
        });
      } else {
        await createSupplierCategory(data);
        void Toast.fire({
          icon: "success",
          title: "Categoría creada",
        });
      }

      setIsFormOpen(false);
      setCategoryToEdit(null);
      await loadCategories();
    } catch (error) {
      void Toast.fire({
        icon: "error",
        title: getErrorMessage(error, "No se pudo guardar la categoría."),
        text: "Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Pide confirmación y después realiza DELETE por el identificador.
  const deleteCategory = async (category: SupplierCategoryWithRelations) => {
    const confirmation = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar categoría?",
      text: `Se eliminará "${category.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteSupplierCategory(category.id);
      closeDetails();
      void Toast.fire({
        icon: "success",
        title: "Categoría eliminada",
      });
      await loadCategories();
    } catch (error) {
      void Toast.fire({
        icon: "error",
        title: getErrorMessage(error, "No se pudo eliminar la categoría."),
        text: "Por favor, intenta nuevamente.",
      });
    }
  };

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLocaleLowerCase().includes(query) ||
        category.description.toLocaleLowerCase().includes(query);
      const hasSuppliers = Boolean(category.suppliers?.length);
      const matchesSupplierFilter =
        supplierFilter === "all" ||
        (supplierFilter === "assigned" && hasSuppliers) ||
        (supplierFilter === "unassigned" && !hasSuppliers);
      return matchesSearch && matchesSupplierFilter;
    });
  }, [categories, searchTerm, supplierFilter]);

  const categoriesWithSuppliers = categories.filter(
    (category) => (category.suppliers?.length ?? 0) > 0,
  ).length;
  const categoriesWithoutSuppliers = categories.length - categoriesWithSuppliers;

  const columns: TableColumn<SupplierCategoryWithRelations>[] = [
    {
      key: "name",
      header: "Categoría",
      render: (category) => (
        <span className="font-bold text-app-text">{category.name}</span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      render: (category) => (
        <span className="text-sm text-app-muted">
          {category.description || "Sin descripción"}
        </span>
      ),
    },
    {
      key: "suppliers",
      header: "Proveedores",
      align: "center",
      render: (category) => (
        <span className="font-semibold text-app-text">
          {category.suppliers?.length ?? 0}
        </span>
      ),
    },
    {
      key: "details",
      header: "Detalle",
      align: "center",
      render: (category) => (
        <Button
          variant="ghost"
          size="sm"
          icon={faEye}
          aria-label={`Ver detalles de ${category.name}`}
          onClick={() => void openCategoryDetails(category.id)}
        >
          Ver
        </Button>
      ),
    },
  ];

  const handleReset = () => {
    setSearchTerm("");
    setSupplierFilter("all");
    void loadCategories();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-4 border-b border-app-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={faTags} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-app-text sm:text-3xl">
              Categorías de Proveedor
            </h1>
            <p className="text-sm text-app-muted">
              Clasificación de proveedores comerciales de mercancía e insumos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={handleReset}
            isLoading={isLoading}
            loadingText="Actualizando..."
          >
            Restablecer
          </Button>
          <Button
            variant="primary"
            icon={faPlus}
            onClick={openCreateForm}
          >
            Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Categorías</p>
            <FontAwesomeIcon icon={faTags} className="text-brand-royal dark:text-brand-sky" />
          </div>
          <p className="mt-2 text-3xl font-black text-app-text">{categories.length}</p>
          <p className="mt-1 text-xs text-app-muted">Clasificaciones registradas</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Con Proveedores</p>
            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {categoriesWithSuppliers}
          </p>
          <p className="mt-1 text-xs text-app-muted">Con al menos una asignación</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Sin Proveedores</p>
            <FontAwesomeIcon icon={faUserSlash} className="text-rose-600 dark:text-rose-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
            {categoriesWithoutSuppliers}
          </p>
          <p className="mt-1 text-xs text-app-muted">Aún sin asignaciones</p>
        </div>
      </div>

      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o descripción..."
              iconLeft={
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-sm text-app-muted"
                />
              }
            />
          </div>
          <Select
            value={supplierFilter}
            onChange={(event) => setSupplierFilter(event.target.value)}
            options={[
              { value: "all", label: "Todas las categorías" },
              { value: "assigned", label: "Con proveedores" },
              { value: "unassigned", label: "Sin proveedores" },
            ]}
          />
        </div>
      </div>

      <Table<SupplierCategoryWithRelations>
        columns={columns}
        data={filteredCategories}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="No hay categorías para mostrar"
        emptyDescription="No se encontraron categorías que coincidan con los filtros."
        emptyState={
          <div className="py-8 text-center text-sm text-app-muted">
            No hay categorías de proveedor registradas en el sistema.
          </div>
        }
      />

      <SupplierCategoryDetailModal
        isOpen={isDetailOpen}
        onClose={closeDetails}
        category={selectedCategory}
        isLoading={isDetailLoading}
        onEdit={openEditForm}
        onDelete={(category) => void deleteCategory(category)}
      />

      <SupplierCategoryFormModal
        key={categoryToEdit ? `edit-${categoryToEdit.id}` : "create-category"}
        isOpen={isFormOpen}
        category={categoryToEdit}
        isSaving={isSaving}
        onClose={() => {
          if (!isSaving) {
            setIsFormOpen(false);
            setCategoryToEdit(null);
          }
        }}
        onSubmit={(data) => void saveCategory(data)}
      />
    </div>
  );
}
