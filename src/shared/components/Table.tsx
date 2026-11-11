import { type ReactNode, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faInbox,
  faArrowUp,
  faArrowDown,
  faArrowsUpDown,
} from "@fortawesome/free-solid-svg-icons";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  /** Clase opcional para la cabecera <th> */
  headerClassName?: string;
  /** Clase opcional para la celda <td> */
  cellClassName?: string;
  /** Ancho sugerido de la columna, e.g. "w-48" o "w-1/4" */
  width?: string;
  /** Función para renderizar el contenido de la celda */
  render?: (row: T, index: number) => ReactNode;
  /** Si la columna permite ordenación */
  sortable?: boolean;
  /** Alineación del texto: left | center | right */
  align?: "left" | "center" | "right";
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Clave única de cada registro (ej: "idProducto" o función (row) => row.id) */
  rowKey: keyof T | ((row: T, index: number) => string | number);
  /** Estado de carga */
  isLoading?: boolean;
  /** Mensaje o contenido alternativo cuando no hay datos */
  emptyState?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Configuración de paginación integrada */
  pagination?: PaginationConfig;
  /** Orden actual para columnas sortables */
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  };
  onSort?: (key: string) => void;
  /** Manejador al hacer clic en una fila */
  onRowClick?: (row: T, index: number) => void;
  /** Clases adicionales para el contenedor principal */
  containerClassName?: string;
  /** Resaltar filas al pasar el cursor (por defecto true) */
  hoverable?: boolean;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyState,
  emptyTitle = "No hay registros disponibles",
  emptyDescription = "No se encontraron elementos para mostrar en esta vista.",
  pagination,
  sortConfig,
  onSort,
  onRowClick,
  containerClassName = "",
  hoverable = true,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }
    return (row[rowKey] as unknown as string | number) ?? index;
  };

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center justify-center";
      case "right":
        return "text-right justify-end";
      default:
        return "text-left justify-start";
    }
  };

  // Generador de números de página con elipsis si hay muchas páginas
  const visiblePages = useMemo(() => {
    if (!pagination) return [];
    const { currentPage, totalPages } = pagination;
    const delta = 1; // páginas adyacentes a mostrar
    const range: (number | "...")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [pagination]);

  return (
    <div
      className={`rounded-2xl border border-app-border bg-app-surface shadow-xs transition-all flex flex-col ${containerClassName}`}
    >
      {/* Contenedor con Scroll Horizontal Responsivo */}
      <div className="w-full overflow-x-auto min-w-0">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-app-border bg-app-surface-alt/75 backdrop-blur-xs">
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                const canSort = col.sortable && !!onSort;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`py-3.5 px-4 text-xs font-bold tracking-wider uppercase text-app-muted select-none ${
                      col.width ? col.width : ""
                    } ${col.headerClassName || ""} ${
                      canSort ? "cursor-pointer hover:text-brand-royal dark:hover:text-brand-sky" : ""
                    }`}
                    onClick={() => canSort && onSort(col.key)}
                  >
                    <div className={`flex items-center gap-2 ${getAlignmentClass(col.align)}`}>
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="text-xs transition-colors">
                          {isSorted ? (
                            sortConfig.direction === "asc" ? (
                              <FontAwesomeIcon
                                icon={faArrowUp}
                                className="text-brand-royal dark:text-brand-sky"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faArrowDown}
                                className="text-brand-royal dark:text-brand-sky"
                              />
                            )
                          ) : (
                            <FontAwesomeIcon
                              icon={faArrowsUpDown}
                              className="text-app-muted/40 hover:text-app-muted"
                            />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-app-border/80">
            {isLoading ? (
              // Skeleton Loading State
              Array.from({ length: pagination?.itemsPerPage || 5 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`loading-col-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 w-3/4 rounded-md bg-app-border/70" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  {emptyState ? (
                    emptyState
                  ) : (
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-surface-alt text-app-muted mb-3 border border-app-border">
                        <FontAwesomeIcon icon={faInbox} className="text-lg" />
                      </div>
                      <h4 className="text-sm font-bold text-app-text">{emptyTitle}</h4>
                      <p className="mt-1 text-xs text-app-muted leading-relaxed">
                        {emptyDescription}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              // Filas de datos
              data.map((row, index) => {
                const key = getRowKey(row, index);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row, index)}
                    className={`transition-colors duration-150 ${
                      hoverable
                        ? "hover:bg-app-surface-alt/70 dark:hover:bg-brand-navy/35"
                        : ""
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={`${key}-${col.key}`}
                          className={`py-3.5 px-4 text-sm text-app-text align-middle ${
                            getAlignmentClass(col.align).split(" ")[0]
                          } ${col.cellClassName || ""}`}
                        >
                          {col.render ? col.render(row, index) : (value as ReactNode) ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación Integrada */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-app-border p-4 bg-app-surface-alt/40 rounded-b-2xl">
          {/* Métricas de página e selector de tamaño */}
          <div className="flex items-center gap-3 text-xs text-app-muted">
            <span>
              Mostrando{" "}
              <strong className="text-app-text font-semibold">
                {data.length === 0
                  ? 0
                  : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </strong>{" "}
              a{" "}
              <strong className="text-app-text font-semibold">
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}
              </strong>{" "}
              de{" "}
              <strong className="text-app-text font-semibold">
                {pagination.totalItems}
              </strong>{" "}
              registros
            </span>

            {pagination.onItemsPerPageChange && (
              <div className="flex items-center gap-1.5 ml-2 border-l border-app-border pl-3">
                <span className="hidden sm:inline">Por página:</span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) =>
                    pagination.onItemsPerPageChange?.(Number(e.target.value))
                  }
                  className="rounded-lg border border-app-border bg-app-surface px-2 py-1 text-xs font-semibold text-app-text focus:border-brand-royal focus:outline-none dark:bg-brand-navy cursor-pointer"
                >
                  {(pagination.pageSizeOptions || [5, 10, 20, 50]).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navegación entre páginas */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.currentPage <= 1 || isLoading}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-semibold text-app-text transition-all hover:border-brand-royal hover:text-brand-royal disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              aria-label="Página anterior"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {visiblePages.map((item, idx) => {
                if (item === "...") {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="flex h-8 w-6 items-center justify-center text-xs text-app-muted select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNumber = item as number;
                const isActive = pagination.currentPage === pageNumber;

                return (
                  <button
                    key={`page-${pageNumber}`}
                    type="button"
                    onClick={() => pagination.onPageChange(pageNumber)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand-royal text-white shadow-xs dark:bg-brand-royal"
                        : "border border-app-border bg-app-surface text-app-text hover:border-brand-royal/40 hover:bg-app-surface-alt"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={
                pagination.currentPage >= pagination.totalPages || isLoading
              }
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-semibold text-app-text transition-all hover:border-brand-royal hover:text-brand-royal disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
