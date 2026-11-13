import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBuildingColumns,
  faMoneyBillWave,
  faCalendarDay,
  faRotateLeft,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { Table, type TableColumn } from "../../../../../shared/components/Table";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import type { Gasto } from "../types";
import { formatoCOP, formatoFecha, normalizar } from "../utils";

interface TablaGastosProps {
  gastos: Gasto[];
}

export function TablaGastos({ gastos }: TablaGastosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "fecha",
    direction: "desc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Filtrado
  const gastosFiltrados = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return gastos;

    return gastos.filter((g) =>
      normalizar(
        [
          g.codigo,
          g.concepto,
          g.fecha,
          formatoFecha(g.fecha),
          g.cajaNombre,
          String(g.valor),
          formatoCOP(g.valor),
          g.descripcion,
        ].join(" "),
      ).includes(termino),
    );
  }, [gastos, busqueda]);

  // Ordenación
  const gastosOrdenados = useMemo(() => {
    return [...gastosFiltrados].sort((a, b) => {
      const { key, direction } = sortConfig;
      let compare = 0;

      if (key === "codigo") {
        compare = a.codigo.localeCompare(b.codigo);
      } else if (key === "concepto") {
        compare = a.concepto.localeCompare(b.concepto);
      } else if (key === "fecha") {
        compare = a.fecha.localeCompare(b.fecha);
      } else if (key === "cajaNombre") {
        compare = a.cajaNombre.localeCompare(b.cajaNombre);
      } else if (key === "valor") {
        compare = a.valor - b.valor;
      }

      return direction === "asc" ? compare : -compare;
    });
  }, [gastosFiltrados, sortConfig]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(gastosOrdenados.length / filasPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * filasPorPagina;
  const gastosPaginados = useMemo(
    () => gastosOrdenados.slice(desde, desde + filasPorPagina),
    [gastosOrdenados, desde, filasPorPagina],
  );

  const columns: TableColumn<Gasto>[] = [
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      render: (gasto) => (
        <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky bg-brand-royal/10 dark:bg-brand-sky/15 px-2.5 py-1 rounded-lg">
          {gasto.codigo}
        </span>
      ),
    },
    {
      key: "concepto",
      header: "Concepto",
      sortable: true,
      render: (gasto) => (
        <span className="inline-flex items-center rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5 text-xs font-semibold text-brand-royal dark:text-brand-sky">
          {gasto.concepto}
        </span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      render: (gasto) => (
        <span className="flex items-center gap-1.5 text-xs font-medium text-app-muted">
          <FontAwesomeIcon icon={faCalendarDay} className="text-[11px] text-brand-sky" />
          {formatoFecha(gasto.fecha)}
        </span>
      ),
    },
    {
      key: "cajaNombre",
      header: "Caja de origen",
      sortable: true,
      render: (gasto) => {
        const esEfectivo = gasto.cajaNombre.toLowerCase().includes("efectivo");
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-app-text">
            <FontAwesomeIcon
              icon={esEfectivo ? faMoneyBillWave : faBuildingColumns}
              className="text-app-muted text-xs"
            />
            <span>{gasto.cajaNombre}</span>
          </div>
        );
      },
    },
    {
      key: "valor",
      header: "Valor",
      sortable: true,
      align: "right",
      render: (gasto) => (
        <span className="text-sm font-bold text-brand-royal dark:text-brand-sky">
          {formatoCOP(gasto.valor)}
        </span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (gasto) => (
        <span className="block max-w-xs truncate text-xs text-app-muted" title={gasto.descripcion}>
          {gasto.descripcion || "—"}
        </span>
      ),
    },
  ];

  return (
    <section aria-labelledby="titulo-historial" className="flex flex-col gap-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="titulo-historial" className="text-lg font-bold text-app-text">
              Historial de gastos
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              Consulta y audita todos los egresos registrados por concepto y caja.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="w-full sm:w-80">
              <Input
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar por código, concepto, caja..."
                iconLeft={faMagnifyingGlass}
                size="sm"
              />
            </div>
            {busqueda && (
              <Button
                variant="ghost"
                size="sm"
                icon={faRotateLeft}
                onClick={() => {
                  setBusqueda("");
                  setPagina(1);
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-brand-royal px-2.5 py-0.5 text-[11px] font-bold text-white dark:bg-brand-sky dark:text-brand-navy">
            {gastosFiltrados.length} {gastosFiltrados.length === 1 ? "resultado" : "resultados"}
          </span>
          <span className="text-app-muted">
            {busqueda.trim()
              ? "Mostrando resultados coincidentes con la búsqueda."
              : `Total histórico: ${gastos.length} gastos registrados.`}
          </span>
        </div>
      </div>

      {/* Componente Tabla Reutilizable */}
      <Table<Gasto>
        columns={columns}
        data={gastosPaginados}
        rowKey="id"
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyTitle={gastos.length === 0 ? "Aún no hay gastos registrados" : "Sin coincidencias"}
        emptyDescription={
          gastos.length === 0
            ? 'Usa el botón "Registrar gasto" para crear el primero.'
            : "Prueba con otro término de búsqueda o limpia los filtros."
        }
        emptyState={
          gastos.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky mb-3">
                <FontAwesomeIcon icon={faReceipt} className="text-xl" />
              </div>
              <p className="text-sm font-bold text-app-text">Aún no hay gastos registrados</p>
              <p className="mt-1 text-xs text-app-muted">
                Usa el botón "Registrar gasto" para crear el primero.
              </p>
            </div>
          ) : undefined
        }
        pagination={{
          currentPage: paginaActual,
          totalPages: totalPaginas,
          totalItems: gastosFiltrados.length,
          itemsPerPage: filasPorPagina,
          onPageChange: (nuevaPagina) => setPagina(nuevaPagina),
          onItemsPerPageChange: (nuevoTamano) => {
            setFilasPorPagina(nuevoTamano);
            setPagina(1);
          },
          pageSizeOptions: [5, 10, 20],
        }}
      />
    </section>
  );
}

export default TablaGastos;
