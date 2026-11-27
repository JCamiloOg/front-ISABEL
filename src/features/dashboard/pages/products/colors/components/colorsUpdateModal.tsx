import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeDropper,
  faFloppyDisk,
  faHashtag,
  faPalette,
  faPenToSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import type { ColorRecord, UpdateColorDTO } from "../services/colorsServicies";

export interface ColorsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorItem: ColorRecord | null;
  onSubmit: (
    id: number,
    data: UpdateColorDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const DEFAULT_HEX = "#2B62D9";

const isValidHexForPicker = (value: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim());
};

const normalizeHexValue = (hex: string): string => {
  const trimmed = hex.trim();
  if (!trimmed.startsWith("#") && /^[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  return trimmed.startsWith("#") ? `#${trimmed.slice(1).toUpperCase()}` : trimmed;
};

export const ColorsUpdateModal: React.FC<ColorsUpdateModalProps> = ({
  isOpen,
  onClose,
  colorItem,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<ColorRecord | null>(colorItem);
  const [color, setColor] = useState<string>(colorItem?.color ?? "");
  const [hex, setHex] = useState<string>(colorItem?.hex ?? DEFAULT_HEX);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedItem !== colorItem)) {
    setTrackedOpen(true);
    setTrackedItem(colorItem);
    setColor(colorItem?.color ?? "");
    setHex(colorItem?.hex ?? DEFAULT_HEX);
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const normalizedPreview = normalizeHexValue(hex);
  const pickerValue = isValidHexForPicker(normalizedPreview) ? normalizedPreview : DEFAULT_HEX;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedColor = color.trim();
    const trimmedHex = normalizeHexValue(hex);

    if (!trimmedColor) {
      newErrors.color = "El nombre del color es obligatorio.";
    } else if (trimmedColor.length > 50) {
      newErrors.color = "El nombre del color no puede superar los 50 caracteres.";
    }

    if (!trimmedHex) {
      newErrors.hex = "El código hexadecimal es obligatorio.";
    } else if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmedHex)) {
      newErrors.hex = "Ingresa un código HEX válido (ej. #2B62D9).";
    } else if (trimmedHex.length > 50) {
      newErrors.hex = "El código hexadecimal no puede superar los 50 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorItem || !validate()) return;

    await onSubmit(
      colorItem.id,
      {
        color: color.trim(),
        hex: normalizeHexValue(hex),
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Color"
      description={
        colorItem
          ? `Actualiza el nombre o código hexadecimal del color #${colorItem.id}.`
          : "Actualiza la información del color."
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
            form="color-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="color-update-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Vista previa en vivo del color */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface-alt/70 p-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className="h-12 w-12 shrink-0 rounded-xl border border-app-border shadow-sm transition-colors"
              style={{
                backgroundColor: isValidHexForPicker(normalizedPreview)
                  ? normalizedPreview
                  : /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{8})$/.test(normalizedPreview)
                  ? normalizedPreview
                  : DEFAULT_HEX,
              }}
            />
            <div className="min-w-0">
              <span className="block text-sm font-extrabold text-app-text truncate">
                {color.trim() || "Vista previa del color"}
              </span>
              <span className="font-mono text-xs font-semibold text-brand-royal dark:text-brand-sky">
                {normalizedPreview || "#000000"}
              </span>
            </div>
          </div>

          {colorItem && (
            <span className="badge-sky font-mono shrink-0">
              ID #{colorItem.id}
            </span>
          )}
        </div>

        {/* Nombre del Color */}
        <Input
          id="edit-color-name"
          name="color"
          label="Nombre del Color"
          type="text"
          required
          maxLength={50}
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            if (errors.color) setErrors((prev) => ({ ...prev, color: "" }));
          }}
          placeholder="Ej. Azul Marino, Negro Mate, Blanco..."
          iconLeft={faPalette}
          error={errors.color}
        />

        {/* Código HEX + Selector visual */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
          <div className="sm:col-span-8">
            <Input
              id="edit-color-hex"
              name="hex"
              label="Código Hexadecimal (HEX)"
              type="text"
              required
              maxLength={50}
              value={hex}
              onChange={(e) => {
                setHex(e.target.value);
                if (errors.hex) setErrors((prev) => ({ ...prev, hex: "" }));
              }}
              placeholder="#2B62D9"
              iconLeft={faHashtag}
              error={errors.hex}
              className="font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="edit-color-picker"
              className="block text-xs font-bold uppercase tracking-wider mb-2 text-app-text"
            >
              Selector
            </label>
            <label
              htmlFor="edit-color-picker"
              className="flex items-center justify-between gap-2 w-full min-h-[42px] px-3 py-1.5 rounded-xl bg-app-surface border border-app-border hover:border-brand-royal dark:hover:border-brand-sky cursor-pointer transition-colors"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-app-muted">
                <FontAwesomeIcon icon={faEyeDropper} className="text-brand-royal dark:text-brand-sky" />
                Elegir
              </span>
              <input
                id="edit-color-picker"
                type="color"
                value={pickerValue}
                onChange={(e) => {
                  setHex(e.target.value.toUpperCase());
                  if (errors.hex) setErrors((prev) => ({ ...prev, hex: "" }));
                }}
                className="h-7 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
              />
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ColorsUpdateModal;
