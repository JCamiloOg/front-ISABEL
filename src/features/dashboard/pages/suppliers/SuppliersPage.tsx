import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faIndustry,
  faBuilding,
  faUserTie,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";

export function SuppliersPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faIndustry} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Proveedores
              </h1>
              <p className="text-sm text-app-muted">
                Registro, consulta y administración de personas naturales y jurídicas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={faPlus}
          >
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* ─── Métricas Ejecutivas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Proveedores</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faIndustry} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">0</span>
            <span className="text-xs text-app-muted">activos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Directorio comercial</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Jurídicos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faBuilding} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">0</span>
            <span className="text-xs text-app-muted">empresas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Con NIT / Razón Social</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Naturales</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faUserTie} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">0</span>
            <span className="text-xs text-app-muted">personas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Artesanos y contratistas</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Importados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faGlobe} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">0</span>
            <span className="text-xs text-app-muted">origen int.</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Comercio exterior</p>
        </div>
      </div>

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay proveedores registrados en el sistema.
      </div>
    </div>
  );
}

export default SuppliersPage;
