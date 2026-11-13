import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faIdCard,
  faGlobe,
  faTags,
  faPhone,
  faEnvelope,
  faLocationDot,
  faPlus,
  faCheck,
  faXmark,
  faCircleExclamation,
  faUserTie,
  faCity,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import type {
  CategoriaProveedor,
  FormProveedor,
  Proveedor,
  TipoDocumentoProveedor,
  TipoProveedor,
} from "../types";
import { validarFormProveedor } from "../utils";

interface ModalFormProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorAEditar: Proveedor | null;
  proveedoresExistentes: Proveedor[];
  categoriasDisponibles: CategoriaProveedor[];
  onGuardarProveedor: (datos: FormProveedor, idProveedor?: string) => void;
}

const FORM_INICIAL: FormProveedor = {
  tipoDocumento: "NIT",
  numeroDocumento: "",
  razonSocial: "",
  tipoProveedor: "Jurídico",
  esImportado: false,
  categoriaIds: [],
  telefono: "",
  email: "",
  direccion: "",
  ciudad: "Bogotá D.C.",
  pais: "Colombia",
};

export function ModalFormProveedor({
  isOpen,
  onClose,
  proveedorAEditar,
  proveedoresExistentes,
  categoriasDisponibles,
  onGuardarProveedor,
}: ModalFormProveedorProps) {
  const [form, setForm] = useState<FormProveedor>(FORM_INICIAL);
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  // Inicializar formulario al abrir o cambiar modo edición/creación
  useEffect(() => {
    if (proveedorAEditar) {
      setForm({
        tipoDocumento: proveedorAEditar.tipoDocumento,
        numeroDocumento: proveedorAEditar.numeroDocumento,
        razonSocial: proveedorAEditar.razonSocial,
        tipoProveedor: proveedorAEditar.tipoProveedor,
        esImportado: proveedorAEditar.esImportado,
        categoriaIds: proveedorAEditar.categorias.map((c) => c.idCategoria),
        telefono: proveedorAEditar.telefono,
        email: proveedorAEditar.email,
        direccion: proveedorAEditar.direccion,
        ciudad: proveedorAEditar.ciudad || "Bogotá D.C.",
        pais: proveedorAEditar.pais || (proveedorAEditar.esImportado ? "Extranjero" : "Colombia"),
      });
    } else {
      setForm(FORM_INICIAL);
    }
    setIntentoEnvio(false);
  }, [proveedorAEditar, isOpen]);

  const errores = intentoEnvio
    ? validarFormProveedor(form, proveedoresExistentes, proveedorAEditar?.idProveedor)
    : {};

  const handleToggleCategoria = (idCat: number) => {
    setForm((prev) => {
      const existe = prev.categoriaIds.includes(idCat);
      return {
        ...prev,
        categoriaIds: existe
          ? prev.categoriaIds.filter((id) => id !== idCat)
          : [...prev.categoriaIds, idCat],
      };
    });
  };

  const handleQuitarCategoria = (idCat: number) => {
    setForm((prev) => ({
      ...prev,
      categoriaIds: prev.categoriaIds.filter((id) => id !== idCat),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIntentoEnvio(true);

    const erroresActuales = validarFormProveedor(
      form,
      proveedoresExistentes,
      proveedorAEditar?.idProveedor,
    );

    if (Object.keys(erroresActuales).length > 0) return;

    onGuardarProveedor(
      {
        ...form,
        razonSocial: form.razonSocial.trim(),
        numeroDocumento: form.numeroDocumento.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        pais: form.esImportado ? (form.pais.trim() || "Extranjero") : "Colombia",
      },
      proveedorAEditar?.idProveedor,
    );

    onClose();
  };

  const esEdicion = Boolean(proveedorAEditar);
  const categoriasSeleccionadas = categoriasDisponibles.filter((c) =>
    form.categoriaIds.includes(c.idCategoria),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
      description={
        esEdicion
          ? `Modifica los datos y categorías asociadas a ${proveedorAEditar?.razonSocial}`
          : "Ingresa los datos del proveedor, su condición de origen y asocia las categorías de insumos que suministra."
      }
      icon={faBuilding}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={esEdicion ? faCheck : faPlus}
            type="submit"
            form="form-proveedor"
          >
            {esEdicion ? "Guardar Cambios" : "Registrar Proveedor"}
          </Button>
        </div>
      }
    >
      <form id="form-proveedor" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 py-1">
        {intentoEnvio && Object.keys(errores).length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
            <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 text-sm shrink-0" />
            <div>
              <p className="font-bold">Corrige los campos marcados para continuar:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {Object.values(errores).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── 1. IDENTIFICACIÓN Y TIPO ── */}
        <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text flex items-center gap-2 border-b border-brand-sky/15 pb-2.5">
            <FontAwesomeIcon icon={faIdCard} className="text-brand-royal dark:text-brand-sky" />
            Identificación y Clasificación
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Tipo de Documento */}
            <div className="sm:col-span-4">
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Tipo de Documento <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup">
                {(["NIT", "Cédula"] as TipoDocumentoProveedor[]).map((tipoDoc) => {
                  const activo = form.tipoDocumento === tipoDoc;
                  return (
                    <button
                      key={tipoDoc}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setForm((p) => ({ ...p, tipoDocumento: tipoDoc }))}
                      className={`flex items-center justify-center rounded-xl border py-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal/40 ${
                        activo
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      {tipoDoc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Número de Documento */}
            <div className="sm:col-span-8">
              <Input
                label="Número de Documento *"
                placeholder={form.tipoDocumento === "NIT" ? "Ej: 900.842.105-3" : "Ej: 1.098.742.331"}
                value={form.numeroDocumento}
                onChange={(e) => setForm((p) => ({ ...p, numeroDocumento: e.target.value }))}
                error={errores.numeroDocumento}
                iconLeft={faIdCard}
              />
            </div>

            {/* Razón Social */}
            <div className="sm:col-span-12">
              <Input
                label="Razón Social / Nombre del Proveedor *"
                placeholder="Ej: Curtidos La Sabana S.A.S. o Juan Pérez"
                value={form.razonSocial}
                onChange={(e) => setForm((p) => ({ ...p, razonSocial: e.target.value }))}
                error={errores.razonSocial}
                iconLeft={faBuilding}
              />
            </div>

            {/* Tipo de Proveedor (Natural o Jurídico) */}
            <div className="sm:col-span-6">
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Tipo de Proveedor <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup">
                {(["Natural", "Jurídico"] as TipoProveedor[]).map((tipo) => {
                  const activo = form.tipoProveedor === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setForm((p) => ({ ...p, tipoProveedor: tipo }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                        activo
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      <FontAwesomeIcon icon={tipo === "Jurídico" ? faBuilding : faUserTie} />
                      <span>{tipo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Importado (Extranjero vs Nacional) */}
            <div className="sm:col-span-6">
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Origen del Proveedor <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      esImportado: false,
                      pais: "Colombia",
                    }))
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                    !form.esImportado
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-brand-navy"
                      : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-emerald-500"
                  }`}
                >
                  <span>🇨🇴 Nacional</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      esImportado: true,
                      pais: p.pais === "Colombia" ? "" : p.pais,
                    }))
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                    form.esImportado
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-sm dark:bg-indigo-500 dark:text-white"
                      : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-indigo-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faGlobe} />
                  <span>🌐 Importado</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. RELACIÓN ENTRE PROVEEDOR Y CATEGORÍAS (SELECCIÓN MÚLTIPLE) ── */}
        <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-sky/15 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
                <FontAwesomeIcon icon={faTags} className="text-brand-royal dark:text-brand-sky" />
                Categorías de Insumos Suministrados <span className="text-[#DC2626]">*</span>
              </h3>
              <p className="text-xs text-app-muted mt-0.5">
                Un proveedor puede suministrar insumos de múltiples categorías simultáneamente.
              </p>
            </div>

            <span className="text-xs font-bold text-brand-royal dark:text-brand-sky">
              {form.categoriaIds.length} {form.categoriaIds.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"}
            </span>
          </div>

          {/* Categorías actualmente asociadas (Badges removibles) */}
          {categoriasSeleccionadas.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-app-bg p-3 border border-brand-sky/15">
              <span className="text-xs font-bold text-app-muted mr-1">Seleccionadas:</span>
              {categoriasSeleccionadas.map((cat) => (
                <span
                  key={cat.idCategoria}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-royal/30 bg-brand-royal/10 dark:border-brand-sky/40 dark:bg-brand-sky/15 px-2.5 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky"
                >
                  <span>{cat.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleQuitarCategoria(cat.idCategoria)}
                    className="hover:text-rose-600 transition"
                    title={`Quitar ${cat.nombre}`}
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Catálogo de categorías disponibles para seleccionar */}
          <div>
            <label className="text-xs font-bold text-app-text mb-2 block">
              Haz clic sobre las categorías para asociarlas o desasociarlas:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {categoriasDisponibles.map((cat) => {
                const seleccionada = form.categoriaIds.includes(cat.idCategoria);
                return (
                  <button
                    key={cat.idCategoria}
                    type="button"
                    onClick={() => handleToggleCategoria(cat.idCategoria)}
                    className={`flex items-start justify-between gap-2 rounded-xl border p-2.5 text-left transition ${
                      seleccionada
                        ? "border-brand-royal bg-brand-royal/10 shadow-sm dark:border-brand-sky dark:bg-brand-sky/15"
                        : "border-brand-sky/20 bg-app-surface hover:border-brand-sky/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${seleccionada ? "text-brand-royal dark:text-brand-sky" : "text-app-text"}`}>
                        {cat.nombre}
                      </span>
                      {cat.descripcion && (
                        <span className="text-[10px] text-app-muted line-clamp-1">
                          {cat.descripcion}
                        </span>
                      )}
                    </div>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] ${
                        seleccionada
                          ? "border-brand-royal bg-brand-royal text-white dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy font-bold"
                          : "border-brand-sky/30 bg-app-bg text-transparent"
                      }`}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {errores.categorias && (
            <p className="text-xs font-semibold text-[#DC2626]">{errores.categorias}</p>
          )}
        </div>

        {/* ── 3. DATOS DE CONTACTO Y UBICACIÓN ── */}
        <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text flex items-center gap-2 border-b border-brand-sky/15 pb-2.5">
            <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
            Información de Contacto y Ubicación
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Teléfono de Contacto"
              placeholder="Ej: +57 (601) 789 4520 o 314 258 7963"
              value={form.telefono}
              onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
              error={errores.telefono}
              iconLeft={faPhone}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ej: compras@proveedor.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              error={errores.email}
              iconLeft={faEnvelope}
            />

            <Input
              label="Dirección Física"
              placeholder="Ej: Carrera 22 # 11-14 Zona Industrial"
              value={form.direccion}
              onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
              error={errores.direccion}
              iconLeft={faLocationDot}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Ciudad"
                placeholder="Ej: Bogotá D.C."
                value={form.ciudad}
                onChange={(e) => setForm((p) => ({ ...p, ciudad: e.target.value }))}
                iconLeft={faCity}
              />

              <Input
                label={form.esImportado ? "País de Origen *" : "País"}
                placeholder={form.esImportado ? "Ej: China, Brasil, Italia..." : "Colombia"}
                value={form.pais}
                onChange={(e) => setForm((p) => ({ ...p, pais: e.target.value }))}
                disabled={!form.esImportado}
                iconLeft={faGlobe}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ModalFormProveedor;

