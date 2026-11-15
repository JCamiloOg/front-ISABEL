import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faReceipt,
  faUser,
  faUserTie,
  faShoePrints,
  faCheck,
  faXmark,
  faPenToSquare,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { Devolucion } from "../types";
import { formatCOP, formatDate } from "../utils";
import { EstadoBadge } from "./EstadoBadge";

interface ModalDetalleDevolucionProps {
  isOpen: boolean;
  onClose: () => void;
  devolucion: Devolucion | null;
  onEditar?: (devolucion: Devolucion) => void;
  onAprobar?: (devolucion: Devolucion) => void;
  onRechazar?: (devolucion: Devolucion) => void;
}

export function ModalDetalleDevolucion({
  isOpen,
  onClose,
  devolucion,
  onEditar,
  onAprobar,
  onRechazar,
}: ModalDetalleDevolucionProps) {
  if (!devolucion) return null;

  const pendiente = devolucion.estado === "Pendiente";
  const valorReferencial = devolucion.precioUnitario * devolucion.cantidad;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Devolución: ${devolucion.codigoDevolucion}`}
      description={`Solicitada el ${formatDate(devolucion.fechaSolicitud)} por ${devolucion.usuarioResponsable}`}
      icon={faRotateLeft}
      size="xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <EstadoBadge estado={devolucion.estado} />

          <div className="flex flex-wrap items-center gap-2.5">
            {pendiente && onEditar && (
              <Button
                variant="outline"
                size="md"
                icon={faPenToSquare}
                onClick={() => {
                  onClose();
                  onEditar(devolucion);
                }}
              >
                Editar
              </Button>
            )}
            {pendiente && onRechazar && (
              <Button
                variant="outline"
                size="md"
                icon={faXmark}
                className="text-rose-600 dark:text-rose-400"
                onClick={() => {
                  onClose();
                  onRechazar(devolucion);
                }}
              >
                Rechazar
              </Button>
            )}
            {pendiente && onAprobar && (
              <Button
                variant="primary"
                size="md"
                icon={faCheck}
                onClick={() => {
                  onClose();
                  onAprobar(devolucion);
                }}
              >
                Aprobar
              </Button>
            )}
            <Button variant="outline" size="md" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Venta y Cliente */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faUser} />
              <span>Cliente</span>
            </div>
            <p className="text-sm font-extrabold text-app-text">{devolucion.cliente.nombre}</p>
            <div className="text-xs text-app-muted flex flex-col gap-1">
              <span>
                <strong>Documento:</strong> {devolucion.cliente.tipoDocumento} {devolucion.cliente.documento}
              </span>
              <span>
                <strong>Teléfono:</strong> {devolucion.cliente.telefono}
              </span>
              <span>
                <strong>Ciudad:</strong> {devolucion.cliente.ciudad}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faReceipt} />
              <span>Venta asociada</span>
            </div>
            <p className="font-mono text-sm font-extrabold text-app-text">{devolucion.codigoVenta}</p>
            <div className="text-xs text-app-muted flex flex-col gap-1">
              <span>
                <strong>Fecha de venta:</strong> {formatDate(devolucion.fechaVenta)}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faUserTie} className="text-[10px]" />
                <strong>Registrada por:</strong> {devolucion.usuarioResponsable}
              </span>
            </div>
          </div>
        </div>

        {/* Producto devuelto */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface overflow-hidden">
          <div className="p-3.5 border-b border-brand-sky/15 bg-app-bg flex items-center justify-between">
            <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
              <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
              Producto devuelto
            </h4>
            <span className="text-xs text-app-muted">SKU {devolucion.sku}</span>
          </div>

          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-brand-sky/20 bg-brand-sky/10 flex items-center justify-center text-2xl text-brand-royal dark:text-brand-sky">
              {devolucion.imagen ? (
                <img
                  src={devolucion.imagen}
                  alt={devolucion.nombreProducto}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faShoePrints} />
              )}
            </div>

            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-4">
                <p className="text-base font-extrabold text-app-text">{devolucion.nombreProducto}</p>
              </div>
              <div>
                <p className="text-app-muted">Color</p>
                <p className="font-bold text-app-text">{devolucion.colorNombre}</p>
              </div>
              <div>
                <p className="text-app-muted">Talla</p>
                <p className="font-bold text-app-text">{devolucion.numeroTalla}</p>
              </div>
              <div>
                <p className="text-app-muted">Cant. devuelta</p>
                <p className="font-bold text-app-text">
                  {devolucion.cantidad} de {devolucion.cantidadVendida}
                </p>
              </div>
              <div>
                <p className="text-app-muted">Valor referencial</p>
                <p className="font-extrabold text-brand-royal dark:text-brand-sky">
                  {formatCOP(valorReferencial)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={faCircleInfo} />
            <span>Motivo de la devolución</span>
          </div>
          <p className="text-sm leading-relaxed text-app-text">{devolucion.motivo}</p>
        </div>

        {/* Motivo de rechazo */}
        {devolucion.estado === "Rechazada" && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
              <FontAwesomeIcon icon={faXmark} />
              <span>Motivo del rechazo</span>
            </div>
            <p className="text-sm leading-relaxed text-app-text">
              {devolucion.motivoRechazo || "Sin motivo registrado."}
            </p>
          </div>
        )}

        {/* Trazabilidad */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-app-text">Trazabilidad</h4>
          <ol className="flex flex-col gap-3 border-l-2 border-brand-sky/30 pl-4 text-xs">
            <li className="relative">
              <span className="absolute -left-5.25 top-1 size-2.5 rounded-full bg-brand-royal dark:bg-brand-sky" />
              <p className="font-bold text-app-text">Solicitud registrada</p>
              <p className="text-app-muted">{formatDate(devolucion.fechaSolicitud)}</p>
            </li>
            {devolucion.fechaResolucion ? (
              <li className="relative">
                <span
                  className={`absolute -left-5.25 top-1 size-2.5 rounded-full ${
                    devolucion.estado === "Aprobada" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <p className="font-bold text-app-text">
                  {devolucion.estado === "Aprobada" ? "Devolución aprobada" : "Devolución rechazada"}
                </p>
                <p className="text-app-muted">{formatDate(devolucion.fechaResolucion)}</p>
              </li>
            ) : (
              <li className="relative">
                <span className="absolute -left-5.25 top-1 size-2.5 rounded-full bg-amber-500" />
                <p className="font-bold text-app-text">Pendiente de resolución</p>
                <p className="text-app-muted">Aún no se ha aprobado ni rechazado.</p>
              </li>
            )}
          </ol>
        </div>
      </div>
    </Modal>
  );
}

export default ModalDetalleDevolucion;
