import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faEye,
  faHandHoldingDollar,
  faRotateLeft,
  faCalendarDay,
  faCheckCircle,
  faClock,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

import { Table, type TableColumn } from "../../../../../shared/components/Table";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import type { Venta } from "../types";
import { formatCOP, formatDate } from "../utils";

interface TablaVentasProps {
  ventas: Venta[];
  onVerDetalle: (venta: Venta) => void;
  onRegistrarAbono: (venta: Venta) => void;
}

export function TablaVentas({
  ventas,
  onVerDetalle,
  onRegistrarAbono,
}: TablaVentasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "fecha",
    direction: "desc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtrado
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      // Filtro tipo
      if (filtroTipo !== "all" && v.tipoVenta !== filtroTipo) return false;

      // Filtro estado
      if (filtroEstado !== "all" && v.estado !== filtroEstado) return false;

      // Búsqueda textual
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        v.codigoVenta.toLowerCase().includes(q) ||
        v.cliente.nombre.toLowerCase().includes(q) ||
        v.cliente.documento.toLowerCase().includes(q) ||
        v.usuarioResponsable.toLowerCase().includes(q)
      );
    });
  }, [ventas, busqueda, filtroTipo, filtroEstado]);

  // Ordenación
  const ventasOrdenadas = useMemo(() => {
    return [...ventasFiltradas].sort((a, b) => {
      const { key, direction } = sortConfig;
      let cmp = 0;

      if (key === "codigoVenta") {
        cmp = a.codigoVenta.localeCompare(b.codigoVenta);
      } else if (key === "fecha") {
        cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (key === "cliente") {
        cmp = a.cliente.nombre.localeCompare(b.cliente.nombre);
      } else if (key === "total") {
        cmp = a.total - b.total;
      } else if (key === "saldoPendiente") {
        cmp = a.saldoPendiente - b.saldoPendiente;
      }

      return direction === "asc" ? cmp : -cmp;
    });
  }, [ventasFiltradas, sortConfig]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(ventasOrdenadas.length / filasPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * filasPorPagina;
  const ventasPaginadas = useMemo(
    () => ventasOrdenadas.slice(desde, desde + filasPorPagina),
    [ventasOrdenadas, desde, filasPorPagina],
  );

  const columns: TableColumn<Venta>[] = [
    {
      key: "codigoVenta",
      header: "Código / Fecha",
      sortable: true,
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
            {v.codigoVenta}
          </span>
          <span className="text-[11px] text-app-muted flex items-center gap-1 mt-0.5">
            <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
            {formatDate(v.fecha)}
          </span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      sortable: true,
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-bold text-app-text text-xs">{v.cliente.nombre}</span>
          <span className="text-[11px] text-app-muted">
            {v.cliente.tipoDocumento}: {v.cliente.documento}
          </span>
        </div>
      ),
    },
    {
      key: "usuarioResponsable",
      header: "Vendedor",
      render: (v) => (
        <span className="text-xs text-app-muted font-medium">
          {v.usuarioResponsable}
        </span>
      ),
    },
    {
      key: "tipoVenta",
      header: "Modalidad",
      render: (v) => (
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${
            v.tipoVenta === "Contado"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "border-brand-royal/30 bg-brand-royal/10 text-brand-royal dark:border-brand-sky/40 dark:bg-brand-sky/15 dark:text-brand-sky"
          }`}
        >
          {v.tipoVenta}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total / Saldo",
      sortable: true,
      align: "right",
      render: (v) => (
        <div className="flex flex-col items-end">
          <span className="text-xs font-extrabold text-app-text">
            {formatCOP(v.total)}
          </span>
          {v.tipoVenta === "Crédito" && v.saldoPendiente > 0 && (
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              Resta: {formatCOP(v.saldoPendiente)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (v) => {
        let badgeStyle = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
        let icon = faCheckCircle;

        if (v.estado === "Crédito Pendiente") {
          badgeStyle = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
          icon = faClock;
        } else if (v.estado === "Crédito Parcial") {
          badgeStyle = "bg-brand-sky/15 text-brand-royal dark:text-brand-sky border-brand-sky/30";
          icon = faDollarSign;
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeStyle}`}
          >
            <FontAwesomeIcon icon={icon} className="text-[10px]" />
            {v.estado}
          </span>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={faEye}
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalle(v);
            }}
            title="Ver Detalle"
          />
          {v.tipoVenta === "Crédito" && v.saldoPendiente > 0 && (
            <Button
              size="sm"
              variant="outline"
              icon={faHandHoldingDollar}
              onClick={(e) => {
                e.stopPropagation();
                onRegistrarAbono(v);
              }}
              className="text-xs"
            >
              Abonar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Filtros */}
      <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
          <div className="sm:col-span-12 lg:col-span-6">
            <Input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por código de venta, cliente o vendedor..."
              iconLeft={faMagnifyingGlass}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPagina(1);
              }}
              options={[
                { value: "all", label: "Todas las Modalidades" },
                { value: "Contado", label: "Solo Contado" },
                { value: "Crédito", label: "Solo Crédito" },
              ]}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "Pagada", label: "Pagadas" },
                { value: "Crédito Parcial", label: "Crédito Parcial" },
                { value: "Crédito Pendiente", label: "Crédito Pendiente" },
              ]}
            />
          </div>
        </div>

        {(busqueda || filtroTipo !== "all" || filtroEstado !== "all") && (
          <div className="mt-3 pt-3 border-t border-brand-sky/15 flex items-center justify-between text-xs text-app-muted">
            <span>
              Filtrando {ventasFiltradas.length} de {ventas.length} ventas
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faRotateLeft}
              onClick={() => {
                setBusqueda("");
                setFiltroTipo("all");
                setFiltroEstado("all");
                setPagina(1);
              }}
            >
              Restablecer filtros
            </Button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <Table<Venta>
        columns={columns}
        data={ventasPaginadas}
        rowKey="idVenta"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={(v) => onVerDetalle(v)}
        emptyTitle="No se encontraron ventas"
        emptyDescription="Prueba con otros términos de búsqueda o registra una nueva venta."
        pagination={{
          currentPage: paginaActual,
          totalPages: totalPaginas,
          totalItems: ventasFiltradas.length,
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

export default TablaVentas;

