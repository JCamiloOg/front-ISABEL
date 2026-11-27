import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faFloppyDisk,
  faPenToSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import { Switcher } from "../../../../components/Switcher";
import type { BrandRecord, UpdateBrandDTO } from "../services/brandsServices";

export interface BrandsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandItem: BrandRecord | null;
  onSubmit: (
    id: number,
    data: UpdateBrandDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

export const BrandsUpdateModal: React.FC<BrandsUpdateModalProps> = ({
  isOpen,
  onClose,
  brandItem,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<BrandRecord | null>(brandItem);
  const [name, setName] = useState<string>(brandItem?.name ?? "");
  const [status, setStatus] = useState<boolean>(brandItem?.status ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedItem !== brandItem)) {
    setTrackedOpen(true);
    setTrackedItem(brandItem);
    setName(brandItem?.name ?? "");
    setStatus(brandItem?.status ?? true);
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "El nombre de la marca es obligatorio.";
    } else if (trimmedName.length > 80) {
      newErrors.name = "El nombre no puede superar los 80 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandItem || !validate()) return;

    await onSubmit(
      brandItem.id,
      {
        name: name.trim(),
        status,
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Marca"
      description={
        brandItem
          ? `Actualiza el nombre o estado operativo de la marca #${brandItem.id}.`
          : "Actualiza la información de la marca."
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
            form="brand-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="brand-update-form" onSubmit={handleSubmit} className="space-y-4">
        {brandItem && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Marca seleccionada
            </span>
            <span className="badge-sky font-mono">ID #{brandItem.id}</span>
          </div>
        )}

        <Input
          id="edit-brand-name"
          name="name"
          label="Nombre de la Marca"
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Ej. Isabel Signature, Nike, Adidas..."
          iconLeft={faAward}
          error={errors.name}
        />

        <div className="flex items-center justify-between gap-4 rounded-xl border border-app-border bg-app-surface p-3.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-text block">
              Estado de la Marca
            </span>
            <p className="text-[11px] text-app-muted mt-0.5">
              Permite habilitar o deshabilitar la marca en el catálogo
            </p>
          </div>
          <Switcher
            checked={status}
            onChange={setStatus}
            size="md"
            showLabel={true}
          />
        </div>
      </form>
    </Modal>
  );
};

export default BrandsUpdateModal;
