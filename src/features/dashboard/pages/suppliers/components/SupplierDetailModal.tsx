import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faBuilding,
  faUserTie,
  faGlobe,
  faPhone,
  faEnvelope,
  faLocationDot,
  faTag,
  faCircleCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import type { SupplierWithRelations } from "../../../../../@types";

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierWithRelations | null;
  isLoading: boolean;
}

export function SupplierDetailModal({
  isOpen,
  onClose,
  supplier,
  isLoading,
}: SupplierDetailModalProps) {
  if (!isOpen) return null;

  const isCompany = supplier?.supplierType === "Jurídica" || supplier?.supplierType === "Empresa";
  const categories = supplier?.categories || [];
  const purchases = supplier?.purchases || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Proveedor"
      description={`Información comercial, categoría y compras asociadas a ${supplier?.businessName || ""}`}
      icon={faIndustry}
      size="lg"
    >
      {isLoading ? (
        <div className="space-y-4 py-8 animate-pulse">
          <div className="h-20 bg-app-border/40 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-app-border/40 rounded-xl" />
            <div className="h-16 bg-app-border/40 rounded-xl" />
          </div>
        </div>
      ) : !supplier ? (
        <div className="py-12 text-center text-app-muted">
          No se encontró la información del proveedor solicitado.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card con Razón Social y Estado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-linear-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky shadow-inner">
                <FontAwesomeIcon icon={isCompany ? faBuilding : faUserTie} className="text-2xl" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-app-text">{supplier.businessName}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${supplier.status === "Active" || supplier.status === "Activo"
                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      }`}
                  >
                    <FontAwesomeIcon
                      icon={supplier.status === "Active" || supplier.status === "Activo" ? faCircleCheck : faBan}
                      className="text-[10px]"
                    />
                    {supplier.status === "Active" || supplier.status === "Activo" ? "Activo" : "Inactivo"}
                  </span>
                  {supplier.isImported && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <FontAwesomeIcon icon={faGlobe} className="text-[9px]" />
                      Importado
                    </span>
                  )}
                </div>
                <p className="text-xs text-app-muted mt-1 font-mono">
                  NIT / Doc: <strong className="text-app-text">{supplier.document}</strong>
                  {supplier.documentType && ` (${supplier.documentType.documentType})`}
                </p>
                <p className="text-xs text-app-muted font-medium">
                  Tipo: <strong className="text-app-text">{supplier.supplierType}</strong>
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                Compras Realizadas
              </span>
              <p className="text-2xl sm:text-3xl font-black text-brand-royal dark:text-brand-sky mt-0.5">
                {purchases.length}
              </p>
              <span className="text-[11px] text-app-muted">Órdenes de abastecimiento</span>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                <FontAwesomeIcon icon={faPhone} className="text-emerald-500" />
                Teléfono
              </span>
              <p className="text-sm font-bold text-app-text truncate">{supplier.phone || "No registrado"}</p>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                <FontAwesomeIcon icon={faEnvelope} className="text-indigo-500" />
                Correo Electrónico
              </span>
              <p className="text-sm font-bold text-app-text truncate" title={supplier.email}>
                {supplier.email || "No registrado"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-app-border bg-app-surface">
              <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                <FontAwesomeIcon icon={faLocationDot} className="text-rose-500" />
                Dirección / Sede
              </span>
              <p className="text-sm font-bold text-app-text truncate" title={supplier.address || ""}>
                {supplier.address || "No registrada"}
              </p>
            </div>
          </div>

          {/* Categorías Asignadas */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTag} className="text-brand-royal dark:text-brand-sky" />
              Líneas y Categorías de Suministro ({categories.length})
            </h4>

            {categories.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-app-border text-xs text-app-muted text-center">
                Este proveedor no tiene categorías asignadas actualmente.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => (
                  <span
                    key={c.supplierCategoryId || i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-sky/30 bg-brand-sky/10 px-3 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky"
                  >
                    <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                    {c.supplierCategory?.name || `Categoría #${c.supplierCategoryId}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
