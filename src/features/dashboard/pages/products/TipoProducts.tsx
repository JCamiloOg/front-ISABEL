import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCertificate,
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

export interface TipoItem {
  idTipoZapato: number;
  nombre: string;
  estado: Estado;
  fechaRegistro: string;
}

// Catálogo inicial con IDs consecutivos (1, 2, 3...) según la base de datos tipo_zapato
const INITIAL_TIPOS: TipoItem[] = [
  {
    idTipoZapato: 1,
    nombre: "Triple AAA",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTipoZapato: 2,
    nombre: "Importado",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTipoZapato: 3,
    nombre: "Nacional",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idTipoZapato: 4,
    nombre: "Calidad 1.1",
    estado: "Activo",
    fechaRegistro: "2026-01-20",
  },
  {
    idTipoZapato: 5,
    nombre: "Cuero Genuino",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idTipoZapato: 6,
    nombre: "Económico / Promocional",
    estado: "Inactivo",
    fechaRegistro: "2026-02-10",
  },
];

export default function TipoProducts() {
  const [tipos, setTipos] = useState<TipoItem[]>(INITIAL_TIPOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "idTipoZapato",
    direction: "asc",
  });

  // Modal Crear / Editar (solo nombre)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoItem | null>(null);
  const [formNombre, setFormNombre] = useState("");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTipo, setDetailTipo] = useState<TipoItem | null>(null);

  // Próximo ID consecutivo (1, 2, 3...)
  const nextId = useMemo(() => {
    return tipos.length > 0
      ? Math.max(...tipos.map((t) => t.idTipoZapato)) + 1
      : 1;
  }, [tipos]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = tipos.length;
    const activos = tipos.filter((t) => t.estado === "Activo").length;
    const inactivos = total - activos;

    return { total, activos, inactivos };
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
          t.idTipoZapato.toString().includes(q) ||
          t.nombre.toLowerCase().includes(q);

        const matchesEstado = filterEstado === "all" || t.estado === filterEstado;

        return matchesQuery && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "idTipoZapato") {
          return (a.idTipoZapato - b.idTipoZapato) * factor;
        }
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        return 0;
      });
  }, [tipos, searchQuery, filterEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage) || 1;
  const paginatedTipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTipos.slice(start, start + itemsPerPage);
  }, [filteredTipos, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setSortConfig({ key: "idTipoZapato", direction: "asc" });
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
      title: `Tipo #${tipo.idTipoZapato} "${tipo.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingTipo(null);
    setFormNombre("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (tipo: TipoItem) => {
    setEditingTipo(tipo);
    setFormNombre(tipo.nombre);
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
        title: "Ingresa el nombre del tipo de zapato",
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
              }
            : t
        )
      );
      Toast.fire({
        icon: "success",
        title: `Tipo #${editingTipo.idTipoZapato} actualizado correctamente`,
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

      const newTipo: TipoItem = {
        idTipoZapato: nextId,
        nombre: formNombre.trim(),
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setTipos((prev) => [newTipo, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Tipo #${nextId} "${formNombre}" registrado con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table (sin botón bloqueado)
  const tableColumns: TableColumn<TipoItem>[] = [
    {
      key: "idTipoZapato",
      header: "# ID",
      width: "80px",
      sortable: true,
      render: (tipo) => (
        <span className="font-mono text-xs font-bold text-app-muted">
          #{tipo.idTipoZapato}
        </span>
      ),
    },
    {
      key: "nombre",
      header: "Tipo de Zapato",
      sortable: true,
      render: (tipo) => (
        <div className="flex items-center gap-3.5 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky border border-brand-royal/20 dark:border-brand-sky/20">
            <FontAwesomeIcon icon={faCertificate} className="text-sm" />
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(tipo)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver detalle del tipo ${tipo.nombre}`}
            >
              {tipo.nombre}
            </p>
            <span className="text-xs text-app-muted">Calidad de calzado</span>
          </div>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (tipo) => (
        <div className="flex items-center justify-center">
          <Switcher
            checked={tipo.estado === "Activo"}
            onChange={() => handleToggleEstado(tipo)}
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
      render: (tipo) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(tipo)}
            title="Ver detalles del tipo"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(tipo)}
            title="Editar tipo de zapato"
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
              <FontAwesomeIcon icon={faCertificate} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Tipos de Calzado
              </h1>
              <p className="text-sm text-app-muted">
                Clasificación de calzados según su tipo y estándar de calidad (Triple AAA, Importado, Nacional, etc.)
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            Listos para clasificar zapatos
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tipos Inactivos</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.inactivos}
            </span>
            <span className="text-xs text-app-muted">pausados</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Ocultos para nuevos productos</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-tipos"
              type="search"
              placeholder="Buscar por ID o nombre (ej. Triple AAA, Nacional)..."
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
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredTipos.length}</strong> de{" "}
            <strong>{tipos.length}</strong> tipos registrados
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

      {/* MODAL CREAR / EDITAR TIPO (SOLO NOMBRE) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTipo ? "Editar Tipo de Zapato" : "Registrar Nuevo Tipo de Zapato"}
        description={
          editingTipo
            ? `Modificando registro #${editingTipo.idTipoZapato}`
            : `Nuevo tipo con identificador consecutivo #${nextId}`
        }
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
          {/* Identificador asignado (1, 2, 3...) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-app-surface-alt border border-app-border text-xs">
            <span className="text-app-muted font-medium">ID Asignado:</span>
            <span className="font-mono font-bold text-brand-royal dark:text-brand-sky text-sm">
              #{editingTipo ? editingTipo.idTipoZapato : nextId}
            </span>
          </div>

          <Input
            id="form-tipo-nombre"
            label="Nombre del Tipo de Zapato"
            placeholder="Ej. Triple AAA, Importado, Nacional"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
            helper="Nombre de la clasificación de calzado (máx. 100 caracteres)"
          />
        </form>
      </Modal>

      {/* MODAL DETALLE DE TIPO */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailTipo?.nombre || "Detalle de Tipo de Calzado"}
        description={`ID #${detailTipo?.idTipoZapato} · Clasificación de calzado`}
        size="md"
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
          <div className="space-y-5">
            {/* Banner de información */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faCertificate} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailTipo.nombre}</h3>
                  <p className="text-xs text-app-muted mt-0.5">
                    Identificador: #{detailTipo.idTipoZapato}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Estado:</span>
                <Switcher
                  checked={detailTipo.estado === "Activo"}
                  onChange={() => handleToggleEstado(detailTipo)}
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 flex items-center justify-between text-xs text-app-muted">
              <span>Fecha de Registro:</span>
              <span className="font-semibold text-app-text">{detailTipo.fechaRegistro}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
