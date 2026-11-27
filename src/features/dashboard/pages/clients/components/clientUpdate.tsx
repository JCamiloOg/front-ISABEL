import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faFloppyDisk,
  faIdCard,
  faLocationDot,
  faPenToSquare,
  faPhone,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Switcher } from "../../../components/Switcher";
import type { ClientDocumentTypeOption } from "./clientCreateModal";
import type { ClientRecord } from "../services/clientsServicies";

export interface ClientUpdateFormData {
  documentType: ClientDocumentTypeOption;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
}

export interface ClientUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRecord | null;
  onSubmit: (
    identityDocument: string,
    data: ClientUpdateFormData,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "CC", label: "Cédula de Ciudadanía (CC)" },
  { value: "CE", label: "Cédula de Extranjería (CE)" },
  { value: "TI", label: "Tarjeta de Identidad (TI)" },
  { value: "PP", label: "Pasaporte (PP)" },
  { value: "NIT", label: "NIT" },
];

const resolveDocumentTypeOption = (docType?: string): ClientDocumentTypeOption => {
  const normalized = (docType || "").trim().toUpperCase();
  if (normalized === "CE" || normalized.includes("EXTRANJER")) return "CE";
  if (normalized === "TI" || normalized.includes("TARJETA")) return "TI";
  if (normalized === "PP" || normalized.includes("PASAPORT")) return "PP";
  if (normalized === "NIT") return "NIT";
  return "CC";
};

const buildFormState = (client: ClientRecord | null): ClientUpdateFormData => ({
  documentType: resolveDocumentTypeOption(client?.documentType),
  documentNumber: client?.identityDocument ?? "",
  firstName: client?.firstName ?? "",
  lastName: client?.lastName ?? "",
  email: client?.email ?? "",
  phone: client?.phone ?? "",
  address: client?.address ?? "",
  status: client?.status ?? true,
});

export const ClientUpdateModal: React.FC<ClientUpdateModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const [trackedClient, setTrackedClient] = useState<ClientRecord | null>(client);
  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [formData, setFormData] = useState<ClientUpdateFormData>(() => buildFormState(client));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isOpen && (!trackedOpen || trackedClient !== client)) {
    setTrackedOpen(true);
    setTrackedClient(client);
    setFormData(buildFormState(client));
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !validate()) return;

    await onSubmit(
      client.identityDocument,
      {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Cliente"
      description={
        client
          ? `Actualiza los datos de contacto y estado de ${client.fullName}`
          : "Actualiza la información del cliente."
      }
      icon={faPenToSquare}
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
            form="client-update-form"
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      <form id="client-update-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Fila 1: Tipo Documento + Documento de Identidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            id="edit-client-document-type"
            name="documentType"
            label="Tipo Documento"
            value={formData.documentType}
            onChange={handleChange}
            iconLeft={faIdCard}
            options={DOCUMENT_TYPE_OPTIONS}
          />

          <Input
            id="edit-client-document-number"
            name="documentNumber"
            label="Documento de Identidad"
            type="text"
            value={formData.documentNumber}
            disabled
            iconLeft={faIdCard}
            helper="El documento de identidad no se puede modificar."
          />
        </div>

        {/* Fila 2: Nombre + Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            id="edit-client-first-name"
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
            id="edit-client-last-name"
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
            id="edit-client-email"
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
            id="edit-client-phone"
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
          id="edit-client-address"
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

        {/* Fila 5: Estado del Cliente */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-app-border bg-app-surface p-3.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-text block">
              Estado del Cliente
            </span>
            <p className="text-[11px] text-app-muted mt-0.5">
              Permite habilitar o suspender la cuenta del cliente
            </p>
          </div>
          <Switcher
            checked={formData.status}
            onChange={(checked) => setFormData((prev) => ({ ...prev, status: checked }))}
            size="md"
            showLabel={true}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ClientUpdateModal;
