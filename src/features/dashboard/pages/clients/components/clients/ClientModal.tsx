import React, { useState, useEffect } from 'react';
import type { Client, ClientFormData, DocumentType } from '../../../../../../@types/client';
import Modal from '../../../../../../shared/components/Modal';
import Input from '../../../../../../shared/components/Inputs/Input';
import { Switcher } from '../../../../components/Switcher';
import { faUserPlus, faPenToSquare, faLock } from '@fortawesome/free-solid-svg-icons';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  clientToEdit?: Client | null;
}

const initialFormState: ClientFormData = {
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  phone: '',
  email: '',
  address: '',
  password: '',
  status: 'Activo',
};

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        firstName: clientToEdit.firstName,
        lastName: clientToEdit.lastName,
        documentType: clientToEdit.documentType,
        documentNumber: clientToEdit.documentNumber,
        phone: clientToEdit.phone,
        email: clientToEdit.email,
        address: clientToEdit.address,
        password: '',
        status: clientToEdit.status,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre/razón social es obligatorio.';
    if (!formData.documentNumber.trim()) newErrors.documentNumber = 'El número de documento es obligatorio.';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Ingrese un correo electrónico válido.';
    }
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if ((!clientToEdit && !formData.password) || (formData.password && formData.password.length < 6)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const footerButtons = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#0E2347] dark:text-[#FFFFFF] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#091322] transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="client-form"
        className="px-5 py-2 bg-[#0E2347] dark:bg-[#52A5E8] hover:bg-[#2B62D9] dark:hover:bg-[#2B62D9] text-[#FFFFFF] rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
      >
        {clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Editar Información de Cliente' : 'Registrar Nuevo Cliente'}
      description="Ingrese los datos comerciales y de contacto para Paradise Shoes."
      icon={clientToEdit ? faPenToSquare : faUserPlus}
      size="lg"
      footer={footerButtons}
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Nombre / Razón Social *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.firstName 
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/20' 
                  : 'border-[#E2E8F0] dark:border-[#1E3A8A] focus:ring-[#2B62D9]/20'
              }`}
              placeholder="Ej. Carlos o Distribuciones S.A.S"
            />
            {errors.firstName && <span className="text-xs text-[#DC2626] mt-1 block">{errors.firstName}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Apellidos / Sigla Comercial
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] dark:border-[#1E3A8A] rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B62D9]/20"
              placeholder="Ej. Gómez Restrepo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Tipo de Documento *
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
              className="w-full px-3 py-2 border border-[#E2E8F0] dark:border-[#1E3A8A] rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] focus:outline-none focus:ring-2 focus:ring-[#2B62D9]/20"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="NIT">NIT</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.documentNumber 
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/20' 
                  : 'border-[#E2E8F0] dark:border-[#1E3A8A] focus:ring-[#2B62D9]/20'
              }`}
              placeholder="Ej. 1038475892"
            />
            {errors.documentNumber && <span className="text-xs text-[#DC2626] mt-1 block">{errors.documentNumber}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Teléfono de Contacto *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.phone 
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/20' 
                  : 'border-[#E2E8F0] dark:border-[#1E3A8A] focus:ring-[#2B62D9]/20'
              }`}
              placeholder="Ej. +57 310 456 7890"
            />
            {errors.phone && <span className="text-xs text-[#DC2626] mt-1 block">{errors.phone}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.email 
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/20' 
                  : 'border-[#E2E8F0] dark:border-[#1E3A8A] focus:ring-[#2B62D9]/20'
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <span className="text-xs text-[#DC2626] mt-1 block">{errors.email}</span>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-1">
            Dirección de Despacho / Sede *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className={`w-full px-3 py-2 border rounded-xl text-sm text-[#0E2347] dark:text-[#FFFFFF] bg-[#FFFFFF] dark:bg-[#091322] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.address 
                ? 'border-[#DC2626] focus:ring-[#DC2626]/20' 
                : 'border-[#E2E8F0] dark:border-[#1E3A8A] focus:ring-[#2B62D9]/20'
            }`}
            placeholder="Ej. Calle 50 # 70-12, Medellín"
          />
          {errors.address && <span className="text-xs text-[#DC2626] mt-1 block">{errors.address}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E2347] dark:text-slate-300 mb-2">
              Estado Operativo
            </label>
            <Switcher
              checked={formData.status === 'Activo'}
              onChange={(checked) => setFormData({ ...formData, status: checked ? 'Activo' : 'Inactivo' })}
              ariaLabel="Estado operativo del cliente"
            />
          </div>
          <Input
            id="client-password"
            type="password"
            label={clientToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors((previous) => ({ ...previous, password: '' }));
            }}
            placeholder={clientToEdit ? 'Dejar vacío para conservarla' : 'Mínimo 6 caracteres'}
            autoComplete="new-password"
            iconLeft={faLock}
            error={errors.password}
          />
        </div>
      </form>
    </Modal>
  );
};