import React, { useState, useEffect } from "react";
import type { Usuario, UsuarioFormData, TipoDocumentoId, RolId } from "../../../../../@types/Users";
import { TIPOS_DOCUMENTO, ROLES_SISTEMA } from "../../../../../data/mockUsers";
import Modal from "../../../../../shared/components/Modal";
import Input from "../../../../../shared/components/Inputs/Input";
import Select from "../../../../../shared/components/Inputs/Select";
import {
  faUserPlus,
  faPenToSquare,
  faIdCard,
  faUser,
  faEnvelope,
  faPhone,
  faLocationDot,
  faLock,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UsuarioFormData) => void;
  userToEdit?: Usuario | null;
}

const initialFormState: UsuarioFormData = {
  documento_identidad: "",
  id_tipo_documento: 1,
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  direccion: "",
  contrasena: "",
  id_rol: 2, // Por defecto Bodeguero
  estado: true,
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
}) => {
  const [formData, setFormData] = useState<UsuarioFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        documento_identidad: userToEdit.documento_identidad,
        id_tipo_documento: userToEdit.id_tipo_documento,
        nombre: userToEdit.nombre,
        apellido: userToEdit.apellido,
        correo: userToEdit.correo,
        telefono: userToEdit.telefono,
        direccion: userToEdit.direccion,
        contrasena: "", // Al editar, dejar vacío salvo que se desee cambiar
        id_rol: userToEdit.id_rol,
        estado: userToEdit.estado,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!formData.documento_identidad.trim()) {
      newErrors.documento_identidad = "El número de documento es obligatorio.";
    }
    if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio.";
    if (!formData.correo.trim() || !formData.correo.includes("@")) {
      newErrors.correo = "Ingrese un correo electrónico válido.";
    }
    if (!formData.direccion.trim()) newErrors.direccion = "La dirección es obligatoria.";
    if (!userToEdit && (!formData.contrasena || formData.contrasena.length < 6)) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres.";
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
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 border border-app-border text-app-text rounded-xl text-sm font-semibold hover:bg-brand-sky/10 transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="user-form"
        className="btn-primary py-2.5 px-5 cursor-pointer shadow-md shadow-brand-royal/20"
      >
        {userToEdit ? "Guardar Cambios" : "Registrar Usuario"}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? "Editar Información de Usuario" : "Registrar Nuevo Usuario"}
      description="Complete los datos del colaborador para asignarle acceso al sistema interno de Calzado ISABEL."
      icon={userToEdit ? faPenToSquare : faUserPlus}
      size="lg"
      footer={footerButtons}
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Documento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Tipo de Documento *
            </label>
            <Select
              id="id_tipo_documento"
              value={String(formData.id_tipo_documento)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  id_tipo_documento: Number(e.target.value) as TipoDocumentoId,
                })
              }
              iconLeft={faIdCard}
              options={TIPOS_DOCUMENTO.map((t) => ({
                value: String(t.id_tipo_documento),
                label: `${t.codigo} - ${t.nombre}`,
              }))}
            />
          </div>

          {/* Documento de Identidad */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Documento de Identidad *
            </label>
            <Input
              id="documento_identidad"
              type="text"
              value={formData.documento_identidad}
              onChange={(e) => {
                setFormData({ ...formData, documento_identidad: e.target.value });
                if (errors.documento_identidad) {
                  setErrors((prev) => ({ ...prev, documento_identidad: "" }));
                }
              }}
              placeholder="Ej. 1038475892"
              iconLeft={faIdCard}
              error={errors.documento_identidad}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Nombre *
            </label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: "" }));
              }}
              placeholder="Ej. Juan Camilo"
              iconLeft={faUser}
              error={errors.nombre}
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Apellido *
            </label>
            <Input
              id="apellido"
              type="text"
              value={formData.apellido}
              onChange={(e) => {
                setFormData({ ...formData, apellido: e.target.value });
                if (errors.apellido) setErrors((prev) => ({ ...prev, apellido: "" }));
              }}
              placeholder="Ej. Osorio Rodríguez"
              iconLeft={faUser}
              error={errors.apellido}
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Correo Institucional *
            </label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => {
                setFormData({ ...formData, correo: e.target.value });
                if (errors.correo) setErrors((prev) => ({ ...prev, correo: "" }));
              }}
              placeholder="usuario@isabelcalzado.com"
              iconLeft={faEnvelope}
              error={errors.correo}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Teléfono de Contacto *
            </label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => {
                setFormData({ ...formData, telefono: e.target.value });
                if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: "" }));
              }}
              placeholder="Ej. +57 312 458 9210"
              iconLeft={faPhone}
              error={errors.telefono}
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
            Dirección de Residencia *
          </label>
          <Input
            id="direccion"
            type="text"
            value={formData.direccion}
            onChange={(e) => {
              setFormData({ ...formData, direccion: e.target.value });
              if (errors.direccion) setErrors((prev) => ({ ...prev, direccion: "" }));
            }}
            placeholder="Ej. Carrera 45 # 68 - 24, Barrio El Poblado, Medellín"
            iconLeft={faLocationDot}
            error={errors.direccion}
          />
        </div>

        {/* Fila: Rol del Sistema + Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Rol en el Sistema *
            </label>
            <Select
              id="id_rol"
              value={String(formData.id_rol)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  id_rol: Number(e.target.value) as RolId,
                })
              }
              iconLeft={faUserShield}
              options={ROLES_SISTEMA.map((r) => ({
                value: String(r.id_rol),
                label: r.nombre,
              }))}
            />
            <span className="text-[11px] text-app-muted mt-1 block">
              {ROLES_SISTEMA.find((r) => r.id_rol === formData.id_rol)?.descripcion}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
              Estado de Acceso
            </label>
            <Select
              id="estado"
              value={formData.estado ? "1" : "0"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.value === "1",
                })
              }
              options={[
                { value: "1", label: "Activo (Con acceso)" },
                { value: "0", label: "Inactivo (Acceso suspendido)" },
              ]}
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-app-text mb-1">
            {userToEdit
              ? "Nueva Contraseña (Opcional, dejar vacío si no cambia)"
              : "Contraseña de Acceso *"}
          </label>
          <Input
            id="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={(e) => {
              setFormData({ ...formData, contrasena: e.target.value });
              if (errors.contrasena) setErrors((prev) => ({ ...prev, contrasena: "" }));
            }}
            placeholder={userToEdit ? "•••••••••••• (sin cambios)" : "Mínimo 6 caracteres"}
            iconLeft={faLock}
            error={errors.contrasena}
          />
        </div>
      </form>
    </Modal>
  );
};
