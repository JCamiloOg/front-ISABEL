import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faShoePrints,
  faLayerGroup,
  faDollarSign,
  faWarehouse,
  faArrowRotateRight,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";

export default function ProductsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Productos
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo maestro de calzado, variantes de color, tallas e inventario físico
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
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* ─── Métricas Ejecutivas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Modelos Base</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">0</span>
            <span className="text-xs text-app-muted">estilos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">0 productos activos</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Variantes (SKU)</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">0</span>
            <span className="text-xs text-app-muted">combinaciones</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Color + Talla física</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Inventario Total</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faWarehouse} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">0</span>
            <span className="text-xs text-app-muted">pares</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Existencias en almacén</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Valor Inventario</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-app-text">$0</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Costo total inventariado</p>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <Input
              placeholder="Buscar por nombre o SKU..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>
          <div>
            <Select
              options={[
                { value: "all", label: "Categoría: Todas" },
                { value: "1", label: "Deportivo" },
                { value: "2", label: "Casual" },
                { value: "3", label: "Urbano / Skate" },
                { value: "4", label: "Formal" },
              ]}
            />
          </div>
          <div>
            <Select
              options={[
                { value: "all", label: "Marca: Todas" },
                { value: "1", label: "Nike" },
                { value: "2", label: "Adidas" },
                { value: "3", label: "Vans" },
                { value: "4", label: "Puma" },
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
        No hay productos registrados en el inventario.
      </div>
    </div>
  );
}
