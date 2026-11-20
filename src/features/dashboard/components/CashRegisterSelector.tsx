import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faBuildingColumns,
  faWallet,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface CashRegisterOption {
  id: number | string;
  name: string;
  currentBalance?: number | string;
  registerType?: string;
}

export interface CashRegisterSelectorProps {
  cashRegisters: CashRegisterOption[];
  value: number | string;
  onChange: (id: number | string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function CashRegisterSelector({
  cashRegisters = [],
  value,
  onChange,
  label = "Caja o Cuenta Afectada *",
  error,
  disabled = false,
}: CashRegisterSelectorProps) {
  const formatMoney = (val?: number | string) => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getRegisterIcon = (name: string, type?: string): IconDefinition => {
    const text = `${name} ${type || ""}`.toLowerCase();
    if (text.includes("banco") || text.includes("cuenta") || text.includes("bancolombia") || text.includes("davivienda")) {
      return faBuildingColumns;
    }
    if (text.includes("chica") || text.includes("menor") || text.includes("auxiliar")) {
      return faWallet;
    }
    return faCashRegister;
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-app-text select-none flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        {cashRegisters.length > 0 && (
          <span className="text-[11px] text-app-muted">
            {cashRegisters.length} {cashRegisters.length === 1 ? "opción disponible" : "opciones disponibles"}
          </span>
        )}
      </div>

      {cashRegisters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-app-border p-3.5 text-center text-xs text-app-muted">
          No hay cajas o cuentas registradas disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {cashRegisters.map((reg) => {
            const isSelected = String(reg.id) === String(value);
            const icon = getRegisterIcon(reg.name, reg.registerType);
            const formattedBalance = formatMoney(reg.currentBalance);

            return (
              <button
                key={reg.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(reg.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none outline-none ${
                  isSelected
                    ? "border-brand-royal bg-brand-royal/10 dark:border-brand-sky dark:bg-brand-sky/15 shadow-2xs ring-1 ring-brand-royal/30 dark:ring-brand-sky/30"
                    : "border-app-border bg-app-surface hover:border-brand-royal/40 dark:hover:border-brand-sky/40 hover:bg-app-surface-alt/70"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {/* Ícono de caja o banco */}
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-brand-royal text-white shadow-2xs dark:bg-brand-royal"
                      : "bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky"
                  }`}
                >
                  <FontAwesomeIcon icon={icon} />
                </div>

                {/* Info de la caja */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`text-xs font-bold truncate transition-colors ${
                      isSelected
                        ? "text-brand-royal dark:text-brand-sky"
                        : "text-app-text"
                    }`}
                    title={reg.name}
                  >
                    {reg.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {formattedBalance !== null ? (
                      <span className="text-[11px] font-mono font-medium text-app-muted truncate">
                        Saldo: <strong className="text-app-text">{formattedBalance}</strong>
                      </span>
                    ) : (
                      <span className="text-[10px] text-app-muted uppercase tracking-wider font-semibold">
                        Caja activa
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkmark activo */}
                {isSelected && (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-royal text-white dark:bg-brand-royal text-[10px] shadow-2xs">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <span className="text-[11px] font-semibold text-rose-500 block">{error}</span>}
    </div>
  );
}

export default CashRegisterSelector;
