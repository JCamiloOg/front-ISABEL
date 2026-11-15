import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { Devolucion } from "../types";
import { MOTIVO_MAX_LENGTH, MOTIVO_MIN_LENGTH } from "../constants";
import { formatCOP } from "../utils";

export type AccionEstado = "Aprobada" | "Rechazada";

interface ModalCambiarEstadoProps {
  isOpen: boolean;
  onClose: () => void;
  devolucion: Devolucion | null;
  accion: AccionEstado;
  /** `motivoRechazo` solo viene informado cuando la acción es "Rechazada". */
  onConfirmar: (devolucion: Devolucion, accion: AccionEstado, motivoRechazo?: string) => void;
}

export function ModalCambiarEstado({
  isOpen,
  onClose,
  devolucion,
  accion,
  onConfirmar,
}: ModalCambiarEstadoProps) {
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMotivoRechazo("");
      setError("");
    }
  }, [isOpen, devolucion, accion]);

  if (!devolucion) return null;

  const esRechazo = accion === "Rechazada";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (esRechazo) {
      const limpio = motivoRechazo.trim();
      if (!limpio) {
        setError("El motivo del rechazo es obligatorio");
        return;
      }
      if (limpio.length < MOTIVO_MIN_LENGTH) {
        setError(`Describe el motivo con al menos ${MOTIVO_MIN_LENGTH} caracteres`);
        return;
      }
      onConfirmar(devolucion, accion, limpio);
      return;
    }

    onConfirmar(devolucion, accion);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esRechazo ? "Rechazar Devolución" : "Aprobar Devolución"}
      description={`${devolucion.codigoDevolucion} · ${devolucion.cliente.nombre}`}
      icon={esRechazo ? faXmark : faCheck}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={esRechazo ? faXmark : faCheck}
            type="submit"
            form="form-cambiar-estado"
          >
            {esRechazo ? "Confirmar Rechazo" : "Confirmar Aprobación"}
          </Button>
        </div>
      }
    >
      <form
        id="form-cambiar-estado"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 py-1"
      >
        <div className="rounded-xl border border-brand-sky/20 bg-app-bg p-4 text-xs">
          <p className="text-sm font-extrabold text-app-text">{devolucion.nombreProducto}</p>
          <p className="mt-0.5 text-app-muted">
            {devolucion.colorNombre} · Talla {devolucion.numeroTalla} · Venta {devolucion.codigoVenta}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-brand-sky/15 pt-3">
            <span className="text-app-muted">
              Cantidad: <strong className="text-app-text">{devolucion.cantidad}</strong>
            </span>
            <span className="text-app-muted">
              Valor referencial:{" "}
              <strong className="text-brand-royal dark:text-brand-sky">
                {formatCOP(devolucion.precioUnitario * devolucion.cantidad)}
              </strong>
            </span>
          </div>
          <p className="mt-3 text-app-muted">
            <strong className="text-app-text">Motivo del cliente:</strong> {devolucion.motivo}
          </p>
        </div>

        {esRechazo ? (
          <Textarea
            label="Motivo del rechazo *"
            placeholder="Explica por qué no procede la devolución..."
            rows={3}
            maxLength={MOTIVO_MAX_LENGTH}
            currentLength={motivoRechazo.length}
            value={motivoRechazo}
            onChange={(e) => {
              setMotivoRechazo(e.target.value);
              setError("");
            }}
            error={error}
          />
        ) : (
          <p className="text-sm leading-relaxed text-app-muted">
            Al aprobar, la devolución quedará registrada con la fecha de resolución de hoy y las
            {" "}
            <strong className="text-app-text">{devolucion.cantidad}</strong> unidad(es) se contarán como
            devueltas de la venta.
          </p>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5" />
          <span>Esta acción es definitiva: una devolución aprobada o rechazada ya no puede modificarse.</span>
        </div>
      </form>
    </Modal>
  );
}

export default ModalCambiarEstado;
