import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faKey,
  faShieldHalved,
  faLayerGroup,
  faArrowRotateRight,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { isAxiosError } from "axios";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";
import {
  getAllPermissions,
  type PermissionPayload,
} from "./services/permissionsServices";

const ETIQUETAS_ACCION: Record<string, string> = {
  Read: "Consultar",
  Create: "Crear",
  Update: "Editar",
  Delete: "Eliminar",
  Approve: "Aprobar",
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionPayload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // Modal de solo lectura
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [detailPermiso, setDetailPermiso] = useState<PermissionPayload | null>(null);

  // ── GET /permissions ──
  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllPermissions();
      if (response.status === 200) {
        setPermissions(response.data.permissions || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los permisos.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ── Métricas dinámicas ──
  const metrics = useMemo(() => {
    const totalModulos = permissions.length;
    const totalPrivilegios = permissions.reduce(
      (acc, p) => acc + (p.privileges?.length || 0),
      0
    );
    const operacionesDistintas = new Set(
      permissions.flatMap((p) => p.privileges.map((priv) => priv.name))
    ).size;

    return { totalModulos, totalPrivilegios, operacionesDistintas };
  }, [permissions]);

  const handleOpenDetail = (permiso: PermissionPayload) => {
    setDetailPermiso(permiso);
    setIsDetailOpen(true);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSortKey("id");
    setSortDir("asc");
    setCurrentPage(1);
    fetchPermissions();
  };

  // Filtrado
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissions;
    const q = searchTerm.toLowerCase().trim();
    return permissions.filter((perm) => {
      const moduleMatch = perm.name.toLowerCase().includes(q);
      const privMatch = perm.privileges.some((priv) => {
        const label = ETIQUETAS_ACCION[priv.name] || priv.name;
        return priv.name.toLowerCase().includes(q) || label.toLowerCase().includes(q);
      });
      return moduleMatch || privMatch;
    });
  }, [permissions, searchTerm]);

  const hasActiveFilters = Boolean(searchTerm.trim());

  // Ordenamiento
  const sortedPermissions = useMemo(() => {
    if (!sortKey || !sortDir) return filteredPermissions;
    return [...filteredPermissions].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "privileges") {
        cmp = a.privileges.length - b.privileges.length;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredPermissions, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.ceil(sortedPermissions.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedPermissions = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedPermissions.slice(start, start + itemsPerPage);
  }, [sortedPermissions, activePage, itemsPerPage]);

  const getPrivilegeBadgeClass = (accion: string) => {
    switch (accion) {
      case "Read":
        return "bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
      case "Create":
        return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "Update":
        return "bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      case "Delete":
        return "bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
      case "Approve":
        return "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
      default:
        return "bg-app-surface-alt text-app-text";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Permisos del Sistema
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo de módulos y acciones operativas de seguridad
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={handleResetFilters}
            disabled={isLoading}
          >
            Restablecer
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Métricas ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Módulos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalModulos}
            </span>
            <span className="text-xs text-app-muted">módulos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Controlados por RBAC</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Privilegios</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faKey} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
              {metrics.totalPrivilegios}
            </span>
            <span className="text-xs text-app-muted">acciones</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Acciones granulares</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Operaciones Distintas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {metrics.operacionesDistintas}
            </span>
            <span className="text-xs text-app-muted">tipos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Alcance de acceso</p>
        </div>
      </div>

      {/* ─── Filtro ─── */}
      <div className="isabel-card p-4">
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar módulo o acción de privilegio..."
          iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
        />

        {hasActiveFilters && (
          <div className="mt-3 pt-2 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredPermissions.length} de {permissions.length} permisos
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faArrowRotateRight}
              onClick={handleResetFilters}
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}
      </div>

      {/* ─── Tabla Principal (Solo Visualización) ─── */}
      <Table>
        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <Table.SortableCell
                sortKey="id"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-24"
              >
                ID
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Permiso (Módulo)
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="privileges"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Privilegios Disponibles
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-32">
                Consulta
              </th>
            </Table.Row>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <Table.Row key={`skeleton-${idx}`}>
                  <Table.Cell rounded="left" colSpan={4} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedPermissions.length === 0 ? (
              <Table.Empty
                colSpan={4}
                message={
                  hasActiveFilters
                    ? "No se encontraron permisos con ese criterio de búsqueda."
                    : "No hay permisos registrados."
                }
              />
            ) : (
              paginatedPermissions.map((perm) => (
                <Table.Row
                  key={perm.id}
                  onClick={() => handleOpenDetail(perm)}
                >
                  <Table.Cell rounded="left">
                    <span className="font-mono text-xs font-bold text-app-muted">
                      #{perm.id}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-app-text">
                        {perm.name}
                      </span>
                      <span className="text-[11px] text-app-muted">
                        {perm.privileges.length}{" "}
                        {perm.privileges.length === 1
                          ? "privilegio configurado"
                          : "privilegios configurados"}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-wrap gap-1.5 py-0.5">
                      {perm.privileges.map((priv) => (
                        <span
                          key={priv.id}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPrivilegeBadgeClass(
                            priv.name
                          )}`}
                        >
                          {ETIQUETAS_ACCION[priv.name] || priv.name}
                        </span>
                      ))}
                    </div>
                  </Table.Cell>

                  <Table.Cell rounded="right" className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={faEye}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(perm);
                      }}
                      title="Ver privilegios del módulo"
                    />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredPermissions.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* ─── Modal de Solo Lectura: Privilegios del Módulo ─── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Permiso: ${detailPermiso?.name || ""}`}
        description={`ID Permiso: #${detailPermiso?.id || ""} · Privilegios habilitados en este módulo`}
        size="md"
        footer={
          <div className="flex w-full justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
          </div>
        }
      >
        {detailPermiso && (
          <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-bold">ID Privilegio</th>
                  <th className="px-4 py-3 font-bold">Acción (Privilegio)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {detailPermiso.privileges.map((priv) => (
                  <tr key={priv.id} className="hover:bg-app-surface-alt/50">
                    <td className="px-4 py-3 font-mono font-bold text-app-muted">
                      #{priv.id}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPrivilegeBadgeClass(
                          priv.name
                        )}`}
                      >
                        {ETIQUETAS_ACCION[priv.name] || priv.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}