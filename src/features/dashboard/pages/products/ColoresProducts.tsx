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
  faCircleCheck,
  faCopy,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { Switcher } from "../../components/Switcher";
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
  descripcion?: string;
  fechaRegistro: string;
}

// Catálogo inicial de colores del ERP con IDs consecutivos (1, 2, 3...)
const INITIAL_COLORS: ColorItem[] = [
  {
    idColor: 1,
    nombre: "Negro Ébano",
    hex: "#1e293b",
    estado: "Activo",
    descripcion: "Tonalidad base oscura de alta rotación para suelas y capelladas",
    fechaRegistro: "2026-01-15",
  },
  {
    idColor: 2,
    nombre: "Blanco Puro",
    hex: "#f8fafc",
    estado: "Activo",
    descripcion: "Blanco estándar brillante utilizado en zapatillas deportivas clásicas",
    fechaRegistro: "2026-01-15",
  },
  {
    idColor: 3,
    nombre: "Azul Royal",
    hex: "#1d4ed8",
    estado: "Activo",
    descripcion: "Azul eléctrico profundo saturado para calzado urbano y running",
    fechaRegistro: "2026-01-20",
  },
  {
    idColor: 4,
    nombre: "Rojo Carmín",
    hex: "#dc2626",
    estado: "Activo",
    descripcion: "Rojo vibrante aplicado en ediciones especiales y contrastes",
    fechaRegistro: "2026-01-22",
  },
  {
    idColor: 5,
    nombre: "Gris Oxford",
    hex: "#64748b",
    estado: "Activo",
    descripcion: "Tono neutro elegante para calzado de oficina, casual y formal",
    fechaRegistro: "2026-02-01",
  },
  {
    idColor: 6,
    nombre: "Verde Militar",
    hex: "#15803d",
    estado: "Activo",
    descripcion: "Verde oliva para líneas de calzado outdoor, skate y aventura",
    fechaRegistro: "2026-02-05",
  },
  {
    idColor: 7,
    nombre: "Beige / Arena",
    hex: "#d97706",
    estado: "Activo",
    descripcion: "Color tierra cálido para modelos de gamuza y lona",
    fechaRegistro: "2026-02-10",
  },
  {
    idColor: 8,
    nombre: "Amarillo Mostaza",
    hex: "#eab308",
    estado: "Inactivo",
    descripcion: "Tonalidad de temporada pausada temporalmente en catálogo",
    fechaRegistro: "2026-02-15",
  },
  {
    idColor: 9,
    nombre: "Rosa Pastel",
    hex: "#ec4899",
    estado: "Activo",
    descripcion: "Color pastel para colecciones juveniles y de dama",
    fechaRegistro: "2026-02-18",
  },
  {
    idColor: 10,
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

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  // Modal Crear / Editar (solo color y nombre)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formHex, setFormHex] = useState("#2563eb");

  // Modal Ver Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailColor, setDetailColor] = useState<ColorItem | null>(null);

  // Métricas del catálogo de colores
  const metrics = useMemo(() => {
    const total = colores.length;
    const activos = colores.filter((c) => c.estado === "Activo").length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
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
        return matchesQuery && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "id") {
          return (a.idColor - b.idColor) * factor;
        }
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "hex") {
          return a.hex.localeCompare(b.hex) * factor;
        }
        return 0;
      });
  }, [colores, searchQuery, filterEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredColores.length / itemsPerPage) || 1;
  const paginatedColores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredColores.slice(start, start + itemsPerPage);
  }, [filteredColores, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setSortConfig({ key: "id", direction: "asc" });
    setCurrentPage(1);
  };

  // Toggle directo de estado del color mediante switch
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

  // Abrir modal de creación (solo color y nombre)
  const handleOpenCreateModal = () => {
    setEditingColor(null);
    setFormNombre("");
    setFormHex("#2563eb");
    setIsFormOpen(true);
  };

  // Abrir modal de edición (solo color y nombre)
  const handleOpenEditModal = (color: ColorItem) => {
    setEditingColor(color);
    setFormNombre(color.nombre);
    setFormHex(color.hex);
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

      // Generar nuevo ID correlativo desde 1, 2, 3...
      const newId =
        colores.length > 0 ? Math.max(...colores.map((c) => c.idColor)) + 1 : 1;

      const newColor: ColorItem = {
        idColor: newId,
        nombre: formNombre.trim(),
        hex: formHex.trim().toLowerCase(),
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setColores((prev) => [...prev, newColor]);
      Toast.fire({
        icon: "success",
        title: `Color "${formNombre}" agregado con ID #${newId}`,
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
      key: "id",
      header: "ID",
      width: "w-20",
      align: "center",
      sortable: true,
      render: (color) => (
        <span className="font-mono text-xs font-black text-slate-600 dark:text-slate-300">
          #{color.idColor}
        </span>
      ),
    },
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
      key: "estado",
      header: "Estado",
      align: "center",
      render: (color) => (
        <div className="flex items-center justify-center">
          <Switcher
            checked={color.estado === "Activo"}
            onChange={() => handleToggleEstado(color)}
            size="sm"
          />
        </div>
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
            title="Ver detalles del color"
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

          {/* Acción de eliminación bloqueada */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: el color forma parte del catálogo protegido de calzado"
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
            Disponibles para calzado
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Colores Inactivos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <FontAwesomeIcon icon={faLock} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.inactivos}
            </span>
            <span className="text-xs text-app-muted">pausados</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Fuera de temporada</p>
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

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-colors"
              type="search"
              placeholder="Buscar por ID, nombre de color o código HEX..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="w-full sm:w-56">
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
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredColores.length}</strong> de{" "}
            <strong>{colores.length}</strong> colores registrados
          </span>
          {(searchQuery || filterEstado !== "all") && (
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

      {/* MODAL CREAR / EDITAR COLOR (SOLO NOMBRE Y COLOR) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingColor ? "Editar Color" : "Registrar Nuevo Color"}
        description="Ingresa el nombre y selecciona la tonalidad del color"
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
            placeholder="Ej. Azul Índigo, Verde Olivo, Blanco Puro"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          {/* Selector de color HEX interactivo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-app-text block">
              Color / Tonalidad
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
              Haz clic en el cuadro de color para elegir con el selector visual o escribe el código HEX.
            </p>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE COLOR */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailColor?.nombre || "Detalle de Color"}
        description={`Código: ${detailColor?.hex.toUpperCase() || ""} · ID #${detailColor?.idColor}`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-app-muted">Estado:</span>
              <Switcher
                checked={detailColor?.estado === "Activo"}
                onChange={() => {
                  if (detailColor) handleToggleEstado(detailColor);
                }}
                size="sm"
              />
            </div>
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
          <div className="space-y-4">
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
                  ID #{detailColor.idColor}
                </span>
                <h3 className="text-2xl font-black">{detailColor.nombre}</h3>
                <p className="text-xs font-mono font-bold mt-1 opacity-90">
                  {detailColor.hex.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyHex(detailColor.hex)}
                  className="rounded-xl px-4 py-2 text-xs font-bold bg-white/90 text-slate-900 shadow hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faCopy} />
                  Copiar HEX
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-app-muted block">Fecha de Registro</span>
              <p className="text-xs font-medium text-app-text">
                {detailColor.fechaRegistro || "2026-01-15"}
              </p>
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
