import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faUser,
  faUserTie,
  faBoxesStacked,
  faHandHoldingDollar,
  faPaperclip,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { Venta } from "../types";
import { formatCOP, formatDate } from "../utils";

interface ModalDetalleVentaProps {
  isOpen: boolean;
  onClose: () => void;
  venta: Venta | null;
  onAbrirAbonar?: (venta: Venta) => void;
}

export function ModalDetalleVenta({
  isOpen,
  onClose,
  venta,
  onAbrirAbonar,
}: ModalDetalleVentaProps) {
  if (!venta) return null;

  const esCredito = venta.tipoVenta === "Crédito";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta: ${venta.codigoVenta}`}
      description={`Registrada el ${formatDate(venta.fecha)} por ${venta.usuarioResponsable}`}
      icon={faReceipt}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                venta.estado === "Pagada"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              }`}
            >
              <FontAwesomeIcon icon={venta.estado === "Pagada" ? faCheckCircle : faClock} />
              {venta.estado}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {esCredito && venta.saldoPendiente > 0 && onAbrirAbonar && (
              <Button
                variant="primary"
                size="md"
                icon={faHandHoldingDollar}
                onClick={() => {
                  onClose();
                  onAbrirAbonar(venta);
                }}
              >
                Registrar Abono
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
        {/* Encabezado: Cliente y Vendedor */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cliente */}
          <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faUser} />
              <span>Cliente Comprador</span>
            </div>
            <p className="text-sm font-extrabold text-app-text">{venta.cliente.nombre}</p>
            <div className="text-xs text-app-muted flex flex-col gap-1">
              <span><strong>Documento:</strong> {venta.cliente.tipoDocumento} {venta.cliente.documento}</span>
              <span><strong>Teléfono:</strong> {venta.cliente.telefono}</span>
              <span><strong>Ciudad:</strong> {venta.cliente.ciudad}</span>
            </div>
          </div>

          {/* Vendedor y Condiciones */}
          <div className="rounded-xl border border-brand-sky/20 bg-app-surface p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faUserTie} />
              <span>Responsable y Modalidad</span>
            </div>
            <p className="text-sm font-extrabold text-app-text">{venta.usuarioResponsable}</p>
            <div className="text-xs text-app-muted flex flex-col gap-1">
              <span><strong>Tipo de Venta:</strong> {venta.tipoVenta}</span>
              {venta.metodoPago && <span><strong>Método Pago:</strong> {venta.metodoPago}</span>}
              {venta.comprobanteNombre && (
                <span className="flex items-center gap-1 text-brand-royal dark:text-brand-sky font-semibold">
                  <FontAwesomeIcon icon={faPaperclip} />
                  Comprobante: {venta.comprobanteNombre}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detalle de Productos */}
        <div className="rounded-xl border border-brand-sky/20 bg-app-surface overflow-hidden">
          <div className="p-3.5 border-b border-brand-sky/15 bg-app-bg flex items-center justify-between">
            <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-brand-royal dark:text-brand-sky" />
              Productos y Tallas Vendidas
            </h4>
            <span className="text-xs text-app-muted">{venta.detalles.length} ítems</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-sky/15 text-app-muted font-bold uppercase">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3 text-center">Talla</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sky/15">
                {venta.detalles.map((det) => (
                  <tr key={det.idDetalle}>
                    <td className="py-2.5 px-3 font-bold text-app-text">
                      {det.nombreProducto}
                    </td>
                    <td className="py-2.5 px-3 text-app-muted">{det.colorNombre}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5 font-bold text-app-text">
                        {det.numeroTalla}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-app-text">
                      {det.cantidad}
                    </td>
                    <td className="py-2.5 px-3 text-right text-app-muted">
                      {formatCOP(det.precioUnitario)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-brand-royal dark:text-brand-sky">
                      {formatCOP(det.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen numérico */}
          <div className="bg-app-bg p-4 border-t border-brand-sky/15 flex flex-col items-end gap-1.5 text-xs">
            <div className="flex justify-between w-64 text-app-muted">
              <span>Subtotal:</span>
              <span className="font-semibold text-app-text">{formatCOP(venta.subtotal)}</span>
            </div>
            {venta.descuento > 0 && (
              <div className="flex justify-between w-64 text-emerald-600 dark:text-emerald-400">
                <span>Descuento:</span>
                <span className="font-semibold">-{formatCOP(venta.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-app-muted">
              <span>IVA (19%):</span>
              <span className="font-semibold text-app-text">{formatCOP(venta.iva)}</span>
            </div>
            <div className="flex justify-between w-64 border-t border-brand-sky/20 pt-1.5 text-sm font-extrabold text-brand-royal dark:text-brand-sky">
              <span>Total:</span>
              <span>{formatCOP(venta.total)}</span>
            </div>

            {esCredito && (
              <div className="flex justify-between w-64 border-t border-brand-sky/15 pt-1.5 text-xs">
                <span className="text-app-muted">Saldo Pendiente:</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {formatCOP(venta.saldoPendiente)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Historial de Abonos (para ventas a crédito) */}
        {esCredito && (
          <div className="rounded-xl border border-brand-sky/20 bg-app-surface overflow-hidden">
            <div className="p-3.5 border-b border-brand-sky/15 bg-app-bg flex items-center justify-between">
              <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                <FontAwesomeIcon icon={faHandHoldingDollar} className="text-brand-royal dark:text-brand-sky" />
                Historial de Abonos Realizados ({venta.abonos.length})
              </h4>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Total abonado: {formatCOP(venta.total - venta.saldoPendiente)}
              </span>
            </div>

            {venta.abonos.length === 0 ? (
              <p className="p-4 text-center text-xs text-app-muted">
                No se han registrado abonos aún para esta venta.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-sky/15 text-app-muted font-bold uppercase">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Caja</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3 text-right">Monto Abonado</th>
                      <th className="py-2.5 px-3">Observaciones</th>
                      <th className="py-2.5 px-3">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sky/15">
                    {venta.abonos.map((abn) => (
                      <tr key={abn.idAbono} className="hover:bg-app-bg">
                        <td className="py-2.5 px-3 whitespace-nowrap text-app-muted">
                          {formatDate(abn.fecha)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-app-text">{abn.cajaNombre}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5 font-semibold text-brand-royal dark:text-brand-sky">
                            {abn.metodoPago}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCOP(abn.monto)}
                        </td>
                        <td className="py-2.5 px-3 text-app-muted max-w-xs truncate" title={abn.observaciones}>
                          {abn.observaciones || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          {abn.comprobanteNombre ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-brand-royal dark:text-brand-sky">
                              <FontAwesomeIcon icon={faPaperclip} />
                              {abn.comprobanteNombre}
                            </span>
                          ) : (
                            <span className="text-app-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalDetalleVenta;
