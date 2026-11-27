import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faUserShield,
  faArrowRotateRight,
  faUsers,
  faShieldHalved,
  faCircleCheck,
  faEye,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { isAxiosError } from "axios";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";
import {
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
  type PermissionCatalogItem,
  type PrivilegeOption,
  type RolePayload,
} from "./services/rolesServices";

const ACCIONES_DB = ["Read", "Create", "Update", "Delete", "Approve"] as const;

const ETIQUETAS_ACCION: Record<string, string> = {
  Read: "Consultar",
  Create: "Crear",
  Update: "Editar",
  Delete: "Eliminar",
  Approve: "Aprobar",
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RolePayload[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [detailRol, setDetailRol] = useState<RolePayload | null>(null);

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRol, setEditingRol] = useState<RolePayload | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formPrivilegeIds, setFormPrivilegeIds] = useState<number[]>([]);

  // ── GET /roles ──
  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllRoles();
      if (response.status === 200) {
        setRoles(response.data.roles || []);
        setPermissionsCatalog(response.data.permissions || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los roles.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const allPrivilegeIds = useMemo(
    () => permissionsCatalog.flatMap((p) => p.privileges.map((priv) => priv.id)),
    [permissionsCatalog]
  );

  // ── Métricas Ejecutivas ──
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const totalUsuarios = roles.reduce((acc, r) => acc + (r._count?.users || 0), 0);
    const totalPrivilegios = allPrivilegeIds.length;

    return { totalRoles, totalUsuarios, totalPrivilegios };
  }, [roles, allPrivilegeIds]);

  // ── Abrir Modales ──
  const handleOpenDetail = (rol: RolePayload) => {
    setDetailRol(rol);
    setIsDetailOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingRol(null);
    setFormName("");
    setFormDescription("");
    setFormPrivilegeIds([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rol: RolePayload) => {
    setEditingRol(rol);
    setFormName(rol.name);
    setFormDescription(rol.description);
    setFormPrivilegeIds(rol.rolePrivileges.map((rp) => rp.privilegeId));
    setIsFormOpen(true);
  };

  // ── Selección de privilegios en matriz ──
  const handleTogglePrivilege = (permiso: PermissionCatalogItem, priv: PrivilegeOption) => {
    setFormPrivilegeIds((prev) => {
      const exists = prev.includes(priv.id);
      const readPriv = permiso.privileges.find((p) => p.name.toLowerCase() === "read");

      if (exists) {
        if (priv.name.toLowerCase() === "read") {
          const modulePrivIds = permiso.privileges.map((p) => p.id);
          return prev.filter((id) => !modulePrivIds.includes(id));
        }
        return prev.filter((id) => id !== priv.id);
      } else {
        const nextSet = new Set([...prev, priv.id]);
        if (readPriv) nextSet.add(readPriv.id);
        return Array.from(nextSet);
      }
    });
  };

  const handleToggleAllPermission = (permiso: PermissionCatalogItem) => {
    const moduleIds = permiso.privileges.map((p) => p.id);
    const allSelected = moduleIds.every((id) => formPrivilegeIds.includes(id));

    setFormPrivilegeIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !moduleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...moduleIds]));
    });
  };

  // ── POST / PUT Rol ──
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formDescription.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Completa el nombre y la descripción del rol.",
      });
      return;
    }

    if (formPrivilegeIds.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona al menos un privilegio para el rol.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        roleInfo: {
          name: formName.trim(),
          description: formDescription.trim(),
        },
        privilegeIds: formPrivilegeIds,
      };

      if (editingRol) {
        const res = await updateRole(editingRol.id, payload);
        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: res.data?.message || "Rol actualizado exitosamente!",
          });
          setIsFormOpen(false);
          fetchRoles();
        }
      } else {
        const res = await createRole(payload);
        if (res.status === 201) {
          Toast.fire({
            icon: "success",
            title: res.data?.message || "Rol registrado exitosamente",
          });
          setIsFormOpen(false);
          fetchRoles();
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al guardar el rol.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── DELETE /roles/:idRole ──
  const handleDeleteRole = (rol: RolePayload) => {
    if ((rol._count?.users || 0) > 0) {
      Toast.fire({
        icon: "warning",
        title: `No se puede eliminar: tiene ${rol._count.users} usuario(s) asignado(s).`,
      });
      return;
    }

    MySwal.fire({
      title: "¿Eliminar rol?",
      text: `¿Seguro que deseas eliminar permanentemente el rol "${rol.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteRole(rol.id);
          if (res.status === 200) {
            Toast.fire({
              icon: "success",
              title: res.data?.message || "Rol eliminado exitosamente.",
            });
            fetchRoles();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            Toast.fire({
              icon: "error",
              title: error.response?.data?.message || "No se pudo eliminar el rol.",
            });
          }
        }
      }
    });
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
    fetchRoles();
  };

  // Filtrado
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const q = searchTerm.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [roles, searchTerm]);

  const hasActiveFilters = Boolean(searchTerm.trim());

  // Ordenamiento
  const sortedRoles = useMemo(() => {
    if (!sortKey || !sortDir) return filteredRoles;
    return [...filteredRoles].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "privileges") {
        cmp = a.rolePrivileges.length - b.rolePrivileges.length;
      } else if (sortKey === "users") {
        cmp = (a._count?.users || 0) - (b._count?.users || 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredRoles, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.ceil(sortedRoles.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedRoles = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedRoles.slice(start, start + itemsPerPage);
  }, [sortedRoles, activePage, itemsPerPage]);

  const detailPrivilegeIds = useMemo(
    () => new Set(detailRol?.rolePrivileges.map((rp) => rp.privilegeId) || []),
    [detailRol]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faUserShield} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Roles y Seguridad
              </h1>
              <p className="text-sm text-app-muted">
                Control de acceso basado en roles (RBAC) y asignación de privilegios
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

          <Button
            variant="primary"
            icon={faPlus}
            onClick={handleOpenCreate}
          >
            Nuevo Rol
          </Button>
        </div>
      </div>

      {/* ─── Métricas Ejecutivas ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Roles</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-app-text mt-2">{metrics.totalRoles}</p>
          <p className="mt-1 text-xs text-app-muted">Configurados en el sistema</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Usuarios Asignados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.totalUsuarios}
          </p>
          <p className="mt-1 text-xs text-app-muted">Cuentas con perfil asignado</p>
        </div>

        <div className="isabel-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Privilegios Totales</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {metrics.totalPrivilegios}
          </p>
          <p className="mt-1 text-xs text-app-muted">Operaciones permitidas</p>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar rol por nombre o descripción..."
          iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
        />

        {hasActiveFilters && (
          <div className="mt-3 pt-2 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredRoles.length} de {roles.length} roles
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

      {/* ─── Tabla Principal ─── */}
      <Table>
        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <Table.SortableCell
                sortKey="id"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="w-20"
              >
                ID
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Rol y Descripción
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="privileges"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-44"
              >
                Privilegios
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="users"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center w-32"
              >
                Usuarios
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider w-32">
                Acciones
              </th>
            </Table.Row>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Table.Row key={`skeleton-${idx}`}>
                  <Table.Cell rounded="left" colSpan={5} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedRoles.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={
                  hasActiveFilters
                    ? "No se encontraron roles con ese criterio de búsqueda."
                    : "No hay roles registrados en el sistema."
                }
              />
            ) : (
              paginatedRoles.map((rol) => {
                const activePrivs = rol.rolePrivileges.length;
                const totalPrivs = allPrivilegeIds.length || 1;
                const pct = Math.round((activePrivs / totalPrivs) * 100);

                return (
                  <Table.Row
                    key={rol.id}
                    onClick={() => handleOpenDetail(rol)}
                  >
                    <Table.Cell rounded="left">
                      <span className="font-mono text-xs font-bold text-app-muted">
                        #{rol.id}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-app-text">
                          {rol.name}
                        </span>
                        <span
                          className="text-[11px] text-app-muted line-clamp-1 max-w-md"
                          title={rol.description}
                        >
                          {rol.description}
                        </span>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-app-text">
                          {activePrivs} / {allPrivilegeIds.length}
                        </span>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-app-surface-alt border border-app-border">
                          <div
                            className="h-full bg-brand-royal dark:bg-brand-sky rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-bold text-app-text border border-app-border">
                        <FontAwesomeIcon icon={faUsers} className="text-app-muted text-[11px]" />
                        {rol._count?.users || 0}
                      </span>
                    </Table.Cell>

                    <Table.Cell rounded="right" className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faEye}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(rol);
                          }}
                          title="Ver privilegios"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faPenToSquare}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(rol);
                          }}
                          title="Editar rol"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrashCan}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(rol);
                          }}
                          title="Eliminar rol"
                        />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredRoles.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* ─── Modal Detalle de Privilegios del Rol ─── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailRol?.name || "Detalle de Rol"}
        description={`ID Rol: #${detailRol?.id || ""} · Usuarios asignados: ${
          detailRol?._count?.users ?? 0
        }`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
            {detailRol && (
              <Button
                variant="primary"
                size="sm"
                icon={faPenToSquare}
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEdit(detailRol);
                }}
              >
                Editar Rol
              </Button>
            )}
          </div>
        }
      >
        {detailRol && (
          <div className="space-y-4">
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-xs">
              <p className="font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky mb-1">
                Descripción
              </p>
              <p className="text-app-text">{detailRol.description}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Permiso (Módulo)</th>
                    {ACCIONES_DB.map((accion) => (
                      <th key={accion} className="px-3 py-2.5 font-bold text-center">
                        {ETIQUETAS_ACCION[accion] || accion}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {permissionsCatalog.map((permiso) => (
                    <tr key={permiso.id} className="hover:bg-app-surface-alt/50">
                      <td className="px-4 py-2.5 font-bold text-app-text">{permiso.name}</td>
                      {ACCIONES_DB.map((accion) => {
                        const privObj = permiso.privileges.find(
                          (p) => p.name.toLowerCase() === accion.toLowerCase()
                        );
                        const active = privObj ? detailPrivilegeIds.has(privObj.id) : false;
                        return (
                          <td key={accion} className="px-3 py-2.5 text-center">
                            {!privObj ? (
                              <span className="text-[10px] text-app-muted/40">N/A</span>
                            ) : active ? (
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className="text-emerald-600 dark:text-emerald-400 text-sm"
                              />
                            ) : (
                              <span className="text-app-muted/40 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Modal Crear / Editar Rol ─── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRol ? "Editar Rol" : "Registrar Nuevo Rol"}
        description="Completa los datos del rol y selecciona los privilegios permitidos por módulo"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveRole}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : editingRol ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Rol *"
              placeholder="Ej. Cajero Principal"
              maxLength={60}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <Input
              label="Descripción *"
              placeholder="Ej. Gestión de cajas, gastos y validación de abonos"
              maxLength={255}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text">
                Matriz de Privilegios *
              </label>
              <span className="text-[11px] text-app-muted">
                Clic en el módulo para marcar/desmarcar toda la fila
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Permiso (Módulo)</th>
                    {ACCIONES_DB.map((accion) => (
                      <th key={accion} className="px-3 py-2.5 font-bold text-center">
                        {ETIQUETAS_ACCION[accion] || accion}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {permissionsCatalog.map((permiso) => (
                    <tr
                      key={permiso.id}
                      className="hover:bg-app-surface-alt/50 transition-colors"
                    >
                      <td
                        onClick={() => handleToggleAllPermission(permiso)}
                        className="px-4 py-2.5 font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky cursor-pointer select-none"
                      >
                        {permiso.name}
                      </td>
                      {ACCIONES_DB.map((accion) => {
                        const privObj = permiso.privileges.find(
                          (p) => p.name.toLowerCase() === accion.toLowerCase()
                        );
                        if (!privObj) {
                          return (
                            <td key={accion} className="px-3 py-2.5 text-center text-app-muted/30">
                              —
                            </td>
                          );
                        }
                        const checked = formPrivilegeIds.includes(privObj.id);
                        return (
                          <td key={accion} className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePrivilege(permiso, privObj)}
                              className="h-4 w-4 rounded border-app-border text-brand-royal focus:ring-brand-royal cursor-pointer accent-[#2B62D9]"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}