import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVault,
  faPenToSquare,
  faPlus,
  faXmark,
  faFloppyDisk,
  faBuildingColumns,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import type { CashRegister, CashRegisterWithRelations } from "../../../../../@types";
import type { BoxPayload } from "../services/boxesServices";

interface BoxFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  box?: CashRegister | CashRegisterWithRelations | null;
  onSubmit: (data: BoxPayload, onClose: () => void) => Promise<void> | void;
  isLoading?: boolean;
  onSubmitLoading?: boolean;
}

export function BoxFormModal({
  isOpen,
  onClose,
  mode,
  box,
  onSubmit,
  isLoading = false,
  onSubmitLoading = false,
}: BoxFormModalProps) {
  const [name, setName] = useState<string>("");
  const [registerType, setRegisterType] = useState<string>("Efectivo");
  const [currentBalance, setCurrentBalance] = useState<string>("0");
  const [details, setDetails] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && box) {
      setName(box.name || "");
      setRegisterType(box.registerType || "Efectivo");
      setCurrentBalance(String(box.currentBalance ?? 0));
      setDetails(box.details || "");
      setStatus(box.status ?? true);
      setErrors({});
    } else if (mode === "create") {
      setName("");
      setRegisterType("Efectivo");
      setCurrentBalance("0");
      setDetails("");
      setStatus(true);
      setErrors({});
    }
  }, [mode, box, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "El nombre de la caja es obligatorio.";
    }

    if (!registerType.trim()) {
      errs.registerType = "El tipo de caja es obligatorio.";
    }

    if (!details.trim()) {
      errs.details = "Los detalles o descripción son obligatorios.";
    }

    const numBalance = Number(currentBalance);
    if (isNaN(numBalance) || numBalance < 0) {
      errs.currentBalance = "El saldo debe ser un número válido mayor o igual a 0.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: BoxPayload = {
      name: name.trim(),
      registerType: registerType.trim(),
      currentBalance: Number(currentBalance),
      details: details.trim(),
      status,
    };

    await onSubmit(payload, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nueva Caja o Cuenta" : "Editar Caja o Cuenta"}
      description={
        mode === "create"
          ? "Crea una nueva caja menor en efectivo o cuenta bancaria para operaciones"
          : `Actualiza los datos y descripción de la caja #${box?.id}`
      }
      icon={mode === "create" ? faPlus : faPenToSquare}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            {onSubmitLoading
              ? "Guardando..."
              : mode === "create"
              ? "Crear Caja"
              : "Guardar Cambios"}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 py-6 animate-pulse">
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-10 bg-app-border/50 rounded-xl" />
          <div className="h-20 bg-app-border/50 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Nombre de la Caja / Cuenta *
            </label>
            <Input
              placeholder="Ej. Caja Principal, Bancolombia Corriente..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Tipo de Cuenta *
              </label>
              <Select
                value={registerType}
                onChange={(e) => setRegisterType(e.target.value)}
                options={[
                  { value: "Efectivo", label: "Efectivo (Caja Menor)" },
                  { value: "Cuenta Bancaria", label: "Cuenta Bancaria" },
                  { value: "Digital", label: "Billetera Digital / Nequi / Daviplata" },
                ]}
                error={errors.registerType}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
                Saldo Inicial / Actual ($) *
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                error={errors.currentBalance}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1.5">
              Detalles / Observaciones *
            </label>
            <Textarea
              placeholder="Descripción breve de la finalidad, número de cuenta o custodio..."
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              error={errors.details}
            />
          </div>

          {mode === "edit" && (
            <div className="pt-2 border-t border-app-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-app-text">Estado Operativo</span>
                <p className="text-[11px] text-app-muted">Permite habilitar o deshabilitar transacciones en esta caja</p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  status
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {status ? "Activa" : "Inactiva"}
              </button>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
