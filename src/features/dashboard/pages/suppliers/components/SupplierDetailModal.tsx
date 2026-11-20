import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faIdCard,
  faPhone,
  faEnvelope,
  faLocationDot,
  faCalendarDay,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Switcher } from "../../../components/Switcher";
import type { Supplier } from "../types";
import { formatDate } from "../utils";

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
  onToggleStatus?: (supplier: Supplier) => void;
}

export function SupplierDetailModal({
  isOpen,
  onClose,
  supplier,
  onEdit,
  onToggleStatus,
}: SupplierDetailModalProps) {
  if (!supplier) return null;

  const esActivo = supplier.status === "Activo";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Proveedor"
      description={`Consulta detallada de información comercial y contacto de ${supplier.businessName}`}
      icon={faBuilding}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {/* Switch de Estado */}
          <div className="flex items-center gap-2.5">
            <Switcher
              checked={esActivo}
              onChange={() => onToggleStatus && onToggleStatus(supplier)}
              showLabel={true}
              labels={{ active: "Activo", inactive: "Inactivo" }}
              size="md"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={faPenToSquare}
              onClick={() => {
                onClose();
                onEdit(supplier);
              }}
            >
              Editar Proveedor
            </Button>
            <Button variant="outline" size="md" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Encabezado: Nombre y Documento */}
        <div className="rounded-xl border border-brand-sky/20 bg-brand-royal/5 dark:bg-brand-sky/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
              {supplier.supplierType}
            </span>
            <h3 className="text-lg font-extrabold text-app-text mt-0.5">
              {supplier.businessName}
            </h3>
            <p className="text-xs text-app-muted mt-1 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faIdCard} />
              <span>{supplier.documentType}: <strong>{supplier.documentNumber}</strong></span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-app-muted">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarDay} className="text-brand-sky" />
              Registrado: {formatDate(supplier.registrationDate)}
            </span>
          </div>
        </div>

        {/* Datos de Contacto */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider border-b border-brand-sky/15 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
            Canales de Contacto
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faPhone} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Teléfono:</span>
                <span className="font-bold text-app-text">{supplier.phone || "No registrado"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faEnvelope} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Correo Electrónico:</span>
                <span className="font-bold text-app-text truncate">{supplier.email || "No registrado"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5 sm:col-span-2">
              <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Dirección:</span>
                <span className="font-bold text-app-text">{supplier.address || "No registrada"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SupplierDetailModal;
