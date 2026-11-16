import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
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
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface CategoriaItem {
  idCategoria: number;
  nombre: string;
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

// Catálogo inicial de categorías de calzado del ERP
const INITIAL_CATEGORIAS: CategoriaItem[] = [
  {
    idCategoria: 1,
    nombre: "Deportivo",
    descripcion: "Calzado de alto rendimiento para running, fútbol, training y fitness",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idCategoria: 2,
    nombre: "Casual",
    descripcion: "Zapatos y zapatillas cómodas para el uso diario y actividades informales",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idCategoria: 3,
    nombre: "Urbano / Skate",
    descripcion: "Zapatillas de suela plana y resistencia para skateboarding y moda streetwear",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idCategoria: 4,
    nombre: "Formal",
    descripcion: "Calzado elegante de vestir, mocasines y zapatos de cuero para eventos y oficina",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idCategoria: 5,
    nombre: "Botas y Botines",
    descripcion: "Calzado de caña media y alta resistente a terrenos difíciles, lluvia y montaña",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idCategoria: 6,
    nombre: "Sandalias y Confort",
    descripcion: "Calzado ergonómico abierto para climas cálidos y descanso en el hogar",
    estado: "Inactivo",
    fechaRegistro: "2026-02-05",
  },
];

export default function CategoriaProduct() {
  const [categorias, setCategorias] = useState<CategoriaItem[]>(INITIAL_CATEGORIAS);
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
  const [editingCategoria, setEditingCategoria] = useState<CategoriaItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formEstado, setFormEstado] = useState<Estado>("Activo");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCategoria, setDetailCategoria] = useState<CategoriaItem | null>(null);

  // Obtener calzados asociados a la categoría desde el mock de productos
  const getShoesForCategoria = (idCategoria: number) => {
    return MOCK_PRODUCTOS_PRISMA.filter(
      (p) => p.idCategoriaProducto === idCategoria
    );
  };

  // Calcular stock total disponible en inventario para una categoría
  const getTotalStockForCategoria = (idCategoria: number) => {
    let stock = 0;
    const shoes = getShoesForCategoria(idCategoria);
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
    const total = categorias.length;
    const activas = categorias.filter((c) => c.estado === "Activo").length;
    const inactivas = total - activas;

    let totalModelosClasificados = 0;
    categorias.forEach((c) => {
      totalModelosClasificados += getShoesForCategoria(c.idCategoria).length;
    });

    return { total, activas, inactivas, totalModelosClasificados };
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

  // Filtrado y ordenamiento de categorías
  const filteredCategorias = useMemo(() => {
    return categorias
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q) ||
          c.idCategoria.toString().includes(q);

        const matchesEstado = filterEstado === "all" || c.estado === filterEstado;

        const shoesCount = getShoesForCategoria(c.idCategoria).length;
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
        if (sortConfig.key === "asociados") {
          const countA = getShoesForCategoria(a.idCategoria).length;
          const countB = getShoesForCategoria(b.idCategoria).length;
          return (countA - countB) * factor;
        }
        if (sortConfig.key === "stock") {
          const stockA = getTotalStockForCategoria(a.idCategoria);
          const stockB = getTotalStockForCategoria(b.idCategoria);
          return (stockA - stockB) * factor;
        }
        return 0;
      });
  }, [categorias, searchQuery, filterEstado, filterAsociados, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage) || 1;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategorias.slice(start, start + itemsPerPage);
  }, [filteredCategorias, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterAsociados("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado de la categoría
  const handleToggleEstado = (categoria: CategoriaItem) => {
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

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingCategoria(null);
    setFormNombre("");
    setFormDescripcion("");
    setFormEstado("Activo");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (categoria: CategoriaItem) => {
    setEditingCategoria(categoria);
    setFormNombre(categoria.nombre);
    setFormDescripcion(categoria.descripcion);
    setFormEstado(categoria.estado);
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (categoria: CategoriaItem) => {
    setDetailCategoria(categoria);
    setIsDetailOpen(true);
  };

  // Guardar Categoría (Crear o Editar)
  const handleSaveCategoria = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre de la categoría",
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
        categorias.length > 0 ? Math.max(...categorias.map((c) => c.idCategoria)) + 1 : 1;

      const newCategoria: CategoriaItem = {
        idCategoria: newId,
        nombre: formNombre.trim(),
        descripcion:
          formDescripcion.trim() ||
          `Categoría comercial de calzado ${formNombre.trim()}`,
        estado: formEstado,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setCategorias((prev) => [newCategoria, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Categoría "${formNombre}" creada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table (SIN botones de eliminación)
  const tableColumns: TableColumn<CategoriaItem>[] = [
    {
      key: "nombre",
      header: "Categoría de Calzado",
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
              title={`Ver calzados en categoría ${categoria.nombre}`}
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
      key: "asociados",
      header: "Modelos Asociados",
      sortable: true,
      align: "center",
      render: (categoria) => {
        const shoes = getShoesForCategoria(categoria.idCategoria);
        return (
          <button
            type="button"
            onClick={() => openDetail(categoria)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              shoes.length > 0
                ? "bg-brand-royal/10 text-brand-royal border-brand-royal/20 dark:bg-brand-sky/15 dark:text-brand-sky dark:border-brand-sky/20 hover:bg-brand-royal/20"
                : "bg-app-surface-alt text-app-muted border-app-border"
            }`}
            title="Ver calzados pertenecientes a esta categoría"
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
      render: (categoria) => {
        const stock = getTotalStockForCategoria(categoria.idCategoria);
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
            title="Ver detalles de la categoría y modelos vinculados"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(categoria)}
            title="Editar nombre y descripción de la categoría"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Acción de eliminación bloqueada intencionalmente */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: la categoría tiene modelos de calzado y existencias asociadas"
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
              <FontAwesomeIcon icon={faLayerGroup} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Categorías de Calzado
              </h1>
              <p className="text-sm text-app-muted">
                Clasificación comercial y funcional de productos (Deportivo, Casual, Urbano, Formal, etc.)
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
            <p className="text-xs font-semibold text-app-muted">Categorías Registradas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">líneas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} activas en tienda
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
            <span className="text-xs text-app-muted">disponibles</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Listas para asignar productos
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
          <p className="mt-1 text-xs text-app-muted">Organizados en catálogo</p>
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
            Categorías no eliminables
          </p>
        </div>
      </div>

      {/* Banner de protección contra eliminación */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <p>
          <strong>Protección de catálogo:</strong> Las categorías de calzado no pueden ser eliminadas debido a que agrupan modelos de productos, ventas y existencias en inventario. Si no deseas utilizar una categoría temporalmente, cámbiala a estado <strong>Inactivo</strong>.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-categorias"
              type="search"
              placeholder="Buscar categoría por nombre o descripción (ej. Deportivo, Casual)..."
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
              id="filter-categoria-estado"
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
              id="filter-categoria-asociados"
              value={filterAsociados}
              onChange={(e) => {
                setFilterAsociados(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Calzados: Todos" },
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
            Mostrando <strong>{filteredCategorias.length}</strong> de{" "}
            <strong>{categorias.length}</strong> categorías registradas
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

      {/* Tabla Global de Categorías */}
      <Table<CategoriaItem>
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
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron categorías"
        emptyDescription="Prueba modificando los términos de búsqueda o los filtros."
      />

      {/* MODAL CREAR / EDITAR CATEGORÍA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategoria ? "Editar Categoría de Calzado" : "Registrar Nueva Categoría"}
        description="Ingresa el nombre comercial y descripción para clasificar los calzados"
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCategoria}>
              {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategoria} className="space-y-4">
          <Input
            id="form-cat-nombre"
            label="Nombre de la Categoría"
            placeholder="Ej. Deportivo, Casual, Urbano / Skate, Formal"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
            helper="Nombre visible en la tienda online y en el filtro de inventario"
          />

          <Select
            id="form-cat-estado"
            label="Estado Inicial"
            value={formEstado}
            onChange={(e) => setFormEstado(e.target.value as Estado)}
            options={[
              { value: "Activo", label: "Activo (Disponible para clasificar productos)" },
              { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
            ]}
          />

          <Input
            id="form-cat-descripcion"
            label="Descripción / Uso Comercial"
            placeholder="Ej. Calzado orientado para actividades deportivas, running y entrenamiento"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
            helper="Breve explicación de las características de este tipo de calzado"
          />

          <div className="rounded-xl border border-app-border bg-app-surface-alt p-3 text-xs text-app-muted flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-brand-royal dark:text-brand-sky mt-0.5" />
            <span>
              <strong>Integridad protegida:</strong> Al registrarse, esta categoría estará disponible para asociar productos y no podrá ser eliminada para garantizar la coherencia del historial de inventario.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE CATEGORÍA Y CALZADOS ASOCIADOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailCategoria?.nombre || "Detalle de Categoría"}
        description={`ID #${detailCategoria?.idCategoria} · Categoría de calzado`}
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
                  Editar Categoría
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailCategoria && (
          <div className="space-y-6">
            {/* Banner de información de la categoría */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faLayerGroup} />
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

            {/* Métricas de inventario de la categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Modelos de Calzado Vinculados
                </span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {getShoesForCategoria(detailCategoria.idCategoria).length}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Pares Totales en Almacén
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {getTotalStockForCategoria(detailCategoria.idCategoria)} pares
                </span>
              </div>
            </div>

            {/* Listado de Calzados pertenecientes a esta categoría */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
                  Calzados en esta Categoría ({getShoesForCategoria(detailCategoria.idCategoria).length})
                </h4>
                <span className="text-xs text-app-muted font-semibold">
                  Catálogo ERP
                </span>
              </div>

              {getShoesForCategoria(detailCategoria.idCategoria).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getShoesForCategoria(detailCategoria.idCategoria).map((prod) => {
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
                              {prod.sku} · {MARCAS_MAP[prod.idMarca] || "Marca"}
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
                  <FontAwesomeIcon icon={faLayerGroup} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Actualmente no hay modelos de calzado asignados a esta categoría.
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
