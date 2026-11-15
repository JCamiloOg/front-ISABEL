import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faCheck,
  faReceipt,
  faBoxOpen,
  faHashtag,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { Venta } from "../../Ventas/types";
import type { Devolucion, ErroresFormDevolucion, FormDevolucion } from "../types";
import { MOTIVO_MAX_LENGTH, MOTIVO_MIN_LENGTH, MOTIVOS_SUGERIDOS } from "../constants";
import {
  calcularDisponibleDevolver,
  formatCOP,
  formatDate,
  soloEnteros,
  ventaTieneDisponible,
} from "../utils";

export interface ModalFormDevolucionProps {
  isOpen: boolean;
  onClose: () => void;
  ventas: Venta[];
  devoluciones: Devolucion[];
  /** Si viene informada, el modal funciona en modo edición. */
  devolucionAEditar: Devolucion | null;
  codigoSiguiente: string;
  onGuardar: (datos: FormDevolucion, idDevolucion?: string) => void;
}

export function ModalFormDevolucion({
  isOpen,
  onClose,
  ventas,
  devoluciones,
  devolucionAEditar,
  codigoSiguiente,
  onGuardar,
}: ModalFormDevolucionProps) {
  const esEdicion = Boolean(devolucionAEditar);

  const [idVenta, setIdVenta] = useState("");
  const [idDetalle, setIdDetalle] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState<ErroresFormDevolucion>({});

  // Reiniciar / precargar cada vez que se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setErrores({});
    if (devolucionAEditar) {
      setIdVenta(devolucionAEditar.idVenta);
      setIdDetalle(devolucionAEditar.idDetalle);
      setCantidad(String(devolucionAEditar.cantidad));
      setMotivo(devolucionAEditar.motivo);
    } else {
      setIdVenta("");
      setIdDetalle("");
      setCantidad("");
      setMotivo("");
    }
  }, [isOpen, devolucionAEditar]);

  const excluirId = devolucionAEditar?.idDevolucion;

  // Lista de ventas: en edición solo la venta original; en registro, las elegibles
  const ventasOpciones = useMemo(
    () =>
      devolucionAEditar
        ? ventas.filter((v) => v.idVenta === devolucionAEditar.idVenta)
        : ventas.filter((v) => ventaTieneDisponible(v, devoluciones)),
    [ventas, devoluciones, devolucionAEditar],
  );

  const ventaSeleccionada = useMemo(
    () => ventas.find((v) => v.idVenta === idVenta) ?? null,
    [ventas, idVenta],
  );

  const detalleSeleccionado = useMemo(
    () => ventaSeleccionada?.detalles.find((d) => d.idDetalle === idDetalle) ?? null,
    [ventaSeleccionada, idDetalle],
  );

  const disponible = useMemo(() => {
    if (!ventaSeleccionada || !detalleSeleccionado) return 0;
    return calcularDisponibleDevolver(
      ventaSeleccionada,
      detalleSeleccionado.idDetalle,
      devoluciones,
      excluirId,
    );
  }, [ventaSeleccionada, detalleSeleccionado, devoluciones, excluirId]);

  const cantidadNum = Number(cantidad) || 0;
  const valorReferencial = detalleSeleccionado ? detalleSeleccionado.precioUnitario * cantidadNum : 0;

  const handleCambiarVenta = (valor: string) => {
    setIdVenta(valor);
    setIdDetalle("");
    setCantidad("");
    setErrores((prev) => ({ ...prev, idVenta: undefined, idDetalle: undefined, cantidad: undefined }));
  };

  const handleCambiarDetalle = (valor: string) => {
    setIdDetalle(valor);
    setErrores((prev) => ({ ...prev, idDetalle: undefined, cantidad: undefined }));

    // Si solo hay una unidad disponible la proponemos automáticamente
    const venta = ventaSeleccionada;
    if (venta && valor) {
      const disp = calcularDisponibleDevolver(venta, valor, devoluciones, excluirId);
      setCantidad(disp === 1 ? "1" : "");
    } else {
      setCantidad("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nuevosErrores: ErroresFormDevolucion = {};

    if (!ventaSeleccionada) {
      nuevosErrores.idVenta = "Selecciona la venta asociada a la devolución";
    }
    if (!detalleSeleccionado) {
      nuevosErrores.idDetalle = "Selecciona el producto, variante y talla a devolver";
    }

    if (detalleSeleccionado) {
      if (!cantidad || cantidadNum <= 0) {
        nuevosErrores.cantidad = "Ingresa una cantidad mayor a 0";
      } else if (cantidadNum > disponible) {
        nuevosErrores.cantidad =
          disponible === 0
            ? "Este producto ya no tiene unidades disponibles para devolver"
            : `Solo se pueden devolver hasta ${disponible} unidad(es)`;
      }
    } else if (!cantidad || cantidadNum <= 0) {
      nuevosErrores.cantidad = "Ingresa una cantidad mayor a 0";
    }

    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) {
      nuevosErrores.motivo = "El motivo de la devolución es obligatorio";
    } else if (motivoLimpio.length < MOTIVO_MIN_LENGTH) {
      nuevosErrores.motivo = `Describe el motivo con al menos ${MOTIVO_MIN_LENGTH} caracteres`;
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    onGuardar(
      {
        idVenta,
        idDetalle,
        cantidad: cantidadNum,
        motivo: motivoLimpio,
      },
      devolucionAEditar?.idDevolucion,
    );
  };

  const opcionesVentas = [
    { value: "", label: "Selecciona una venta..." },
    ...ventasOpciones.map((v) => ({
      value: v.idVenta,
      label: `${v.codigoVenta} · ${v.cliente.nombre} · ${v.cliente.tipoDocumento} ${v.cliente.documento} · ${formatDate(v.fecha)}`,
    })),
  ];

  const opcionesDetalles = [
    { value: "", label: ventaSeleccionada ? "Selecciona un producto..." : "Primero selecciona una venta" },
    ...(ventaSeleccionada
      ? ventaSeleccionada.detalles.map((d) => {
          const disp = calcularDisponibleDevolver(ventaSeleccionada, d.idDetalle, devoluciones, excluirId);
          return {
            value: d.idDetalle,
            label: `${d.nombreProducto} · ${d.colorNombre} · Talla ${d.numeroTalla} (${disp} disp.)`,
            disabled: disp === 0,
          };
        })
      : []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? "Editar Devolución" : "Registrar Devolución"}
      description={
        esEdicion
          ? `Actualiza la cantidad o el motivo de ${devolucionAEditar?.codigoDevolucion}`
          : `Se creará la solicitud ${codigoSiguiente} en estado Pendiente`
      }
      icon={faRotateLeft}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" icon={faCheck} type="submit" form="form-devolucion">
            {esEdicion ? "Guardar Cambios" : "Registrar Devolución"}
          </Button>
        </div>
      }
    >
      <form id="form-devolucion" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 py-1">
        {esEdicion && (
          <div className="flex items-start gap-2 rounded-xl border border-brand-sky/20 bg-brand-royal/5 p-3 text-xs text-app-muted dark:bg-brand-sky/5">
            <FontAwesomeIcon icon={faLock} className="mt-0.5 text-brand-royal dark:text-brand-sky" />
            <span>
              La venta y el producto no se pueden modificar. Si fueron seleccionados por error, rechaza esta
              solicitud y registra una nueva.
            </span>
          </div>
        )}

        {/* 1. Venta */}
        <Select
          label="Venta *"
          value={idVenta}
          onChange={(e) => handleCambiarVenta(e.target.value)}
          options={opcionesVentas}
          error={errores.idVenta}
          iconLeft={faReceipt}
          disabled={esEdicion}
          helper={
            !esEdicion && ventasOpciones.length === 0
              ? "No hay ventas con productos disponibles para devolver."
              : "Código de venta · cliente · documento · fecha"
          }
        />

        {/* 2. Producto / variante / talla */}
        <Select
          label="Producto / Variante / Talla *"
          value={idDetalle}
          onChange={(e) => handleCambiarDetalle(e.target.value)}
          options={opcionesDetalles}
          error={errores.idDetalle}
          iconLeft={faBoxOpen}
          disabled={esEdicion || !ventaSeleccionada}
        />

        {/* Resumen del producto elegido */}
        {detalleSeleccionado && (
          <div className="flex items-center gap-3 rounded-xl border border-brand-sky/20 bg-app-bg p-3">
            <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-brand-sky/20 bg-brand-sky/10">
              {detalleSeleccionado.imagen && (
                <img
                  src={detalleSeleccionado.imagen}
                  alt={detalleSeleccionado.nombreProducto}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate text-sm font-extrabold text-app-text">
                {detalleSeleccionado.nombreProducto}
              </p>
              <p className="text-app-muted">
                SKU {detalleSeleccionado.sku} · {detalleSeleccionado.colorNombre} · Talla{" "}
                {detalleSeleccionado.numeroTalla}
              </p>
              <p className="text-app-muted">
                Vendidas: <strong className="text-app-text">{detalleSeleccionado.cantidad}</strong> · Disponibles
                para devolver: <strong className="text-app-text">{disponible}</strong> · Precio:{" "}
                <strong className="text-app-text">{formatCOP(detalleSeleccionado.precioUnitario)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* 3. Cantidad a devolver */}
        <Input
          label="Cantidad a devolver *"
          placeholder="0"
          inputMode="numeric"
          value={cantidad}
          onChange={(e) => {
            setCantidad(soloEnteros(e.target.value));
            setErrores((prev) => ({ ...prev, cantidad: undefined }));
          }}
          error={errores.cantidad}
          iconLeft={faHashtag}
          disabled={!detalleSeleccionado}
          helper={
            detalleSeleccionado
              ? `Máximo permitido: ${disponible} · Valor referencial: ${formatCOP(valorReferencial)}`
              : "Selecciona primero el producto"
          }
        />

        {/* 4. Motivo */}
        <div className="flex flex-col gap-2">
          <Textarea
            label="Motivo de la devolución *"
            placeholder="Describe por qué el cliente devuelve el producto (defecto, talla, garantía, etc.)..."
            rows={3}
            maxLength={MOTIVO_MAX_LENGTH}
            currentLength={motivo.length}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              setErrores((prev) => ({ ...prev, motivo: undefined }));
            }}
            error={errores.motivo}
          />
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS_SUGERIDOS.map((sugerido) => (
              <button
                key={sugerido}
                type="button"
                onClick={() => {
                  setMotivo(sugerido);
                  setErrores((prev) => ({ ...prev, motivo: undefined }));
                }}
                className="rounded-full border border-brand-sky/30 bg-brand-sky/10 px-2.5 py-1 text-[11px] font-semibold text-brand-royal transition hover:bg-brand-sky/20 dark:text-brand-sky"
              >
                {sugerido}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ModalFormDevolucion;
