import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
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

export interface MarcaItem {
  idMarca: number;
  nombre: string;
  estado: Estado;
  fechaRegistro: string;
}

// Catálogo maestro con IDs consecutivos (1, 2, 3...) según la base de datos marcas
const INITIAL_MARCAS: MarcaItem[] = [
  {
    idMarca: 1,
    nombre: "Nike",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idMarca: 2,
    nombre: "Adidas",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idMarca: 3,
    nombre: "Vans",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idMarca: 4,
    nombre: "Puma",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idMarca: 5,
    nombre: "Converse",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idMarca: 6,
    nombre: "New Balance",
    estado: "Activo",
    fechaRegistro: "2026-01-25",
  },
  {
    idMarca: 7,
    nombre: "Reebok",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idMarca: 8,
    nombre: "Jordan",
    estado: "Activo",
    fechaRegistro: "2026-02-05",
  },
  {
    idMarca: 9,
    nombre: "Fila",
    estado: "Inactivo",
    fechaRegistro: "2026-02-10",
  },
];

export default function MarcaProducts() {
  const [marcas, setMarcas] = useState<MarcaItem[]>(INITIAL_MARCAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "idMarca",
    direction: "asc",
  });

  // Modal Crear / Editar (solo nombre)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaItem | null>(null);
  const [formNombre, setFormNombre] = useState("");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailMarca, setDetailMarca] = useState<MarcaItem | null>(null);

  // Próximo ID consecutivo (1, 2, 3...)
  const nextId = useMemo(() => {
    return marcas.length > 0
      ? Math.max(...marcas.map((m) => m.idMarca)) + 1
      : 1;
  }, [marcas]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = marcas.length;
    const activas = marcas.filter((m) => m.estado === "Activo").length;
    const inactivas = total - activas;

    return { total, activas, inactivas };
  }, [marcas]);

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

  // Filtrado y ordenamiento de marcas
  const filteredMarcas = useMemo(() => {
    return marcas
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          m.idMarca.toString().includes(q) ||
          m.nombre.toLowerCase().includes(q);

        const matchesEstado = filterEstado === "all" || m.estado === filterEstado;

        return matchesQuery && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "idMarca") {
          return (a.idMarca - b.idMarca) * factor;
        }
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        return 0;
      });
  }, [marcas, searchQuery, filterEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredMarcas.length / itemsPerPage) || 1;
  const paginatedMarcas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMarcas.slice(start, start + itemsPerPage);
  }, [filteredMarcas, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setSortConfig({ key: "idMarca", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado de la marca
  const handleToggleEstado = (marca: MarcaItem) => {
    const nextEstado: Estado = marca.estado === "Activo" ? "Inactivo" : "Activo";
    setMarcas((prev) =>
      prev.map((m) =>
        m.idMarca === marca.idMarca ? { ...m, estado: nextEstado } : m
      )
    );
    if (detailMarca && detailMarca.idMarca === marca.idMarca) {
      setDetailMarca({ ...detailMarca, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Marca #${marca.idMarca} "${marca.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingMarca(null);
    setFormNombre("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (marca: MarcaItem) => {
    setEditingMarca(marca);
    setFormNombre(marca.nombre);
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (marca: MarcaItem) => {
    setDetailMarca(marca);
    setIsDetailOpen(true);
  };

  // Guardar Marca (Crear o Editar)
  const handleSaveMarca = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre de la marca",
      });
      return;
    }

    if (editingMarca) {
      setMarcas((prev) =>
        prev.map((m) =>
          m.idMarca === editingMarca.idMarca
            ? {
                ...m,
                nombre: formNombre.trim(),
              }
            : m
        )
      );
      Toast.fire({
        icon: "success",
        title: `Marca #${editingMarca.idMarca} actualizada correctamente`,
      });
    } else {
      // Validar duplicado por nombre de marca
      const exists = marcas.some(
        (m) => m.nombre.toLowerCase() === formNombre.trim().toLowerCase()
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe la marca "${formNombre}" en el catálogo`,
        });
        return;
      }

      const newMarca: MarcaItem = {
        idMarca: nextId,
        nombre: formNombre.trim(),
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setMarcas((prev) => [newMarca, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Marca #${nextId} "${formNombre}" registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table
  const tableColumns: TableColumn<MarcaItem>[] = [
    {
      key: "idMarca",
      header: "# ID",
      width: "80px",
      sortable: true,
      render: (marca) => (
        <span className="font-mono text-xs font-bold text-app-muted">
          #{marca.idMarca}
        </span>
      ),
    },
    {
      key: "nombre",
      header: "Marca / Fabricante",
      sortable: true,
      render: (marca) => (
        <div className="flex items-center gap-3.5 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky border border-brand-royal/20 dark:border-brand-sky/20">
            <FontAwesomeIcon icon={faAward} className="text-sm" />
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(marca)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver detalle de la marca ${marca.nombre}`}
            >
              {marca.nombre}
            </p>
            <span className="text-xs text-app-muted">Marca oficial de calzado</span>
          </div>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (marca) => (
        <div className="flex items-center justify-center">
          <Switcher
            checked={marca.estado === "Activo"}
            onChange={() => handleToggleEstado(marca)}
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
      render: (marca) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(marca)}
            title="Ver detalles de la marca"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(marca)}
            title="Editar nombre de la marca"
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
              <FontAwesomeIcon icon={faAward} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Marcas
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo maestro de marcas de calzado (Nike, Adidas, Vans, Puma, Converse, etc.)
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
            Nueva Marca
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Marcas en Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faAward} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">marcas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} activas para calzados
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Marcas Activas</p>
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
            <p className="text-xs font-semibold text-app-muted">Marcas Inactivas</p>
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
          <p className="mt-1 text-xs text-app-muted">Ocultas para nuevos productos</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-marcas"
              type="search"
              placeholder="Buscar marca por ID o nombre (ej. Nike, Adidas)..."
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
              id="filter-marca-estado"
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
            Mostrando <strong>{filteredMarcas.length}</strong> de{" "}
            <strong>{marcas.length}</strong> marcas registradas
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

      {/* Tabla Global de Marcas */}
      <Table<MarcaItem>
        columns={tableColumns}
        data={paginatedMarcas}
        rowKey="idMarca"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredMarcas.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron marcas"
        emptyDescription="Prueba modificando la búsqueda o los filtros de estado."
      />

      {/* MODAL CREAR / EDITAR MARCA (SOLO NOMBRE) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMarca ? "Editar Marca" : "Registrar Nueva Marca"}
        description={
          editingMarca
            ? `Modificando registro #${editingMarca.idMarca}`
            : `Nueva marca con identificador consecutivo #${nextId}`
        }
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveMarca}>
              {editingMarca ? "Guardar Cambios" : "Crear Marca"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveMarca} className="space-y-4">
          {/* Identificador asignado (1, 2, 3...) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-app-surface-alt border border-app-border text-xs">
            <span className="text-app-muted font-medium">ID Asignado:</span>
            <span className="font-mono font-bold text-brand-royal dark:text-brand-sky text-sm">
              #{editingMarca ? editingMarca.idMarca : nextId}
            </span>
          </div>

          <Input
            id="form-marca-nombre"
            label="Nombre de la Marca"
            placeholder="Ej. Nike, Adidas, Puma, Vans, New Balance"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
            helper="Nombre oficial que identificará los modelos de calzado (máx. 80 caracteres)"
          />
        </form>
      </Modal>

      {/* MODAL DETALLE DE MARCA */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailMarca?.nombre || "Detalle de Marca"}
        description={`ID #${detailMarca?.idMarca} · Fabricante de calzado`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailMarca?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailMarca && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailMarca);
                  }}
                >
                  Editar Marca
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailMarca && (
          <div className="space-y-5">
            {/* Banner de información de la marca */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faAward} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailMarca.nombre}</h3>
                  <p className="text-xs text-app-muted mt-0.5">
                    Identificador: #{detailMarca.idMarca}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Estado:</span>
                <Switcher
                  checked={detailMarca.estado === "Activo"}
                  onChange={() => handleToggleEstado(detailMarca)}
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 flex items-center justify-between text-xs text-app-muted">
              <span>Fecha de Registro:</span>
              <span className="font-semibold text-app-text">{detailMarca.fechaRegistro}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
