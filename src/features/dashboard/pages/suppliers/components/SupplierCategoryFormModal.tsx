import { useState, type FormEvent } from "react";
import { faPenToSquare, faPlus, faTags } from "@fortawesome/free-solid-svg-icons";

import type { SupplierCategoryWithRelations } from "../../../../../@types/suppliers";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import Modal from "../../../../../shared/components/Modal";
import type { SupplierCategoryFormData } from "../services/supplierCategoryServices";

interface SupplierCategoryFormModalProps {
  isOpen: boolean;
  category: SupplierCategoryWithRelations | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierCategoryFormData) => void;
}

export default function SupplierCategoryFormModal({
  isOpen,
  category,
  isSaving,
  onClose,
  onSubmit,
}: SupplierCategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  const isEditing = Boolean(category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description={
        isEditing
          ? "Modifica el nombre y la descripción de la categoría."
          : "Registra una nueva categoría para clasificar proveedores."
      }
      icon={isEditing ? faPenToSquare : faTags}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={isEditing ? faPenToSquare : faPlus}
            type="submit"
            form="supplier-category-form"
            isLoading={isSaving}
            loadingText="Guardando..."
          >
            {isEditing ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </>
      }
    >
      <form
        id="supplier-category-form"
        onSubmit={handleSubmit}
        className="space-y-4 py-1"
        noValidate
      >
        <Input
          label="Nombre *"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Material y insumos"
          error={
            attemptedSubmit && !name.trim()
              ? "El nombre de la categoría es obligatorio."
              : undefined
          }
        />
        <Input
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe la clasificación"
        />
      </form>
    </Modal>
  );
}
