import React from "react";
import Input from "../../../../shared/components/Inputs/Input";
import Select from "../../../../shared/components/Inputs/Select";
import Button from "../../../../shared/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

export const ClientsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 flex items-center justify-center text-brand-royal dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Clientes
            </h1>
            <p className="text-sm text-app-muted">
              Directorio de clientes y registro de compradores
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={faUserPlus}
        >
          Nuevo Cliente
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="isabel-card p-4">
          <span className="text-xs font-semibold text-app-muted">Total Clientes</span>
          <p className="text-2xl font-bold text-app-text mt-1">0</p>
        </div>
        <div className="isabel-card p-4">
          <span className="text-xs font-semibold text-app-muted">Clientes Activos</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">0</p>
        </div>
        <div className="isabel-card p-4">
          <span className="text-xs font-semibold text-app-muted">Clientes Inactivos</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">0</p>
        </div>
        <div className="isabel-card p-4">
          <span className="text-xs font-semibold text-app-muted">Con Pedidos</span>
          <p className="text-2xl font-bold text-brand-royal dark:text-brand-sky mt-1">0</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Buscar por nombre, documento o correo..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>
          <div>
            <Select
              options={[
                { value: "Todos", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tabla Contenedora */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay clientes registrados en el sistema.
      </div>
    </div>
  );
};

export default ClientsPage;
