import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRulerCombined,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faMars,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";

export default function TallaProducts() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRulerCombined} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Tallas
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo de tallas locales y conversiones internacionales por género
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
          >
            Restablecer
          </Button>

          <Button
            variant="primary"
            icon={faPlus}
          >
            Nueva Talla
          </Button>
        </div>
      </div>

      {/* ─── Métricas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Tallas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRulerCombined} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-app-text mt-2">0</p>
          <p className="mt-1 text-xs text-app-muted">Registradas en el catálogo</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Masculinas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faMars} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">0</p>
          <p className="mt-1 text-xs text-app-muted">Numeración masculina</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Femeninas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <FontAwesomeIcon icon={faVenus} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-pink-600 dark:text-pink-400 mt-2">0</p>
          <p className="mt-1 text-xs text-app-muted">Numeración femenina</p>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              placeholder="Buscar por número o talla int..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>
          <div>
            <Select
              options={[
                { value: "all", label: "Género: Todos" },
                { value: "Masculino", label: "Masculino" },
                { value: "Femenino", label: "Femenino" },
              ]}
            />
          </div>
          <div>
            <Select
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay tallas registradas en el catálogo.
      </div>
    </div>
  );
}
