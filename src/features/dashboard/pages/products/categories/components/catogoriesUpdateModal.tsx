import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faFloppyDisk,
  faLayerGroup,
  faPenToSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import { Textarea } from "../../../../../../shared/components/Inputs/Textarea";
import type {
  CategoryRecord,
  UpdateProductCategoryDTO,
} from "../services/categoriesServices";

export interface CategoriesUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryItem: CategoryRecord | null;
  onSubmit: (
    id: number,
    data: UpdateProductCategoryDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

export const CategoriesUpdateModal: React.FC<CategoriesUpdateModalProps> = ({
  isOpen,
  onClose,
  categoryItem,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<CategoryRecord | null>(categoryItem);
  const [name, setName] = useState<string>(categoryItem?.name ?? "");
  const [description, setDescription] = useState<string>(categoryItem?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedItem !== categoryItem)) {
    setTrackedOpen(true);
    setTrackedItem(categoryItem);
    setName(categoryItem?.name ?? "");
    setDescription(categoryItem?.description ?? "");
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      newErrors.name = "El nombre de la categoría es obligatorio.";
    } else if (trimmedName.length > 80) {
      newErrors.name = "El nombre no puede superar los 80 caracteres.";
    }

    if (!trimmedDescription) {
      newErrors.description = "La descripción de la categoría es obligatoria.";
    } else if (trimmedDescription.length > 255) {
      newErrors.description = "La descripción no puede superar los 255 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryItem || !validate()) return;

    await onSubmit(
      categoryItem.id,
      {
        name: name.trim(),
        description: description.trim(),
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Categoría"
      description={
        categoryItem
          ? `Actualiza el nombre o la descripción de la categoría #${categoryItem.id}.`
          : "Actualiza la información de la categoría."
      }
      icon={faPenToSquare}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="category-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="category-update-form" onSubmit={handleSubmit} className="space-y-4">
        {categoryItem && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Categoría seleccionada
            </span>
            <span className="badge-sky font-mono">ID #{categoryItem.id}</span>
          </div>
        )}

        <Input
          id="edit-category-name"
          name="name"
          label="Nombre de la Categoría"
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Ej. Deportivo, Casual, Formal..."
          iconLeft={faLayerGroup}
          error={errors.name}
        />

        <Textarea
          id="edit-category-description"
          name="description"
          label="Descripción"
          required
          rows={4}
          maxLength={255}
          currentLength={description.length}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
          }}
          placeholder="Describe el estilo, ocasión o características principales de esta categoría..."
          iconLeft={faAlignLeft}
          error={errors.description}
        />
      </form>
    </Modal>
  );
};

export default CategoriesUpdateModal;
