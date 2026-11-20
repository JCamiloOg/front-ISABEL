import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faEye,
  faPenToSquare,
  faRotateLeft,
  faGlobe,
  faBuilding,
  faUserTie,
  faIndustry,
} from "@fortawesome/free-solid-svg-icons";

import { Table, type TableColumn } from "../../../../../shared/components/Table";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";

import type { SupplierCategory, Supplier } from "../types";

interface SuppliersTableProps {
  suppliers: Supplier[];
  categories: SupplierCategory[];
  onViewDetails: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onToggleStatus?: (supplier: Supplier) => void;
}

export function SuppliersTable({
  suppliers: proveedores,
  categories: categorias,
  onViewDetails: onVerDetalle,
  onEdit: onEditar,
}: SuppliersTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("all");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const [filtroOrigen, setFiltroOrigen] = useState<string>("all");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "businessName",
    direction: "asc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtrado
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((p) => {
      // Filtro tipo
      if (filtroTipo !== "all" && p.supplierType !== filtroTipo) return false;

      // Filtro origen (nacional vs importado)
      if (filtroOrigen === "nacional" && p.isImported) return false;
      if (filtroOrigen === "importado" && !p.isImported) return false;

      // Filtro estado
      if (filtroEstado !== "all" && p.status !== filtroEstado) return false;

      // Filtro categoría
      if (filtroCategoria !== "all") {
        const idCat = Number(filtroCategoria);

        if (!p.categories.some((c) => c.id === idCat)) return false;
      }

      // Búsqueda por Razón Social o Número de Documento
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        p.businessName.toLowerCase().includes(q) ||
        p.documentNumber.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    });
  }, [proveedores, busqueda, filtroCategoria, filtroTipo, filtroOrigen, filtroEstado]);

  // Ordenación
  const proveedoresOrdenados = useMemo(() => {
    return [...proveedoresFiltrados].sort((a, b) => {
      const { key, direction } = sortConfig;
      let cmp = 0;

      if (key === "businessName") {
        cmp = a.businessName.localeCompare(b.businessName);
      } else if (key === "documentNumber") {
        cmp = a.documentNumber.localeCompare(b.documentNumber);
      } else if (key === "supplierType") {
        cmp = a.supplierType.localeCompare(b.supplierType);
      } else if (key === "status") {
        cmp = a.status.localeCompare(b.status);
      }

      return direction === "asc" ? cmp : -cmp;
    });
  }, [proveedoresFiltrados, sortConfig]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(proveedoresOrdenados.length / filasPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * filasPorPagina;
  const proveedoresPaginados = useMemo(
    () => proveedoresOrdenados.slice(desde, desde + filasPorPagina),
    [proveedoresOrdenados, desde, filasPorPagina],
  );

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    filtroCategoria !== "all" ||
    filtroTipo !== "all" ||
    filtroOrigen !== "all" ||
    filtroEstado !== "all";

  const handleResetFiltros = () => {
    setBusqueda("");
    setFiltroCategoria("all");
    setFiltroTipo("all");
    setFiltroOrigen("all");
    setFiltroEstado("all");
    setPagina(1);
  };

  const columns: TableColumn<Supplier>[] = [
    {
      key: "documentNumber",
      header: "Documento",
      sortable: true,
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
            {p.documentNumber}
          </span>
          <span className="text-[10px] font-semibold text-app-muted uppercase">
            {p.documentType}
          </span>
        </div>
      ),
    },
    {
      key: "businessName",
      header: "Razón Social",
      sortable: true,
      render: (p) => (
        <span className="font-bold text-xs text-app-text">{p.businessName}</span>
      ),
    },
    {
      key: "supplierType",
      header: "Tipo",
      sortable: true,
      render: (p) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
            p.supplierType === "Jurídico"
              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-brand-sky/30 dark:bg-brand-sky/15 dark:text-brand-sky"
              : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300"
          }`}
        >
          <FontAwesomeIcon icon={p.supplierType === "Jurídico" ? faBuilding : faUserTie} className="text-[10px]" />
          {p.supplierType}
        </span>
      ),
    },
    {
      key: "origen",
      header: "Origen",
      render: (p) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
            p.isImported
              ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
          }`}
        >
          {p.isImported ? (
            <>
              <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
              <span>Importado</span>
            </>
          ) : (
            <span>🇨🇴 Nacional</span>
          )}
        </span>
      ),
    },
    {
      key: "categories",
      header: "Categorías",
      render: (p) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {p.categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-block rounded-md border border-brand-sky/30 bg-brand-sky/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-royal dark:text-brand-sky"
            >
              {cat.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "contacto",
      header: "Contacto",
      render: (p) => (
        <div className="flex flex-col text-[11px]">

          <span className="font-semibold text-app-text">{p.phone || "Sin teléfono"}</span>
          <span className="text-app-muted truncate max-w-35" title={p.email}>
            {p.email || "Sin email"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      align: "center",
      render: (p) => {
        const esActivo = p.status === "Activo";
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              esActivo
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <span className={`size-1.5 rounded-full ${esActivo ? "bg-emerald-500" : "bg-slate-400"}`} />
            {p.status}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      render: (p) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={faEye}
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalle(p);
            }}
            title="Ver Detalle"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={faPenToSquare}
            onClick={(e) => {
              e.stopPropagation();
              onEditar(p);
            }}
            title="Editar Proveedor"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Barra de Búsqueda y Filtros ── */}
      <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
          {/* Búsqueda principal */}
          <div className="sm:col-span-12 lg:col-span-4">
            <Input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por razón social, documento, email..."
              iconLeft={faMagnifyingGlass}
            />
          </div>

          {/* Filtro Categoría */}
          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setPagina(1);
              }}
              options={[
                { value: "all", label: "Todas las Categorías" },
                ...categorias.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
            />
          </div>

          {/* Filtro Tipo de Proveedor */}
          <div className="sm:col-span-6 lg:col-span-2">
            <Select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPagina(1);
              }}
              options={[
                { value: "all", label: "Todos los Tipos" },
                { value: "Jurídico", label: "Jurídico" },
                { value: "Natural", label: "Natural" },
              ]}
            />
          </div>

          {/* Filtro Origen (Nacional / Importado) */}
          <div className="sm:col-span-6 lg:col-span-3">
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filtroOrigen}
                onChange={(e) => {
                  setFiltroOrigen(e.target.value);
                  setPagina(1);
                }}
                options={[
                  { value: "all", label: "Origen: Todos" },
                  { value: "nacional", label: "Nacional" },
                  { value: "importado", label: "Importado" },
                ]}
              />

              <Select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setPagina(1);
                }}
                options={[
                  { value: "all", label: "Estado: Todos" },
                  { value: "Activo", label: "Activos" },
                  { value: "Inactivo", label: "Inactivos" },
                ]}
              />
            </div>
          </div>
        </div>

        {hayFiltrosActivos && (
          <div className="mt-3 pt-3 border-t border-brand-sky/15 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores registrados
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faRotateLeft}
              onClick={handleResetFiltros}
            >
              Restablecer filtros
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabla Principal ── */}
      <Table<Supplier>
        columns={columns}
        data={proveedoresPaginados}
        rowKey="id"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={(p) => onVerDetalle(p)}
        emptyTitle="No se encontraron proveedores"
        emptyDescription="Prueba con otros términos de búsqueda o registra un nuevo proveedor en el sistema."
        emptyState={
          <div className="py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky mb-3">
              <FontAwesomeIcon icon={faIndustry} className="text-xl" />
            </div>
            <p className="text-sm font-bold text-app-text">Sin proveedores para mostrar</p>
            <p className="mt-1 text-xs text-app-muted">
              Usa el botón "Registrar Proveedor" para crear el primero.
            </p>
          </div>
        }
        pagination={{
          currentPage: paginaActual,
          totalPages: totalPaginas,
          totalItems: proveedoresFiltrados.length,
          itemsPerPage: filasPorPagina,
          onPageChange: (p) => setPagina(p),
          onItemsPerPageChange: (size) => {
            setFilasPorPagina(size);
            setPagina(1);
          },
          pageSizeOptions: [5, 8, 12, 20],
        }}
      />
    </div>
  );
}

export default SuppliersTable;

