import React from "react";
import Input from "../../../../shared/components/Inputs/Input";
import Select from "../../../../shared/components/Inputs/Select";
import Button from "../../../../shared/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserPlus,
  faUsers,
  faUserShield,
  faBoxesPacking,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 flex items-center justify-center text-brand-royal dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Usuarios del Sistema
            </h1>
            <p className="text-sm text-app-muted">
              Directorio de colaboradores internos (Administradores y Bodegueros)
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={faUserPlus}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* ─── Métricas ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted mb-1">
            <span className="text-xs font-semibold">Total Empleados</span>
            <FontAwesomeIcon icon={faUsers} className="text-brand-royal dark:text-brand-sky" />
          </div>
          <p className="text-2xl font-black text-app-text">0</p>
          <span className="text-[11px] text-app-muted">Colaboradores</span>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted mb-1">
            <span className="text-xs font-semibold">Administradores</span>
            <FontAwesomeIcon icon={faUserShield} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">0</p>
          <span className="text-[11px] text-app-muted">Acceso total</span>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted mb-1">
            <span className="text-xs font-semibold">Bodegueros</span>
            <FontAwesomeIcon icon={faBoxesPacking} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">0</p>
          <span className="text-[11px] text-app-muted">Inventario</span>
        </div>

        <div className="isabel-card p-4">
          <div className="flex items-center justify-between text-app-muted mb-1">
            <span className="text-xs font-semibold">Activos</span>
            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">En nómina activa</span>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              placeholder="Buscar por nombre, documento o correo..."
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              options={[
                { value: "Todos", label: "Rol: Todos" },
                { value: "Administrador", label: "Administrador" },
                { value: "Bodeguero", label: "Bodeguero" },
              ]}
            />
          </div>
          <div className="sm:col-span-3">
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

      {/* ─── Tabla Principal ─── */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center text-app-muted">
        No hay usuarios registrados en el sistema.
      </div>
    </div>
  );
};

export default UsersPage;
