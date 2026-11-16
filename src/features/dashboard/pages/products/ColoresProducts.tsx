import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPalette,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faLock,
  faShoePrints,
  faCircleCheck,
  faCopy,
  faShieldHalved,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface ColorItem {
  idColor: number;
  nombre: string;
  hex: string;
  estado: Estado;
  descripcion: string;
  fechaRegistro: string;
}

// Catálogo inicial de colores del ERP
const INITIAL_COLORS: ColorItem[] = [
  {
    idColor: 101,
    nombre: "Negro Ébano",
    hex: "#1e293b",
    estado: "Activo",
    descripcion: "Tonalidad base oscura de alta rotación para suelas y capelladas",
    fechaRegistro: "2026-01-15",
  },
  {
    idColor: 102,
    nombre: "Blanco Puro",
    hex: "#f8fafc",
    estado: "Activo",
    descripcion: "Blanco estándar brillante utilizado en zapatillas deportivas clásicas",
    fechaRegistro: "2026-01-15",
  },
  {
    idColor: 103,
    nombre: "Azul Royal",
    hex: "#1d4ed8",
    estado: "Activo",
    descripcion: "Azul eléctrico profundo saturado para calzado urbano y running",
    fechaRegistro: "2026-01-20",
  },
  {
    idColor: 104,
    nombre: "Rojo Carmín",
    hex: "#dc2626",
    estado: "Activo",
    descripcion: "Rojo vibrante aplicado en ediciones especiales y contrastes",
    fechaRegistro: "2026-01-22",
  },
  {
    idColor: 105,
    nombre: "Gris Oxford",
    hex: "#64748b",
    estado: "Activo",
    descripcion: "Tono neutro elegante para calzado de oficina, casual y formal",
    fechaRegistro: "2026-02-01",
  },
  {
    idColor: 106,
    nombre: "Verde Militar",
    hex: "#15803d",
    estado: "Activo",
    descripcion: "Verde oliva para líneas de calzado outdoor, skate y aventura",
    fechaRegistro: "2026-02-05",
  },
  {
    idColor: 107,
    nombre: "Beige / Arena",
    hex: "#d97706",
    estado: "Activo",
    descripcion: "Color tierra cálido para modelos de gamuza y lona",
    fechaRegistro: "2026-02-10",
  },
  {
    idColor: 108,
    nombre: "Amarillo Mostaza",
    hex: "#eab308",
    estado: "Inactivo",
    descripcion: "Tonalidad de temporada pausada temporalmente en catálogo",
    fechaRegistro: "2026-02-15",
  },
  {
    idColor: 109,
    nombre: "Rosa Pastel",
    hex: "#ec4899",
    estado: "Activo",
    descripcion: "Color pastel para colecciones juveniles y de dama",
    fechaRegistro: "2026-02-18",
  },
  {
    idColor: 110,
    nombre: "Café Cuero",
    hex: "#78350f",
    estado: "Activo",
    descripcion: "Acabado clásico para botines de cuero, botas y mocasines",
    fechaRegistro: "2026-02-20",
  },
];

export default function ColoresProducts() {
  const [colores, setColores] = useState<ColorItem[]>(INITIAL_COLORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterAsociados, setFilterAsociados] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formHex, setFormHex] = useState("#2563eb");
  const [formEstado, setFormEstado] = useState<Estado>("Activo");
  const [formDescripcion, setFormDescripcion] = useState("");

  // Modal Ver Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailColor, setDetailColor] = useState<ColorItem | null>(null);

  // Obtener calzados asociados a un color desde los datos de productos
  const getShoesForColor = (idColor: number) => {
    return MOCK_PRODUCTOS_PRISMA.filter((p) =>
      p.colores.some((c) => c.idColor === idColor)
    );
  };

  // Métricas del catálogo de colores
  const metrics = useMemo(() => {
    const total = colores.length;
    const activos = colores.filter((c) => c.estado === "Activo").length;
    const inactivos = total - activos;

    // Conteo total de asociaciones con zapatos
    let totalZapatosConColor = 0;
    colores.forEach((c) => {
      totalZapatosConColor += getShoesForColor(c.idColor).length;
    });

    return { total, activos, inactivos, totalZapatosConColor };
  }, [colores]);

  // Manejo de ordenamiento
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

  // Filtrado y ordenamiento de colores
  const filteredColores = useMemo(() => {
    return colores
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          c.hex.toLowerCase().includes(q) ||
          c.idColor.toString().includes(q);

        const matchesEstado = filterEstado === "all" || c.estado === filterEstado;

        const shoesCount = getShoesForColor(c.idColor).length;
        const matchesAsociados =
          filterAsociados === "all" ||
          (filterAsociados === "with_shoes" && shoesCount > 0) ||
          (filterAsociados === "without_shoes" && shoesCount === 0);

        return matchesQuery && matchesEstado && matchesAsociados;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "hex") {
          return a.hex.localeCompare(b.hex) * factor;
        }
        if (sortConfig.key === "asociados") {
          const countA = getShoesForColor(a.idColor).length;
          const countB = getShoesForColor(b.idColor).length;
          return (countA - countB) * factor;
        }
        return 0;
      });
  }, [colores, searchQuery, filterEstado, filterAsociados, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredColores.length / itemsPerPage) || 1;
  const paginatedColores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredColores.slice(start, start + itemsPerPage);
  }, [filteredColores, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterAsociados("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Toggle directo de estado del color
  const handleToggleEstado = (color: ColorItem) => {
    const nextEstado: Estado = color.estado === "Activo" ? "Inactivo" : "Activo";
    setColores((prev) =>
      prev.map((c) => (c.idColor === color.idColor ? { ...c, estado: nextEstado } : c))
    );
    if (detailColor && detailColor.idColor === color.idColor) {
      setDetailColor({ ...detailColor, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `${color.nombre}: ahora está ${nextEstado}`,
    });
  };

  // Abrir modal de creación
  const handleOpenCreateModal = () => {
    setEditingColor(null);
    setFormNombre("");
    setFormHex("#2563eb");
    setFormEstado("Activo");
    setFormDescripcion("");
    setIsFormOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEditModal = (color: ColorItem) => {
    setEditingColor(color);
    setFormNombre(color.nombre);
    setFormHex(color.hex);
    setFormEstado(color.estado);
    setFormDescripcion(color.descripcion);
    setIsFormOpen(true);
  };

  // Abrir modal de detalle
  const openDetail = (color: ColorItem) => {
    setDetailColor(color);
    setIsDetailOpen(true);
  };

  // Guardar Color (Crear o Editar)
  const handleSaveColor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre del color",
      });
      return;
    }

    // Validar formato HEX básico (#RGB o #RRGGBB)
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(formHex.trim())) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa un código HEX válido (ej. #2563eb)",
      });
      return;
    }

    if (editingColor) {
      setColores((prev) =>
        prev.map((c) =>
          c.idColor === editingColor.idColor
            ? {
                ...c,
                nombre: formNombre.trim(),
                hex: formHex.trim().toLowerCase(),
                estado: formEstado,
                descripcion: formDescripcion.trim(),
              }
            : c
        )
      );
      Toast.fire({
        icon: "success",
        title: `Color "${formNombre}" actualizado con éxito`,
      });
    } else {
      // Verificar que el nombre no esté duplicado
      const duplicate = colores.some(
        (c) => c.nombre.toLowerCase() === formNombre.trim().toLowerCase()
      );
      if (duplicate) {
        Toast.fire({
          icon: "warning",
          title: "Ya existe un color registrado con ese nombre",
        });
        return;
      }

      const newId =
        colores.length > 0 ? Math.max(...colores.map((c) => c.idColor)) + 1 : 101;

      const newColor: ColorItem = {
        idColor: newId,
        nombre: formNombre.trim(),
        hex: formHex.trim().toLowerCase(),
        estado: formEstado,
        descripcion: formDescripcion.trim() || "Color registrado en catálogo de calzado",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setColores((prev) => [newColor, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Color "${formNombre}" agregado con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Copiar código HEX al portapapeles
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    Toast.fire({
      icon: "success",
      title: `Código ${hex} copiado al portapapeles`,
    });
  };

  // Columnas para la tabla global Table
  const tableColumns: TableColumn<ColorItem>[] = [
    {
      key: "nombre",
      header: "Color / Muestra",
      sortable: true,
      render: (color) => (
        <div className="flex items-center gap-3.5 py-1">
          <div
            className="h-10 w-10 shrink-0 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: color.hex }}
            title={`Muestra de ${color.nombre} (${color.hex})`}
          />
          <div className="min-w-0">
            <p
              onClick={() => openDetail(color)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={color.nombre}
            >
              {color.nombre}
            </p>
            <p className="text-xs text-app-muted truncate max-w-xs">
              {color.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "hex",
      header: "Código HEX",
      sortable: true,
      render: (color) => (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-app-surface-alt border border-app-border">
          <span
            className="h-2.5 w-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-app-text">{color.hex.toUpperCase()}</span>
          <button
            type="button"
            onClick={() => handleCopyHex(color.hex)}
            className="text-app-muted hover:text-brand-royal dark:hover:text-brand-sky ml-1 cursor-pointer transition-colors"
            title="Copiar código HEX"
          >
            <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
          </button>
        </div>
      ),
    },
    {
      key: "asociados",
      header: "Calzados Asociados",
      sortable: true,
      align: "center",
      render: (color) => {
        const shoes = getShoesForColor(color.idColor);
        return (
          <button
            type="button"
            onClick={() => openDetail(color)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              shoes.length > 0
                ? "bg-brand-royal/10 text-brand-royal border-brand-royal/20 dark:bg-brand-sky/15 dark:text-brand-sky dark:border-brand-sky/20 hover:bg-brand-royal/20"
                : "bg-app-surface-alt text-app-muted border-app-border"
            }`}
            title="Hacer clic para ver modelos de zapatos asociados"
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
      key: "estado",
      header: "Estado",
      align: "center",
      render: (color) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(color)}
          title={`Hacer clic para cambiar a ${color.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            color.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              color.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {color.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (color) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(color)}
            title="Ver detalles del color y calzado asociado"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(color)}
            title="Editar color"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Acción de eliminación bloqueada por zapatos asociados */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: el color tiene zapatos o existencias asociadas"
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
              <FontAwesomeIcon icon={faPalette} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Colores
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo maestro de colores y tonalidades para las variantes de calzado
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
            Nuevo Color
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Colores en Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faPalette} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">tonos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activos} activos en tienda
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Colores Activos</p>
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
            Listos para nuevos calzados
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Calzados Vinculados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalZapatosConColor}
            </span>
            <span className="text-xs text-app-muted">asociaciones</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Modelos activos en stock</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Protección de Datos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              100%
            </span>
            <span className="text-xs text-app-muted">integridad</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Colores no eliminables
          </p>
        </div>
      </div>

      {/* Banner de información de integridad */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <p>
          <strong>Política de integridad del inventario:</strong> Los colores no pueden eliminarse del sistema porque tienen modelos de zapatos, variantes de tallas y ventas asociadas. Si no deseas utilizar un color en nuevas producciones, cámbialo a estado <strong>Inactivo</strong>.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              id="search-colors"
              type="search"
              placeholder="Buscar por nombre de color o código HEX..."
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
              id="filter-color-estado"
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
              id="filter-color-asociados"
              value={filterAsociados}
              onChange={(e) => {
                setFilterAsociados(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Zapatos: Todos" },
                { value: "with_shoes", label: "Con calzado asociado" },
                { value: "without_shoes", label: "Sin calzado asociado" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredColores.length}</strong> de{" "}
            <strong>{colores.length}</strong> colores registrados
          </span>
          {(searchQuery || filterEstado !== "all" || filterAsociados !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Colores */}
      <Table<ColorItem>
        columns={tableColumns}
        data={paginatedColores}
        rowKey="idColor"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredColores.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron colores"
        emptyDescription="Prueba modificando la búsqueda o los filtros de estado."
      />

      {/* MODAL CREAR / EDITAR COLOR */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingColor ? "Editar Color de Calzado" : "Registrar Nuevo Color"}
        description="Ingresa el nombre, código hexadecimal y estado para las variantes de productos"
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveColor}>
              {editingColor ? "Guardar Cambios" : "Crear Color"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveColor} className="space-y-4">
          <Input
            id="form-color-nombre"
            label="Nombre del Color"
            placeholder="Ej. Azul Índigo, Verde Olivo, Terracota"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          {/* Selector de color HEX interactivo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-app-text block">
              Tonalidad / Código Hexadecimal
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-app-border bg-app-surface-alt">
              {/* Color picker nativo */}
              <input
                type="color"
                value={formHex}
                onChange={(e) => setFormHex(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-app-border bg-transparent p-0"
              />

              {/* Input texto del HEX */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="#2563eb"
                  value={formHex}
                  onChange={(e) => setFormHex(e.target.value)}
                  className="h-9 w-full rounded-lg border border-app-border bg-app-surface px-3 font-mono text-xs font-bold text-app-text"
                />
              </div>

              {/* Muestra previa */}
              <div
                className="h-10 w-16 shrink-0 rounded-lg border border-white/40 shadow-xs flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: formHex,
                  color: isLightColor(formHex) ? "#0f172a" : "#ffffff",
                }}
              >
                Muestra
              </div>
            </div>
            <p className="text-[11px] text-app-muted">
              Puedes hacer clic en el selector visual de color o escribir el código hexadecimal manualmente.
            </p>
          </div>

          <Select
            id="form-color-estado"
            label="Estado Inicial"
            value={formEstado}
            onChange={(e) => setFormEstado(e.target.value as Estado)}
            options={[
              { value: "Activo", label: "Activo (Disponible para nuevos calzados)" },
              { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
            ]}
          />

          <Input
            id="form-color-desc"
            label="Descripción / Uso sugerido (Opcional)"
            placeholder="Ej. Tono oscuro para líneas de running y calzado casual"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
          />

          <div className="rounded-xl border border-app-border bg-app-surface-alt p-3 text-xs text-app-muted flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-brand-royal dark:text-brand-sky mt-0.5" />
            <span>
              <strong>Nota de seguridad:</strong> Una vez registrado, este color quedará protegido y no podrá eliminarse ya que formará parte del historial de calzado.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE COLOR Y CALZADO ASOCIADO */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailColor?.nombre || "Detalle de Color"}
        description={`Código: ${detailColor?.hex.toUpperCase() || ""} · ID #${detailColor?.idColor}`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailColor?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailColor && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailColor);
                  }}
                >
                  Editar Color
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailColor && (
          <div className="space-y-6">
            {/* Banner visual del color */}
            <div
              className="rounded-2xl p-6 shadow-sm border border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                backgroundColor: detailColor.hex,
                color: isLightColor(detailColor.hex) ? "#0f172a" : "#ffffff",
              }}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Tonalidad de Calzado
                </span>
                <h3 className="text-2xl font-black">{detailColor.nombre}</h3>
                <p className="text-xs font-mono font-bold mt-1 opacity-90">
                  {detailColor.hex.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleEstado(detailColor)}
                  className="rounded-xl px-4 py-2 text-xs font-bold bg-white/90 text-slate-900 shadow hover:bg-white transition-all cursor-pointer"
                >
                  Cambiar a {detailColor.estado === "Activo" ? "Inactivo" : "Activo"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-app-muted block">Descripción</span>
                <p className="text-xs font-medium text-app-text">
                  {detailColor.descripcion || "Sin descripción adicional registrada."}
                </p>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-app-muted block">Fecha de Registro</span>
                <p className="text-xs font-medium text-app-text">
                  {detailColor.fechaRegistro || "2026-01-15"}
                </p>
              </div>
            </div>

            {/* Listado de Calzados Asociados */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
                  Modelos de Calzado Asociados ({getShoesForColor(detailColor.idColor).length})
                </h4>
                <span className="text-xs text-app-muted">
                  Vinculación en inventario
                </span>
              </div>

              {getShoesForColor(detailColor.idColor).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getShoesForColor(detailColor.idColor).map((prod) => {
                    const colorVariant = prod.colores.find((c) => c.idColor === detailColor.idColor);
                    const prodImg =
                      colorVariant?.imagenes?.[0] ||
                      prod.colores?.[0]?.imagenes?.[0] ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

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
                            <span className="text-[11px] text-app-muted font-mono">{prod.sku}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-app-muted">
                            <FontAwesomeIcon icon={faBoxesStacked} className="text-[10px]" />
                            {colorVariant?.variantes.length || 0} tallas en este color
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-app-muted">
                  <FontAwesomeIcon icon={faShoePrints} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Este color no está asociado a ningún modelo de calzado actualmente.
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

// Función auxiliar para determinar si un color HEX es claro u oscuro (para contraste de texto)
function isLightColor(hex: string): boolean {
  const cleanHex = hex.replace("#", "");
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;

  // Fórmula de luminosidad relativa estándar HSP
  const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return brightness > 140;
}
