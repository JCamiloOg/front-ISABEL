import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
  faFloppyDisk,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import type { CreateShoeTypeDTO } from "../services/TypesServices";

export interface TypesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextId?: number | null;
  onSubmit: (data: CreateShoeTypeDTO, onClose: () => void) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

export const TypesCreateModal: React.FC<TypesCreateModalProps> = ({
  isOpen,
  onClose,
  nextId,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [name, setName] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && !trackedOpen) {
    setTrackedOpen(true);
    setName("");
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
    if (!validate()) return;

    await onSubmit({ name: name.trim() }, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Tipo de Calzado"
      description={
        nextId
          ? `Registra un nuevo tipo o estilo de calzado en el catálogo (ID asignado: #${nextId}).`
          : "Registra un nuevo tipo o estilo de calzado comercializado."
      }
      icon={faPlus}
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
            form="type-create-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Registrar Tipo
          </Button>
        </div>
      }
    >
      <form id="type-create-form" onSubmit={handleSubmit} className="space-y-4">
        {nextId && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Próximo identificador disponible
            </span>
            <span className="badge-sky font-mono">ID #{nextId}</span>
          </div>
        )}

        <Input
          id="create-type-name"
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

export default TypesCreateModal;
