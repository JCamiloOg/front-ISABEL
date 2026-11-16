import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faKey,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faTrashCan,
  faShieldHalved,
  faLayerGroup,
  faLock,
  faUserShield,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";

// --- Tipos de Permisos (Estructura Prisma / RBAC Paradise Shoes) ---
export type ModuloSistema =
  | "Dashboard"
  | "Productos"
  | "Compras y Proveedores"
  | "Pedidos y Despachos"
  | "Comprobantes de Pago"
  | "Clientes"
  | "Usuarios"
  | "Roles y Permisos";

export type AccionPermiso = "Lectura" | "Creación" | "Edición" | "Eliminación" | "Aprobación";
export type EstadoPermiso = "Activo" | "Inactivo";

export interface PermisoItem {
  idPermiso: number;
  clave: string;
  nombre: string;
  descripcion: string;
  modulo: ModuloSistema;
  accion: AccionPermiso;
  esCritico: boolean;
  rolesAsignados: string[];
  estado: EstadoPermiso;
}

// --- Catálogo Mock Inicial de Permisos Granulares ---
const MOCK_PERMISOS_INICIALES: PermisoItem[] = [
  {
    idPermiso: 1,
    clave: "dashboard.ver",
    nombre: "Visualizar Tablero Ejecutivo",
    descripcion: "Permite consultar KPIs financieros, balance de gastos y métricas de ventas.",
    modulo: "Dashboard",
    accion: "Lectura",
    esCritico: false,
    rolesAsignados: ["Administrador General", "Auxiliar de Bodega", "Validador de Caja"],
    estado: "Activo",
  },
  {
    idPermiso: 2,
    clave: "productos.ver",
    nombre: "Consultar Catálogo de Calzado",
    descripcion: "Acceso al listado de modelos, tallas, colores y disponibilidad en almacén.",
    modulo: "Productos",
    accion: "Lectura",
    esCritico: false,
    rolesAsignados: ["Administrador General", "Auxiliar de Bodega", "Asesor Comercial"],
    estado: "Activo",
  },
  {
    idPermiso: 3,
    clave: "productos.crear",
    nombre: "Registrar Nuevo Calzado",
    descripcion: "Habilita la creación de referencias, SKUs, precios de compra y venta.",
    modulo: "Productos",
    accion: "Creación",
    esCritico: false,
    rolesAsignados: ["Administrador General", "Auxiliar de Bodega"],
    estado: "Activo",
  },
  {
    idPermiso: 4,
    clave: "productos.editar",
    nombre: "Modificar Precios y Stock",
    descripcion: "Permite actualizar costos, PVP, variantes y estado de visibilidad en tienda.",
    modulo: "Productos",
    accion: "Edición",
    esCritico: true,
    rolesAsignados: ["Administrador General", "Auxiliar de Bodega"],
    estado: "Activo",
  },
  {
    idPermiso: 5,
    clave: "productos.eliminar",
    nombre: "Eliminar Referencia del Catálogo",
    descripcion: "Borrado permanente de modelos de calzado sin movimientos asociados.",
    modulo: "Productos",
    accion: "Eliminación",
    esCritico: true,
    rolesAsignados: ["Administrador General"],
    estado: "Activo",
  },
  {
    idPermiso: 6,
    clave: "pagos.aprobar",
    nombre: "Validar Comprobantes de Pago",
    descripcion: "Autoriza transferencias bancarias y cambia el estado del pedido a Por despachar.",
    modulo: "Comprobantes de Pago",
    accion: "Aprobación",
    esCritico: true,
    rolesAsignados: ["Administrador General", "Validador de Caja"],
    estado: "Activo",
  },
  {
    idPermiso: 7,
    clave: "pedidos.crear",
    nombre: "Registrar Pedidos de Clientes",
    descripcion: "Permite generar órdenes de venta y reservar pares disponibles en inventario.",
    modulo: "Pedidos y Despachos",
    accion: "Creación",
    esCritico: false,
    rolesAsignados: ["Administrador General", "Asesor Comercial"],
    estado: "Activo",
  },
  {
    idPermiso: 8,
    clave: "pedidos.despachar",
    nombre: "Confirmar Despacho Logístico",
    descripcion: "Marca pedidos validados como despachados y descuenta stock físico.",
    modulo: "Pedidos y Despachos",
    accion: "Edición",
    esCritico: false,
    rolesAsignados: ["Administrador General", "Auxiliar de Bodega"],
    estado: "Activo",
  },
  {
    idPermiso: 9,
    clave: "roles.gestionar",
    nombre: "Administrar Roles y Permisos",
    descripcion: "Control total sobre la matriz de seguridad RBAC y asignación de privilegios.",
    modulo: "Roles y Permisos",
    accion: "Edición",
    esCritico: true,
    rolesAsignados: ["Administrador General"],
    estado: "Activo",
  },
];

const MODULOS_OPTIONS: ModuloSistema[] = [
  "Dashboard",
  "Productos",
  "Compras y Proveedores",
  "Pedidos y Despachos",
  "Comprobantes de Pago",
  "Clientes",
  "Usuarios",
  "Roles y Permisos",
];

const ACCIONES_OPTIONS: AccionPermiso[] = [
  "Lectura",
  "Creación",
  "Edición",
  "Eliminación",
  "Aprobación",
];

export default function PermissionsPage() {
  // Estado local de permisos
  const [permisos, setPermisos] = useState<PermisoItem[]>(MOCK_PERMISOS_INICIALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModulo, setSelectedModulo] = useState<string>("all");
  const [selectedAccion, setSelectedAccion] = useState<string>("all");
  const [selectedEstado, setSelectedEstado] = useState<string>("all");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "clave",
    direction: "asc",
  });

  // Modal Detalle
  const [detailPermiso, setDetailPermiso] = useState<PermisoItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState<PermisoItem | null>(null);

  // Estados del formulario
  const [formClave, setFormClave] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formModulo, setFormModulo] = useState<ModuloSistema>("Productos");
  const [formAccion, setFormAccion] = useState<AccionPermiso>("Lectura");
  const [formEsCritico, setFormEsCritico] = useState<boolean>(false);
  const [formEstado, setFormEstado] = useState<EstadoPermiso>("Activo");

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const totalCount = permisos.length;
    const activeCount = permisos.filter((p) => p.estado === "Activo").length;
    const criticalCount = permisos.filter((p) => p.esCritico).length;
    const modulosCubiertos = new Set(permisos.map((p) => p.modulo)).size;

    return { totalCount, activeCount, criticalCount, modulosCubiertos };
  }, [permisos]);

  // Ordenamiento
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  // Filtrado y ordenamiento
  const filteredPermisos = useMemo(() => {
    return permisos
      .filter((p) => {
        const matchesQuery =
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.clave.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.modulo.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesModulo = selectedModulo === "all" || p.modulo === selectedModulo;
        const matchesAccion = selectedAccion === "all" || p.accion === selectedAccion;
        const matchesEstado = selectedEstado === "all" || p.estado === selectedEstado;

        return matchesQuery && matchesModulo && matchesAccion && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "clave") {
          return a.clave.localeCompare(b.clave) * factor;
        }
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "modulo") {
          return a.modulo.localeCompare(b.modulo) * factor;
        }
        return 0;
      });
  }, [permisos, searchQuery, selectedModulo, selectedAccion, selectedEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredPermisos.length / itemsPerPage) || 1;
  const paginatedPermisos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPermisos.slice(start, start + itemsPerPage);
  }, [filteredPermisos, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedModulo("all");
    setSelectedAccion("all");
    setSelectedEstado("all");
    setSortConfig({ key: "clave", direction: "asc" });
    setCurrentPage(1);
  };

  // Abrir Detalle
  const openDetail = (perm: PermisoItem) => {
    setDetailPermiso(perm);
    setIsDetailOpen(true);
  };

  // Abrir Modal Crear
  const handleOpenCreateModal = () => {
    setEditingPermiso(null);
    setFormClave("");
    setFormNombre("");
    setFormDescripcion("");
    setFormModulo("Productos");
    setFormAccion("Lectura");
    setFormEsCritico(false);
    setFormEstado("Activo");
    setIsFormOpen(true);
  };

  // Abrir Modal Editar
  const handleOpenEditModal = (perm: PermisoItem) => {
    setEditingPermiso(perm);
    setFormClave(perm.clave);
    setFormNombre(perm.nombre);
    setFormDescripcion(perm.descripcion);
    setFormModulo(perm.modulo);
    setFormAccion(perm.accion);
    setFormEsCritico(perm.esCritico);
    setFormEstado(perm.estado);
    setIsFormOpen(true);
  };

  // Guardar Permiso
  const handleSavePermiso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formClave.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Completa el nombre y la clave técnica del permiso",
      });
      return;
    }

    const claveNormalizada = formClave.trim().toLowerCase().replace(/\s+/g, ".");

    const claveDuplicada = permisos.some(
      (p) => p.clave === claveNormalizada && p.idPermiso !== editingPermiso?.idPermiso
    );
    if (claveDuplicada) {
      Toast.fire({
        icon: "error",
        title: `La clave "${claveNormalizada}" ya existe en el catálogo`,
      });
      return;
    }

    if (editingPermiso) {
      setPermisos((prev) =>
        prev.map((item) =>
          item.idPermiso === editingPermiso.idPermiso
            ? {
                ...item,
                clave: claveNormalizada,
                nombre: formNombre,
                descripcion: formDescripcion,
                modulo: formModulo,
                accion: formAccion,
                esCritico: formEsCritico,
                estado: formEstado,
              }
            : item
        )
      );
      Toast.fire({ icon: "success", title: "Permiso actualizado correctamente" });
    } else {
      const newId = permisos.length > 0 ? Math.max(...permisos.map((p) => p.idPermiso)) + 1 : 1;
      const newPermiso: PermisoItem = {
        idPermiso: newId,
        clave: claveNormalizada,
        nombre: formNombre,
        descripcion: formDescripcion || "Permiso operativo del sistema Paradise Shoes.",
        modulo: formModulo,
        accion: formAccion,
        esCritico: formEsCritico,
        rolesAsignados: ["Administrador General"],
        estado: formEstado,
      };
      setPermisos((prev) => [newPermiso, ...prev]);
      Toast.fire({ icon: "success", title: "Nuevo permiso registrado con éxito" });
    }

    setIsFormOpen(false);
  };

  // Alternar Estado
  const handleToggleEstado = (perm: PermisoItem) => {
    const nextEstado: EstadoPermiso = perm.estado === "Activo" ? "Inactivo" : "Activo";
    setPermisos((prev) =>
      prev.map((p) => (p.idPermiso === perm.idPermiso ? { ...p, estado: nextEstado } : p))
    );
    Toast.fire({
      icon: "info",
      title: `${perm.clave}: ahora está ${nextEstado}`,
    });
  };

  // Eliminar Permiso
  const handleDeletePermiso = (perm: PermisoItem) => {
    if (perm.rolesAsignados.length > 0) {
      MySwal.fire({
        title: "Permiso vinculado a roles",
        text: `Este permiso está activo en ${perm.rolesAsignados.length} rol(es) (${perm.rolesAsignados.join(", ")}). ¿Deseas revocarlo y eliminarlo de todos modos?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, revocar y eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          setPermisos((prev) => prev.filter((p) => p.idPermiso !== perm.idPermiso));
          Toast.fire({ icon: "success", title: "Permiso revocado y eliminado" });
        }
      });
      return;
    }

    MySwal.fire({
      title: "¿Eliminar permiso?",
      text: `¿Seguro que deseas remover "${perm.nombre}" (${perm.clave})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setPermisos((prev) => prev.filter((p) => p.idPermiso !== perm.idPermiso));
        Toast.fire({ icon: "success", title: "Permiso eliminado del catálogo" });
      }
    });
  };

  // Badge visual por tipo de acción
  const getAccionBadgeClass = (accion: AccionPermiso) => {
    switch (accion) {
      case "Lectura":
        return "bg-sky-100/90 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
      case "Creación":
        return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "Edición":
        return "bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      case "Eliminación":
        return "bg-rose-100/90 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
      case "Aprobación":
        return "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
    }
  };

  // Columnas para Table global
  const tableColumns: TableColumn<PermisoItem>[] = [
    {
      key: "nombre",
      header: "Permiso / Capacidad",
      sortable: true,
      render: (perm) => (
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface-alt text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={perm.esCritico ? faLock : faKey} className="text-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                onClick={() => openDetail(perm)}
                className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              >
                {perm.nombre}
              </p>
              {perm.esCritico && (
                <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                  Crítico
                </span>
              )}
            </div>
            <p className="text-xs text-app-muted line-clamp-1 max-w-md" title={perm.descripcion}>
              {perm.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "clave",
      header: "Clave Técnica",
      sortable: true,
      render: (perm) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 font-mono text-xs font-semibold text-app-text border border-app-border">
          <FontAwesomeIcon icon={faCode} className="text-[10px] text-app-muted" />
          {perm.clave}
        </span>
      ),
    },
    {
      key: "modulo",
      header: "Módulo",
      sortable: true,
      render: (perm) => (
        <span className="inline-flex items-center rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-semibold text-app-text border border-app-border">
          {perm.modulo}
        </span>
      ),
    },
    {
      key: "accion",
      header: "Operación",
      align: "center",
      render: (perm) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getAccionBadgeClass(
            perm.accion
          )}`}
        >
          {perm.accion}
        </span>
      ),
    },
    {
      key: "roles",
      header: "Roles Vinculados",
      align: "center",
      render: (perm) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-bold text-app-text border border-app-border">
          <FontAwesomeIcon icon={faUserShield} className="text-brand-royal dark:text-brand-sky text-[11px]" />
          {perm.rolesAsignados.length}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (perm) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(perm)}
          title={`Hacer clic para cambiar a ${perm.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            perm.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              perm.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {perm.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (perm) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(perm)}
            title="Ver detalles y roles asignados"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(perm)}
            title="Editar permiso"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleDeletePermiso(perm)}
            title="Eliminar permiso"
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
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
            <FontAwesomeIcon icon={faKey} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Catálogo de Permisos
            </h1>
            <p className="text-sm text-app-muted">
              Definición de privilegios atómicos, claves de autorización y políticas críticas del ERP
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
            Nuevo Permiso
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Permisos Registrados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faKey} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalCount}
            </span>
            <span className="text-xs text-app-muted">privilegios</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">{metrics.activeCount} activos en producción</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Permisos Críticos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.criticalCount}
            </span>
            <span className="text-xs text-app-muted">de alto impacto</span>
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
            Requieren supervisión de admin
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Módulos Protegidos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.modulosCubiertos}
            </span>
            <span className="text-xs text-app-muted">de {MODULOS_OPTIONS.length} módulos</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Cobertura funcional ERP
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Estándar de Claves</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCode} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              RBAC
            </span>
            <span className="text-xs text-app-muted">módulo.acción</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Paradise Shoes Seguridad</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              id="search-permisos"
              type="search"
              placeholder="Buscar por clave, nombre, módulo o descripción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Select
              id="filter-modulo-permiso"
              value={selectedModulo}
              onChange={(e) => {
                setSelectedModulo(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Módulo: Todos" },
                ...MODULOS_OPTIONS.map((m) => ({ value: m, label: m })),
              ]}
              size="sm"
            />

            <Select
              id="filter-accion-permiso"
              value={selectedAccion}
              onChange={(e) => {
                setSelectedAccion(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Operación: Todas" },
                ...ACCIONES_OPTIONS.map((a) => ({ value: a, label: a })),
              ]}
              size="sm"
            />

            <Select
              id="filter-estado-permiso"
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredPermisos.length}</strong> de{" "}
            <strong>{permisos.length}</strong> permisos definidos
          </span>
          {(searchQuery || selectedModulo !== "all" || selectedAccion !== "all" || selectedEstado !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* COMPONENTE GLOBAL TABLE DE PERMISOS */}
      <Table<PermisoItem>
        columns={tableColumns}
        data={paginatedPermisos}
        rowKey="idPermiso"
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
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron permisos"
        emptyDescription="Prueba ajustando los filtros de módulo, operación o búsqueda."
      />

      {/* MODAL DETALLE DE PERMISO Y ROLES QUE LO HEREDAN */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailPermiso?.nombre || "Detalle de Permiso"}
        description={`Clave: ${detailPermiso?.clave || ""} · Módulo: ${detailPermiso?.modulo || ""}`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailPermiso?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailPermiso && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailPermiso);
                  }}
                >
                  Editar Permiso
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailPermiso && (
          <div className="space-y-4">
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                  Descripción Funcional
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getAccionBadgeClass(
                    detailPermiso.accion
                  )}`}
                >
                  {detailPermiso.accion}
                </span>
              </div>
              <p className="text-sm text-app-text">{detailPermiso.descripcion}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-app-text">
                Roles que poseen este permiso ({detailPermiso.rolesAsignados.length})
              </p>
              {detailPermiso.rolesAsignados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detailPermiso.rolesAsignados.map((rolNombre) => (
                    <span
                      key={rolNombre}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-app-border bg-app-surface px-3 py-1.5 text-xs font-bold text-app-text"
                    >
                      <FontAwesomeIcon
                        icon={faUserShield}
                        className="text-brand-royal dark:text-brand-sky text-xs"
                      />
                      {rolNombre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-app-muted italic">
                  Ningún rol tiene asignado este permiso actualmente.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL CREAR / EDITAR PERMISO */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPermiso ? "Editar Permiso" : "Registrar Nuevo Permiso"}
        description="Define la clave de autorización y el módulo al que pertenece"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePermiso}>
              {editingPermiso ? "Guardar Cambios" : "Crear Permiso"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSavePermiso} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-permiso-nombre"
              label="Nombre Descriptivo"
              placeholder="Ej. Exportar Reporte de Ventas"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
            />

            <Input
              id="form-permiso-clave"
              label="Clave Técnica (módulo.acción)"
              placeholder="Ej. dashboard.exportar"
              value={formClave}
              onChange={(e) => setFormClave(e.target.value)}
              helper="Identificador único usado en el backend y rutas protegidas"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="form-permiso-modulo"
              label="Módulo Asociado"
              value={formModulo}
              onChange={(e) => setFormModulo(e.target.value as ModuloSistema)}
              options={MODULOS_OPTIONS.map((m) => ({ value: m, label: m }))}
            />

            <Select
              id="form-permiso-accion"
              label="Tipo de Operación"
              value={formAccion}
              onChange={(e) => setFormAccion(e.target.value as AccionPermiso)}
              options={ACCIONES_OPTIONS.map((a) => ({ value: a, label: a }))}
            />

            <Select
              id="form-permiso-estado"
              label="Estado"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as EstadoPermiso)}
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
            />
          </div>

          <Input
            id="form-permiso-descripcion"
            label="Descripción del Alcance"
            placeholder="Explica qué acción habilita este permiso dentro del sistema..."
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
          />

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setFormEsCritico((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                formEsCritico
                  ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
                  : "border-app-border bg-app-surface-alt text-app-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} />
                {formEsCritico
                  ? "Permiso Crítico (Afecta finanzas, borrados o seguridad)"
                  : "Permiso Estándar (Operación rutinaria)"}
              </span>
              <span className="uppercase text-[10px] tracking-wider">
                {formEsCritico ? "Activado" : "Normal"}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}