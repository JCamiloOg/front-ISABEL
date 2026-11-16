import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faEye,
  faPenToSquare,
  faToggleOn,
  faRotateLeft,
  faCalendarDay,
  faShoePrints,
} from "@fortawesome/free-solid-svg-icons";

import { Table, type TableColumn } from "../../../../../shared/components/Table";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import type { Devolucion } from "../types";
import { ESTADOS_DEVOLUCION } from "../constants";
import { formatDate } from "../utils";
import { EstadoBadge } from "./EstadoBadge";

interface TablaDevolucionesProps {
  devoluciones: Devolucion[];
  onVerDetalle: (devolucion: Devolucion) => void;
  onEditar: (devolucion: Devolucion) => void;
  onCambiarEstado: (devolucion: Devolucion) => void;
}

export function TablaDevoluciones({
  devoluciones,
  onVerDetalle,
  onEditar,
  onCambiarEstado,
}: TablaDevolucionesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "fechaSolicitud",
    direction: "desc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtrado
  const devolucionesFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return devoluciones.filter((d) => {
      if (filtroEstado !== "all" && d.estado !== filtroEstado) return false;
      if (!q) return true;
      return (
        d.codigoDevolucion.toLowerCase().includes(q) ||
        d.codigoVenta.toLowerCase().includes(q) ||
        d.cliente.nombre.toLowerCase().includes(q) ||
        d.cliente.documento.toLowerCase().includes(q) ||
        d.nombreProducto.toLowerCase().includes(q) ||
        d.sku.toLowerCase().includes(q)
      );
    });
  }, [devoluciones, busqueda, filtroEstado]);

  // Ordenación
  const devolucionesOrdenadas = useMemo(() => {
    return [...devolucionesFiltradas].sort((a, b) => {
      const { key, direction } = sortConfig;
      let cmp = 0;

      if (key === "codigoDevolucion") {
        cmp = a.codigoDevolucion.localeCompare(b.codigoDevolucion);
      } else if (key === "fechaSolicitud") {
        cmp = new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime();
      } else if (key === "cliente") {
        cmp = a.cliente.nombre.localeCompare(b.cliente.nombre);
      } else if (key === "producto") {
        cmp = a.nombreProducto.localeCompare(b.nombreProducto);
      } else if (key === "cantidad") {
        cmp = a.cantidad - b.cantidad;
      } else if (key === "estado") {
        cmp = a.estado.localeCompare(b.estado);
      }

      return direction === "asc" ? cmp : -cmp;
    });
  }, [devolucionesFiltradas, sortConfig]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(devolucionesOrdenadas.length / filasPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * filasPorPagina;
  const devolucionesPaginadas = useMemo(
    () => devolucionesOrdenadas.slice(desde, desde + filasPorPagina),
    [devolucionesOrdenadas, desde, filasPorPagina],
  );

  const columns: TableColumn<Devolucion>[] = [
    {
      key: "codigoDevolucion",
      header: "Código / Solicitud",
      sortable: true,
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
            {d.codigoDevolucion}
          </span>
          <span className="text-[11px] text-app-muted flex items-center gap-1 mt-0.5">
            <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
            {formatDate(d.fechaSolicitud)}
          </span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Venta / Cliente",
      sortable: true,
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-bold text-app-text text-xs">{d.cliente.nombre}</span>
          <span className="text-[11px] text-app-muted">
            {d.codigoVenta} · {d.cliente.tipoDocumento} {d.cliente.documento}
          </span>
        </div>
      ),
    },
    {
      key: "producto",
      header: "Producto",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-brand-sky/20 bg-brand-sky/10 flex items-center justify-center text-brand-royal dark:text-brand-sky">
            {d.imagen ? (
              <img
                src={d.imagen}
                alt={d.nombreProducto}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <FontAwesomeIcon icon={faShoePrints} />
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold text-app-text">{d.nombreProducto}</span>
            <span className="text-[11px] text-app-muted">
              {d.colorNombre} · Talla {d.numeroTalla}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "cantidad",
      header: "Cant.",
      sortable: true,
      align: "center",
      render: (d) => (
        <span className="rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5 text-xs font-bold text-app-text">
          {d.cantidad}
        </span>
      ),
    },
    {
      key: "motivo",
      header: "Motivo",
      render: (d) => (
        <p className="max-w-56 truncate text-xs text-app-muted" title={d.motivo}>
          {d.motivo}
        </p>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (d) => <EstadoBadge estado={d.estado} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      render: (d) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={faEye}
            title="Ver detalle"
            aria-label={`Ver detalle de ${d.codigoDevolucion}`}
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalle(d);
            }}
          />
          {d.estado === "Pendiente" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                icon={faPenToSquare}
                title="Editar devolución"
                aria-label={`Editar ${d.codigoDevolucion}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(d);
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                icon={faToggleOn}
                title="Cambiar estado"
                aria-label={`Cambiar estado de ${d.codigoDevolucion}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCambiarEstado(d);
                }}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const hayFiltros = busqueda !== "" || filtroEstado !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de filtros */}
      <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
          <div className="sm:col-span-12 lg:col-span-8">
            <Input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por código, venta, cliente, documento o producto..."
              iconLeft={faMagnifyingGlass}
            />
          </div>

          <div className="sm:col-span-12 lg:col-span-4">
            <Select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPagina(1);
              }}
              options={[
                { value: "all", label: "Todos los estados" },
                ...ESTADOS_DEVOLUCION.map((estado) => ({ value: estado, label: estado })),
              ]}
            />
          </div>
        </div>

        {hayFiltros && (
          <div className="mt-3 pt-3 border-t border-brand-sky/15 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {devolucionesFiltradas.length} de {devoluciones.length} devoluciones
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faRotateLeft}
              onClick={() => {
                setBusqueda("");
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
      <Table<Devolucion>
        columns={columns}
        data={devolucionesPaginadas}
        rowKey="idDevolucion"
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={(d) => onVerDetalle(d)}
        emptyTitle="No se encontraron devoluciones"
        emptyDescription="Prueba con otros términos de búsqueda o registra una nueva devolución."
        pagination={{
          currentPage: paginaActual,
          totalPages: totalPaginas,
          totalItems: devolucionesFiltradas.length,
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

export default TablaDevoluciones;
