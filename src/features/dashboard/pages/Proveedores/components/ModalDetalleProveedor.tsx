import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faIdCard,
  faTags,
  faPhone,
  faEnvelope,
  faLocationDot,
  faCalendarDay,
  faCheckCircle,
  faBan,
  faPenToSquare,
  faCity,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { Proveedor } from "../types";
import { formatDate } from "../utils";

interface ModalDetalleProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
  onEditar: (proveedor: Proveedor) => void;
}

export function ModalDetalleProveedor({
  isOpen,
  onClose,
  proveedor,
  onEditar,
}: ModalDetalleProveedorProps) {
  if (!proveedor) return null;

  const esActivo = proveedor.estado === "Activo";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Proveedor"
      description={`Consulta detallada de información y categorías asociadas a ${proveedor.razonSocial}`}
      icon={faBuilding}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
              esActivo
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400"
            }`}
          >
            <FontAwesomeIcon icon={esActivo ? faCheckCircle : faBan} />
            {proveedor.estado}
          </span>

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
              {proveedor.tipoProveedor} • {proveedor.esImportado ? `Importado (${proveedor.pais})` : "Nacional (Colombia)"}
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

        {/* Categorías asociadas (Muchos a Muchos) */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-brand-sky/15 pb-2">
            <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
              <FontAwesomeIcon icon={faTags} className="text-brand-royal dark:text-brand-sky" />
              Categorías de Insumos Suministrados ({proveedor.categorias.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {proveedor.categorias.map((cat) => (
              <div
                key={cat.idCategoria}
                className="flex flex-col rounded-xl border border-brand-sky/20 bg-app-bg p-3"
              >
                <span className="font-extrabold text-xs text-brand-royal dark:text-brand-sky">
                  {cat.nombre}
                </span>
                {cat.descripcion && (
                  <span className="text-[11px] text-app-muted mt-0.5">
                    {cat.descripcion}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Datos de Contacto y Ubicación */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-app-text uppercase tracking-wider border-b border-brand-sky/15 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
            Canales de Contacto y Dirección
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

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Dirección:</span>
                <span className="font-bold text-app-text">{proveedor.direccion || "No registrada"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-app-bg p-2.5">
              <FontAwesomeIcon icon={faCity} className="text-brand-royal dark:text-brand-sky" />
              <div>
                <span className="text-[10px] text-app-muted block">Ciudad / País:</span>
                <span className="font-bold text-app-text">
                  {proveedor.ciudad || "—"}, {proveedor.pais || "Colombia"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalDetalleProveedor;
