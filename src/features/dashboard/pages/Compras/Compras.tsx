import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faChartPie,
  faCircleCheck,
  faTruckFast,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import { useCallback, useEffect, useState } from "react";
import type { Purchase } from "../../../../@types";
import { getAllPurchases } from "./services/shoppingsServices";
import { Toast } from "../../../../shared/utils/alerts";
import { isAxiosError } from "axios";

export default function Compras() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const findPurchases = useCallback(async () => {
    try {
      const response = await getAllPurchases();

      if (response.status === 200) {
        setPurchases(response.data.shoppings);
      }

      console.log(purchases);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener las compras.",
          text: "Por favor, intenta nuevamente",
        });

      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    findPurchases();
  }, [findPurchases]);


  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Compras
              </h1>
              <p className="text-sm text-app-muted">
                Registro, consulta y seguimiento de compras vinculadas a caja y proveedor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faChartPie}
            className="hover:border-brand-royal dark:hover:border-brand-sky opacity-80"
          >
            Generar Reporte
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Restablecer
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nueva Compra
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Compras</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCartShopping} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              0
            </span>
            <span className="text-xs text-app-muted">órdenes</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Inversión activa: $0
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Recibidas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              0
            </span>
            <span className="text-xs text-app-muted">entregadas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Mercancía verificada en bodega
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Enviadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              0
            </span>
            <span className="text-xs text-app-muted">en tránsito</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">En camino desde proveedor</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Canceladas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              0
            </span>
            <span className="text-xs text-app-muted">anuladas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Sin impacto en almacén</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              id="search-compras"
              type="search"
              placeholder="Buscar por ID, proveedor o fecha..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div>
            <Select
              id="filter-compra-estado"
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Recibido", label: "Recibido" },
                { value: "Enviado", label: "Enviado" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>0</strong> compras registradas
          </span>
        </div>
      </div>
    </div>
  );
}
