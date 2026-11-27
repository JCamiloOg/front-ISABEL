import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faFloppyDisk,
  faIdCard,
  faLocationDot,
  faLock,
  faPhone,
  faUser,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";

export type ClientDocumentTypeOption = "CC" | "CE" | "TI" | "PP" | "NIT";

export interface ClientCreateFormData {
  documentType: ClientDocumentTypeOption;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface ClientCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ClientCreateFormData, onClose: () => void) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const INITIAL_FORM_STATE: ClientCreateFormData = {
  documentType: "CC",
  documentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

const DOCUMENT_TYPE_OPTIONS = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "PP", label: "Pasaporte (PP)" },
  { value: "NIT", label: "NIT" },
];

export const ClientCreateModal: React.FC<ClientCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [formData, setFormData] = useState<ClientCreateFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === "password" || name === "confirmPassword") {
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors, [name]: "" };
        if (
          updated.password &&
          updated.confirmPassword &&
          updated.password !== updated.confirmPassword
        ) {
          nextErrors.confirmPassword = "Las contraseñas no coinciden.";
        } else if (
          updated.password &&
          updated.confirmPassword &&
          updated.password === updated.confirmPassword
        ) {
          nextErrors.confirmPassword = "";
        }
        return nextErrors;
      });
    } else if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es obligatorio.";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio.";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Ingresa un correo electrónico válido.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio.";
    }
    if (!formData.address.trim()) {
      newErrors.address = "La dirección de envío es obligatoria.";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener mínimo 8 caracteres.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: ClientCreateFormData = {
      ...formData,
      documentNumber: formData.documentNumber.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    if (onSubmit) {
      await onSubmit(payload, onClose);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Cliente"
      description="Completa los datos para registrar un nuevo cliente en el sistema."
      icon={faUserPlus}
      size="lg"
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
            form="client-create-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Registrar Cliente
          </Button>
        </div>
      }
    >
      <form id="client-create-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Fila 1: Tipo Documento + Documento de Identidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            id="client-document-type"
            name="documentType"
            label="Tipo Documento"
            value={formData.documentType}
            onChange={handleChange}
            iconLeft={faIdCard}
            options={DOCUMENT_TYPE_OPTIONS}
          />

          <Input
            id="client-document-number"
            name="documentNumber"
            label="Documento de Identidad"
            type="text"
            required
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder="Número de documento"
            iconLeft={faIdCard}
            error={errors.documentNumber}
          />
        </div>

        {/* Fila 2: Nombre + Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="client-first-name"
            name="firstName"
            label="Nombre"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Tu nombre"
            iconLeft={faUser}
            error={errors.firstName}
          />

          <Input
            id="client-last-name"
            name="lastName"
            label="Apellido"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Tu apellido"
            iconLeft={faUser}
            error={errors.lastName}
          />
        </div>

        {/* Fila 3: Correo Electrónico + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="client-email"
            name="email"
            label="Correo Electrónico"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            iconLeft={faEnvelope}
            error={errors.email}
          />

          <Input
            id="client-phone"
            name="phone"
            label="Teléfono"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+57 300 000 0000"
            iconLeft={faPhone}
            error={errors.phone}
          />
        </div>

        {/* Fila 4: Dirección de Envío */}
        <Input
          id="client-address"
          name="address"
          label="Dirección de Envío"
          type="text"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="Calle, carrera, número, ciudad"
          iconLeft={faLocationDot}
          error={errors.address}
        />

        {/* Fila 5: Contraseña + Confirmar Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="client-password"
            name="password"
            label="Contraseña"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            iconLeft={faLock}
            error={errors.password}
          />

          <Input
            id="client-confirm-password"
            name="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            iconLeft={faLock}
            error={errors.confirmPassword}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ClientCreateModal;
