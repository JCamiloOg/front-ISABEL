import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPiggyBank,
  faBuildingColumns,
  faMoneyBillWave,
  faCheckCircle,
  faCashRegister,
  faVault,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";

export default function BoxesPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal y Acciones ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faVault} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Cajas Menores y Cuentas
              </h1>
              <p className="text-sm text-app-muted">
                Supervisa los fondos disponibles en efectivo y cuentas bancarias, controla saldos y activa o pausa cajas operativas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={faPlus}
            className="shadow-md shadow-brand-royal/20"
          >
            Añadir Nueva Caja
          </Button>
        </div>
      </div>

      {/* ─── Métricas de Fondos ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidez */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Liquidez Total Activa
            </span>
            <p className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1">
              $0
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              En 0 cajas activas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faPiggyBank} />
          </div>
        </div>

        {/* Cuentas Bancarias */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Fondos en Bancos
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              $0
            </p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Cuentas registradas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faBuildingColumns} />
          </div>
        </div>

        {/* Efectivo en Bodega */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Efectivo Disponible
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              $0
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              Cajas físicas menores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
        </div>

        {/* Estado Operativo */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Total Cajas
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              0
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
              0 operativas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faCashRegister} />
          </div>
        </div>
      </div>

      {/* ─── Filtros de Búsqueda ─── */}
      <div className="isabel-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          <div className="sm:col-span-12 lg:col-span-6">
            <Input
              placeholder="Buscar por nombre o detalles de la caja..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              options={[
                { value: "all", label: "Todos los Tipos" },
                { value: "Efectivo", label: "Efectivo" },
                { value: "Cuenta Bancaria", label: "Cuenta Bancaria" },
              ]}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "active", label: "Cajas Activas" },
                { value: "inactive", label: "Cajas Pausadas / Inactivas" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── Grid de Tarjetas de Cajas ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay cajas registradas actualmente.
      </div>
    </div>
  );
}
