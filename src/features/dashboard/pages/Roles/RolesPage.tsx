import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faUserShield,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faTrashCan,
  faUsers,
  faShieldHalved,
  faCircleCheck,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";

// --- Interfaces alineadas exactamente con isbaeldb.txt ---
// Table roles: id_rol, nombre, descripcion
// Table permisos: id_permiso, nombre
// Table privilegios: id_privilegio, id_permiso, nombre
// Table rol_privilegios: id_rol_privilegio, id_rol, id_privilegio

export type NombrePrivilegio = "Consultar" | "Crear" | "Editar" | "Eliminar" | "Aprobar";

export interface PrivilegioDB {
  id_privilegio: number;
  id_permiso: number;
  nombre: NombrePrivilegio;
}

export interface PermisoConPrivilegios {
  id_permiso: number;
  nombre: string;
  privilegios: PrivilegioDB[];
}

export interface RolDB {
  id_rol: number;
  nombre: string;
  descripcion: string;
  usuarios_count: number; // Conteo relacional desde usuarios.id_rol
  privilegios_ids: number[]; // Equivalente a registros en rol_privilegios (id_privilegio)
}

// --- Catálogo de Permisos (Módulos) y Privilegios (Acciones) según BD ---
export const CATALOGO_PERMISOS_PRIVILEGIOS: PermisoConPrivilegios[] = [
  {
    id_permiso: 1,
    nombre: "Dashboard",
    privilegios: [
      { id_privilegio: 1, id_permiso: 1, nombre: "Consultar" },
    ],
  },
  {
    id_permiso: 2,
    nombre: "Usuarios",
    privilegios: [
      { id_privilegio: 2, id_permiso: 2, nombre: "Consultar" },
      { id_privilegio: 3, id_permiso: 2, nombre: "Crear" },
      { id_privilegio: 4, id_permiso: 2, nombre: "Editar" },
      { id_privilegio: 5, id_permiso: 2, nombre: "Eliminar" },
    ],
  },
  {
    id_permiso: 3,
    nombre: "Roles y Permisos",
    privilegios: [
      { id_privilegio: 6, id_permiso: 3, nombre: "Consultar" },
      { id_privilegio: 7, id_permiso: 3, nombre: "Crear" },
      { id_privilegio: 8, id_permiso: 3, nombre: "Editar" },
      { id_privilegio: 9, id_permiso: 3, nombre: "Eliminar" },
    ],
  },
  {
    id_permiso: 4,
    nombre: "Productos",
    privilegios: [
      { id_privilegio: 10, id_permiso: 4, nombre: "Consultar" },
      { id_privilegio: 11, id_permiso: 4, nombre: "Crear" },
      { id_privilegio: 12, id_permiso: 4, nombre: "Editar" },
      { id_privilegio: 13, id_permiso: 4, nombre: "Eliminar" },
    ],
  },
  {
    id_permiso: 5,
    nombre: "Proveedores y Compras",
    privilegios: [
      { id_privilegio: 14, id_permiso: 5, nombre: "Consultar" },
      { id_privilegio: 15, id_permiso: 5, nombre: "Crear" },
      { id_privilegio: 16, id_permiso: 5, nombre: "Editar" },
      { id_privilegio: 17, id_permiso: 5, nombre: "Eliminar" },
    ],
  },
  {
    id_permiso: 6,
    nombre: "Ventas",
    privilegios: [
      { id_privilegio: 18, id_permiso: 6, nombre: "Consultar" },
      { id_privilegio: 19, id_permiso: 6, nombre: "Crear" },
      { id_privilegio: 20, id_permiso: 6, nombre: "Editar" },
      { id_privilegio: 21, id_permiso: 6, nombre: "Aprobar" },
    ],
  },
  {
    id_permiso: 7,
    nombre: "Cajas",
    privilegios: [
      { id_privilegio: 22, id_permiso: 7, nombre: "Consultar" },
      { id_privilegio: 23, id_permiso: 7, nombre: "Crear" },
      { id_privilegio: 24, id_permiso: 7, nombre: "Editar" },
      { id_privilegio: 25, id_permiso: 7, nombre: "Aprobar" },
    ],
  },
];

const TODOS_LOS_PRIVILEGIOS_IDS = CATALOGO_PERMISOS_PRIVILEGIOS.flatMap((p) =>
  p.privilegios.map((priv) => priv.id_privilegio)
);

const COLUMNAS_PRIVILEGIOS: NombrePrivilegio[] = [
  "Consultar",
  "Crear",
  "Editar",
  "Eliminar",
  "Aprobar",
];

// --- Datos Mock de Roles según Table roles ---
const MOCK_ROLES_DB: RolDB[] = [
  {
    id_rol: 1,
    nombre: "Administrador",
    descripcion: "Acceso total a todos los permisos y privilegios del sistema Paradise Shoes.",
    usuarios_count: 2,
    privilegios_ids: TODOS_LOS_PRIVILEGIOS_IDS,
  },
  {
    id_rol: 2,
    nombre: "Bodeguero",
    descripcion: "Control de inventario, catálogo de productos, variantes y compras a proveedores.",
    usuarios_count: 4,
    privilegios_ids: [1, 10, 11, 12, 14, 15, 16],
  },
  {
    id_rol: 3,
    nombre: "Vendedor",
    descripcion: "Consulta de productos disponibles y registro de ventas y abonos de clientes.",
    usuarios_count: 5,
    privilegios_ids: [10, 18, 19],
  },
  {
    id_rol: 4,
    nombre: "Cajero",
    descripcion: "Gestión de cajas, gastos operativos y aprobación de abonos y comprobantes.",
    usuarios_count: 2,
    privilegios_ids: [1, 18, 21, 22, 23, 24, 25],
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<RolDB[]>(MOCK_ROLES_DB);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Detalle
  const [detailRol, setDetailRol] = useState<RolDB | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal Crear / Editar (solo campos de la BD: nombre, descripcion y rol_privilegios)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<RolDB | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formPrivilegiosIds, setFormPrivilegiosIds] = useState<number[]>([]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const totalUsuarios = roles.reduce((acc, r) => acc + r.usuarios_count, 0);
    const totalPermisos = CATALOGO_PERMISOS_PRIVILEGIOS.length;
    const totalPrivilegiosCatalogo = TODOS_LOS_PRIVILEGIOS_IDS.length;
    return { totalRoles, totalUsuarios, totalPermisos, totalPrivilegiosCatalogo };
  }, [roles]);

  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredRoles = useMemo(() => {
    return roles
      .filter(
        (r) =>
          r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") return a.nombre.localeCompare(b.nombre) * factor;
        if (sortConfig.key === "usuarios") return (a.usuarios_count - b.usuarios_count) * factor;
        return 0;
      });
  }, [roles, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  const openDetail = (rol: RolDB) => {
    setDetailRol(rol);
    setIsDetailOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingRol(null);
    setFormNombre("");
    setFormDescripcion("");
    setFormPrivilegiosIds([]);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (rol: RolDB) => {
    setEditingRol(rol);
    setFormNombre(rol.nombre);
    setFormDescripcion(rol.descripcion);
    setFormPrivilegiosIds([...rol.privilegios_ids]);
    setIsFormOpen(true);
  };

  // Alternar un privilegio individual (id_privilegio)
  const handleTogglePrivilegio = (permiso: PermisoConPrivilegios, priv: PrivilegioDB) => {
    setFormPrivilegiosIds((prev) => {
      const existe = prev.includes(priv.id_privilegio);
      const privConsultar = permiso.privilegios.find((p) => p.nombre === "Consultar");

      if (existe) {
        // Si desmarca "Consultar", desmarca todos los privilegios de ese permiso
        if (priv.nombre === "Consultar") {
          const idsDelPermiso = permiso.privilegios.map((p) => p.id_privilegio);
          return prev.filter((id) => !idsDelPermiso.includes(id));
        }
        return prev.filter((id) => id !== priv.id_privilegio);
      } else {
        // Si marca otro privilegio, asegura que "Consultar" también quede marcado
        const nuevos = new Set([...prev, priv.id_privilegio]);
        if (privConsultar) nuevos.add(privConsultar.id_privilegio);
        return Array.from(nuevos);
      }
    });
  };

  // Marcar / desmarcar todos los privilegios de un permiso
  const handleToggleTodoPermiso = (permiso: PermisoConPrivilegios) => {
    const idsPermiso = permiso.privilegios.map((p) => p.id_privilegio);
    const todosMarcados = idsPermiso.every((id) => formPrivilegiosIds.includes(id));

    setFormPrivilegiosIds((prev) => {
      if (todosMarcados) {
        return prev.filter((id) => !idsPermiso.includes(id));
      }
      return Array.from(new Set([...prev, ...idsPermiso]));
    });
  };

  const handleSaveRol = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim() || !formDescripcion.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Completa el nombre y la descripción del rol",
      });
      return;
    }

    if (formNombre.trim().length > 60) {
      Toast.fire({
        icon: "warning",
        title: "El nombre del rol no puede superar los 60 caracteres",
      });
      return;
    }

    const nombreDuplicado = roles.some(
      (r) =>
        r.nombre.toLowerCase() === formNombre.trim().toLowerCase() &&
        r.id_rol !== editingRol?.id_rol
    );
    if (nombreDuplicado) {
      Toast.fire({
        icon: "error",
        title: "Ya existe un rol registrado con ese nombre",
      });
      return;
    }

    if (formPrivilegiosIds.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona al menos un privilegio para el rol",
      });
      return;
    }

    if (editingRol) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id_rol === editingRol.id_rol
            ? {
                ...item,
                nombre: formNombre.trim(),
                descripcion: formDescripcion.trim(),
                privilegios_ids: formPrivilegiosIds,
              }
            : item
        )
      );
      Toast.fire({ icon: "success", title: "Rol actualizado correctamente" });
    } else {
      const nextId = roles.length > 0 ? Math.max(...roles.map((r) => r.id_rol)) + 1 : 1;
      const nuevoRol: RolDB = {
        id_rol: nextId,
        nombre: formNombre.trim(),
        descripcion: formDescripcion.trim(),
        usuarios_count: 0,
        privilegios_ids: formPrivilegiosIds,
      };
      setRoles((prev) => [nuevoRol, ...prev]);
      Toast.fire({ icon: "success", title: "Rol registrado correctamente" });
    }

    setIsFormOpen(false);
  };

  const handleDeleteRol = (rol: RolDB) => {
    if (rol.usuarios_count > 0) {
      Toast.fire({
        icon: "warning",
        title: `No se puede eliminar: hay ${rol.usuarios_count} usuario(s) con este rol asignado`,
      });
      return;
    }

    MySwal.fire({
      title: "¿Eliminar rol?",
      text: `¿Seguro que deseas eliminar permanentemente el rol "${rol.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setRoles((prev) => prev.filter((r) => r.id_rol !== rol.id_rol));
        Toast.fire({ icon: "success", title: "Rol eliminado correctamente" });
      }
    });
  };

  const tableColumns: TableColumn<RolDB>[] = [
    {
      key: "id_rol",
      header: "ID",
      render: (rol) => (
        <span className="font-mono text-xs font-bold text-app-muted">#{rol.id_rol}</span>
      ),
    },
    {
      key: "nombre",
      header: "Nombre del Rol",
      sortable: true,
      render: (rol) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface-alt text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={faUserShield} className="text-sm" />
          </div>
          <div>
            <p
              onClick={() => openDetail(rol)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer"
            >
              {rol.nombre}
            </p>
            <p className="text-xs text-app-muted line-clamp-1 max-w-md" title={rol.descripcion}>
              {rol.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "privilegios",
      header: "Privilegios Asignados",
      align: "center",
      render: (rol) => {
        const activos = rol.privilegios_ids.length;
        const total = TODOS_LOS_PRIVILEGIOS_IDS.length;
        const porcentaje = Math.round((activos / total) * 100);
        return (
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-app-text">
              {activos} / {total} privilegios
            </span>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-app-surface-alt border border-app-border">
              <div
                className="h-full bg-brand-royal dark:bg-brand-sky rounded-full transition-all"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "usuarios",
      header: "Usuarios",
      sortable: true,
      align: "center",
      render: (rol) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-bold text-app-text border border-app-border">
          <FontAwesomeIcon icon={faUsers} className="text-app-muted text-[11px]" />
          {rol.usuarios_count}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (rol) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(rol)}
            title="Ver permisos y privilegios del rol"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(rol)}
            title="Editar rol"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleDeleteRol(rol)}
            title="Eliminar rol"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:border-rose-800 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={faUserShield} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Gestión de Roles
            </h1>
            <p className="text-sm text-app-muted">
              Administración de perfiles de acceso y asignación de privilegios por permiso
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
          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            onClick={handleOpenCreateModal}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nuevo Rol
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Roles Registrados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faUserShield} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalRoles}
            </span>
            <span className="text-xs text-app-muted">roles</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Tabla: roles</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Usuarios Vinculados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalUsuarios}
            </span>
            <span className="text-xs text-app-muted">usuarios</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Con rol asignado
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Permisos (Módulos)</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalPermisos}
            </span>
            <span className="text-xs text-app-muted">permisos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Tabla: permisos</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Privilegios Disponibles</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              {metrics.totalPrivilegiosCatalogo}
            </span>
            <span className="text-xs text-app-muted">acciones</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Tabla: rol_privilegios</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-3">
        <div className="w-full lg:max-w-md">
          <Input
            id="search-roles"
            type="search"
            placeholder="Buscar rol por nombre o descripción..."
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
            Mostrando <strong>{filteredRoles.length}</strong> de <strong>{roles.length}</strong> roles
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

      {/* Tabla */}
      <Table<RolDB>
        columns={tableColumns}
        data={paginatedRoles}
        rowKey="id_rol"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredRoles.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15],
        }}
        emptyTitle="No se encontraron roles"
        emptyDescription="Intenta con otro término de búsqueda o crea un nuevo rol."
      />

      {/* MODAL DETALLE DE PERMISOS Y PRIVILEGIOS DEL ROL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailRol?.nombre || "Detalle de Rol"}
        description={`ID Rol: #${detailRol?.id_rol || ""} · Usuarios asignados: ${detailRol?.usuarios_count ?? 0}`}
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
                  handleOpenEditModal(detailRol);
                }}
              >
                Editar Rol
              </Button>
            )}
          </div>
        }
      >
        {detailRol && (
          <div className="space-y-5">
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky mb-1">
                Descripción
              </p>
              <p className="text-sm text-app-text">{detailRol.descripcion}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">Permisos</th>
                    {COLUMNAS_PRIVILEGIOS.map((col) => (
                      <th key={col} className="px-3 py-3 font-bold text-center">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {CATALOGO_PERMISOS_PRIVILEGIOS.map((permiso) => (
                    <tr key={permiso.id_permiso} className="hover:bg-app-surface-alt/50">
                      <td className="px-4 py-2.5 font-bold text-app-text">{permiso.nombre}</td>
                      {COLUMNAS_PRIVILEGIOS.map((accion) => {
                        const privObj = permiso.privilegios.find((p) => p.nombre === accion);
                        const activo = privObj
                          ? detailRol.privilegios_ids.includes(privObj.id_privilegio)
                          : false;
                        return (
                          <td key={accion} className="px-3 py-2.5 text-center">
                            {!privObj ? (
                              <span className="text-[10px] text-app-muted/40">N/A</span>
                            ) : activo ? (
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

      {/* MODAL CREAR / EDITAR ROL (Campos exactos de Table roles + rol_privilegios) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRol ? "Editar Rol" : "Registrar Nuevo Rol"}
        description="Completa los datos del rol y marca los privilegios habilitados por permiso"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveRol}>
              {editingRol ? "Guardar Cambios" : "Crear Rol"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRol} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-rol-nombre"
              label="Nombre del Rol"
              placeholder="Ej. Supervisor de Bodega"
              maxLength={60}
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
            />

            <Input
              id="form-rol-descripcion"
              label="Descripción"
              placeholder="Ej. Encargado de validar inventario y despachos"
              maxLength={255}
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
              required
            />
          </div>

          {/* Matriz de PERMISOS y PRIVILEGIOS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text">
                Asignación de Privilegios por Permiso
              </label>
              <span className="text-[11px] text-app-muted">
                Clic en el permiso para seleccionar todos sus privilegios
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Permisos</th>
                    {COLUMNAS_PRIVILEGIOS.map((accion) => (
                      <th key={accion} className="px-3 py-2.5 font-bold text-center">
                        {accion}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {CATALOGO_PERMISOS_PRIVILEGIOS.map((permiso) => (
                    <tr
                      key={permiso.id_permiso}
                      className="hover:bg-app-surface-alt/50 transition-colors"
                    >
                      <td
                        onClick={() => handleToggleTodoPermiso(permiso)}
                        className="px-4 py-2.5 font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky cursor-pointer select-none"
                      >
                        {permiso.nombre}
                      </td>
                      {COLUMNAS_PRIVILEGIOS.map((accion) => {
                        const privObj = permiso.privilegios.find((p) => p.nombre === accion);
                        if (!privObj) {
                          return (
                            <td key={accion} className="px-3 py-2.5 text-center text-app-muted/30">
                              —
                            </td>
                          );
                        }
                        const checked = formPrivilegiosIds.includes(privObj.id_privilegio);
                        return (
                          <td key={accion} className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePrivilegio(permiso, privObj)}
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