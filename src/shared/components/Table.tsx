import {
  faArrowLeft,
  faArrowRight,
  faMagnifyingGlass,
  faSort,
  faSortDown,
  faSortUp,
  faXmark,
  faInbox,
  faChevronLeft,
  faChevronRight,
  faArrowUp,
  faArrowDown,
  faArrowsUpDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
export type SortDirection = "asc" | "desc" | null;

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
  /** Clave única de cada registro (ej: "id" o función (row) => row.id) */
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

/* ─────────────────────────────────────────────────────────────
   Root – Soporta tanto modo declarativo props-based como children-based
───────────────────────────────────────────────────────────── */
type TableComponentProps<T = unknown> =
  | ({ children: ReactNode; className?: string } & { columns?: never })
  | TableProps<T>;

export default function Table<T = unknown>(props: TableComponentProps<T>) {
  // Caso 1: Uso con subcomponentes (children)
  if ("children" in props && props.children) {
    return (
      <div className="flex-1">
        <section
          className={`rounded-2xl border border-app-border bg-app-surface/90 p-5 sm:p-6 shadow-sm backdrop-blur-sm transition-all duration-200 ${
            props.className || ""
          }`}
        >
          {props.children}
        </section>
      </div>
    );
  }

  // Caso 2: Compatibilidad hacia atrás con TableProps<T>
  const {
    columns = [],
    data = [],
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
  } = props as TableProps<T>;

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

  const visiblePages = useMemo(() => {
    if (!pagination) return [];
    const { currentPage, totalPages } = pagination;
    const delta = 1;
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
              Array.from({ length: pagination?.itemsPerPage || 5 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={`loading-col-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 w-3/4 rounded-md bg-app-border/70" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
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

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-app-border p-4 bg-app-surface-alt/40 rounded-b-2xl">
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

/* ─────────────────────────────────────────────────────────────
   Table.Header  –  title + description + right-side action slot
───────────────────────────────────────────────────────────── */
Table.Header = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
    <div>
      <h2 className="text-xl font-extrabold tracking-tight text-app-text leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-app-muted mt-0.5">{description}</p>
      )}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Table.Search  –  standalone search input
───────────────────────────────────────────────────────────── */
Table.Search = ({
  value,
  onChange,
  placeholder = "Buscar…",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={`relative flex items-center ${className}`}>
    <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="absolute left-3.5 text-app-muted text-xs pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-9 py-2 rounded-xl bg-app-surface-alt border border-app-border text-sm text-app-text placeholder:text-app-muted/60 outline-none focus:border-brand-royal dark:focus:border-brand-sky focus:ring-2 focus:ring-brand-royal/20 transition-all duration-200"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute right-3 p-1 rounded-full text-app-muted hover:text-app-text hover:bg-app-surface-alt transition cursor-pointer flex items-center justify-center"
        title="Limpiar búsqueda"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xs" />
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Table.Table  –  overflow wrapper + <table> con tarjetas flotantes (border-separate)
───────────────────────────────────────────────────────────── */
Table.Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto min-w-0">
    <table className="min-w-full border-separate border-spacing-y-2">
      {children}
    </table>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Table.Thead
───────────────────────────────────────────────────────────── */
Table.Thead = ({ children }: { children: ReactNode }) => (
  <thead>{children}</thead>
);

/* ─────────────────────────────────────────────────────────────
   Table.Row  –  head variant vs. body variant
───────────────────────────────────────────────────────────── */
Table.Row = ({
  head,
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  head?: boolean;
  onClick?: () => void;
  className?: string;
}) => {
  if (head) {
    return (
      <tr className={`text-left text-[11px] font-bold uppercase tracking-[0.12em] text-app-muted select-none ${className}`}>
        {children}
      </tr>
    );
  }

  return (
    <tr
      onClick={onClick}
      className={`group rounded-2xl bg-app-surface border border-app-border/80 shadow-2xs hover:shadow-sm transition-all duration-150 ${
        onClick ? "cursor-pointer hover:bg-brand-royal/5 dark:hover:bg-brand-sky/10" : "hover:bg-app-surface-alt/70"
      } ${className}`}
    >
      {children}
    </tr>
  );
};

/* ─────────────────────────────────────────────────────────────
   Table.SortableCell  –  header cell with sort toggle
───────────────────────────────────────────────────────────── */
Table.SortableCell = ({
  children,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  className = "",
}: {
  children: ReactNode;
  sortKey: string;
  activeSortKey: string | null;
  sortDir: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}) => {
  const isActive = activeSortKey === sortKey;
  const icon = !isActive
    ? faSort
    : sortDir === "asc"
      ? faSortUp
      : faSortDown;

  return (
    <th
      className={`px-4 py-3 font-bold select-none cursor-pointer hover:text-brand-royal dark:hover:text-brand-sky transition-colors whitespace-nowrap ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        <FontAwesomeIcon
          icon={icon}
          className={`w-3 h-3 ${isActive ? "text-brand-royal dark:text-brand-sky" : "opacity-35"}`}
        />
      </span>
    </th>
  );
};

/* ─────────────────────────────────────────────────────────────
   Table.Cell  –  body cell with rounded corners helpers
───────────────────────────────────────────────────────────── */
Table.Cell = ({
  children,
  rounded,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  rounded?: "none" | "left" | "right" | "full";
  className?: string;
  colSpan?: number;
}) => {
  const roundedMap = {
    none: "px-4 py-3.5 border-y border-app-border/70",
    left: "px-4 py-3.5 rounded-l-2xl border-y border-l border-app-border/70",
    right: "px-4 py-3.5 rounded-r-2xl border-y border-r border-app-border/70",
    full: "px-4 py-3.5 rounded-2xl border border-app-border/70",
  };

  return (
    <td
      colSpan={colSpan}
      className={`${roundedMap[rounded ?? "none"]} text-app-text align-middle ${className}`}
    >
      {children}
    </td>
  );
};

/* ─────────────────────────────────────────────────────────────
   Table.Tbody
───────────────────────────────────────────────────────────── */
Table.Tbody = ({ children }: { children: ReactNode }) => (
  <tbody className="text-sm">{children}</tbody>
);

/* ─────────────────────────────────────────────────────────────
   Table.Empty  –  empty / no-results state
───────────────────────────────────────────────────────────── */
Table.Empty = ({
  colSpan,
  message = "No hay datos disponibles.",
}: {
  colSpan: number;
  message?: string;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-4 py-14 text-center text-sm text-app-muted italic rounded-2xl bg-app-surface-alt/40 border border-app-border/60"
    >
      {message}
    </td>
  </tr>
);

/* ─────────────────────────────────────────────────────────────
   Table.Pagination  –  prev / page numbers / next
───────────────────────────────────────────────────────────── */
Table.Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
}) => {
  const delta = 2;
  const pages: (number | "…")[] = [];
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("…");
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("…");
    pages.push(totalPages);
  }

  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * (pageSize ?? 10) + 1;
  const pageEnd = Math.min(currentPage * (pageSize ?? 10), totalItems ?? 0);

  return (
    <div className="flex flex-wrap justify-between items-center mt-5 gap-3 pt-3 border-t border-app-border/60">
      {/* Left: rows per page + range info */}
      <div className="flex items-center gap-3 text-xs text-app-muted">
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-app-border bg-app-surface rounded-lg px-2 py-1 text-xs text-app-text focus:outline-none focus:border-brand-royal dark:focus:border-brand-sky cursor-pointer"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
        {totalItems != null && (
          <span>
            {pageStart}–{pageEnd} de {totalItems}
          </span>
        )}
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages <= 1}
          className="flex h-8.5 items-center justify-center px-3 rounded-xl bg-app-surface border border-app-border text-sm text-app-muted disabled:opacity-35 hover:bg-app-surface-alt hover:text-app-text transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Página anterior"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-app-muted text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-8.5 h-8.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                p === currentPage
                  ? "bg-brand-royal text-white shadow-xs"
                  : "bg-app-surface border border-app-border text-app-text hover:bg-app-surface-alt hover:border-brand-royal/40"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages <= 1}
          className="flex h-8.5 items-center justify-center px-3 rounded-xl bg-app-surface border border-app-border text-sm text-app-muted disabled:opacity-35 hover:bg-app-surface-alt hover:text-app-text transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Página siguiente"
        >
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export { Table };

