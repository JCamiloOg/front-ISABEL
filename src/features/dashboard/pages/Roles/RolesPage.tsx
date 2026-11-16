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
  faLock,
  faShieldHalved,
  faCircleCheck,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";

// --- Tipos de Roles y Permisos (Estructura Prisma / ERP) ---
export type EstadoRol = "Activo" | "Inactivo";

export interface ModuloPermiso {
  idModulo: string;
  nombre: string;
  grupo: "Operación" | "Inventario" | "Comercial" | "Administración";
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface RolConPermisos {
  idRol: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  esSistema: boolean;
  usuariosAsignados: number;
  estado: EstadoRol;
  fechaActualizacion: string;
  permisos: ModuloPermiso[];
}

// --- Catálogo Base de Módulos del Sistema ISABEL ---
const MODULOS_BASE: Omit<ModuloPermiso, "ver" | "crear" | "editar" | "eliminar">[] = [
  { idModulo: "dashboard", nombre: "Tablero de Control (KPIs)", grupo: "Administración" },
  { idModulo: "productos", nombre: "Catálogo y Productos", grupo: "Inventario" },
  { idModulo: "compras", nombre: "Entradas y Proveedores", grupo: "Inventario" },
  { idModulo: "pedidos", nombre: "Pedidos y Despachos", grupo: "Operación" },
  { idModulo: "pagos", nombre: "Comprobantes de Pago", grupo: "Comercial" },
  { idModulo: "clientes", nombre: "Gestión de Clientes", grupo: "Comercial" },
  { idModulo: "usuarios", nombre: "Usuarios y Empleados", grupo: "Administración" },
  { idModulo: "roles", nombre: "Roles y Permisos", grupo: "Administración" },
];

const crearMatrizPermisos = (
  preset: "admin" | "bodega" | "ventas" | "caja" | "vacio"
): ModuloPermiso[] => {
  return MODULOS_BASE.map((mod) => {
    if (preset === "admin") {
      return { ...mod, ver: true, crear: true, editar: true, eliminar: true };
    }
    if (preset === "bodega") {
      const esBodega = ["productos", "compras", "pedidos"].includes(mod.idModulo);
      return {
        ...mod,
        ver: esBodega || mod.idModulo === "dashboard",
        crear: ["productos", "compras"].includes(mod.idModulo),
        editar: esBodega,
        eliminar: false,
      };
    }
    if (preset === "ventas") {
      const esVentas = ["pedidos", "clientes", "pagos", "productos"].includes(mod.idModulo);
      return {
        ...mod,
        ver: esVentas,
        crear: ["pedidos", "clientes", "pagos"].includes(mod.idModulo),
        editar: ["pedidos", "clientes"].includes(mod.idModulo),
        eliminar: false,
      };
    }
    if (preset === "caja") {
      const esCaja = ["pagos", "pedidos", "dashboard"].includes(mod.idModulo);
      return {
        ...mod,
        ver: esCaja,
        crear: mod.idModulo === "pagos",
        editar: ["pagos", "pedidos"].includes(mod.idModulo),
        eliminar: false,
      };
    }
    return { ...mod, ver: false, crear: false, editar: false, eliminar: false };
  });
};

// --- Datos Mock Iniciales según Ficha Técnica Paradise Shoes ---
const MOCK_ROLES_INICIALES: RolConPermisos[] = [
  {
    idRol: 1,
    nombre: "Administrador General",
    codigo: "ROL-ADM",
    descripcion: "Control total sobre inventario, finanzas, despachos, comprobantes y configuración de seguridad.",
    esSistema: true,
    usuariosAsignados: 2,
    estado: "Activo",
    fechaActualizacion: "15 Nov 2026",
    permisos: crearMatrizPermisos("admin"),
  },
  {
    idRol: 2,
    nombre: "Auxiliar de Bodega y Logística",
    codigo: "ROL-BOD",
    descripcion: "Gestión de existencias de calzado, tallas, recepción de proveedores y alistamiento de pedidos.",
    esSistema: false,
    usuariosAsignados: 4,
    estado: "Activo",
    fechaActualizacion: "14 Nov 2026",
    permisos: crearMatrizPermisos("bodega"),
  },
  {
    idRol: 3,
    nombre: "Asesor Comercial",
    codigo: "ROL-VEN",
    descripcion: "Registro de pedidos, consulta de disponibilidad en catálogo y atención de clientes.",
    esSistema: false,
    usuariosAsignados: 5,
    estado: "Activo",
    fechaActualizacion: "12 Nov 2026",
    permisos: crearMatrizPermisos("ventas"),
  },
  {
    idRol: 4,
    nombre: "Validador de Caja y Pagos",
    codigo: "ROL-CAJ",
    descripcion: "Auditoría y aprobación de comprobantes de transferencia antes de autorizar despacho.",
    esSistema: false,
    usuariosAsignados: 2,
    estado: "Activo",
    fechaActualizacion: "10 Nov 2026",
    permisos: crearMatrizPermisos("caja"),
  },
];

export default function RolesPage() {
  // Estado principal de roles
  const [roles, setRoles] = useState<RolConPermisos[]>(MOCK_ROLES_INICIALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("all");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Detalle de Permisos
  const [detailRol, setDetailRol] = useState<RolConPermisos | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal Crear / Editar Rol
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<RolConPermisos | null>(null);

  // Estados del formulario
  const [formNombre, setFormNombre] = useState("");
  const [formCodigo, setFormCodigo] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formEstado, setFormEstado] = useState<EstadoRol>("Activo");
  const [formPermisos, setFormPermisos] = useState<ModuloPermiso[]>(crearMatrizPermisos("vacio"));

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const activeRoles = roles.filter((r) => r.estado === "Activo").length;
    const totalUsuarios = roles.reduce((acc, r) => acc + r.usuariosAsignados, 0);
    const totalPermisosActivos = roles.reduce(
      (acc, r) =>
        acc +
        r.permisos.reduce(
          (sum, p) => sum + Number(p.ver) + Number(p.crear) + Number(p.editar) + Number(p.eliminar),
          0
        ),
      0
    );

    return { totalRoles, activeRoles, totalUsuarios, totalPermisosActivos };
  }, [roles]);

  // Ordenamiento por columna
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
  const filteredRoles = useMemo(() => {
    return roles
      .filter((r) => {
        const matchesQuery =
          r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesEstado = selectedEstado === "all" || r.estado === selectedEstado;
        const matchesTipo =
          selectedTipo === "all" ||
          (selectedTipo === "sistema" && r.esSistema) ||
          (selectedTipo === "personalizado" && !r.esSistema);

        return matchesQuery && matchesEstado && matchesTipo;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "usuarios") {
          return (a.usuariosAsignados - b.usuariosAsignados) * factor;
        }
        return 0;
      });
  }, [roles, searchQuery, selectedEstado, selectedTipo, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedEstado("all");
    setSelectedTipo("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Contar permisos activos por rol
  const contarPermisos = (permisos: ModuloPermiso[]) => {
    const activos = permisos.reduce(
      (sum, p) => sum + Number(p.ver) + Number(p.crear) + Number(p.editar) + Number(p.eliminar),
      0
    );
    const total = permisos.length * 4;
    return { activos, total };
  };

  // Abrir Detalle
  const openDetail = (rol: RolConPermisos) => {
    setDetailRol(rol);
    setIsDetailOpen(true);
  };

  // Abrir Modal Crear
  const handleOpenCreateModal = () => {
    setEditingRol(null);
    setFormNombre("");
    setFormCodigo(`ROL-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescripcion("");
    setFormEstado("Activo");
    setFormPermisos(crearMatrizPermisos("vacio"));
    setIsFormOpen(true);
  };

  // Abrir Modal Editar
  const handleOpenEditModal = (rol: RolConPermisos) => {
    setEditingRol(rol);
    setFormNombre(rol.nombre);
    setFormCodigo(rol.codigo);
    setFormDescripcion(rol.descripcion);
    setFormEstado(rol.estado);
    setFormPermisos(rol.permisos.map((p) => ({ ...p })));
    setIsFormOpen(true);
  };

  // Alternar permiso individual en la matriz
  const handleTogglePermiso = (
    idModulo: string,
    accion: "ver" | "crear" | "editar" | "eliminar"
  ) => {
    setFormPermisos((prev) =>
      prev.map((mod) => {
        if (mod.idModulo !== idModulo) return mod;
        const nuevoValor = !mod[accion];

        // Regla de coherencia: si activa crear/editar/eliminar, activa "ver" automáticamente;
        // si desactiva "ver", desactiva los demás permisos de ese módulo.
        if (accion === "ver" && !nuevoValor) {
          return { ...mod, ver: false, crear: false, editar: false, eliminar: false };
        }
        if (accion !== "ver" && nuevoValor) {
          return { ...mod, ver: true, [accion]: true };
        }
        return { ...mod, [accion]: nuevoValor };
      })
    );
  };

  // Seleccionar / deseleccionar toda la fila de un módulo
  const handleToggleFilaModulo = (idModulo: string) => {
    setFormPermisos((prev) =>
      prev.map((mod) => {
        if (mod.idModulo !== idModulo) return mod;
        const todosActivos = mod.ver && mod.crear && mod.editar && mod.eliminar;
        return {
          ...mod,
          ver: !todosActivos,
          crear: !todosActivos,
          editar: !todosActivos,
          eliminar: !todosActivos,
        };
      })
    );
  };

  // Guardar Rol (Crear o Actualizar)
  const handleSaveRol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCodigo.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Completa el nombre y código del rol",
      });
      return;
    }

    const tieneAlMenosUnPermiso = formPermisos.some((p) => p.ver);
    if (!tieneAlMenosUnPermiso) {
      Toast.fire({
        icon: "warning",
        title: "Asigna al menos un permiso de lectura al rol",
      });
      return;
    }

    if (editingRol) {
      setRoles((prev) =>
        prev.map((item) =>
          item.idRol === editingRol.idRol
            ? {
                ...item,
                nombre: formNombre,
                codigo: formCodigo.toUpperCase(),
                descripcion: formDescripcion,
                estado: editingRol.esSistema ? "Activo" : formEstado,
                fechaActualizacion: "16 Nov 2026",
                permisos: formPermisos,
              }
            : item
        )
      );
      Toast.fire({ icon: "success", title: "Rol y permisos actualizados" });
    } else {
      const newId = roles.length > 0 ? Math.max(...roles.map((r) => r.idRol)) + 1 : 1;
      const newRol: RolConPermisos = {
        idRol: newId,
        nombre: formNombre,
        codigo: formCodigo.toUpperCase(),
        descripcion: formDescripcion || "Rol personalizado del sistema administrativo.",
        esSistema: false,
        usuariosAsignados: 0,
        estado: formEstado,
        fechaActualizacion: "16 Nov 2026",
        permisos: formPermisos,
      };
      setRoles((prev) => [newRol, ...prev]);
      Toast.fire({ icon: "success", title: "Nuevo rol creado correctamente" });
    }

    setIsFormOpen(false);
  };

  // Cambiar Estado Activo / Inactivo
  const handleToggleEstado = (rol: RolConPermisos) => {
    if (rol.esSistema) {
      Toast.fire({
        icon: "warning",
        title: "El rol principal del sistema no puede desactivarse",
      });
      return;
    }
    const nextEstado: EstadoRol = rol.estado === "Activo" ? "Inactivo" : "Activo";
    setRoles((prev) =>
      prev.map((r) => (r.idRol === rol.idRol ? { ...r, estado: nextEstado } : r))
    );
    Toast.fire({
      icon: "info",
      title: `${rol.nombre}: ahora está ${nextEstado}`,
    });
  };

  // Eliminar Rol con validación de seguridad
  const handleDeleteRol = (rol: RolConPermisos) => {
    if (rol.esSistema) {
      Toast.fire({
        icon: "error",
        title: "No es posible eliminar un rol base del sistema",
      });
      return;
    }

    if (rol.usuariosAsignados > 0) {
      Toast.fire({
        icon: "warning",
        title: `Este rol tiene ${rol.usuariosAsignados} usuarios asignados. Reasígnalos primero.`,
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
        setRoles((prev) => prev.filter((r) => r.idRol !== rol.idRol));
        Toast.fire({
          icon: "success",
          title: "Rol eliminado del sistema",
        });
      }
    });
  };

  // Columnas para Table global
  const tableColumns: TableColumn<RolConPermisos>[] = [
    {
      key: "nombre",
      header: "Rol / Perfil de Acceso",
      sortable: true,
      render: (rol) => (
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface-alt text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={rol.esSistema ? faLock : faUserShield} className="text-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                onClick={() => openDetail(rol)}
                className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              >
                {rol.nombre}
              </p>
              {rol.esSistema && (
                <span className="rounded-md bg-brand-royal/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  Sistema
                </span>
              )}
            </div>
            <p className="text-xs text-app-muted line-clamp-1 max-w-md" title={rol.descripcion}>
              {rol.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "codigo",
      header: "Código",
      render: (rol) => (
        <span className="inline-flex items-center rounded-lg bg-app-surface-alt px-2.5 py-1 font-mono text-xs font-semibold text-app-text border border-app-border">
          {rol.codigo}
        </span>
      ),
    },
    {
      key: "permisos",
      header: "Cobertura Permisos",
      align: "center",
      render: (rol) => {
        const { activos, total } = contarPermisos(rol.permisos);
        const porcentaje = Math.round((activos / total) * 100);
        return (
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-app-text">
              {activos} / {total} permisos
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
          {rol.usuariosAsignados}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (rol) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(rol)}
          title={
            rol.esSistema
              ? "Rol protegido del sistema"
              : `Hacer clic para cambiar a ${rol.estado === "Activo" ? "Inactivo" : "Activo"}`
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            rol.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              rol.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {rol.estado}
        </button>
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
            title="Ver matriz de permisos"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(rol)}
            title="Editar rol y permisos"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleDeleteRol(rol)}
            title={rol.esSistema ? "Rol protegido" : "Eliminar rol"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-app-border transition-all ${
              rol.esSistema
                ? "text-app-muted/40 cursor-not-allowed"
                : "text-app-muted hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:border-rose-800 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
            }`}
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
            <FontAwesomeIcon icon={faUserShield} className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Gestión de Roles y Permisos
            </h1>
            <p className="text-sm text-app-muted">
              Control de acceso granular por módulos operativos, bodega, caja y administración
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

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Roles Configurados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faUserShield} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalRoles}
            </span>
            <span className="text-xs text-app-muted">perfiles</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">{metrics.activeRoles} activos actualmente</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Usuarios Asignados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalUsuarios}
            </span>
            <span className="text-xs text-app-muted">colaboradores</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Con credenciales vinculadas
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Reglas Habilitadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalPermisosActivos}
            </span>
            <span className="text-xs text-app-muted">permisos CRUD</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Distribuidos en {MODULOS_BASE.length} módulos</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Seguridad RBAC</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              100%
            </span>
            <span className="text-xs text-app-muted">auditado</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Paradise Shoes ERP</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              id="search-roles"
              type="search"
              placeholder="Buscar por nombre de rol, código o descripción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Select
              id="filter-tipo-rol"
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Origen: Todos" },
                { value: "sistema", label: "Rol del Sistema" },
                { value: "personalizado", label: "Personalizado" },
              ]}
              size="sm"
            />

            <Select
              id="filter-estado-rol"
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
            Mostrando <strong>{filteredRoles.length}</strong> de{" "}
            <strong>{roles.length}</strong> roles registrados
          </span>
          {(searchQuery || selectedEstado !== "all" || selectedTipo !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* COMPONENTE GLOBAL TABLE DE ROLES */}
      <Table<RolConPermisos>
        columns={tableColumns}
        data={paginatedRoles}
        rowKey="idRol"
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
        emptyDescription="Prueba ajustando los filtros de búsqueda o crea un nuevo perfil de acceso."
      />

      {/* MODAL DETALLE DE MATRIZ DE PERMISOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailRol?.nombre || "Detalle de Rol"}
        description={`Código: ${detailRol?.codigo || ""} · Última actualización: ${detailRol?.fechaActualizacion || ""}`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Usuarios vinculados: <strong className="text-app-text">{detailRol?.usuariosAsignados}</strong>
            </span>
            <div className="flex items-center gap-2">
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
                  Editar Permisos
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailRol && (
          <div className="space-y-5">
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky mb-1">
                Descripción del Perfil
              </p>
              <p className="text-sm text-app-text">{detailRol.descripcion}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-bold">Módulo del Sistema</th>
                    <th className="px-3 py-3 font-bold text-center">Ver</th>
                    <th className="px-3 py-3 font-bold text-center">Crear</th>
                    <th className="px-3 py-3 font-bold text-center">Editar</th>
                    <th className="px-3 py-3 font-bold text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {detailRol.permisos.map((perm) => (
                    <tr key={perm.idModulo} className="hover:bg-app-surface-alt/50">
                      <td className="px-4 py-2.5">
                        <p className="font-bold text-app-text">{perm.nombre}</p>
                        <span className="text-[11px] text-app-muted">{perm.grupo}</span>
                      </td>
                      {(["ver", "crear", "editar", "eliminar"] as const).map((accion) => (
                        <td key={accion} className="px-3 py-2.5 text-center">
                          {perm[accion] ? (
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="text-emerald-600 dark:text-emerald-400 text-sm"
                            />
                          ) : (
                            <span className="text-app-muted/40 font-bold">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL CREAR / EDITAR ROL Y MATRIZ CRUD */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRol ? "Editar Rol y Permisos" : "Crear Nuevo Rol"}
        description="Define el alcance operativo y los permisos por módulo del ERP"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                id="form-rol-nombre"
                label="Nombre del Rol"
                placeholder="Ej. Supervisor de Inventario"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
              />
            </div>

            <Input
              id="form-rol-codigo"
              label="Código Identificador"
              placeholder="Ej. ROL-SUP"
              value={formCodigo}
              onChange={(e) => setFormCodigo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                id="form-rol-descripcion"
                label="Descripción de Responsabilidades"
                placeholder="Describe brevemente las funciones de este rol..."
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
              />
            </div>

            <Select
              id="form-rol-estado"
              label="Estado"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as EstadoRol)}
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
            />
          </div>

          {/* Matriz Interactiva de Permisos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text">
                Matriz de Permisos por Módulo
              </label>
              <span className="text-[11px] text-app-muted">
                Clic en el nombre del módulo para marcar/desmarcar toda la fila
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Módulo</th>
                    <th className="px-3 py-2.5 font-bold text-center">Ver</th>
                    <th className="px-3 py-2.5 font-bold text-center">Crear</th>
                    <th className="px-3 py-2.5 font-bold text-center">Editar</th>
                    <th className="px-3 py-2.5 font-bold text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {formPermisos.map((mod) => (
                    <tr key={mod.idModulo} className="hover:bg-app-surface-alt/50 transition-colors">
                      <td
                        onClick={() => handleToggleFilaModulo(mod.idModulo)}
                        className="px-4 py-2.5 cursor-pointer select-none"
                      >
                        <p className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky">
                          {mod.nombre}
                        </p>
                        <span className="text-[10px] text-app-muted">{mod.grupo}</span>
                      </td>
                      {(["ver", "crear", "editar", "eliminar"] as const).map((accion) => (
                        <td key={accion} className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={mod[accion]}
                            onChange={() => handleTogglePermiso(mod.idModulo, accion)}
                            className="h-4 w-4 rounded border-app-border text-brand-royal focus:ring-brand-royal cursor-pointer accent-[#2B62D9]"
                          />
                        </td>
                      ))}
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