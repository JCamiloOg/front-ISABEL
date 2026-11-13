import { useState } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import type { Caja, FormCaja, TipoCaja } from "../types";
import { TIPOS_CAJA } from "../constants";
import { formatoMiles, limpiarEspacios, soloDigitos, validarCaja } from "../utils";

interface ModalCajaProps {
  isOpen: boolean;
  cajas: Caja[];
  onCerrar: () => void;
  onGuardar: (datos: { nombre: string; tipo: TipoCaja; saldo: number }) => void;
}

export function ModalCaja({ isOpen, cajas, onCerrar, onGuardar }: ModalCajaProps) {
  const [form, setForm] = useState<FormCaja>({ nombre: "", tipo: "", saldo: "" });
  const [intento, setIntento] = useState(false);

  const errores = intento ? validarCaja(form, cajas) : {};

  const handleClose = () => {
    setForm({ nombre: "", tipo: "", saldo: "" });
    setIntento(false);
    onCerrar();
  };

  const manejarEnvio = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIntento(true);
    const erroresActuales = validarCaja(form, cajas);
    if (Object.keys(erroresActuales).length > 0 || form.tipo === "") return;

    onGuardar({
      nombre: limpiarEspacios(form.nombre),
      tipo: form.tipo,
      saldo: Number(form.saldo),
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar caja"
      description="Crea una cuenta bancaria o una caja de efectivo con su saldo inicial."
      icon={faBuildingColumns}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="md" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" icon={faPlus} type="submit" form="form-caja">
            Guardar caja
          </Button>
        </div>
      }
    >
      <form id="form-caja" onSubmit={manejarEnvio} noValidate className="flex flex-col gap-4 py-1">
        <Input
          label="Nombre de la caja *"
          placeholder="Ej.: Cuenta Bancolombia Principal"
          value={form.nombre}
          onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
          error={errores.nombre}
          maxLength={40}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-app-text">
            Tipo de caja <span className="text-[#DC2626]">*</span>
          </label>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Tipo de caja">
            {TIPOS_CAJA.map((tipo) => {
              const activo = form.tipo === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setForm((p) => ({ ...p, tipo }))}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-royal/40 ${
                    activo
                      ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                      : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal dark:hover:border-brand-sky"
                  }`}
                >
                  {tipo}
                  {activo && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                </button>
              );
            })}
          </div>
          {errores.tipo && <p className="text-xs font-semibold text-[#DC2626]">{errores.tipo}</p>}
        </div>

        <Input
          label="Saldo inicial *"
          placeholder="0"
          inputMode="numeric"
          value={formatoMiles(form.saldo)}
          onChange={(e) => setForm((p) => ({ ...p, saldo: soloDigitos(e.target.value) }))}
          error={errores.saldo}
          iconLeft={<span className="text-sm font-bold text-app-muted">$</span>}
          helper="Puedes iniciar en 0 si la caja no tiene saldo al momento de registro."
        />
      </form>
    </Modal>
  );
}

export default ModalCaja;

