import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faIdCard,
  faPhone,
  faEnvelope,
  faLocationDot,
  faCalendarDay,
  faPenToSquare,
  faCity,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Switcher } from "../../../components/Switcher";
import type { Proveedor } from "../types";
import { formatDate } from "../utils";

interface ModalDetalleProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
  onEditar: (proveedor: Proveedor) => void;
  onToggleEstado?: (proveedor: Proveedor) => void;
}

export function ModalDetalleProveedor({
  isOpen,
  onClose,
  proveedor,
  onEditar,
  onToggleEstado,
}: ModalDetalleProveedorProps) {
  if (!proveedor) return null;

  const esActivo = proveedor.estado === "Activo";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Proveedor"
      description={`Consulta detallada de información comercial y contacto de ${proveedor.razonSocial}`}
      icon={faBuilding}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {/* Switch de Estado */}
          <div className="flex items-center gap-2.5">
            <Switcher
              checked={esActivo}
              onChange={() => onToggleEstado && onToggleEstado(proveedor)}
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
                onEditar(proveedor);
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
              {proveedor.tipoProveedor} • {proveedor.esImportado ? `Importado (${proveedor.pais || "Extranjero"})` : "Nacional (Colombia)"}
            </span>
            <h3 className="text-lg font-extrabold text-app-text mt-0.5">
              {proveedor.razonSocial}
            </h3>
            <p className="text-xs text-app-muted mt-1 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faIdCard} />
              <span>{proveedor.tipoDocumento}: <strong>{proveedor.numeroDocumento}</strong></span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-app-muted">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarDay} className="text-brand-sky" />
              Registrado: {formatDate(proveedor.fechaRegistro)}
            </span>
          </div>
        </div>

        {/* Datos de Contacto y Ubicación */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider border-b border-brand-sky/15 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
            Canales de Contacto y Ubicación
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faPhone} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Teléfono:</span>
                <span className="font-bold text-app-text">{proveedor.telefono || "No registrado"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faEnvelope} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Correo Electrónico:</span>
                <span className="font-bold text-app-text truncate">{proveedor.email || "No registrado"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5 sm:col-span-2">
              <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Dirección:</span>
                <span className="font-bold text-app-text">{proveedor.direccion || "No registrada"}</span>
              </div>
            </div>

            {(proveedor.ciudad || proveedor.pais) && (
              <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5 sm:col-span-2">
                <FontAwesomeIcon icon={faCity} className="text-brand-royal dark:text-brand-sky" />
                <div>
                  <span className="text-[10px] text-app-muted block">Origen:</span>
                  <span className="font-bold text-app-text">
                    {[proveedor.ciudad, proveedor.pais].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalDetalleProveedor;
