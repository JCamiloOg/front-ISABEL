import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCartPlus,
  faDollarSign,
  faReceipt,
  faFileInvoiceDollar,
  faScaleUnbalanced,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";

export function VentasPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCartPlus} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Ventas
              </h1>
              <p className="text-sm text-app-muted">
                Registro de facturación comercial, cartera a crédito y recaudos de abonos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={faPlus}
          >
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* ─── Métricas Ejecutivas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Facturado</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-app-text">$0</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">0 ventas totales</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Ventas de Contado</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faReceipt} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">$0</span>
          </div>
          <p className="mt-1 text-xs text-app-muted font-medium">Liquidez de contado</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Ventas a Crédito</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">$0</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Financiación concedida</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Cartera por Cobrar</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faScaleUnbalanced} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">$0</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Saldo pendiente por recaudar</p>
        </div>
      </div>

      {/* ─── Pestañas de Vista ─── */}
      <div className="flex items-center gap-2 border-b border-app-border">
        <button
          type="button"
          className="pb-3 px-4 font-bold text-sm border-b-2 border-brand-royal text-brand-royal dark:border-brand-sky dark:text-brand-sky"
        >
          Facturación y Ventas
        </button>
        <button
          type="button"
          className="pb-3 px-4 font-bold text-sm text-app-muted hover:text-app-text"
        >
          Historial de Abonos
        </button>
      </div>

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay ventas registradas en el sistema.
      </div>
    </div>
  );
}

export default VentasPage;
