import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { Switcher } from "../../components/Switcher";
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
  estado: Estado;
  fechaRegistro: string;
}

// Catálogo inicial con IDs consecutivos (1, 2, 3...) según la base de datos categorias_proveedor
const INITIAL_CATEGORIAS_PROVEEDOR: CategoriaProveedorItem[] = [
  {
    idCategoria: 1,
    nombre: "Proveedores Calzado Deportivo Triple AAA",
    descripcion: "Mayoristas especializados en zapatillas deportivas de alto impacto, réplicas G5 y modelos de entrenamiento",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idCategoria: 2,
    nombre: "Fabricantes Nacionales en Cuero Genuino",
    descripcion: "Talleres colombianos y artesanos de calzado formal, botines y mocasines con suela de vaqueta y cuero vacuno",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idCategoria: 3,
    nombre: "Distribuidores Oficiales Importado Original",
    descripcion: "Casas matrices y distribuidores con licencia directa de marcas internacionales de calzado original",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idCategoria: 4,
    nombre: "Insumos, Suelas y Sintéticos Especiales",
    descripcion: "Proveedores industriales de suelas de caucho, TR, poliuretano, plantillas y materiales sintéticos de armado",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idCategoria: 5,
    nombre: "Calzado Casual y Urbano Premium 1.1",
    descripcion: "Proveedores de calzado para uso diario con acabados de precisión y excelente relación costo-beneficio",
    estado: "Activo",
    fechaRegistro: "2026-01-22",
  },
  {
    idCategoria: 6,
    nombre: "Líneas Económicas y Maquila Masiva",
    descripcion: "Fabricantes por volumen orientados a calzado accesible, remates y promociones de temporada",
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

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "idCategoria",
    direction: "asc",
  });

  // Modal Crear / Editar (solo nombre y descripción)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaProveedorItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");

  // Modal Consultar Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCategoria, setDetailCategoria] = useState<CategoriaProveedorItem | null>(null);

  // Próximo ID consecutivo (1, 2, 3...)
  const nextId = useMemo(() => {
    return categorias.length > 0
      ? Math.max(...categorias.map((c) => c.idCategoria)) + 1
      : 1;
  }, [categorias]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = categorias.length;
    const activas = categorias.filter((c) => c.estado === "Activo").length;
    const inactivas = total - activas;

    return { total, activas, inactivas };
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
          c.idCategoria.toString().includes(q) ||
          c.nombre.toLowerCase().includes(q) ||
          c.descripcion.toLowerCase().includes(q);

        const matchesEstado = filterEstado === "all" || c.estado === filterEstado;

        return matchesQuery && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "idCategoria") {
          return (a.idCategoria - b.idCategoria) * factor;
        }
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        return 0;
      });
  }, [categorias, searchQuery, filterEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage) || 1;
  const paginatedCategorias = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategorias.slice(start, start + itemsPerPage);
  }, [filteredCategorias, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setSortConfig({ key: "idCategoria", direction: "asc" });
    setCurrentPage(1);
  };

  // Cambiar el estado de la categoría con Switcher
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
      title: `Categoría #${categoria.idCategoria} "${categoria.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Registro (Crear)
  const handleOpenCreateModal = () => {
    setEditingCategoria(null);
    setFormNombre("");
    setFormDescripcion("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Actualizar (Editar)
  const handleOpenEditModal = (categoria: CategoriaProveedorItem) => {
    setEditingCategoria(categoria);
    setFormNombre(categoria.nombre);
    setFormDescripcion(categoria.descripcion);
    setIsFormOpen(true);
  };

  // Abrir Modal de Consulta (Detalle)
  const openDetail = (categoria: CategoriaProveedorItem) => {
    setDetailCategoria(categoria);
    setIsDetailOpen(true);
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

    if (!formDescripcion.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa la descripción de la categoría",
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
                descripcion: formDescripcion.trim(),
              }
            : c
        )
      );
      Toast.fire({
        icon: "success",
        title: `Categoría #${editingCategoria.idCategoria} actualizada correctamente`,
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

      const newCat: CategoriaProveedorItem = {
        idCategoria: nextId,
        nombre: formNombre.trim(),
        descripcion: formDescripcion.trim(),
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setCategorias((prev) => [newCat, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Categoría #${nextId} "${formNombre}" registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla: solo ID, Nombre, Descripción, Estado y Acciones
  const tableColumns: TableColumn<CategoriaProveedorItem>[] = [
    {
      key: "idCategoria",
      header: "# ID",
      width: "80px",
      sortable: true,
      render: (categoria) => (
        <span className="font-mono text-xs font-bold text-app-muted">
          #{categoria.idCategoria}
        </span>
      ),
    },
    {
      key: "nombre",
      header: "Nombre de Categoría",
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
            <span className="text-xs text-app-muted">Categoría de proveedor</span>
          </div>
        </div>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (categoria) => (
        <p className="text-xs text-app-muted line-clamp-2 max-w-md">
          {categoria.descripcion}
        </p>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (categoria) => (
        <div className="flex items-center justify-center">
          <Switcher
            checked={categoria.estado === "Activo"}
            onChange={() => handleToggleEstado(categoria)}
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
      render: (categoria) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(categoria)}
            title="Consultar detalle de la categoría"
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
                Clasificación de proveedores según el tipo de producto y alcance comercial
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            Habilitadas en compras
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Categorías Inactivas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.inactivas}
            </span>
            <span className="text-xs text-app-muted">pausadas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Ocultas para nuevos proveedores</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-categorias-prov"
              type="search"
              placeholder="Buscar por ID, nombre o descripción..."
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
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredCategorias.length}</strong> de{" "}
            <strong>{categorias.length}</strong> categorías registradas
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
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron categorías de proveedor"
        emptyDescription="Prueba modificando la búsqueda o el filtro de estado."
      />

      {/* MODAL REGISTRAR / ACTUALIZAR CATEGORÍA (SOLO NOMBRE Y DESCRIPCIÓN) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategoria ? "Actualizar Categoría" : "Registrar Categoría"}
        description={
          editingCategoria
            ? `Modificando registro #${editingCategoria.idCategoria}`
            : `Nueva categoría con identificador consecutivo #${nextId}`
        }
        size="md"
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
          {/* Identificador asignado (1, 2, 3...) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-app-surface-alt border border-app-border text-xs">
            <span className="text-app-muted font-medium">ID Asignado:</span>
            <span className="font-mono font-bold text-brand-royal dark:text-brand-sky text-sm">
              #{editingCategoria ? editingCategoria.idCategoria : nextId}
            </span>
          </div>

          <div className="space-y-4">
            <Input
              id="form-cat-nombre"
              label="Nombre de la Categoría"
              placeholder="Ej. Proveedores Deportivo Triple AAA"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
              helper="Nombre de la categoría de proveedor (máx. 80 caracteres)"
            />

            <Input
              id="form-cat-desc"
              label="Descripción"
              placeholder="Ej. Mayoristas y fabricantes especializados en calzado deportivo"
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
              required
              helper="Descripción del alcance de suministro (máx. 255 caracteres)"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL CONSULTAR DETALLE */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailCategoria?.nombre || "Consulta de Categoría"}
        description={`ID #${detailCategoria?.idCategoria} · Categoría de Proveedores`}
        size="md"
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
          <div className="space-y-5">
            {/* Banner de información general */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faTags} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailCategoria.nombre}</h3>
                  <p className="text-xs text-app-muted mt-0.5">
                    Identificador: #{detailCategoria.idCategoria}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Estado:</span>
                <Switcher
                  checked={detailCategoria.estado === "Activo"}
                  onChange={() => handleToggleEstado(detailCategoria)}
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-app-border bg-app-surface p-4 space-y-1.5">
              <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                Descripción
              </span>
              <p className="text-sm font-medium text-app-text">
                {detailCategoria.descripcion}
              </p>
            </div>

            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 flex items-center justify-between text-xs text-app-muted">
              <span>Fecha de Registro:</span>
              <span className="font-semibold text-app-text">{detailCategoria.fechaRegistro}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
