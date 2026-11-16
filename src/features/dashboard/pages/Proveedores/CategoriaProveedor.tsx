import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faToggleOn,
  faToggleOff,
  faTruck,
  faShoePrints,
  faGem,
  faCircleCheck,
  faIndustry,
  faGlobe,
  faPhone,
  faLocationDot,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PROVEEDORES } from "./constants";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface CategoriaProveedorItem {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  tiposZapato: string[];
  calidadesOfrecidas: string[];
  colorBadge: string;
  estado: Estado;
  fechaRegistro: string;
}

// Opciones disponibles de tipos de calzado para clasificación
const TIPOS_ZAPATO_DISPONIBLES = [
  "Deportivo",
  "Casual",
  "Urbano / Skate",
  "Formal",
  "Botas y Botines",
  "Sandalias y Confort",
];

// Opciones disponibles de calidades para clasificación
const CALIDADES_DISPONIBLES = [
  "Triple AAA (G5 / Top Quality)",
  "Importado Original / Genuino",
  "Nacional Cuero Genuino",
  "Nacional (Fabricación Colombia)",
  "Calidad 1.1 / Premium",
  "Económico / Maquila",
];

// Opciones de colores de badge temáticos
const BADGE_COLOR_OPTIONS = [
  {
    label: "Azul Real",
    value: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    label: "Ámbar / Cuero",
    value: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    label: "Esmeralda",
    value: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    label: "Índigo",
    value: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  },
  {
    label: "Púrpura",
    value: "border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    label: "Rosa",
    value: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    label: "Verde Azulado",
    value: "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  },
];

// Catálogo inicial de categorías de proveedores clasificadas por tipo de zapato y calidades
const INITIAL_CATEGORIAS_PROVEEDOR: CategoriaProveedorItem[] = [
  {
    idCategoria: 1,
    nombre: "Proveedores Calzado Deportivo Triple AAA",
    descripcion: "Mayoristas especializados en zapatillas deportivas de alto impacto, réplicas G5 y modelos de entrenamiento",
    tiposZapato: ["Deportivo", "Urbano / Skate"],
    calidadesOfrecidas: ["Triple AAA (G5 / Top Quality)", "Calidad 1.1 / Premium"],
    colorBadge: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idCategoria: 2,
    nombre: "Fabricantes Nacionales en Cuero Genuino",
    descripcion: "Talleres colombianos y artesanos de calzado formal, botines y mocasines con suela de vaqueta y cuero vacuno",
    tiposZapato: ["Formal", "Casual", "Botas y Botines"],
    calidadesOfrecidas: ["Nacional Cuero Genuino", "Nacional (Fabricación Colombia)"],
    colorBadge: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idCategoria: 3,
    nombre: "Distribuidores Oficiales Importado Original",
    descripcion: "Casas matrices y distribuidores con licencia directa de marcas internacionales de calzado original",
    tiposZapato: ["Deportivo", "Casual", "Urbano / Skate"],
    calidadesOfrecidas: ["Importado Original / Genuino"],
    colorBadge: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idCategoria: 4,
    nombre: "Insumos, Suelas y Sintéticos Especiales",
    descripcion: "Proveedores industriales de suelas de caucho, TR, poliuretano, plantillas y materiales sintéticos de armado",
    tiposZapato: ["Deportivo", "Casual", "Urbano / Skate", "Botas y Botines"],
    calidadesOfrecidas: ["Triple AAA (G5 / Top Quality)", "Nacional (Fabricación Colombia)"],
    colorBadge: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idCategoria: 5,
    nombre: "Calzado Casual y Urbano Premium 1.1",
    descripcion: "Proveedores de calzado para uso diario con acabados de precisión y excelente relación costo-beneficio",
    tiposZapato: ["Casual", "Urbano / Skate"],
    calidadesOfrecidas: ["Calidad 1.1 / Premium", "Triple AAA (G5 / Top Quality)"],
    colorBadge: "border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
    estado: "Activo",
    fechaRegistro: "2026-01-22",
  },
  {
    idCategoria: 6,
    nombre: "Líneas Económicas y Maquila Masiva",
    descripcion: "Fabricantes por volumen orientados a calzado accesible, remates y promociones de temporada",
    tiposZapato: ["Casual", "Sandalias y Confort"],
    calidadesOfrecidas: ["Económico / Maquila"],
    colorBadge: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    estado: "Inactivo",
    fechaRegistro: "2026-02-01",
  },
];

export default function CategoriaProveedor() {
  const [categorias, setCategorias] = useState<CategoriaProveedorItem[]>(
    INITIAL_CATEGORIAS_PROVEEDOR
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterTipoZapato, setFilterTipoZapato] = useState<string>("all");
  const [filterCalidad, setFilterCalidad] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaProveedorItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formTiposZapato, setFormTiposZapato] = useState<string[]>([]);
  const [formCalidades, setFormCalidades] = useState<string[]>([]);
  const [formColorBadge, setFormColorBadge] = useState(BADGE_COLOR_OPTIONS[0].value);
  const [formEstado, setFormEstado] = useState<Estado>("Activo");

  // Modal Consultar Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCategoria, setDetailCategoria] = useState<CategoriaProveedorItem | null>(null);

  // Obtener proveedores vinculados (mapeando con idCategoria o coincidencia temática)
  const getProveedoresPorCategoria = (idCategoria: number) => {
    // Si la categoría existe en el mock inicial o está vinculada por id
    const provs = MOCK_PROVEEDORES.filter((p) => {
      // Coincidencia directa por id o asignación proporcional para demo interactiva
      if (p.categorias.some((c) => c.idCategoria === idCategoria)) return true;
      // Para IDs mayores generados dinámicamente, asociar por hash para previsualización
      if (idCategoria > 4 && p.categorias.some((c) => c.idCategoria === (idCategoria % 4) + 1)) {
        return true;
      }
      return false;
    });
    return provs;
  };

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = categorias.length;
    const activas = categorias.filter((c) => c.estado === "Activo").length;
    const inactivas = total - activas;

    const allTipos = new Set<string>();
    categorias.forEach((c) => {
      c.tiposZapato.forEach((t) => allTipos.add(t));
    });

    const proveedoresAsociadosTotal = MOCK_PROVEEDORES.filter((p) => p.estado === "Activo").length;

    return { total, activas, inactivas, totalTipos: allTipos.size, proveedoresAsociadosTotal };
  }, [categorias]);

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

  // Filtrado y ordenamiento
  const filteredCategorias = useMemo(() => {
    return categorias
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q) ||
          c.tiposZapato.some((t) => t.toLowerCase().includes(q)) ||
          c.calidadesOfrecidas.some((cal) => cal.toLowerCase().includes(q));

        const matchesEstado = filterEstado === "all" || c.estado === filterEstado;

        const matchesTipo =
          filterTipoZapato === "all" ||
          c.tiposZapato.some((t) => t.toLowerCase() === filterTipoZapato.toLowerCase());

        const matchesCalidad =
          filterCalidad === "all" ||
          c.calidadesOfrecidas.some((cal) => cal.toLowerCase() === filterCalidad.toLowerCase());

        return matchesQuery && matchesEstado && matchesTipo && matchesCalidad;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "proveedores") {
          const countA = getProveedoresPorCategoria(a.idCategoria).length;
          const countB = getProveedoresPorCategoria(b.idCategoria).length;
          return (countA - countB) * factor;
        }
        return 0;
      });
  }, [categorias, searchQuery, filterEstado, filterTipoZapato, filterCalidad, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage) || 1;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategorias.slice(start, start + itemsPerPage);
  }, [filteredCategorias, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterTipoZapato("all");
    setFilterCalidad("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Cambiar el estado de la categoría (Activo / Inactivo)
  const handleToggleEstado = (categoria: CategoriaProveedorItem) => {
    const nextEstado: Estado = categoria.estado === "Activo" ? "Inactivo" : "Activo";
    setCategorias((prev) =>
      prev.map((c) =>
        c.idCategoria === categoria.idCategoria ? { ...c, estado: nextEstado } : c
      )
    );
    if (detailCategoria && detailCategoria.idCategoria === categoria.idCategoria) {
      setDetailCategoria({ ...detailCategoria, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Categoría "${categoria.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Registro (Crear)
  const handleOpenCreateModal = () => {
    setEditingCategoria(null);
    setFormNombre("");
    setFormDescripcion("");
    setFormTiposZapato(["Deportivo", "Casual"]);
    setFormCalidades(["Triple AAA (G5 / Top Quality)"]);
    setFormColorBadge(BADGE_COLOR_OPTIONS[0].value);
    setFormEstado("Activo");
    setIsFormOpen(true);
  };

  // Abrir Modal de Actualizar (Editar)
  const handleOpenEditModal = (categoria: CategoriaProveedorItem) => {
    setEditingCategoria(categoria);
    setFormNombre(categoria.nombre);
    setFormDescripcion(categoria.descripcion);
    setFormTiposZapato([...categoria.tiposZapato]);
    setFormCalidades([...categoria.calidadesOfrecidas]);
    setFormColorBadge(categoria.colorBadge || BADGE_COLOR_OPTIONS[0].value);
    setFormEstado(categoria.estado);
    setIsFormOpen(true);
  };

  // Abrir Modal de Consulta (Detalle)
  const openDetail = (categoria: CategoriaProveedorItem) => {
    setDetailCategoria(categoria);
    setIsDetailOpen(true);
  };

  // Toggle para selección de Tipos de Zapato en el Formulario
  const handleToggleTipoZapato = (tipo: string) => {
    setFormTiposZapato((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  // Toggle para selección de Calidades en el Formulario
  const handleToggleCalidad = (calidad: string) => {
    setFormCalidades((prev) =>
      prev.includes(calidad) ? prev.filter((c) => c !== calidad) : [...prev, calidad]
    );
  };

  // Guardar Categoría (Registrar o Actualizar)
  const handleSaveCategoria = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre de la categoría de proveedor",
      });
      return;
    }

    if (formTiposZapato.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona al menos un tipo de zapato que clasifica",
      });
      return;
    }

    if (formCalidades.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona al menos una calidad ofrecida por esta categoría",
      });
      return;
    }

    if (editingCategoria) {
      setCategorias((prev) =>
        prev.map((c) =>
          c.idCategoria === editingCategoria.idCategoria
            ? {
                ...c,
                nombre: formNombre.trim(),
                descripcion: formDescripcion.trim() || c.descripcion,
                tiposZapato: formTiposZapato,
                calidadesOfrecidas: formCalidades,
                colorBadge: formColorBadge,
                estado: formEstado,
              }
            : c
        )
      );
      Toast.fire({
        icon: "success",
        title: `Categoría "${formNombre}" actualizada correctamente`,
      });
    } else {
      // Validar duplicado por nombre
      const exists = categorias.some(
        (c) => c.nombre.toLowerCase() === formNombre.trim().toLowerCase()
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe una categoría llamada "${formNombre}"`,
        });
        return;
      }

      const newId =
        categorias.length > 0
          ? Math.max(...categorias.map((c) => c.idCategoria)) + 1
          : 1;

      const newCat: CategoriaProveedorItem = {
        idCategoria: newId,
        nombre: formNombre.trim(),
        descripcion:
          formDescripcion.trim() ||
          `Clasificación de proveedores para calzado ${formTiposZapato.join(", ")}`,
        tiposZapato: formTiposZapato,
        calidadesOfrecidas: formCalidades,
        colorBadge: formColorBadge,
        estado: formEstado,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setCategorias((prev) => [newCat, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Categoría "${formNombre}" registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table
  const tableColumns: TableColumn<CategoriaProveedorItem>[] = [
    {
      key: "nombre",
      header: "Categoría de Proveedor",
      sortable: true,
      render: (categoria) => (
        <div className="flex items-center gap-3.5 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky border border-brand-royal/20 dark:border-brand-sky/20">
            <FontAwesomeIcon icon={faTags} className="text-sm" />
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(categoria)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={categoria.nombre}
            >
              {categoria.nombre}
            </p>
            <p className="text-xs text-app-muted truncate max-w-sm">
              {categoria.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "tiposZapato",
      header: "Tipos de Zapato",
      render: (categoria) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {categoria.tiposZapato.slice(0, 2).map((tipo, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-app-surface-alt px-2 py-0.5 text-[11px] font-semibold text-app-text border border-app-border"
            >
              <FontAwesomeIcon icon={faShoePrints} className="text-[9px] text-app-muted" />
              {tipo}
            </span>
          ))}
          {categoria.tiposZapato.length > 2 && (
            <span
              onClick={() => openDetail(categoria)}
              className="inline-flex items-center rounded-md bg-app-surface-alt px-1.5 py-0.5 text-[10px] font-bold text-brand-royal dark:text-brand-sky cursor-pointer hover:underline"
            >
              +{categoria.tiposZapato.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "calidades",
      header: "Calidades que Ofrecen",
      render: (categoria) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {categoria.calidadesOfrecidas.slice(0, 2).map((cal, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 text-[11px] font-medium"
            >
              <FontAwesomeIcon icon={faGem} className="text-[9px]" />
              {cal.length > 20 ? `${cal.substring(0, 18)}...` : cal}
            </span>
          ))}
          {categoria.calidadesOfrecidas.length > 2 && (
            <span
              onClick={() => openDetail(categoria)}
              className="inline-flex items-center rounded-md bg-app-surface-alt px-1.5 py-0.5 text-[10px] font-bold text-brand-royal dark:text-brand-sky cursor-pointer hover:underline"
            >
              +{categoria.calidadesOfrecidas.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "proveedores",
      header: "Proveedores",
      sortable: true,
      align: "center",
      render: (categoria) => {
        const provs = getProveedoresPorCategoria(categoria.idCategoria);
        return (
          <button
            type="button"
            onClick={() => openDetail(categoria)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              provs.length > 0
                ? "bg-brand-royal/10 text-brand-royal border-brand-royal/20 dark:bg-brand-sky/15 dark:text-brand-sky dark:border-brand-sky/20 hover:bg-brand-royal/20"
                : "bg-app-surface-alt text-app-muted border-app-border"
            }`}
            title="Ver proveedores clasificados en esta categoría"
          >
            <FontAwesomeIcon icon={faTruck} className="text-xs" />
            <span>
              {provs.length} {provs.length === 1 ? "proveedor" : "proveedores"}
            </span>
          </button>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (categoria) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(categoria)}
          title={`Hacer clic para cambiar a ${categoria.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            categoria.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              categoria.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {categoria.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (categoria) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(categoria)}
            title="Consultar detalle de la categoría y proveedores vinculados"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(categoria)}
            title="Actualizar datos de la categoría"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>
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
              <FontAwesomeIcon icon={faTags} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Categorías de Proveedores
              </h1>
              <p className="text-sm text-app-muted">
                Clasificación de proveedores según el tipo de zapato y calidades que ofrecen
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
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Categorías Definidas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faTags} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">categorías</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} disponibles para asignar
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Categorías Activas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.activas}
            </span>
            <span className="text-xs text-app-muted">activas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Habilitadas en el ERP
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Proveedores Activos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faTruck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.proveedoresAsociadosTotal}
            </span>
            <span className="text-xs text-app-muted">proveedores</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Clasificados por suministro</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tipos de Zapato Cubiertos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalTipos}
            </span>
            <span className="text-xs text-app-muted">líneas</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Deportivo, Formal, Urbano, etc.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              id="search-categorias-prov"
              type="search"
              placeholder="Buscar por nombre, tipo de zapato o calidad..."
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
              id="filter-cat-estado"
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
              id="filter-cat-tipozapato"
              value={filterTipoZapato}
              onChange={(e) => {
                setFilterTipoZapato(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Tipo de Zapato: Todos" },
                ...TIPOS_ZAPATO_DISPONIBLES.map((t) => ({ value: t, label: t })),
              ]}
              size="sm"
            />

            <Select
              id="filter-cat-calidad"
              value={filterCalidad}
              onChange={(e) => {
                setFilterCalidad(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Calidad: Todas" },
                ...CALIDADES_DISPONIBLES.map((cal) => ({ value: cal, label: cal })),
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredCategorias.length}</strong> de{" "}
            <strong>{categorias.length}</strong> categorías registradas
          </span>
          {(searchQuery || filterEstado !== "all" || filterTipoZapato !== "all" || filterCalidad !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Categorías de Proveedores */}
      <Table<CategoriaProveedorItem>
        columns={tableColumns}
        data={paginatedCategorias}
        rowKey="idCategoria"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredCategorias.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [4, 6, 10, 20],
        }}
        emptyTitle="No se encontraron categorías de proveedor"
        emptyDescription="Prueba modificando la búsqueda o los filtros de tipo y calidad."
      />

      {/* MODAL REGISTRAR / ACTUALIZAR CATEGORÍA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategoria ? "Actualizar Categoría de Proveedor" : "Registrar Categoría de Proveedor"}
        description="Define la categoría y clasifica según los tipos de calzado y calidades suministradas"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCategoria}>
              {editingCategoria ? "Guardar Cambios" : "Registrar Categoría"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategoria} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-cat-nombre"
              label="Nombre de la Categoría"
              placeholder="Ej. Proveedores Deportivo Triple AAA"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
              helper="Identificador visible en la gestión de compras y proveedores"
            />

            <Select
              id="form-cat-estado"
              label="Estado de la Categoría"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible para clasificar proveedores)" },
                { value: "Inactivo", label: "Inactivo (Oculto en selección)" },
              ]}
            />
          </div>

          {/* Selección interactiva de Tipos de Zapato */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-app-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky text-xs" />
                Tipos de Zapato que clasifica (Selecciona los aplicables)
              </span>
              <span className="text-[11px] font-normal text-app-muted">
                {formTiposZapato.length} seleccionados
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIPOS_ZAPATO_DISPONIBLES.map((tipo) => {
                const isSelected = formTiposZapato.includes(tipo);
                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleToggleTipoZapato(tipo)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky shadow-xs"
                        : "border-app-border bg-app-surface text-app-muted hover:border-brand-royal/30"
                    }`}
                  >
                    <span>{tipo}</span>
                    {isSelected && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selección interactiva de Calidades ofrecidas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-app-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faGem} className="text-amber-500 text-xs" />
                Calidades de Calzado que ofrecen (Selecciona las aplicables)
              </span>
              <span className="text-[11px] font-normal text-app-muted">
                {formCalidades.length} seleccionadas
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CALIDADES_DISPONIBLES.map((calidad) => {
                const isSelected = formCalidades.includes(calidad);
                return (
                  <button
                    key={calidad}
                    type="button"
                    onClick={() => handleToggleCalidad(calidad)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs"
                        : "border-app-border bg-app-surface text-app-muted hover:border-amber-400/40"
                    }`}
                  >
                    <span className="truncate">{calidad}</span>
                    {isSelected && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="form-cat-badge-color"
              label="Distintivo Visual de Color"
              value={formColorBadge}
              onChange={(e) => setFormColorBadge(e.target.value)}
              options={BADGE_COLOR_OPTIONS.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
            />

            <Input
              id="form-cat-desc"
              label="Descripción / Alcance de Suministro"
              placeholder="Ej. Línea enfocada a distribución mayorista y confección"
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL CONSULTAR DETALLE DE CATEGORÍA Y PROVEEDORES VINCULADOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailCategoria?.nombre || "Consulta de Categoría"}
        description={`ID #${detailCategoria?.idCategoria} · Categoría de Proveedores`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailCategoria?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailCategoria && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailCategoria);
                  }}
                >
                  Actualizar Categoría
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailCategoria && (
          <div className="space-y-6">
            {/* Banner de información general */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faTags} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailCategoria.nombre}</h3>
                  <p className="text-xs text-app-muted mt-0.5">
                    {detailCategoria.descripcion}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleEstado(detailCategoria)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer self-start sm:self-center ${
                  detailCategoria.estado === "Activo"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={detailCategoria.estado === "Activo" ? faToggleOn : faToggleOff}
                  className="text-xs"
                />
                <span>Estado: {detailCategoria.estado}</span>
              </button>
            </div>

            {/* Clasificación: Tipos de Zapato y Calidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-app-border bg-app-surface p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky text-xs" />
                  Tipos de Zapato Cubiertos ({detailCategoria.tiposZapato.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailCategoria.tiposZapato.map((tipo, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-semibold text-app-text border border-app-border"
                    >
                      <FontAwesomeIcon icon={faShoePrints} className="text-[10px] text-app-muted" />
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faGem} className="text-amber-500 text-xs" />
                  Calidades que Ofrecen ({detailCategoria.calidadesOfrecidas.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {detailCategoria.calidadesOfrecidas.map((cal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 text-xs font-semibold"
                    >
                      <FontAwesomeIcon icon={faGem} className="text-[10px]" />
                      {cal}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Listado de Proveedores Clasificados */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruck} className="text-brand-royal dark:text-brand-sky" />
                  Proveedores Clasificados en esta Categoría ({getProveedoresPorCategoria(detailCategoria.idCategoria).length})
                </h4>
                <span className="text-xs text-app-muted font-semibold">
                  Módulo de Compras ERP
                </span>
              </div>

              {getProveedoresPorCategoria(detailCategoria.idCategoria).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getProveedoresPorCategoria(detailCategoria.idCategoria).map((prov) => (
                    <div
                      key={prov.idProveedor}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-app-surface-alt/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-app-text">{prov.razonSocial}</p>
                          <span
                            className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              prov.esImportado
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={prov.esImportado ? faGlobe : faIndustry}
                              className="text-[9px] mr-1"
                            />
                            {prov.esImportado ? "Importado" : "Nacional"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-muted">
                          <span>
                            {prov.tipoDocumento}: <strong>{prov.numeroDocumento}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[10px]" />
                            {prov.ciudad || prov.pais || "Colombia"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-app-muted">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                          {prov.telefono}
                        </span>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            prov.estado === "Activo"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {prov.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-app-muted">
                  <FontAwesomeIcon icon={faTruck} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Actualmente no hay proveedores vinculados directamente a esta categoría.
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
