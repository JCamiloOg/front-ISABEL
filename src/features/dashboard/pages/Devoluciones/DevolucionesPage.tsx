import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateLeft,
  faClock,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";

export function DevolucionesPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRotateLeft} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Devoluciones
              </h1>
              <p className="text-sm text-app-muted">
                Registro, revisión y resolución de garantías y cambios de producto
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={faPlus}
          >
            Nueva Devolución
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Métricas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Solicitudes</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">0</span>
            <span className="text-xs text-app-muted">casos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Historial completo</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">En Revisión</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">0</span>
            <span className="text-xs text-app-muted">pendientes</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Requieren respuesta</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Aprobadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">0</span>
            <span className="text-xs text-app-muted">reingresadas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">0 pares devueltos</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Rechazadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faCircleXmark} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">0</span>
            <span className="text-xs text-app-muted">desestimadas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Con motivo registrado</p>
        </div>
      </div>

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay registros de devoluciones en el sistema.
      </div>
    </div>
  );
}

export default DevolucionesPage;
