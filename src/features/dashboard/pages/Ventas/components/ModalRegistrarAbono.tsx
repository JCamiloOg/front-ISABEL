import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingDollar,
  faPaperclip,
  faCheck,
  faBuildingColumns,
  faMoneyBillWave,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { MetodoPagoVenta, Venta } from "../types";
import { CAJAS_DISPONIBLES } from "../constants";
import { formatCOP, formatoMiles, soloDigitos } from "../utils";

export interface ModalRegistrarAbonoProps {
  isOpen: boolean;
  onClose: () => void;
  venta: Venta | null;
  onGuardarAbono: (datos: {
    idVenta: string;
    cajaId: string;
    cajaNombre: string;
    metodoPago: MetodoPagoVenta;
    monto: number;
    comprobanteUrl?: string;
    comprobanteNombre?: string;
    observaciones?: string;
  }) => void;
}

export function ModalRegistrarAbono({
  isOpen,
  onClose,
  venta,
  onGuardarAbono,
}: ModalRegistrarAbonoProps) {
  const [cajaId, setCajaId] = useState(CAJAS_DISPONIBLES[0]?.id || "");
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta>("Efectivo");
  const [monto, setMonto] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [errorMonto, setErrorMonto] = useState("");
  const [errorCaja, setErrorCaja] = useState("");
  const [errorComprobante, setErrorComprobante] = useState("");

  // Reiniciar estado cada vez que se abre el modal o cambia la venta
  useEffect(() => {
    if (isOpen) {
      setCajaId(CAJAS_DISPONIBLES[0]?.id || "");
      setMetodoPago("Efectivo");
      setMonto("");
      setComprobanteFile(null);
      setObservaciones("");
      setErrorMonto("");
      setErrorCaja("");
      setErrorComprobante("");
    }
  }, [isOpen, venta]);

  const handleReset = () => {
    setCajaId(CAJAS_DISPONIBLES[0]?.id || "");
    setMetodoPago("Efectivo");
    setMonto("");
    setComprobanteFile(null);
    setObservaciones("");
    setErrorMonto("");
    setErrorCaja("");
    setErrorComprobante("");
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprobanteFile(e.target.files[0]);
      setErrorComprobante("");
    }
  };

  const handlePagarTodo = () => {
    if (!venta) return;
    setMonto(String(venta.saldoPendiente));
    setErrorMonto("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!venta) return;

    let hasError = false;

    if (!cajaId) {
      setErrorCaja("Debes seleccionar una caja");
      hasError = true;
    } else {
      setErrorCaja("");
    }

    const valorAbono = Number(monto);
    if (!monto || valorAbono <= 0) {
      setErrorMonto("Ingresa un monto válido mayor a 0");
      hasError = true;
    } else if (valorAbono > venta.saldoPendiente) {
      setErrorMonto(
        `El abono no puede superar el saldo pendiente (${formatCOP(venta.saldoPendiente)})`,
      );
      hasError = true;
    } else {
      setErrorMonto("");
    }

    if (metodoPago === "Transferencia" && !comprobanteFile) {
      setErrorComprobante("El comprobante de pago es obligatorio cuando el método es transferencia.");
      hasError = true;
    } else {
      setErrorComprobante("");
    }

    if (hasError) return;

    const cajaSeleccionada = CAJAS_DISPONIBLES.find((c) => c.id === cajaId);

    onGuardarAbono({
      idVenta: venta.idVenta,
      cajaId,
      cajaNombre: cajaSeleccionada ? cajaSeleccionada.nombre : "Caja Registrada",
      metodoPago,
      monto: valorAbono,
      comprobanteNombre: comprobanteFile ? comprobanteFile.name : undefined,
      comprobanteUrl: comprobanteFile ? URL.createObjectURL(comprobanteFile) : undefined,
      observaciones: observaciones.trim() || undefined,
    });

    handleReset();
  };

  if (!venta) return null;

  const opcionesCajas = CAJAS_DISPONIBLES.map((c) => ({
    value: c.id,
    label: `${c.nombre} (${c.tipo})`,
  }));

  const nuevoSaldoEstimado = Math.max(0, venta.saldoPendiente - (Number(monto) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Registrar Abono a Crédito"
      description={`Abono para la venta ${venta.codigoVenta} a nombre de ${venta.cliente.nombre}`}
      icon={faHandHoldingDollar}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={handleReset}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={faCheck}
            type="submit"
            form="form-abono"
          >
            Registrar Abono
          </Button>
        </div>
      }
    >
      <form id="form-abono" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 py-1">
        {/* Resumen del crédito */}
        <div className="rounded-xl border border-brand-sky/20 bg-brand-royal/5 p-4 dark:border-brand-sky/30 dark:bg-brand-sky/5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-app-muted">Total de la venta: </span>
              <strong className="text-app-text font-bold">{formatCOP(venta.total)}</strong>
            </div>
            <div>
              <span className="text-app-muted">Saldo pendiente actual: </span>
              <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                {formatCOP(venta.saldoPendiente)}
              </strong>
            </div>
          </div>

          {Number(monto) > 0 && Number(monto) <= venta.saldoPendiente && (
            <div className="mt-2.5 pt-2 border-t border-brand-sky/20 flex items-center justify-between text-xs">
              <span className="text-app-muted">Nuevo saldo después del abono:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCOP(nuevoSaldoEstimado)}
              </span>
            </div>
          )}
        </div>

        {/* 1. Caja */}
        <Select
          label="Caja *"
          value={cajaId}
          onChange={(e) => {
            setCajaId(e.target.value);
            setErrorCaja("");
          }}
          options={opcionesCajas}
          error={errorCaja}
          iconLeft={faBuildingColumns}
        />

        {/* 2. Método de pago */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-app-text">
            Método de pago <span className="text-[#DC2626]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Método de pago">
            {(["Efectivo", "Transferencia"] as MetodoPagoVenta[]).map((metodo) => {
              const activo = metodoPago === metodo;
              return (
                <button
                  key={metodo}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => {
                    setMetodoPago(metodo);
                    setErrorComprobante("");
                    if (metodo === "Efectivo") {
                      setComprobanteFile(null);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal/40 ${
                    activo
                      ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                      : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal dark:hover:border-brand-sky"
                  }`}
                >
                  <FontAwesomeIcon icon={metodo === "Efectivo" ? faMoneyBillWave : faBuildingColumns} />
                  <span>{metodo}</span>
                  {activo && <FontAwesomeIcon icon={faCheck} className="text-xs ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Monto del abono */}
        <div>
          <Input
            label="Monto del abono *"
            placeholder="0"
            inputMode="numeric"
            value={formatoMiles(monto)}
            onChange={(e) => {
              setMonto(soloDigitos(e.target.value));
              setErrorMonto("");
            }}
            error={errorMonto}
            iconLeft={<span className="text-sm font-bold text-app-muted">$</span>}
            helper={`Máximo a abonar: ${formatCOP(venta.saldoPendiente)}`}
          />
          {venta.saldoPendiente > 0 && (
            <button
              type="button"
              onClick={handlePagarTodo}
              className="mt-1.5 text-xs font-bold text-brand-royal hover:underline dark:text-brand-sky inline-flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
              Abonar el valor total pendiente ({formatCOP(venta.saldoPendiente)})
            </button>
          )}
        </div>

        {/* 4. Comprobante de pago (SÓLO SI ES TRANSFERENCIA) */}
        {metodoPago === "Transferencia" && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-brand-sky/20 bg-app-surface p-3 transition">
            <label className="text-xs font-bold text-app-text flex items-center gap-1.5">
              <FontAwesomeIcon icon={faPaperclip} className="text-brand-sky" />
              Comprobante de pago (Transferencia) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="text-xs text-app-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-royal/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-royal hover:file:bg-brand-royal/20 dark:file:bg-brand-sky/15 dark:file:text-brand-sky"
            />
            {comprobanteFile && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ Archivo seleccionado: {comprobanteFile.name}
              </p>
            )}
            {errorComprobante && (
              <p className="text-xs text-[#DC2626] font-medium mt-1">
                {errorComprobante}
              </p>
            )}
            <p className="text-[11px] text-app-muted">
              Adjunta la captura o recibo de la transferencia bancaria.
            </p>
          </div>
        )}

        {/* 5. Observaciones (Opcional) */}
        <Textarea
          label="Observaciones (opcional)"
          placeholder="Comentarios adicionales sobre este abono..."
          rows={2}
          maxLength={200}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default ModalRegistrarAbono;
