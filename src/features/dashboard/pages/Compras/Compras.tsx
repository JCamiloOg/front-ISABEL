import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faBan,
  faTruckFast,
  faChartPie,
  faCashRegister,
  faCalendarDays,
  faRotate,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";
import { MOCK_PROVEEDORES } from "../Proveedores/constants";

// ==========================================
// Tipos y Modelos de Datos de Compras
// ==========================================

export type EstadoCompra = "Cancelado" | "Enviado" | "Recibido";

export interface ItemCompra {
  idDetalle: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  idCompra: number; // Consecutivo 1, 2, 3...
  idCaja: number;
  idProveedor: string;
  nombreProveedor: string;
  fechaOrden: string; // YYYY-MM-DD
  estado: EstadoCompra;
  fechaEntrega?: string; // YYYY-MM-DD (visible cuando es Recibido)
  iva: number; // Porcentaje de IVA, ej. 19.00
  subtotal: number;
  total: number;
  observaciones?: string;
}

// Cajas registradas en el ERP
export const CAJAS_DISPONIBLES = [
  { value: "1", label: "Caja #1 - Principal (Ventas y Mostrador)" },
  { value: "2", label: "Caja #2 - Bodega y Recepción" },
  { value: "3", label: "Caja #3 - Tesorería y Administración" },
  { value: "4", label: "Caja #4 - Taller y Maquila" },
];

// Formateador de moneda en pesos colombianos
const formatCOP = (val: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

// ==========================================
// Datos Iniciales con IDs Consecutivos (1, 2, 3...)
// ==========================================
const INITIAL_COMPRAS: Compra[] = [
  {
    idCompra: 1,
    idCaja: 1,
    idProveedor: "prov-001",
    nombreProveedor: "Curtidos La Sabana S.A.S.",
    fechaOrden: "2026-02-05",
    estado: "Recibido",
    fechaEntrega: "2026-02-14",
    iva: 19,
    subtotal: 7800000,
    total: 9282000,
    observaciones: "Entrega completa recibida e inspeccionada en bodega.",
  },
  {
    idCompra: 2,
    idCaja: 2,
    idProveedor: "prov-002",
    nombreProveedor: "Industrias Caucho SuelaFlex Ltda.",
    fechaOrden: "2026-02-11",
    estado: "Enviado",
    iva: 19,
    subtotal: 6200000,
    total: 7378000,
    observaciones: "Despachado desde fábrica Medellín en ruta de transporte.",
  },
  {
    idCompra: 3,
    idCaja: 1,
    idProveedor: "prov-003",
    nombreProveedor: "Hernando Silva (Herrajes El Artesano)",
    fechaOrden: "2026-02-13",
    estado: "Enviado",
    iva: 19,
    subtotal: 5025000,
    total: 5979750,
    observaciones: "Orden enviada con transporte local Restrepo.",
  },
  {
    idCompra: 4,
    idCaja: 3,
    idProveedor: "prov-004",
    nombreProveedor: "Guangzhou Shoe Materials International Co.",
    fechaOrden: "2026-02-14",
    estado: "Recibido",
    fechaEntrega: "2026-02-16",
    iva: 19,
    subtotal: 3800000,
    total: 4522000,
    observaciones: "Lote de alta gama verificado con factura.",
  },
  {
    idCompra: 5,
    idCaja: 1,
    idProveedor: "prov-001",
    nombreProveedor: "Curtidos La Sabana S.A.S.",
    fechaOrden: "2026-02-15",
    estado: "Cancelado",
    iva: 19,
    subtotal: 2400000,
    total: 2856000,
    observaciones: "Orden cancelada por falta de stock temporal del fabricante.",
  },
];

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>(INITIAL_COMPRAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterCaja, setFilterCaja] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "idCompra",
    direction: "asc",
  });

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);
  const [formIdCaja, setFormIdCaja] = useState<number>(1);
  const [formIdProveedor, setFormIdProveedor] = useState<string>("prov-001");
  const [formFechaOrden, setFormFechaOrden] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formIva, setFormIva] = useState<number>(19.0);
  const [formSubtotal, setFormSubtotal] = useState<number>(5000000);
  const [formObservaciones, setFormObservaciones] = useState<string>("");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCompra, setDetailCompra] = useState<Compra | null>(null);

  // Modal Rápido de Cambio de Estado
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [compraToChangeStatus, setCompraToChangeStatus] = useState<Compra | null>(null);

  // Próximo ID consecutivo (1, 2, 3...)
  const nextId = useMemo(() => {
    return compras.length > 0 ? Math.max(...compras.map((c) => c.idCompra)) + 1 : 1;
  }, [compras]);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = compras.length;
    const recibidas = compras.filter((c) => c.estado === "Recibido").length;
    const enviadas = compras.filter((c) => c.estado === "Enviado").length;
    const canceladas = compras.filter((c) => c.estado === "Cancelado").length;

    const totalGasto = compras
      .filter((c) => c.estado !== "Cancelado")
      .reduce((acc, c) => acc + c.total, 0);

    return { total, recibidas, enviadas, canceladas, totalGasto };
  }, [compras]);

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

  // Filtrado y ordenamiento de compras
  const filteredCompras = useMemo(() => {
    return compras
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.idCompra.toString().includes(q) ||
          c.nombreProveedor.toLowerCase().includes(q) ||
          c.idProveedor.toLowerCase().includes(q) ||
          c.fechaOrden.includes(q) ||
          `caja ${c.idCaja}`.includes(q);

        const matchesEstado = filterEstado === "all" || c.estado === filterEstado;
        const matchesCaja = filterCaja === "all" || c.idCaja.toString() === filterCaja;

        return matchesQuery && matchesEstado && matchesCaja;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "idCompra") {
          return (a.idCompra - b.idCompra) * factor;
        }
        if (sortConfig.key === "fechaOrden") {
          return a.fechaOrden.localeCompare(b.fechaOrden) * factor;
        }
        if (sortConfig.key === "total") {
          return (a.total - b.total) * factor;
        }
        if (sortConfig.key === "proveedor") {
          return a.nombreProveedor.localeCompare(b.nombreProveedor) * factor;
        }
        return 0;
      });
  }, [compras, searchQuery, filterEstado, filterCaja, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredCompras.length / itemsPerPage) || 1;
  const paginatedCompras = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompras.slice(start, start + itemsPerPage);
  }, [filteredCompras, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterCaja("all");
    setSortConfig({ key: "idCompra", direction: "asc" });
    setCurrentPage(1);
  };

  // Cambio de estado directo
  const handleCambiarEstado = (compra: Compra, nuevoEstado: EstadoCompra) => {
    const updatedFechaEntrega =
      nuevoEstado === "Recibido"
        ? (compra.fechaEntrega || new Date().toISOString().split("T")[0])
        : undefined;

    setCompras((prev) =>
      prev.map((c) =>
        c.idCompra === compra.idCompra
          ? {
              ...c,
              estado: nuevoEstado,
              fechaEntrega: updatedFechaEntrega,
            }
          : c
      )
    );

    if (detailCompra && detailCompra.idCompra === compra.idCompra) {
      setDetailCompra({
        ...detailCompra,
        estado: nuevoEstado,
        fechaEntrega: updatedFechaEntrega,
      });
    }

    setIsStatusModalOpen(false);

    Toast.fire({
      icon: "success",
      title: `Compra #${compra.idCompra}: estado cambiado a ${nuevoEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingCompra(null);
    setFormIdCaja(1);
    setFormIdProveedor(MOCK_PROVEEDORES[0]?.idProveedor || "prov-001");
    setFormFechaOrden(new Date().toISOString().split("T")[0]);
    setFormIva(19.0);
    setFormSubtotal(5000000);
    setFormObservaciones("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (compra: Compra) => {
    setEditingCompra(compra);
    setFormIdCaja(compra.idCaja);
    setFormIdProveedor(compra.idProveedor);
    setFormFechaOrden(compra.fechaOrden);
    setFormIva(compra.iva);
    setFormSubtotal(compra.subtotal);
    setFormObservaciones(compra.observaciones || "");
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (compra: Compra) => {
    setDetailCompra(compra);
    setIsDetailOpen(true);
  };

  // Guardar Compra (Crear o Editar)
  const handleSaveCompra = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFechaOrden) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona la fecha de orden en el calendario",
      });
      return;
    }

    if (formSubtotal <= 0) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa un subtotal válido mayor a $0",
      });
      return;
    }

    const provObj = MOCK_PROVEEDORES.find((p) => p.idProveedor === formIdProveedor);
    const nombreProveedor = provObj ? provObj.razonSocial : "Proveedor Registrado";

    const valorIva = formSubtotal * (formIva / 100);
    const totalCalculado = formSubtotal + valorIva;

    if (editingCompra) {
      setCompras((prev) =>
        prev.map((c) =>
          c.idCompra === editingCompra.idCompra
            ? {
                ...c,
                idCaja: formIdCaja,
                idProveedor: formIdProveedor,
                nombreProveedor,
                fechaOrden: formFechaOrden,
                iva: formIva,
                subtotal: formSubtotal,
                total: totalCalculado,
                observaciones: formObservaciones.trim() || undefined,
              }
            : c
        )
      );

      if (detailCompra && detailCompra.idCompra === editingCompra.idCompra) {
        setDetailCompra({
          ...detailCompra,
          idCaja: formIdCaja,
          idProveedor: formIdProveedor,
          nombreProveedor,
          fechaOrden: formFechaOrden,
          iva: formIva,
          subtotal: formSubtotal,
          total: totalCalculado,
          observaciones: formObservaciones.trim() || undefined,
        });
      }

      Toast.fire({
        icon: "success",
        title: `Compra #${editingCompra.idCompra} actualizada con éxito`,
      });
    } else {
      const newCompra: Compra = {
        idCompra: nextId,
        idCaja: formIdCaja,
        idProveedor: formIdProveedor,
        nombreProveedor,
        fechaOrden: formFechaOrden,
        estado: "Enviado",
        fechaEntrega: undefined,
        iva: formIva,
        subtotal: formSubtotal,
        total: totalCalculado,
        observaciones: formObservaciones.trim() || undefined,
      };

      setCompras((prev) => [newCompra, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Compra #${nextId} registrada correctamente`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla
  const tableColumns: TableColumn<Compra>[] = [
    {
      key: "idCompra",
      header: "# ID",
      width: "70px",
      sortable: true,
      render: (compra) => (
        <span className="font-mono text-xs font-bold text-app-muted">
          #{compra.idCompra}
        </span>
      ),
    },
    {
      key: "idCaja",
      header: "Caja",
      sortable: true,
      render: (compra) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-semibold text-app-text border border-app-border">
          <FontAwesomeIcon icon={faCashRegister} className="text-[11px] text-brand-royal dark:text-brand-sky" />
          Caja #{compra.idCaja}
        </span>
      ),
    },
    {
      key: "idProveedor",
      header: "Proveedor",
      sortable: true,
      render: (compra) => (
        <div className="flex flex-col py-1">
          <p
            onClick={() => openDetail(compra)}
            className="font-bold text-xs text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
            title={compra.nombreProveedor}
          >
            {compra.nombreProveedor}
          </p>
          <span className="text-[11px] text-app-muted font-mono">{compra.idProveedor}</span>
        </div>
      ),
    },
    {
      key: "fechaOrden",
      header: "Fecha de Orden",
      sortable: true,
      render: (compra) => (
        <div className="flex items-center gap-1.5 text-xs text-app-text">
          <FontAwesomeIcon icon={faCalendarDays} className="text-app-muted text-xs" />
          <span>{compra.fechaOrden}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total (COP)",
      align: "right",
      sortable: true,
      render: (compra) => (
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs font-bold text-app-text">
            {formatCOP(compra.total)}
          </span>
          <span className="text-[10px] text-app-muted">IVA {compra.iva}% incl.</span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (compra) => (
        <button
          type="button"
          onClick={() => {
            setCompraToChangeStatus(compra);
            setIsStatusModalOpen(true);
          }}
          title="Clic para cambiar el estado"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
            compra.estado === "Recibido"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
              : compra.estado === "Enviado"
              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200"
              : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              compra.estado === "Recibido"
                ? "bg-emerald-500"
                : compra.estado === "Enviado"
                ? "bg-blue-500"
                : "bg-rose-500"
            }`}
          />
          {compra.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (compra) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(compra)}
            title="Ver detalle de la compra"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => {
              setCompraToChangeStatus(compra);
              setIsStatusModalOpen(true);
            }}
            title="Cambiar estado de la compra"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotate} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(compra)}
            title="Editar orden de compra"
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
              <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Compras
              </h1>
              <p className="text-sm text-app-muted">
                Registro, consulta y seguimiento de compras vinculadas a caja y proveedor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Reporte sin funcionalidad activa */}
          <Button
            variant="outline"
            size="md"
            icon={faChartPie}
            onClick={() => {
              Toast.fire({
                icon: "info",
                title: "Reportes no disponibles",
                text: "La generación y tabla de reportes no está disponible en este momento.",
              });
            }}
            className="hover:border-brand-royal dark:hover:border-brand-sky opacity-80"
          >
            Generar Reporte
          </Button>

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
            Nueva Compra
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Total Compras</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faCartShopping} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">órdenes</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            Inversión activa: {formatCOP(metrics.totalGasto)}
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Recibidas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.recibidas}
            </span>
            <span className="text-xs text-app-muted">entregadas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Mercancía verificada en bodega
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Enviadas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.enviadas}
            </span>
            <span className="text-xs text-app-muted">en tránsito</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">En camino desde proveedor</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Compras Canceladas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <FontAwesomeIcon icon={faBan} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.canceladas}
            </span>
            <span className="text-xs text-app-muted">anuladas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Sin impacto en almacén</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              id="search-compras"
              type="search"
              placeholder="Buscar por ID, proveedor o fecha..."
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
              id="filter-compra-estado"
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Recibido", label: "Recibido" },
                { value: "Enviado", label: "Enviado" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
              size="sm"
            />
          </div>

          <div>
            <Select
              id="filter-compra-caja"
              value={filterCaja}
              onChange={(e) => {
                setFilterCaja(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Caja: Todas" },
                ...CAJAS_DISPONIBLES.map((c) => ({ value: c.value, label: c.label })),
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredCompras.length}</strong> de{" "}
            <strong>{compras.length}</strong> compras registradas
          </span>
          {(searchQuery || filterEstado !== "all" || filterCaja !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Compras */}
      <Table<Compra>
        columns={tableColumns}
        data={paginatedCompras}
        rowKey="idCompra"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredCompras.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron compras"
        emptyDescription="Prueba ajustando la búsqueda o los filtros de estado y caja."
      />

      {/* MODAL CREAR / EDITAR COMPRA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCompra ? "Editar Orden de Compra" : "Registrar Nueva Compra"}
        description={
          editingCompra
            ? `Modificando registro de compra #${editingCompra.idCompra}`
            : `Nueva orden de compra con identificador consecutivo #${nextId}`
        }
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCompra}>
              {editingCompra ? "Guardar Cambios" : "Registrar Compra"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCompra} className="space-y-4">
          {/* Identificador consecutivo (1, 2, 3...) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-app-surface-alt border border-app-border text-xs">
            <span className="text-app-muted font-medium">ID Asignado:</span>
            <span className="font-mono font-bold text-brand-royal dark:text-brand-sky text-sm">
              #{editingCompra ? editingCompra.idCompra : nextId}
            </span>
          </div>

          <div className="space-y-4">
            {/* Select Cajas */}
            <Select
              id="form-caja"
              label="Caja Responsable"
              value={String(formIdCaja)}
              onChange={(e) => setFormIdCaja(Number(e.target.value))}
              options={CAJAS_DISPONIBLES}
              required
            />

            {/* Select Proveedores */}
            <Select
              id="form-proveedor"
              label="Proveedor"
              value={formIdProveedor}
              onChange={(e) => setFormIdProveedor(e.target.value)}
              options={MOCK_PROVEEDORES.map((p) => ({
                value: p.idProveedor,
                label: `${p.razonSocial} (${p.numeroDocumento})`,
              }))}
              required
            />

            {/* Fecha de Orden (Calendario nativo) */}
            <Input
              id="form-fecha-orden"
              type="date"
              label="Fecha de Orden"
              value={formFechaOrden}
              onChange={(e) => setFormFechaOrden(e.target.value)}
              required
              helper="Selecciona la fecha en el calendario"
            />

            {/* IVA en input numérico */}
            <Input
              id="form-iva"
              type="number"
              step="0.01"
              min="0"
              max="100"
              label="IVA (%)"
              placeholder="19.00"
              value={formIva}
              onChange={(e) => setFormIva(Number(e.target.value))}
              required
              helper="Porcentaje de IVA a aplicar (ej. 19.00)"
              iconRight={<FontAwesomeIcon icon={faPercent} className="text-app-muted text-xs" />}
            />

            {/* Subtotal base en COP */}
            <Input
              id="form-subtotal"
              type="number"
              min="0"
              step="1000"
              label="Subtotal (COP)"
              placeholder="Ej. 5000000"
              value={formSubtotal}
              onChange={(e) => setFormSubtotal(Number(e.target.value))}
              required
              helper="Monto neto antes de IVA"
            />

            {/* Vista previa de totales calculados */}
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-app-muted">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatCOP(formSubtotal)}</span>
              </div>
              <div className="flex justify-between text-app-muted">
                <span>IVA ({formIva}%):</span>
                <span className="font-mono font-semibold">
                  {formatCOP(formSubtotal * (formIva / 100))}
                </span>
              </div>
              <div className="flex justify-between text-app-text font-bold pt-1 border-t border-app-border text-sm">
                <span>Total Compra:</span>
                <span className="font-mono text-brand-royal dark:text-brand-sky">
                  {formatCOP(formSubtotal * (1 + formIva / 100))}
                </span>
              </div>
            </div>

            <Input
              id="form-observaciones"
              label="Observaciones (Opcional)"
              placeholder="Ej. Lote de temporada para bodega principal"
              value={formObservaciones}
              onChange={(e) => setFormObservaciones(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE COMPRA (CON IVA Y FECHA DE ENTREGA) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailCompra ? `Compra #${detailCompra.idCompra}` : "Detalle de Compra"}
        description={
          detailCompra
            ? `Proveedor: ${detailCompra.nombreProveedor} · Caja #${detailCompra.idCaja}`
            : "Consulta de orden de compra"
        }
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailCompra?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailCompra && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailCompra);
                  }}
                >
                  Editar Compra
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailCompra && (
          <div className="space-y-5">
            {/* Banner de información general */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faCartShopping} />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-app-text">
                    Orden de Compra #{detailCompra.idCompra}
                  </h3>
                  <p className="text-xs text-app-muted mt-0.5">
                    {detailCompra.nombreProveedor} ({detailCompra.idProveedor})
                  </p>
                </div>
              </div>

              {/* Selector interactivo para cambiar estado en el detalle */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-app-muted uppercase font-semibold">Estado</span>
                <select
                  value={detailCompra.estado}
                  onChange={(e) => handleCambiarEstado(detailCompra, e.target.value as EstadoCompra)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                    detailCompra.estado === "Recibido"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : detailCompra.estado === "Enviado"
                      ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                      : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  }`}
                >
                  <option value="Enviado">Enviado</option>
                  <option value="Recibido">Recibido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Fecha de Entrega destacada SOLO cuando el estado es Recibido */}
            {detailCompra.estado === "Recibido" && (
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white text-sm shadow-xs">
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      Fecha de Entrega
                    </span>
                    <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                      {detailCompra.fechaEntrega || new Date().toISOString().split("T")[0]}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Mercancía Recibida en Bodega
                </span>
              </div>
            )}

            {/* Desglose Financiero con IVA claramente visible */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-app-border bg-app-surface p-3 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Subtotal
                </span>
                <span className="text-sm font-mono font-bold text-app-text mt-1 block">
                  {formatCOP(detailCompra.subtotal)}
                </span>
              </div>

              <div className="rounded-xl border border-brand-royal/30 bg-brand-royal/10 dark:bg-brand-sky/15 dark:border-brand-sky/30 p-3 text-center">
                <span className="text-[10px] font-bold text-brand-royal dark:text-brand-sky uppercase tracking-wider block">
                  IVA ({detailCompra.iva}%)
                </span>
                <span className="text-sm font-mono font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {formatCOP(detailCompra.subtotal * (detailCompra.iva / 100))}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-3 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Total
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formatCOP(detailCompra.total)}
                </span>
              </div>
            </div>

            {/* Datos de Caja, Proveedor y Fechas */}
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-app-muted">Caja Responsable:</span>
                <span className="font-semibold text-app-text">Caja #{detailCompra.idCaja}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-muted">Fecha de Orden:</span>
                <span className="font-semibold text-app-text">{detailCompra.fechaOrden}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-muted">Proveedor:</span>
                <span className="font-semibold text-app-text">{detailCompra.nombreProveedor}</span>
              </div>
              {detailCompra.observaciones && (
                <div className="pt-2 border-t border-app-border">
                  <span className="text-app-muted block mb-0.5">Observaciones:</span>
                  <p className="text-app-text font-medium">{detailCompra.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL RÁPIDO PARA CAMBIAR ESTADO */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Cambiar Estado de la Compra"
        description={
          compraToChangeStatus
            ? `Selecciona el nuevo estado para la orden #${compraToChangeStatus.idCompra}`
            : ""
        }
        size="sm"
        footer={
          <div className="flex w-full items-center justify-end">
            <Button variant="ghost" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        }
      >
        {compraToChangeStatus && (
          <div className="space-y-3">
            <p className="text-xs text-app-muted">
              Estado actual: <strong>{compraToChangeStatus.estado}</strong>
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleCambiarEstado(compraToChangeStatus, "Enviado")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  compraToChangeStatus.estado === "Enviado"
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200"
                    : "border-app-border bg-app-surface hover:bg-app-surface-alt text-app-text"
                }`}
              >
                <div>
                  <p className="font-bold text-xs">Enviado</p>
                  <p className="text-[11px] text-app-muted">Despachado en camino</p>
                </div>
                <FontAwesomeIcon icon={faTruckFast} className="text-xs text-blue-500" />
              </button>

              <button
                type="button"
                onClick={() => handleCambiarEstado(compraToChangeStatus, "Recibido")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  compraToChangeStatus.estado === "Recibido"
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                    : "border-app-border bg-app-surface hover:bg-app-surface-alt text-app-text"
                }`}
              >
                <div>
                  <p className="font-bold text-xs">Recibido</p>
                  <p className="text-[11px] text-app-muted">
                    Registra la fecha de entrega en almacén
                  </p>
                </div>
                <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-emerald-500" />
              </button>

              <button
                type="button"
                onClick={() => handleCambiarEstado(compraToChangeStatus, "Cancelado")}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  compraToChangeStatus.estado === "Cancelado"
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                    : "border-app-border bg-app-surface hover:bg-app-surface-alt text-app-text"
                }`}
              >
                <div>
                  <p className="font-bold text-xs">Cancelado</p>
                  <p className="text-[11px] text-app-muted">Anular orden de compra</p>
                </div>
                <FontAwesomeIcon icon={faBan} className="text-xs text-rose-500" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
