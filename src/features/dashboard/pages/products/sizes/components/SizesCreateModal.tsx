import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faGlobe,
  faPlus,
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
  type CreateSizeDTO,
} from "../services/SizesServices";

export interface SizesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextId?: number | null;
  onSubmit: (data: CreateSizeDTO, onClose: () => void) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino (Hombre)" },
  { value: "Femenino", label: "Femenino (Mujer)" },
];

export const SizesCreateModal: React.FC<SizesCreateModalProps> = ({
  isOpen,
  onClose,
  nextId,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [sizeNumber, setSizeNumber] = useState<string>("");
  const [internationalSize, setInternationalSize] = useState<string>("");
  const [isManualInternational, setIsManualInternational] = useState<boolean>(false);
  const [gender, setGender] = useState<string>("Masculino");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && !trackedOpen) {
    setTrackedOpen(true);
    setSizeNumber("");
    setInternationalSize("");
    setIsManualInternational(false);
    setGender("Masculino");
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
    if (!validate()) return;

    await onSubmit(
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
      title="Nueva Talla"
      description={
        nextId
          ? `Registra una nueva talla y su equivalencia internacional (ID asignado: #${nextId}).`
          : "Registra una nueva talla en el catálogo de variantes de calzado."
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
            form="size-create-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Registrar Talla
          </Button>
        </div>
      }
    >
      <form id="size-create-form" onSubmit={handleSubmit} className="space-y-4">
        {nextId && (
          <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-app-muted">
              Próximo identificador disponible
            </span>
            <span className="badge-sky font-mono">ID #{nextId}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="create-size-number"
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
            id="create-size-international"
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
            helper="Se calcula automáticamente según la talla nacional y el género."
            error={errors.internationalSize}
          />
        </div>

        <Select
          id="create-size-gender"
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

export default SizesCreateModal;
