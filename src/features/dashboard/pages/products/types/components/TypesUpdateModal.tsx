import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
  faFloppyDisk,
  faPenToSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import type { ShoeTypeRecord, UpdateShoeTypeDTO } from "../services/TypesServices";

export interface TypesUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoeTypeItem: ShoeTypeRecord | null;
  onSubmit: (
    id: number,
    data: UpdateShoeTypeDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

export const TypesUpdateModal: React.FC<TypesUpdateModalProps> = ({
  isOpen,
  onClose,
  shoeTypeItem,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<ShoeTypeRecord | null>(shoeTypeItem);
  const [name, setName] = useState<string>(shoeTypeItem?.name ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedItem !== shoeTypeItem)) {
    setTrackedOpen(true);
    setTrackedItem(shoeTypeItem);
    setName(shoeTypeItem?.name ?? "");
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "El nombre del tipo de zapato es obligatorio.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "El nombre no puede superar los 100 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoeTypeItem || !validate()) return;

    await onSubmit(shoeTypeItem.id, { name: name.trim() }, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Tipo de Calzado"
      description={
        shoeTypeItem
          ? `Actualiza el nombre del tipo de calzado #${shoeTypeItem.id}.`
          : "Actualiza la información del tipo de calzado."
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
            form="type-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="type-update-form" onSubmit={handleSubmit} className="space-y-4">
        {shoeTypeItem && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Tipo seleccionado
            </span>
            <span className="badge-sky font-mono">ID #{shoeTypeItem.id}</span>
          </div>
        )}

        <Input
          id="edit-type-name"
          name="name"
          label="Nombre del Tipo de Calzado"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Ej. Tenis, Bota, Sandalia, Mocasín..."
          iconLeft={faCertificate}
          error={errors.name}
        />
      </form>
    </Modal>
  );
};

export default TypesUpdateModal;
