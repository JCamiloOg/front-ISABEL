import { useState } from "react";
import type { FormEvent } from "react";
import {
  faMoneyBillWave,
  faPlus,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { Caja, DatosGasto, FormGasto } from "../types";
import {
  capitalizar,
  formatoCOP,
  formatoMiles,
  hoyISO,
  limpiarEspacios,
  normalizar,
  soloDigitos,
  validarGasto,
} from "../utils";

interface ModalGastoProps {
  isOpen: boolean;
  cajas: Caja[];
  conceptos: string[];
  onCerrar: () => void;
  onGuardar: (datos: DatosGasto) => void;
  onNuevoConcepto: (concepto: string) => void;
}

export function ModalGasto({
  isOpen,
  cajas,
  conceptos,
  onCerrar,
  onGuardar,
  onNuevoConcepto,
}: ModalGastoProps) {
  const [form, setForm] = useState<FormGasto>({
    concepto: "",
    fecha: hoyISO(),
    cajaId: "",
    valor: "",
    descripcion: "",
  });
  const [intento, setIntento] = useState(false);
  const [agregandoConcepto, setAgregandoConcepto] = useState(false);
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [errorConcepto, setErrorConcepto] = useState("");

  const errores = intento ? validarGasto(form, cajas) : {};
  const cajaSeleccionada = cajas.find((c) => c.id === form.cajaId);

  const actualizar = <K extends keyof FormGasto>(campo: K, valor: FormGasto[K]) =>
    setForm((previo) => ({ ...previo, [campo]: valor }));

  const handleClose = () => {
    setForm({
      concepto: "",
      fecha: hoyISO(),
      cajaId: "",
      valor: "",
      descripcion: "",
    });
    setIntento(false);
    setAgregandoConcepto(false);
    setNuevoConcepto("");
    setErrorConcepto("");
    onCerrar();
  };

  const agregarConcepto = () => {
    const limpio = capitalizar(limpiarEspacios(nuevoConcepto));
    if (!limpio) {
      setErrorConcepto("Escribe el nombre del concepto.");
      return;
    }
    if (limpio.length > 30) {
      setErrorConcepto("El concepto no puede superar los 30 caracteres.");
      return;
    }
    if (conceptos.some((c) => normalizar(c) === normalizar(limpio))) {
      setErrorConcepto("Ese concepto ya existe.");
      return;
    }

    onNuevoConcepto(limpio);
    actualizar("concepto", limpio);
    setNuevoConcepto("");
    setErrorConcepto("");
    setAgregandoConcepto(false);
  };

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIntento(true);
    const erroresActuales = validarGasto(form, cajas);
    if (Object.keys(erroresActuales).length > 0) return;

    onGuardar({
      concepto: form.concepto,
      fecha: form.fecha,
      cajaId: form.cajaId,
      valor: Number(form.valor),
      descripcion: limpiarEspacios(form.descripcion),
    });
    handleClose();
  };

  const opcionesConceptos = [
    { value: "", label: "Selecciona un concepto" },
    ...conceptos.map((c) => ({ value: c, label: c })),
  ];

  const opcionesCajas = [
    { value: "", label: "Selecciona una caja" },
    ...cajas.map((c) => ({
      value: c.id,
      label: `${c.nombre} — Saldo: ${formatoCOP(c.saldo)}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar gasto"
      description="El valor se descontará únicamente de la caja de origen seleccionada."
      icon={faMoneyBillWave}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" icon={faPlus} type="submit" form="form-gasto">
            Guardar gasto
          </Button>
        </div>
      }
    >
      <form id="form-gasto" onSubmit={manejarEnvio} noValidate className="flex flex-col gap-4 py-1">
        {/* Concepto */}
        <div className="flex flex-col gap-2">
          <Select
            label="Concepto *"
            value={form.concepto}
            onChange={(e) => actualizar("concepto", e.target.value)}
            error={errores.concepto}
            options={opcionesConceptos}
          />

          {agregandoConcepto ? (
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-brand-royal/40 bg-brand-royal/5 p-3 dark:border-brand-sky/40 dark:bg-brand-sky/5">
              <span className="text-xs font-bold text-app-text">Nuevo concepto</span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  maxLength={30}
                  autoFocus
                  value={nuevoConcepto}
                  onChange={(e) => {
                    setNuevoConcepto(e.target.value);
                    setErrorConcepto("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarConcepto();
                    }
                  }}
                  placeholder="Ej.: Mantenimiento preventivo"
                  className="flex-1 min-w-[200px] rounded-xl border border-brand-sky/30 bg-app-surface px-3 py-2 text-sm text-app-text outline-none focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/20 dark:focus:border-brand-sky"
                />
                <Button size="sm" variant="primary" onClick={agregarConcepto}>
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAgregandoConcepto(false);
                    setNuevoConcepto("");
                    setErrorConcepto("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
              {errorConcepto && (
                <p className="text-xs font-semibold text-[#DC2626]">{errorConcepto}</p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAgregandoConcepto(true)}
              className="self-start text-xs font-bold text-brand-royal hover:underline dark:text-brand-sky"
            >
              + Agregar nuevo concepto
            </button>
          )}
        </div>

        {/* Fecha y Caja en fila responsive */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Fecha *"
            type="date"
            max={hoyISO()}
            value={form.fecha}
            onChange={(e) => actualizar("fecha", e.target.value)}
            error={errores.fecha}
            iconLeft={faCalendarDay}
          />

          <Select
            label="Caja de origen *"
            value={form.cajaId}
            onChange={(e) => actualizar("cajaId", e.target.value)}
            error={errores.cajaId}
            helper={
              cajaSeleccionada
                ? `Saldo disponible: ${formatoCOP(cajaSeleccionada.saldo)}`
                : undefined
            }
            options={opcionesCajas}
          />
        </div>

        {/* Valor */}
        <Input
          label="Valor del gasto *"
          placeholder="0"
          inputMode="numeric"
          value={formatoMiles(form.valor)}
          onChange={(e) => actualizar("valor", soloDigitos(e.target.value))}
          error={errores.valor}
          iconLeft={<span className="text-sm font-bold text-app-muted">$</span>}
        />

        {/* Descripción */}
        <Textarea
          label="Descripción (opcional)"
          placeholder="Añade detalles relevantes sobre este gasto..."
          rows={3}
          maxLength={200}
          showCount
          currentLength={form.descripcion.length}
          value={form.descripcion}
          onChange={(e) => actualizar("descripcion", e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default ModalGasto;

