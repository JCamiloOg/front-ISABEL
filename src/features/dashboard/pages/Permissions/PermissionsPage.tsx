import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faKey,
  faArrowRotateRight,
  faEye,
  faShieldHalved,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import {
  CATALOGO_PERMISOS_PRIVILEGIOS,
  type PermisoConPrivilegios,
  type NombrePrivilegio,
} from "../Roles/RolesPage";

export default function PermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id_permiso",
    direction: "asc",
  });

  // Modal solo lectura para inspeccionar los privilegios del permiso
  const [detailPermiso, setDetailPermiso] = useState<PermisoConPrivilegios | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const metrics = useMemo(() => {
    const totalPermisos = CATALOGO_PERMISOS_PRIVILEGIOS.length;
    const totalPrivilegios = CATALOGO_PERMISOS_PRIVILEGIOS.reduce(
      (acc, p) => acc + p.privilegios.length,
      0
    );
    const accionesDistintas = new Set(
      CATALOGO_PERMISOS_PRIVILEGIOS.flatMap((p) => p.privilegios.map((priv) => priv.nombre))
    ).size;

    return { totalPermisos, totalPrivilegios, accionesDistintas };
  }, []);

  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredPermisos = useMemo(() => {
    return CATALOGO_PERMISOS_PRIVILEGIOS.filter((perm) => {
      const q = searchQuery.toLowerCase();
      return (
        perm.nombre.toLowerCase().includes(q) ||
        perm.privilegios.some((priv) => priv.nombre.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      const factor = sortConfig.direction === "asc" ? 1 : -1;
      if (sortConfig.key === "id_permiso") return (a.id_permiso - b.id_permiso) * factor;
      if (sortConfig.key === "nombre") return a.nombre.localeCompare(b.nombre) * factor;
      return 0;
    });
  }, [searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredPermisos.length / itemsPerPage) || 1;
  const paginatedPermisos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPermisos.slice(start, start + itemsPerPage);
  }, [filteredPermisos, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortConfig({ key: "id_permiso", direction: "asc" });
    setCurrentPage(1);
  };

  const openDetail = (permiso: PermisoConPrivilegios) => {
    setDetailPermiso(permiso);
    setIsDetailOpen(true);
  };

  const getPrivilegioBadgeClass = (accion: NombrePrivilegio) => {
    switch (accion) {
      case "Consultar":
        return "bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
      case "Crear":
        return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "Editar":
        return "bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      case "Eliminar":
        return "bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
      case "Aprobar":
        return "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
    }
  };

  const tableColumns: TableColumn<PermisoConPrivilegios>[] = [
    {
      key: "id_permiso",
      header: "ID Permiso",
      sortable: true,
      render: (perm) => (
        <span className="font-mono text-xs font-bold text-app-muted">#{perm.id_permiso}</span>
      ),
    },
    {
      key: "nombre",
      header: "Permiso (Módulo)",
      sortable: true,
      render: (perm) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface-alt text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={faKey} className="text-sm" />
          </div>
          <div>
            <p
              onClick={() => openDetail(perm)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer"
            >
              {perm.nombre}
            </p>
            <p className="text-xs text-app-muted">
              {perm.privilegios.length}{" "}
              {perm.privilegios.length === 1 ? "privilegio habilitado" : "privilegios habilitados"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "privilegios",
      header: "Privilegios del Módulo (Acciones)",
      render: (perm) => (
        <div className="flex flex-wrap gap-1.5 py-1">
          {perm.privilegios.map((priv) => (
            <span
              key={priv.id_privilegio}
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPrivilegioBadgeClass(
                priv.nombre
              )}`}
            >
              {priv.nombre}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "acciones",
      header: "Consulta",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (perm) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => openDetail(perm)}
            title="Visualizar privilegios de este permiso"
            className="inline-flex items-center gap-1.5 rounded-lg border border-app-border px-3 py-1.5 text-xs font-bold text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
            <span>Ver privilegios</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado (Solo consulta) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={faKey} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Permisos y Privilegios
            </h1>
            <p className="text-sm text-app-muted">
              Consulta de los módulos del sistema (permisos) y las acciones disponibles en cada uno (privilegios)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={handleResetFilters}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Restablecer
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Permisos (Módulos)</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalPermisos}
            </span>
            <span className="text-xs text-app-muted">módulos en sistema</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Tabla: permisos</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Privilegios Totales</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faKey} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalPrivilegios}
            </span>
            <span className="text-xs text-app-muted">acciones configuradas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Tabla: privilegios
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tipos de Acción</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              {metrics.accionesDistintas}
            </span>
            <span className="text-xs text-app-muted">operaciones base</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Consultar, Crear, Editar, Eliminar, Aprobar</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-3">
        <div className="w-full lg:max-w-md">
          <Input
            id="search-permisos"
            type="search"
            placeholder="Buscar permiso (módulo) o privilegio (acción)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
            className="bg-app-surface-alt"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredPermisos.length}</strong> de{" "}
            <strong>{CATALOGO_PERMISOS_PRIVILEGIOS.length}</strong> permisos
          </span>
          {searchQuery && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Solo Visualización */}
      <Table<PermisoConPrivilegios>
        columns={tableColumns}
        data={paginatedPermisos}
        rowKey="id_permiso"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredPermisos.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15],
        }}
        emptyTitle="No se encontraron permisos"
        emptyDescription="Prueba ajustando el filtro de búsqueda."
      />

      {/* MODAL DE SOLO LECTURA: PRIVILEGIOS DEL PERMISO */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Permiso: ${detailPermiso?.nombre || ""}`}
        description={`ID Permiso: #${detailPermiso?.id_permiso || ""} · Acciones permitidas en este módulo`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
          </div>
        }
      >
        {detailPermiso && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">ID Privilegio</th>
                    <th className="px-4 py-3 font-bold">Acción (Privilegio)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {detailPermiso.privilegios.map((priv) => (
                    <tr key={priv.id_privilegio} className="hover:bg-app-surface-alt/50">
                      <td className="px-4 py-3 font-mono font-bold text-app-muted">
                        #{priv.id_privilegio}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPrivilegioBadgeClass(
                            priv.nombre
                          )}`}
                        >
                          {priv.nombre}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}