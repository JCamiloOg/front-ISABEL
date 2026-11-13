import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import type { Caja } from "../types";
import { formatoCOP } from "../utils";

interface CajaCardProps {
  caja: Caja;
}

export function CajaCard({ caja }: CajaCardProps) {
  const esBanco = caja.tipo === "Cuenta bancaria";

  return (
    <article className="flex flex-col justify-between gap-3 rounded-2xl border border-brand-sky/20 bg-app-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={esBanco ? faBuildingColumns : faMoneyBillWave} className="text-lg" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-app-text" title={caja.nombre}>
              {caja.nombre}
            </h3>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                esBanco
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-brand-sky/30 dark:bg-brand-sky/15 dark:text-brand-sky"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}
            >
              {caja.tipo}
            </span>
          </div>
        </div>

        {caja.saldo === 0 && (
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
            Sin saldo
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-brand-sky/10">
        <p className="text-xs font-medium text-app-muted">Saldo disponible</p>
        <p className="mt-0.5 text-2xl font-extrabold leading-tight text-brand-royal dark:text-brand-sky">
          {formatoCOP(caja.saldo)}
        </p>
      </div>
    </article>
  );
}

export default CajaCard;

