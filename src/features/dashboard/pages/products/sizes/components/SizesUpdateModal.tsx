import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faGlobe,
  faPenToSquare,
  faRulerCombined,
  faVenusMars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../../shared/components/Inputs/Select";
import {
  getInternationalSize,
  type SizeRecord,
  type UpdateSizeDTO,
} from "../services/SizesServices";

export interface SizesUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeItem: SizeRecord | null;
  onSubmit: (
    id: number,
    data: UpdateSizeDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino (Hombre)" },
  { value: "Femenino", label: "Femenino (Mujer)" },
];

const resolveGenderOption = (gender?: string): string => {
  const lower = (gender || "").trim().toLowerCase();
  if (lower === "femenino" || lower === "mujer") return "Femenino";
  return "Masculino";
};

export const SizesUpdateModal: React.FC<SizesUpdateModalProps> = ({
  isOpen,
  onClose,
  sizeItem,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<SizeRecord | null>(sizeItem);
  const [sizeNumber, setSizeNumber] = useState<string>(sizeItem?.sizeNumber ?? "");
  const [internationalSize, setInternationalSize] = useState<string>(
    sizeItem?.internationalSize ?? ""
  );
  const [isManualInternational, setIsManualInternational] = useState<boolean>(false);
  const [gender, setGender] = useState<string>(() => resolveGenderOption(sizeItem?.gender));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedItem !== sizeItem)) {
    setTrackedOpen(true);
    setTrackedItem(sizeItem);
    setSizeNumber(sizeItem?.sizeNumber ?? "");
    setInternationalSize(sizeItem?.internationalSize ?? "");
    setIsManualInternational(false);
    setGender(resolveGenderOption(sizeItem?.gender));
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const handleSizeNumberChange = (value: string) => {
    setSizeNumber(value);
    if (errors.sizeNumber) setErrors((prev) => ({ ...prev, sizeNumber: "" }));

    if (!isManualInternational || !value.trim()) {
      const autoInternational = getInternationalSize(value, gender);
      setInternationalSize(autoInternational);
      if (autoInternational && errors.internationalSize) {
        setErrors((prev) => ({ ...prev, internationalSize: "" }));
      }
      if (!value.trim()) {
        setIsManualInternational(false);
      }
    }
  };

  const handleGenderChange = (nextGender: string) => {
    setGender(nextGender);
    if (errors.gender) setErrors((prev) => ({ ...prev, gender: "" }));

    if (!isManualInternational && sizeNumber.trim()) {
      const autoInternational = getInternationalSize(sizeNumber, nextGender);
      setInternationalSize(autoInternational);
      if (autoInternational && errors.internationalSize) {
        setErrors((prev) => ({ ...prev, internationalSize: "" }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedSize = sizeNumber.trim();
    const trimmedIntl = internationalSize.trim();

    if (!trimmedSize) {
      newErrors.sizeNumber = "El número de la talla es obligatorio.";
    } else if (trimmedSize.length > 10) {
      newErrors.sizeNumber = "El número de la talla no puede superar los 10 caracteres.";
    }

    if (!trimmedIntl) {
      newErrors.internationalSize = "La talla internacional es obligatoria.";
    } else if (trimmedIntl.length > 10) {
      newErrors.internationalSize = "La talla internacional no puede superar los 10 caracteres.";
    }

    if (!gender) {
      newErrors.gender = "El género es obligatorio.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeItem || !validate()) return;

    await onSubmit(
      sizeItem.id,
      {
        sizeNumber: sizeNumber.trim(),
        internationalSize: internationalSize.trim(),
        gender,
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Talla"
      description={
        sizeItem
          ? `Actualiza la numeración, género o talla internacional de la talla #${sizeItem.id}.`
          : "Actualiza la información de la talla."
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
            form="size-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="size-update-form" onSubmit={handleSubmit} className="space-y-4">
        {sizeItem && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Talla seleccionada
            </span>
            <span className="badge-sky font-mono">ID #{sizeItem.id}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="edit-size-number"
            name="sizeNumber"
            label="Talla Nacional"
            type="text"
            required
            maxLength={10}
            value={sizeNumber}
            onChange={(e) => handleSizeNumberChange(e.target.value)}
            placeholder="Ej. 38, 39, 40"
            iconLeft={faRulerCombined}
            error={errors.sizeNumber}
          />

          <Input
            id="edit-size-international"
            name="internationalSize"
            label="Talla Internacional"
            type="text"
            required
            maxLength={10}
            value={internationalSize}
            onChange={(e) => {
              const val = e.target.value;
              setInternationalSize(val);
              setIsManualInternational(Boolean(val.trim()));
              if (errors.internationalSize) {
                setErrors((prev) => ({ ...prev, internationalSize: "" }));
              }
            }}
            placeholder="Ej. US 7"
            iconLeft={faGlobe}
            helper="Se actualiza automáticamente al cambiar la talla nacional o el género."
            error={errors.internationalSize}
          />
        </div>

        <Select
          id="edit-size-gender"
          name="gender"
          label="Género"
          value={gender}
          onChange={(e) => handleGenderChange(e.target.value)}
          iconLeft={faVenusMars}
          options={GENDER_OPTIONS}
          error={errors.gender}
        />
      </form>
    </Modal>
  );
};

export default SizesUpdateModal;
