import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRulerCombined,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faGlobe,
  faCircleCheck,
  faMars,
  faVenus,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { Switcher } from "../../components/Switcher";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export type GeneroTalla = "Masculino" | "Femenino";

export interface TallaItem {
  idTalla: number;
  numeroTalla: string;
  genero: GeneroTalla;
  tallaInternacional: string;
  estado: Estado;
  fechaRegistro: string;
}

// Catálogo inicial con IDs consecutivos (1, 2, 3...) según la estructura de base de datos
const INITIAL_TALLAS: TallaItem[] = [
  {
    idTalla: 1,
    numeroTalla: "35",
    genero: "Femenino",
    tallaInternacional: "US 4.5",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTalla: 2,
    numeroTalla: "36",
    genero: "Femenino",
    tallaInternacional: "US 5",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idTalla: 3,
    numeroTalla: "37",
    genero: "Femenino",
    tallaInternacional: "US 6",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idTalla: 4,
    numeroTalla: "38",
    genero: "Femenino",
    tallaInternacional: "US 6.5",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idTalla: 5,
    numeroTalla: "39",
    genero: "Masculino",
    tallaInternacional: "US 7.5",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idTalla: 6,
    numeroTalla: "40",
    genero: "Masculino",
    tallaInternacional: "US 8",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idTalla: 7,
    numeroTalla: "41",
    genero: "Masculino",
    tallaInternacional: "US 8.5",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idTalla: 8,
    numeroTalla: "42",
    genero: "Masculino",
    tallaInternacional: "US 9",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idTalla: 9,
    numeroTalla: "43",
    genero: "Masculino",
    tallaInternacional: "US 10",
    estado: "Activo",
    fechaRegistro: "2026-01-20",
  },
  {
    idTalla: 10,
    numeroTalla: "44",
    genero: "Masculino",
    tallaInternacional: "US 10.5",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idTalla: 11,
    numeroTalla: "45",
    genero: "Masculino",
    tallaInternacional: "US 11.5",
    estado: "Inactivo",
    fechaRegistro: "2026-02-10",
  },
];

// Conversor auxiliar sugerido para talla extranjera (US)
const sugerirTallaExtranjera = (nacional: string): string => {
  const num = parseInt(nacional, 10);
  if (isNaN(num)) return "";
  if (num <= 28) return "US 11C";
  if (num <= 31) return "US 13C";
  if (num <= 34) return "US 2.5Y";
  const us = Math.max(4, (num - 32) * 0.8 + 4).toFixed(1).replace(".0", "");
  return `US ${us}`;
};

export default function TallaProducts() {
  const [tallas, setTallas] = useState<TallaItem[]>(INITIAL_TALLAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterGenero, setFilterGenero] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "idTalla",
    direction: "asc",
  });

  // Modal Crear / Editar Talla
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalla, setEditingTalla] = useState<TallaItem | null>(null);
  const [formNumero, setFormNumero] = useState("");
  const [formGenero, setFormGenero] = useState<GeneroTalla>("Masculino");
  const [formInternacional, setFormInternacional] = useState("");

  // Modal Detalle de Talla
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTalla, setDetailTalla] = useState<TallaItem | null>(null);

  // Próximo ID consecutivo (1, 2, 3...)
  const nextId = useMemo(() => {
    return tallas.length > 0 ? Math.max(...tallas.map((t) => t.idTalla)) + 1 : 1;
  }, [tallas]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = tallas.length;
    const activas = tallas.filter((t) => t.estado === "Activo").length;
    const masculinas = tallas.filter((t) => t.genero === "Masculino").length;
    const femeninas = tallas.filter((t) => t.genero === "Femenino").length;

    return { total, activas, masculinas, femeninas };
  }, [tallas]);

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

  // Filtrado y ordenamiento de tallas
  const filteredTallas = useMemo(() => {
    return tallas
      .filter((t) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          t.idTalla.toString().includes(q) ||
          t.numeroTalla.toLowerCase().includes(q) ||
          t.tallaInternacional.toLowerCase().includes(q) ||
          t.genero.toLowerCase().includes(q);

        const matchesEstado = filterEstado === "all" || t.estado === filterEstado;
        const matchesGenero = filterGenero === "all" || t.genero === filterGenero;

        return matchesQuery && matchesEstado && matchesGenero;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "idTalla") {
          return (a.idTalla - b.idTalla) * factor;
        }
        if (sortConfig.key === "numeroTalla") {
          const numA = parseFloat(a.numeroTalla) || 0;
          const numB = parseFloat(b.numeroTalla) || 0;
          return (numA - numB) * factor;
        }
        if (sortConfig.key === "genero") {
          return a.genero.localeCompare(b.genero) * factor;
        }
        if (sortConfig.key === "tallaInternacional") {
          return a.tallaInternacional.localeCompare(b.tallaInternacional) * factor;
        }
        return 0;
      });
  }, [tallas, searchQuery, filterEstado, filterGenero, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredTallas.length / itemsPerPage) || 1;
  const paginatedTallas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTallas.slice(start, start + itemsPerPage);
  }, [filteredTallas, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterGenero("all");
    setSortConfig({ key: "idTalla", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado de la talla
  const handleToggleEstado = (talla: TallaItem) => {
    const nextEstado: Estado = talla.estado === "Activo" ? "Inactivo" : "Activo";
    setTallas((prev) =>
      prev.map((t) => (t.idTalla === talla.idTalla ? { ...t, estado: nextEstado } : t))
    );
    if (detailTalla && detailTalla.idTalla === talla.idTalla) {
      setDetailTalla({ ...detailTalla, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Talla #${talla.idTalla} (${talla.numeroTalla} - ${talla.genero}): ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingTalla(null);
    setFormNumero("");
    setFormGenero("Masculino");
    setFormInternacional("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (talla: TallaItem) => {
    setEditingTalla(talla);
    setFormNumero(talla.numeroTalla);
    setFormGenero(talla.genero);
    setFormInternacional(talla.tallaInternacional);
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (talla: TallaItem) => {
    setDetailTalla(talla);
    setIsDetailOpen(true);
  };

  // Auto-sugerir talla internacional al escribir la talla nacional
  const handleNumeroChange = (val: string) => {
    setFormNumero(val);
    if (!editingTalla && val.trim()) {
      const sugerencia = sugerirTallaExtranjera(val.trim());
      if (sugerencia) {
        setFormInternacional(sugerencia);
      }
    }
  };

  // Guardar Talla (Crear o Editar)
  const handleSaveTalla = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNumero.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el número de talla",
      });
      return;
    }

    if (!formInternacional.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa la talla internacional",
      });
      return;
    }

    if (editingTalla) {
      setTallas((prev) =>
        prev.map((t) =>
          t.idTalla === editingTalla.idTalla
            ? {
                ...t,
                numeroTalla: formNumero.trim(),
                genero: formGenero,
                tallaInternacional: formInternacional.trim(),
              }
            : t
        )
      );
      Toast.fire({
        icon: "success",
        title: `Talla #${editingTalla.idTalla} actualizada correctamente`,
      });
    } else {
      // Validar duplicado por misma talla y mismo género
      const exists = tallas.some(
        (t) =>
          t.numeroTalla.toLowerCase() === formNumero.trim().toLowerCase() &&
          t.genero === formGenero
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe la talla ${formNumero} para género ${formGenero}`,
        });
        return;
      }

      const newTalla: TallaItem = {
        idTalla: nextId,
        numeroTalla: formNumero.trim(),
        genero: formGenero,
        tallaInternacional: formInternacional.trim(),
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setTallas((prev) => [newTalla, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Talla #${nextId} (${formNumero} - ${formGenero}) registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla
  const tableColumns: TableColumn<TallaItem>[] = [
    {
      key: "idTalla",
      header: "# ID",
      width: "80px",
      sortable: true,
      render: (talla) => (
        <span className="font-mono text-xs font-bold text-app-muted">
          #{talla.idTalla}
        </span>
      ),
    },
    {
      key: "numeroTalla",
      header: "Talla",
      sortable: true,
      render: (talla) => (
        <div className="flex items-center gap-3 py-1">
          <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-black text-sm border border-brand-royal/20 dark:border-brand-sky/20">
            {talla.numeroTalla}
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(talla)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver detalle de talla ${talla.numeroTalla}`}
            >
              Talla {talla.numeroTalla}
            </p>
            <span className="text-xs text-app-muted">Medida estándar</span>
          </div>
        </div>
      ),
    },
    {
      key: "genero",
      header: "Género",
      sortable: true,
      render: (talla) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            talla.genero === "Masculino"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
              : "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300"
          }`}
        >
          <FontAwesomeIcon
            icon={talla.genero === "Masculino" ? faMars : faVenus}
            className="text-[10px]"
          />
          {talla.genero}
        </span>
      ),
    },
    {
      key: "tallaInternacional",
      header: "Talla Internacional",
      sortable: true,
      render: (talla) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-mono font-bold text-app-text border border-app-border w-fit">
          <FontAwesomeIcon icon={faGlobe} className="text-brand-royal dark:text-brand-sky text-[11px]" />
          <span>{talla.tallaInternacional}</span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (talla) => (
        <div className="flex items-center justify-center">
          <Switcher
            checked={talla.estado === "Activo"}
            onChange={() => handleToggleEstado(talla)}
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
      render: (talla) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(talla)}
            title="Ver detalles de la talla"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(talla)}
            title="Editar talla"
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
              <FontAwesomeIcon icon={faRulerCombined} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Tallas
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo de medidas por número de talla, género y talla internacional
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
            Nueva Talla
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Tallas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRulerCombined} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">registros</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} activas en el sistema
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tallas Activas</p>
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
            Disponibles para selección
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tallas Masculino</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FontAwesomeIcon icon={faMars} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.masculinas}
            </span>
            <span className="text-xs text-app-muted">medidas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Línea de calzado masculino</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tallas Femenino</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <FontAwesomeIcon icon={faVenus} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.femeninas}
            </span>
            <span className="text-xs text-app-muted">medidas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Línea de calzado femenino</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              id="search-tallas"
              type="search"
              placeholder="Buscar por ID, talla o internacional..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div>
            <Select
              id="filter-talla-genero"
              value={filterGenero}
              onChange={(e) => {
                setFilterGenero(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Género: Todos" },
                { value: "Masculino", label: "Masculino" },
                { value: "Femenino", label: "Femenino" },
              ]}
              size="sm"
            />
          </div>

          <div>
            <Select
              id="filter-talla-estado"
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
            Mostrando <strong>{filteredTallas.length}</strong> de{" "}
            <strong>{tallas.length}</strong> tallas registradas
          </span>
          {(searchQuery || filterEstado !== "all" || filterGenero !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Tallas */}
      <Table<TallaItem>
        columns={tableColumns}
        data={paginatedTallas}
        rowKey="idTalla"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredTallas.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron tallas"
        emptyDescription="Prueba modificando la búsqueda o los filtros."
      />

      {/* MODAL CREAR / EDITAR TALLA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTalla ? "Editar Talla" : "Registrar Nueva Talla"}
        description={
          editingTalla
            ? `Modificando registro #${editingTalla.idTalla}`
            : `Nueva talla con identificador consecutivo #${nextId}`
        }
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTalla}>
              {editingTalla ? "Guardar Cambios" : "Crear Talla"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTalla} className="space-y-4">
          {/* Identificador asignado (1, 2, 3...) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-app-surface-alt border border-app-border text-xs">
            <span className="text-app-muted font-medium">ID Asignado:</span>
            <span className="font-mono font-bold text-brand-royal dark:text-brand-sky text-sm">
              #{editingTalla ? editingTalla.idTalla : nextId}
            </span>
          </div>

          <div className="space-y-4">
            <Input
              id="form-talla"
              label="Talla (Número)"
              placeholder="Ej. 38, 39, 40"
              value={formNumero}
              onChange={(e) => handleNumeroChange(e.target.value)}
              required
              helper="Número o medida de la talla"
            />

            <Select
              id="form-genero"
              label="Género"
              value={formGenero}
              onChange={(e) => setFormGenero(e.target.value as GeneroTalla)}
              options={[
                { value: "Masculino", label: "Masculino" },
                { value: "Femenino", label: "Femenino" },
              ]}
              required
            />

            <Input
              id="form-talla-internacional"
              label="Talla Internacional"
              placeholder="Ej. US 8, US 8.5"
              value={formInternacional}
              onChange={(e) => setFormInternacional(e.target.value)}
              required
              helper="Equivalencia internacional (ej. US 8, US 8.5)"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE TALLA */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailTalla ? `Talla ${detailTalla.numeroTalla} (${detailTalla.genero})` : "Detalle de Talla"}
        description={`ID #${detailTalla?.idTalla} · Catálogo de Tallas`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailTalla?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailTalla && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailTalla);
                  }}
                >
                  Editar Talla
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailTalla && (
          <div className="space-y-5">
            {/* Tarjetas comparativas de medidas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-brand-royal/30 bg-brand-royal/10 dark:bg-brand-sky/15 dark:border-brand-sky/30 p-3.5 text-center">
                <span className="text-[10px] font-bold text-brand-royal dark:text-brand-sky uppercase tracking-wider block">
                  Talla
                </span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {detailTalla.numeroTalla}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Género
                </span>
                <span className="text-base font-bold text-app-text mt-1.5 flex items-center justify-center gap-1.5">
                  <FontAwesomeIcon
                    icon={detailTalla.genero === "Masculino" ? faMars : faVenus}
                    className={
                      detailTalla.genero === "Masculino"
                        ? "text-blue-500"
                        : "text-pink-500"
                    }
                  />
                  {detailTalla.genero}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Internacional
                </span>
                <span className="text-base font-mono font-bold text-app-text mt-1.5 block">
                  {detailTalla.tallaInternacional}
                </span>
              </div>
            </div>

            {/* Información adicional y estado con Switcher */}
            <div className="rounded-2xl border border-app-border bg-app-surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-app-text">
                  Identificador: #{detailTalla.idTalla}
                </p>
                <p className="text-xs text-app-muted mt-0.5">
                  Registrada el {detailTalla.fechaRegistro}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Estado:</span>
                <Switcher
                  checked={detailTalla.estado === "Activo"}
                  onChange={() => handleToggleEstado(detailTalla)}
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
