import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faMagnifyingGlass,
  faClock,
  faBoxOpen,
  faTruck,
  faCheckCircle,
  faBan,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";

export default function OrdersPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Pedidos
              </h1>
              <p className="text-sm text-app-muted">
                Control de estados, preparación logística y despachos a clientes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={faPlus}
          >
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Métricas ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-xs font-semibold">Pendientes</span>
            <FontAwesomeIcon icon={faClock} className="text-amber-500 text-xs" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">0</p>
          <p className="text-[11px] text-app-muted mt-0.5">Por procesar</p>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-xs font-semibold">En Preparación</span>
            <FontAwesomeIcon icon={faBoxOpen} className="text-sky-500 text-xs" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">0</p>
          <p className="text-[11px] text-app-muted mt-0.5">En bodega</p>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-xs font-semibold">Enviados</span>
            <FontAwesomeIcon icon={faTruck} className="text-indigo-500 text-xs" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">0</p>
          <p className="text-[11px] text-app-muted mt-0.5">En transporte</p>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-xs font-semibold">Entregados</span>
            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xs" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">0</p>
          <p className="text-[11px] text-app-muted mt-0.5">Completados</p>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-xs font-semibold">Cancelados</span>
            <FontAwesomeIcon icon={faBan} className="text-rose-500 text-xs" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">0</p>
          <p className="text-[11px] text-app-muted mt-0.5">Anulados</p>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Buscar por código, cliente o dirección..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Pendiente", label: "Pendiente" },
                { value: "En Preparación", label: "En Preparación" },
                { value: "Enviado", label: "Enviado" },
                { value: "Entregado", label: "Entregado" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay pedidos registrados en el sistema.
      </div>
    </div>
  );
}
