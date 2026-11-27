import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPlus,
  faXmark,
  faFloppyDisk,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import type { Supplier, SupplierWithRelations } from "../../../../../@types";
import type { CreateSupplierData, UpdateSupplierData } from "../services/suppliersServices";
import type { SupplierCategoryRecord } from "../services/suppliersCategoryServices";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  supplier?: Supplier | SupplierWithRelations | null;
  categoriesList: SupplierCategoryRecord[];
  onSubmit: (data: CreateSupplierData | UpdateSupplierData, onClose: () => void) => Promise<void> | void;
  isLoading?: boolean;
  onSubmitLoading?: boolean;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  mode,
  supplier,
  categoriesList,
  onSubmit,
  isLoading = false,
  onSubmitLoading = false,
}: SupplierFormModalProps) {
  const [document, setDocument] = useState<string>("");
  const [documentTypeId, setDocumentTypeId] = useState<string>("1");
  const [supplierType, setSupplierType] = useState<string>("Jurídica");
  const [businessName, setBusinessName] = useState<string>("");
  const [isImported, setIsImported] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("Active");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && supplier) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDocument(supplier.document || "");
      setDocumentTypeId(String(supplier.documentTypeId || 1));
      setSupplierType(supplier.supplierType || "Jurídica");
      setBusinessName(supplier.businessName || "");
      setIsImported(Boolean(supplier.isImported));
      setPhone(supplier.phone || "");
      setEmail(supplier.email || "");
      setAddress(supplier.address || "");
      setStatus(supplier.status || "Active");

      const cats = (supplier as SupplierWithRelations).categories?.map((c) => c.supplierCategoryId) || [];
      setSelectedCategoryIds(cats);
      setErrors({});
    } else if (mode === "create") {
      setDocument("");
      setDocumentTypeId("1");
      setSupplierType("Jurídica");
      setBusinessName("");
      setIsImported(false);
      setPhone("");
      setEmail("");
      setAddress("");
      setStatus("Active");
      setSelectedCategoryIds(categoriesList.length > 0 ? [categoriesList[0].id] : []);
      setErrors({});
    }
  }, [mode, supplier, isOpen, categoriesList]);

  if (!isOpen) return null;

  const toggleCategory = (catId: number) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (mode === "create" && !document.trim()) {
      errs.document = "El número de documento o NIT es obligatorio.";
    }

    if (!businessName.trim()) {
      errs.businessName = "La razón social o nombre comercial es obligatorio.";
    }

    if (!phone.trim()) {
      errs.phone = "El teléfono de contacto es obligatorio.";
    }

    if (!email.trim() || !email.includes("@")) {
      errs.email = "Ingresa un correo electrónico válido.";
    }

    if (mode === "create" && selectedCategoryIds.length === 0) {
      errs.categories = "Debes seleccionar al menos una categoría de suministro.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "create") {
      const payload: CreateSupplierData = {
        supplierInfo: {
          document: document.trim(),
          documentTypeId: Number(documentTypeId),
          supplierType,
          businessName: businessName.trim(),
          isImported,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim() || null,
        },
        categories: selectedCategoryIds,
      };
      await onSubmit(payload, onClose);
    } else {
      const payload: UpdateSupplierData = {
        supplierInfo: {
          documentTypeId: Number(documentTypeId),
          supplierType,
          businessName: businessName.trim(),
          isImported,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim() || null,
          status,
        },
      };
      await onSubmit(payload, onClose);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nuevo Proveedor" : "Editar Proveedor"}
      description={
        mode === "create"
          ? "Registra una empresa o persona natural proveedora de insumos o calzado"
          : `Actualiza la información comercial del proveedor ${supplier?.businessName}`
      }
      icon={mode === "create" ? faPlus : faPenToSquare}
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
            onClick={handleSubmit}
            disabled={isLoading || onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            {onSubmitLoading
              ? "Guardando..."
              : mode === "create"
                ? "Registrar Proveedor"
                : "Guardar Cambios"}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 py-6 animate-pulse">
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-20 bg-app-border/50 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Tipo de Persona *
              </label>
              <Select
                value={supplierType}
                onChange={(e) => setSupplierType(e.target.value)}
                options={[
                  { value: "Jurídica", label: "Jurídica (Empresa con NIT)" },
                  { value: "Natural", label: "Natural (Persona con C.C.)" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Tipo de Documento *
              </label>
              <Select
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
                options={[
                  { value: "1", label: "NIT (Número de Identificación Tributaria)" },
                  { value: "2", label: "Cédula de Ciudadanía (CC)" },
                  { value: "3", label: "Cédula de Extranjería (CE)" },
                  { value: "4", label: "Pasaporte" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Documento / NIT *
              </label>
              <Input
                placeholder="Ej. 901234567-8"
                value={document}
                disabled={mode === "edit"}
                onChange={(e) => setDocument(e.target.value)}
                error={errors.document}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Razón Social / Nombre Comercial *
              </label>
              <Input
                placeholder="Ej. Cueros Isabel S.A.S."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                error={errors.businessName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Teléfono de Contacto *
              </label>
              <Input
                placeholder="Ej. 3123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Correo Electrónico *
              </label>
              <Input
                type="email"
                placeholder="contacto@proveedor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Dirección Comercial / Ubicación
            </label>
            <Input
              placeholder="Calle, Ciudad o Zona industrial..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border border-app-border bg-app-surface">
            <div>
              <span className="text-xs font-bold text-app-text">Origen del Proveedor</span>
              <p className="text-[11px] text-app-muted">¿La mercancía es importada del exterior?</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-app-text">
              <input
                type="checkbox"
                checked={isImported}
                onChange={(e) => setIsImported(e.target.checked)}
                className="rounded text-brand-royal"
              />
              Proveedor Internacional / Importado
            </label>
          </div>

          {/* Categorías de Proveedor */}
          {mode === "create" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted">
                Categorías de Suministro *
              </label>
              {errors.categories && (
                <p className="text-xs text-rose-500 font-semibold">{errors.categories}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isSelected
                        ? "bg-brand-royal text-white border-brand-royal dark:bg-brand-sky dark:text-brand-royal"
                        : "bg-app-surface text-app-muted border-app-border hover:border-brand-sky"
                        }`}
                    >
                      <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="pt-2 border-t border-app-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-app-text">Estado del Proveedor</span>
                <p className="text-[11px] text-app-muted">Permite activar o desactivar relaciones comerciales</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === "Active" ? "Inactive" : "Active")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${status === "Active"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                  }`}
              >
                {status === "Active" ? "Activo" : "Inactivo"}
              </button>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
