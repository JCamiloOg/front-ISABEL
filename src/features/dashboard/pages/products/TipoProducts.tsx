import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faLock,
  faShoePrints,
  faToggleOn,
  faToggleOff,
  faShieldHalved,
  faBoxesStacked,
  faCircleCheck,
  faGlobe,
  faIndustry,
  faGem,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface TipoItem {
  idTipoZapato: number;
  nombre: string;
  origen: string;
  garantiaDias?: number;
  descripcion: string;
  estado: Estado;
  fechaRegistro: string;
}

const MARCAS_MAP: Record<number, string> = {
  1: "Nike",
  2: "Adidas",
  3: "Vans",
  4: "Puma",
  5: "Converse",
};

const CATEGORIAS_MAP: Record<number, string> = {
  1: "Deportivo",
  2: "Casual",
  3: "Urbano / Skate",
  4: "Formal",
  5: "Botas y Botines",
};

// Catálogo maestro de tipos de calzado / calidad / procedencia
const INITIAL_TIPOS: TipoItem[] = [
  {
    idTipoZapato: 1,
    nombre: "Triple AAA (G5 / Top Quality)",
    origen: "Importado",
    garantiaDias: 60,
    descripcion: "Réplica de alta gama con materiales premium, acabados de precisión y gran durabilidad",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTipoZapato: 2,
    nombre: "Importado Original / Genuino",
    origen: "Importado",
    garantiaDias: 90,
    descripcion: "Calzado 100% original importado de distribución oficial de marcas internacionales",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTipoZapato: 3,
    nombre: "Nacional (Fabricación Colombia)",
    origen: "Nacional",
    garantiaDias: 45,
    descripcion: "Calzado manufacturado por talleres colombianos con cuero e insumos locales de alta calidad",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idTipoZapato: 4,
    nombre: "Calidad 1.1 / Premium",
    origen: "Importado",
    garantiaDias: 30,
    descripcion: "Excelente relación costo-beneficio con diseño fiel y materiales sintéticos resistentes",
    estado: "Activo",
    fechaRegistro: "2026-01-20",
  },
  {
    idTipoZapato: 5,
    nombre: "Nacional Cuero Genuino",
    origen: "Nacional",
    garantiaDias: 60,
    descripcion: "Zapatos y botines formales confeccionados en 100% cuero vacuno colombiano",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idTipoZapato: 6,
    nombre: "Económico / Promocional",
    origen: "Mixto",
    garantiaDias: 15,
    descripcion: "Línea accesible orientada a remates, eventos y venta masiva",
    estado: "Inactivo",
    fechaRegistro: "2026-02-10",
  },
];

export default function TipoProducts() {
  const [tipos, setTipos] = useState<TipoItem[]>(INITIAL_TIPOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterOrigen, setFilterOrigen] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formOrigen, setFormOrigen] = useState("Importado");
  const [formGarantia, setFormGarantia] = useState<number>(60);
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formEstado, setFormEstado] = useState<Estado>("Activo");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTipo, setDetailTipo] = useState<TipoItem | null>(null);

  // Obtener calzados asociados al tipo desde el mock global de productos
  const getShoesForTipo = (idTipoZapato: number) => {
    return MOCK_PRODUCTOS_PRISMA.filter((p) => p.idTipoZapato === idTipoZapato);
  };

  // Calcular el stock total disponible en inventario para un tipo de calzado
  const getTotalStockForTipo = (idTipoZapato: number) => {
    let stock = 0;
    const shoes = getShoesForTipo(idTipoZapato);
    shoes.forEach((p) => {
      p.colores.forEach((c) => {
        c.variantes.forEach((v) => {
          stock += v.stockActual;
        });
      });
    });
    return stock;
  };

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = tipos.length;
    const activos = tipos.filter((t) => t.estado === "Activo").length;
    const inactivos = total - activos;

    let totalModelosClasificados = 0;
    tipos.forEach((t) => {
      totalModelosClasificados += getShoesForTipo(t.idTipoZapato).length;
    });

    return { total, activos, inactivos, totalModelosClasificados };
  }, [tipos]);

  // Manejo de ordenamiento por columna
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

  // Filtrado y ordenamiento de tipos
  const filteredTipos = useMemo(() => {
    return tipos
      .filter((t) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          t.nombre.toLowerCase().includes(q) ||
          t.descripcion.toLowerCase().includes(q) ||
          t.origen.toLowerCase().includes(q) ||
          t.idTipoZapato.toString().includes(q);

        const matchesEstado = filterEstado === "all" || t.estado === filterEstado;
        const matchesOrigen = filterOrigen === "all" || t.origen.toLowerCase().includes(filterOrigen.toLowerCase());

        return matchesQuery && matchesEstado && matchesOrigen;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "origen") {
          return a.origen.localeCompare(b.origen) * factor;
        }
        if (sortConfig.key === "asociados") {
          const countA = getShoesForTipo(a.idTipoZapato).length;
          const countB = getShoesForTipo(b.idTipoZapato).length;
          return (countA - countB) * factor;
        }
        if (sortConfig.key === "stock") {
          const stockA = getTotalStockForTipo(a.idTipoZapato);
          const stockB = getTotalStockForTipo(b.idTipoZapato);
          return (stockA - stockB) * factor;
        }
        return 0;
      });
  }, [tipos, searchQuery, filterEstado, filterOrigen, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage) || 1;
  const paginatedTipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTipos.slice(start, start + itemsPerPage);
  }, [filteredTipos, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterOrigen("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado del tipo de calzado
  const handleToggleEstado = (tipo: TipoItem) => {
    const nextEstado: Estado = tipo.estado === "Activo" ? "Inactivo" : "Activo";
    setTipos((prev) =>
      prev.map((t) =>
        t.idTipoZapato === tipo.idTipoZapato ? { ...t, estado: nextEstado } : t
      )
    );
    if (detailTipo && detailTipo.idTipoZapato === tipo.idTipoZapato) {
      setDetailTipo({ ...detailTipo, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Tipo "${tipo.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingTipo(null);
    setFormNombre("");
    setFormOrigen("Importado");
    setFormGarantia(60);
    setFormDescripcion("");
    setFormEstado("Activo");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (tipo: TipoItem) => {
    setEditingTipo(tipo);
    setFormNombre(tipo.nombre);
    setFormOrigen(tipo.origen);
    setFormGarantia(tipo.garantiaDias || 60);
    setFormDescripcion(tipo.descripcion);
    setFormEstado(tipo.estado);
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (tipo: TipoItem) => {
    setDetailTipo(tipo);
    setIsDetailOpen(true);
  };

  // Guardar Tipo de Calzado (Crear o Editar)
  const handleSaveTipo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre del tipo o calidad de calzado",
      });
      return;
    }

    if (editingTipo) {
      setTipos((prev) =>
        prev.map((t) =>
          t.idTipoZapato === editingTipo.idTipoZapato
            ? {
                ...t,
                nombre: formNombre.trim(),
                origen: formOrigen.trim(),
                garantiaDias: Number(formGarantia) || 0,
                descripcion: formDescripcion.trim() || t.descripcion,
                estado: formEstado,
              }
            : t
        )
      );
      Toast.fire({
        icon: "success",
        title: `Tipo "${formNombre}" actualizado correctamente`,
      });
    } else {
      // Validar duplicado por nombre
      const exists = tipos.some(
        (t) => t.nombre.toLowerCase() === formNombre.trim().toLowerCase()
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe el tipo "${formNombre}" registrado`,
        });
        return;
      }

      const newId =
        tipos.length > 0 ? Math.max(...tipos.map((t) => t.idTipoZapato)) + 1 : 1;

      const newTipo: TipoItem = {
        idTipoZapato: newId,
        nombre: formNombre.trim(),
        origen: formOrigen.trim(),
        garantiaDias: Number(formGarantia) || 30,
        descripcion:
          formDescripcion.trim() ||
          `Clasificación de calzado ${formNombre.trim()} (${formOrigen.trim()})`,
        estado: formEstado,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setTipos((prev) => [newTipo, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Tipo "${formNombre}" registrado con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table (SIN botones de eliminación)
  const tableColumns: TableColumn<TipoItem>[] = [
    {
      key: "nombre",
      header: "Tipo / Clasificación",
      sortable: true,
      render: (tipo) => (
        <div className="flex items-center gap-3.5 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky border border-brand-royal/20 dark:border-brand-sky/20">
            <FontAwesomeIcon icon={faGem} className="text-sm" />
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(tipo)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver calzados de tipo ${tipo.nombre}`}
            >
              {tipo.nombre}
            </p>
            <p className="text-xs text-app-muted truncate max-w-sm">
              {tipo.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "origen",
      header: "Procedencia / Origen",
      sortable: true,
      render: (tipo) => {
        const isNacional = tipo.origen.toLowerCase().includes("nacional");
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
              isNacional
                ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40"
                : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40"
            }`}
          >
            <FontAwesomeIcon
              icon={isNacional ? faIndustry : faGlobe}
              className="text-[11px]"
            />
            {tipo.origen}
          </span>
        );
      },
    },
    {
      key: "asociados",
      header: "Modelos Asociados",
      sortable: true,
      align: "center",
      render: (tipo) => {
        const shoes = getShoesForTipo(tipo.idTipoZapato);
        return (
          <button
            type="button"
            onClick={() => openDetail(tipo)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              shoes.length > 0
                ? "bg-brand-royal/10 text-brand-royal border-brand-royal/20 dark:bg-brand-sky/15 dark:text-brand-sky dark:border-brand-sky/20 hover:bg-brand-royal/20"
                : "bg-app-surface-alt text-app-muted border-app-border"
            }`}
            title="Ver calzados clasificados bajo este tipo"
          >
            <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            <span>
              {shoes.length} {shoes.length === 1 ? "modelo" : "modelos"}
            </span>
          </button>
        );
      },
    },
    {
      key: "stock",
      header: "Pares en Stock",
      sortable: true,
      align: "center",
      render: (tipo) => {
        const stock = getTotalStockForTipo(tipo.idTipoZapato);
        return (
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-app-text">
            <FontAwesomeIcon icon={faBoxesStacked} className="text-app-muted text-xs" />
            <span>{stock} pares</span>
          </div>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (tipo) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(tipo)}
          title={`Hacer clic para cambiar a ${tipo.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            tipo.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              tipo.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {tipo.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (tipo) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(tipo)}
            title="Ver detalles del tipo y modelos vinculados"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(tipo)}
            title="Editar datos del tipo de calzado"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Acción de eliminación bloqueada intencionalmente */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: el tipo tiene modelos de calzado y existencias asociadas"
          >
            <FontAwesomeIcon icon={faLock} className="text-xs" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCertificate} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Tipos y Calidades de Calzado
              </h1>
              <p className="text-sm text-app-muted">
                Clasificación por procedencia y estándares comerciales (Triple AAA, Importado, Nacional, etc.)
              </p>
            </div>
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
            Nuevo Tipo
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tipos en Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCertificate} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">tipos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activos} activos para asignación
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tipos Activos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.activos}
            </span>
            <span className="text-xs text-app-muted">disponibles</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            En producción y ventas
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Modelos Clasificados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalModelosClasificados}
            </span>
            <span className="text-xs text-app-muted">zapatos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Con estándar de calidad definido</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Integridad de Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              100%
            </span>
            <span className="text-xs text-app-muted">protegido</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Tipos no eliminables
          </p>
        </div>
      </div>

      {/* Banner de protección contra eliminación */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <p>
          <strong>Protección de procedencia:</strong> Los tipos de calzado no pueden ser eliminados debido a que clasifican existencias, órdenes de compra y precios de venta según su calidad (Triple AAA, Importado, Nacional). Si no deseas utilizar un tipo, cámbialo a estado <strong>Inactivo</strong>.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-tipos"
              type="search"
              placeholder="Buscar por tipo, procedencia o descripción (ej. Triple AAA, Nacional)..."
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
              id="filter-tipo-estado"
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              size="sm"
            />

            <Select
              id="filter-tipo-origen"
              value={filterOrigen}
              onChange={(e) => {
                setFilterOrigen(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Procedencia: Todas" },
                { value: "importado", label: "Importado" },
                { value: "nacional", label: "Nacional (Colombia)" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredTipos.length}</strong> de{" "}
            <strong>{tipos.length}</strong> tipos registrados
          </span>
          {(searchQuery || filterEstado !== "all" || filterOrigen !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Tipos */}
      <Table<TipoItem>
        columns={tableColumns}
        data={paginatedTipos}
        rowKey="idTipoZapato"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredTipos.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron tipos de calzado"
        emptyDescription="Prueba ajustando los términos de búsqueda o los filtros."
      />

      {/* MODAL CREAR / EDITAR TIPO */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTipo ? "Editar Tipo de Calzado" : "Registrar Nuevo Tipo de Calzado"}
        description="Ingresa la denominación de calidad y procedencia comercial del calzado"
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTipo}>
              {editingTipo ? "Guardar Cambios" : "Crear Tipo"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTipo} className="space-y-4">
          <Input
            id="form-tipo-nombre"
            label="Nombre del Tipo / Calidad"
            placeholder="Ej. Triple AAA, Importado Original, Nacional"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
            helper="Nombre que identificará el tipo de calzado en el catálogo"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="form-tipo-origen"
              label="Procedencia"
              value={formOrigen}
              onChange={(e) => setFormOrigen(e.target.value)}
              options={[
                { value: "Importado", label: "Importado (Alta Gama / Original)" },
                { value: "Nacional", label: "Nacional (Fabricación Colombia)" },
                { value: "Mixto", label: "Mixto / Especial" },
              ]}
            />

            <Select
              id="form-tipo-estado"
              label="Estado Inicial"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible para clasificar)" },
                { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
              ]}
            />
          </div>

          <Input
            id="form-tipo-garantia"
            type="number"
            min="0"
            label="Garantía Recomendada (Días)"
            placeholder="Ej. 30, 60, 90"
            value={formGarantia}
            onChange={(e) => setFormGarantia(Number(e.target.value))}
            helper="Días sugeridos de garantía para el cliente final"
          />

          <Input
            id="form-tipo-desc"
            label="Descripción / Criterio de Calidad"
            placeholder="Ej. Confeccionado con materiales premium de réplica idéntica y suela inyectada"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
            helper="Detalles sobre materiales, costuras y estándares"
          />

          <div className="rounded-xl border border-app-border bg-app-surface-alt p-3 text-xs text-app-muted flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-brand-royal dark:text-brand-sky mt-0.5" />
            <span>
              <strong>Integridad protegida:</strong> Al registrarse, este tipo de calzado formará parte del catálogo de inventario y no podrá ser eliminado.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE TIPO Y CALZADOS ASOCIADOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailTipo?.nombre || "Detalle de Tipo de Calzado"}
        description={`ID #${detailTipo?.idTipoZapato} · Clasificación de calzado`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailTipo?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailTipo && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailTipo);
                  }}
                >
                  Editar Tipo
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailTipo && (
          <div className="space-y-6">
            {/* Banner de información */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faCertificate} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailTipo.nombre}</h3>
                  <div className="flex items-center gap-2 text-xs text-app-muted mt-0.5">
                    <span className="font-semibold text-brand-royal dark:text-brand-sky">
                      Procedencia: {detailTipo.origen}
                    </span>
                    {detailTipo.garantiaDias && (
                      <>
                        <span>•</span>
                        <span>{detailTipo.garantiaDias} días de garantía</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleEstado(detailTipo)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer self-start sm:self-center ${
                  detailTipo.estado === "Activo"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={detailTipo.estado === "Activo" ? faToggleOn : faToggleOff}
                  className="text-xs"
                />
                <span>Estado: {detailTipo.estado}</span>
              </button>
            </div>

            {/* Descripción */}
            <div className="rounded-xl border border-app-border bg-app-surface p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-app-muted block">Criterio y Descripción</span>
              <p className="text-xs font-medium text-app-text">
                {detailTipo.descripcion}
              </p>
            </div>

            {/* Métricas de inventario */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Modelos de Calzado Asociados
                </span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {getShoesForTipo(detailTipo.idTipoZapato).length}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Pares Físicos en Almacén
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {getTotalStockForTipo(detailTipo.idTipoZapato)} pares
                </span>
              </div>
            </div>

            {/* Listado de Calzados de este tipo */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
                  Calzados clasificados como {detailTipo.nombre} ({getShoesForTipo(detailTipo.idTipoZapato).length})
                </h4>
                <span className="text-xs text-app-muted font-semibold">
                  Catálogo ERP
                </span>
              </div>

              {getShoesForTipo(detailTipo.idTipoZapato).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getShoesForTipo(detailTipo.idTipoZapato).map((prod) => {
                    const firstColor = prod.colores?.[0];
                    const prodImg =
                      firstColor?.imagenes?.[0] ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

                    const prodStock = prod.colores.reduce(
                      (acc, c) => acc + c.variantes.reduce((s, v) => s + v.stockActual, 0),
                      0
                    );

                    return (
                      <div
                        key={prod.idProducto}
                        className="p-3 flex items-center justify-between hover:bg-app-surface-alt/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prodImg}
                            alt={prod.nombre}
                            className="h-10 w-10 rounded-lg object-cover border border-app-border"
                          />
                          <div>
                            <p className="font-bold text-xs text-app-text">{prod.nombre}</p>
                            <span className="text-[11px] text-app-muted font-mono">
                              {prod.sku} · {MARCAS_MAP[prod.idMarca] || "Marca"} · {CATEGORIAS_MAP[prod.idCategoriaProducto] || "Calzado"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-app-text block">
                            ${prod.precioVenta.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-app-muted">
                            {prodStock} pares disponibles
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-app-muted">
                  <FontAwesomeIcon icon={faCertificate} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Actualmente no hay modelos de calzado clasificados bajo este tipo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
