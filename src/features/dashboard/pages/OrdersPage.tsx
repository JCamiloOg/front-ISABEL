import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faMagnifyingGlass,
  faEye,
  faClock,
  faBoxOpen,
  faTruck,
  faCheckCircle,
  faBan,
  faArrowRotateRight,
  faReceipt,
  faUser,
  faLocationDot,
  faPhone,
  faEnvelope,
  faFileInvoiceDollar,
  faPlus,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

import type { Pedido, EstadoPedido } from "../../../@types/Orders";
import { MOCK_PEDIDOS } from "../../../data/orders";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Select } from "../../../shared/components/Inputs/Select";
import Modal from "../../../shared/components/Modal";
import { Toast, MySwal } from "../../../shared/utils/alerts";

// Formateador de moneda en pesos colombianos
const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

// Formateador de fecha legible
const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
};

// Configuraciones visuales por estado
const ESTADO_CONFIG: Record<
  EstadoPedido,
  { label: string; bg: string; text: string; border: string; icon: typeof faClock }
> = {
  Pendiente: {
    label: "Pendiente",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/30",
    icon: faClock,
  },
  "En Preparación": {
    label: "En Preparación",
    bg: "bg-brand-sky/15 dark:bg-brand-sky/20",
    text: "text-brand-royal dark:text-brand-sky",
    border: "border-brand-sky/35",
    icon: faBoxOpen,
  },
  Enviado: {
    label: "Enviado",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    icon: faTruck,
  },
  Entregado: {
    label: "Entregado",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: faCheckCircle,
  },
  Cancelado: {
    label: "Cancelado",
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    icon: faBan,
  },
};

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(MOCK_PEDIDOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("all");
  const [selectedMetodo, setSelectedMetodo] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "fecha",
    direction: "desc",
  });

  // Modal Detalle
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal Cambiar Estado
  const [pedidoToUpdate, setPedidoToUpdate] = useState<Pedido | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido>("Pendiente");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const totalPedidos = pedidos.length;
    const pendientes = pedidos.filter((p) => p.estado === "Pendiente").length;
    const enProceso = pedidos.filter((p) => p.estado === "En Preparación" || p.estado === "Enviado").length;
    const facturacionTotal = pedidos
      .filter((p) => p.estado !== "Cancelado")
      .reduce((sum, p) => sum + p.total, 0);

    return { totalPedidos, pendientes, enProceso, facturacionTotal };
  }, [pedidos]);

  // Manejo de ordenamiento
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Filtrado y ordenación
  const filteredPedidos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return pedidos
      .filter((p) => {
        // Búsqueda por código, cliente, email, ciudad o teléfono
        const matchesQuery =
          !q ||
          p.codigoPedido.toLowerCase().includes(q) ||
          p.cliente.nombre.toLowerCase().includes(q) ||
          p.cliente.email.toLowerCase().includes(q) ||
          p.cliente.ciudad.toLowerCase().includes(q) ||
          p.cliente.documento.includes(q);

        // Filtro por Estado
        const matchesEstado = selectedEstado === "all" || p.estado === selectedEstado;

        // Filtro por Método de Pago
        const matchesMetodo = selectedMetodo === "all" || p.metodoPago === selectedMetodo;

        return matchesQuery && matchesEstado && matchesMetodo;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "fecha") {
          return (new Date(a.fecha).getTime() - new Date(b.fecha).getTime()) * factor;
        }
        if (sortConfig.key === "total") {
          return (a.total - b.total) * factor;
        }
        if (sortConfig.key === "codigoPedido") {
          return a.codigoPedido.localeCompare(b.codigoPedido) * factor;
        }
        if (sortConfig.key === "cliente") {
          return a.cliente.nombre.localeCompare(b.cliente.nombre) * factor;
        }
        return 0;
      });
  }, [pedidos, searchQuery, selectedEstado, selectedMetodo, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPedidos.slice(start, start + itemsPerPage);
  }, [filteredPedidos, currentPage, itemsPerPage]);

  const handleOpenDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDetailOpen(true);
  };

  const handleOpenStatusModal = (pedido: Pedido) => {
    setPedidoToUpdate(pedido);
    setNuevoEstado(pedido.estado);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!pedidoToUpdate) return;

    setPedidos((prev) =>
      prev.map((p) =>
        p.idPedido === pedidoToUpdate.idPedido ? { ...p, estado: nuevoEstado } : p
      )
    );

    setIsStatusModalOpen(false);

    // Actualizar también en el detalle si está abierto
    if (selectedPedido && selectedPedido.idPedido === pedidoToUpdate.idPedido) {
      setSelectedPedido({ ...selectedPedido, estado: nuevoEstado });
    }

    Toast.fire({
      icon: "success",
      title: `Estado actualizado a "${nuevoEstado}"`,
    });
  };

  const handleImprimirComprobante = () => {
    window.print();
  };

  const handleReiniciarFiltros = () => {
    setSearchQuery("");
    setSelectedEstado("all");
    setSelectedMetodo("all");
    setCurrentPage(1);
  };

  // Definición de columnas de la tabla
  const columns: TableColumn<Pedido>[] = [
    {
      key: "codigoPedido",
      header: "Código / Fecha",
      sortable: true,
      render: (pedido) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-brand-navy dark:text-white text-sm">
            {pedido.codigoPedido}
          </span>
          <span className="text-[11px] text-app-muted flex items-center gap-1 mt-0.5">
            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
            {formatDate(pedido.fecha)}
          </span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente / Destino",
      sortable: true,
      render: (pedido) => (
        <div className="flex flex-col min-w-44">
          <span className="font-bold text-app-text text-sm truncate" title={pedido.cliente.nombre}>
            {pedido.cliente.nombre}
          </span>
          <div className="flex items-center gap-2 text-xs text-app-muted mt-0.5">
            <span className="truncate">{pedido.cliente.ciudad}</span>
            <span>&bull;</span>
            <span className="text-[11px]">{pedido.cliente.tipoDocumento}: {pedido.cliente.documento}</span>
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Artículos",
      render: (pedido) => {
        const totalPares = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
        return (
          <div className="flex items-center gap-2">
            <span className="badge-navy text-[11px] py-1 px-2.5 font-bold">
              {totalPares} {totalPares === 1 ? "par" : "pares"}
            </span>
            <span className="text-xs text-app-muted truncate hidden lg:inline max-w-44" title={pedido.items.map((i) => i.nombreProducto).join(", ")}>
              ({pedido.items.length} {pedido.items.length === 1 ? "ref" : "refs"})
            </span>
          </div>
        );
      },
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
      render: (pedido) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-app-surface-alt border border-app-border text-app-text">
          {pedido.metodoPago}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      align: "right",
      render: (pedido) => (
        <div className="text-right">
          <span className="font-extrabold text-brand-royal dark:text-brand-sky text-sm">
            {formatCOP(pedido.total)}
          </span>
          {pedido.descuentoTotal > 0 && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
              Desc: {formatCOP(pedido.descuentoTotal)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (pedido) => {
        const cfg = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.Pendiente;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStatusModal(pedido);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-transform hover:scale-105 cursor-pointer shadow-2xs ${cfg.bg} ${cfg.text} ${cfg.border}`}
            title="Haz clic para cambiar estado"
          >
            <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />
            <span>{cfg.label}</span>
          </button>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (pedido) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(pedido)}
            className="p-2 rounded-xl text-brand-royal dark:text-brand-sky hover:bg-brand-sky/15 dark:hover:bg-brand-sky/20 transition-colors cursor-pointer"
            title="Ver detalle del pedido"
            aria-label={`Ver pedido ${pedido.codigoPedido}`}
          >
            <FontAwesomeIcon icon={faEye} className="text-sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado de la Sección ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sky/15 text-brand-royal dark:text-brand-sky border border-brand-sky/30 text-xs font-bold tracking-wider uppercase mb-2">
            <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
            <span>Gestión de Ventas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
            Pedidos de Clientes
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Supervisa, gestiona y despacha los pedidos generados desde la tienda en línea y compras mayoristas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={() => {
              setPedidos(MOCK_PEDIDOS);
              Toast.fire({ icon: "info", title: "Listado de pedidos sincronizado" });
            }}
          >
            Sincronizar
          </Button>
        </div>
      </div>

      {/* ─── Tarjetas de Métricas Ejecutivas ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pedidos */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Total Pedidos
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              {metrics.totalPedidos}
            </p>
            <span className="text-[11px] text-brand-royal dark:text-brand-sky font-medium">
              Histórico registrado
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faBoxesStacked} />
          </div>
        </div>

        {/* Pendientes */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pendientes
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              {metrics.pendientes}
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              Por confirmar o pago
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faClock} />
          </div>
        </div>

        {/* En Preparación / Tránsito */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              En Tránsito / Prep
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              {metrics.enProceso}
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              Bodega y logística
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-sky/20 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faTruck} />
          </div>
        </div>

        {/* Facturación Activa */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Facturación Total
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCOP(metrics.facturacionTotal)}
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              Excluye cancelados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faFileInvoiceDollar} />
          </div>
        </div>
      </div>

      {/* ─── Barra de Filtros y Búsqueda ─── */}
      <div className="isabel-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Búsqueda principal */}
          <div className="sm:col-span-12 lg:col-span-5">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por código, cliente, email, documento o ciudad..."
              iconLeft={faMagnifyingGlass}
            />
          </div>

          {/* Filtro Estado */}
          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "Pendiente", label: "Pendiente" },
                { value: "En Preparación", label: "En Preparación" },
                { value: "Enviado", label: "Enviado" },
                { value: "Entregado", label: "Entregado" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
            />
          </div>

          {/* Filtro Método de Pago */}
          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={selectedMetodo}
              onChange={(e) => {
                setSelectedMetodo(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Todos los Métodos" },
                { value: "Wompi / PSE", label: "Wompi / PSE" },
                { value: "Transferencia Bancaria", label: "Transferencia Bancaria" },
                { value: "Contra Entrega", label: "Contra Entrega" },
                { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
                { value: "Efectivo Bodega", label: "Efectivo Bodega" },
              ]}
            />
          </div>

          {/* Botón limpiar */}
          <div className="sm:col-span-12 lg:col-span-1 flex justify-end">
            <Button
              variant="ghost"
              onClick={handleReiniciarFiltros}
              title="Restablecer filtros"
              className="w-full sm:w-auto text-xs"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Tabla Principal de Pedidos ─── */}
      <Table<Pedido>
        columns={columns}
        data={paginatedData}
        rowKey="idPedido"
        onRowClick={(pedido) => handleOpenDetail(pedido)}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyTitle="No se encontraron pedidos"
        emptyDescription="Intenta ajustar tus criterios de búsqueda o limpia los filtros activos."
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredPedidos.length,
          itemsPerPage,
          onPageChange: (p) => setCurrentPage(p),
          onItemsPerPageChange: (size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 12, 20],
        }}
      />

      {/* ─── Modal Detalle Completo del Pedido ─── */}
      {selectedPedido && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detalle de Pedido: ${selectedPedido.codigoPedido}`}
          description={`Generado el ${formatDate(selectedPedido.fecha)}`}
          icon={faReceipt}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                icon={faPrint}
                onClick={handleImprimirComprobante}
              >
                Imprimir Recibo
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleOpenStatusModal(selectedPedido);
                  }}
                >
                  Cambiar Estado
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Header del Pedido: Estado + Método de Pago */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-app-surface-alt border border-app-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Estado Actual:</span>
                {(() => {
                  const cfg = ESTADO_CONFIG[selectedPedido.estado] || ESTADO_CONFIG.Pendiente;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />
                      <span>{cfg.label}</span>
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-app-muted">Método de Pago:</span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-sky/15 text-brand-royal dark:text-brand-sky border border-brand-sky/30">
                  {selectedPedido.metodoPago}
                </span>
              </div>
            </div>

            {/* Datos del Cliente y Envío */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Información del Cliente</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-app-text text-sm">{selectedPedido.cliente.nombre}</p>
                  <p className="text-xs text-app-muted flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                    {selectedPedido.cliente.email}
                  </p>
                  <p className="text-xs text-app-muted flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                    {selectedPedido.cliente.telefono}
                  </p>
                  <p className="text-xs text-app-muted">
                    {selectedPedido.cliente.tipoDocumento}: <strong className="text-app-text">{selectedPedido.cliente.documento}</strong>
                  </p>
                </div>
              </div>

              {/* Destino y Logística */}
              <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>Destino de Envío</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-app-text text-sm">{selectedPedido.cliente.ciudad}</p>
                  <p className="text-xs text-app-muted">{selectedPedido.cliente.direccion}</p>
                  {selectedPedido.transportadora && (
                    <div className="pt-1 mt-1 border-t border-app-border/60 text-xs">
                      <span className="text-app-muted">Transportadora: </span>
                      <strong className="text-app-text">{selectedPedido.transportadora}</strong>
                      {selectedPedido.guiaTransportadora && (
                        <span className="block text-[11px] text-brand-sky font-semibold">
                          Guía: {selectedPedido.guiaTransportadora}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Calzado / Ítems */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-app-text">
                Calzado Seleccionado ({selectedPedido.items.length})
              </h3>
              <div className="space-y-2">
                {selectedPedido.items.map((item) => (
                  <div
                    key={item.idItem}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-app-surface-alt border border-app-border"
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombreProducto}
                      className="w-14 h-14 rounded-xl object-cover border border-app-border shrink-0 bg-white"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/shoesGreenSplash.jpg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-app-text text-sm truncate">{item.nombreProducto}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-app-muted">
                        <span className="badge-navy text-[10px] py-0.5 px-2">SKU: {item.sku}</span>
                        <span>Color: <strong className="text-app-text">{item.color}</strong></span>
                        <span>&bull;</span>
                        <span>Talla: <strong className="text-app-text">{item.talla}</strong></span>
                        <span>&bull;</span>
                        <span>Cant: <strong className="text-app-text">{item.cantidad}</strong></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-brand-royal dark:text-brand-sky block">
                        {formatCOP(item.subtotal)}
                      </span>
                      {item.descuento > 0 && (
                        <span className="text-[10px] font-bold text-rose-500 block">
                          -{item.descuento}% desc.
                        </span>
                      )}
                      <span className="text-[10px] text-app-muted block">
                        {formatCOP(item.precioUnitario)} c/u
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas del Pedido si existen */}
            {selectedPedido.notas && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                  Notas / Instrucciones del Cliente:
                </span>
                <p className="text-amber-900/90 dark:text-amber-200">{selectedPedido.notas}</p>
              </div>
            )}

            {/* Resumen Financiero */}
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2">
              <div className="flex justify-between text-xs text-app-muted">
                <span>Subtotal ({selectedPedido.items.reduce((s, i) => s + i.cantidad, 0)} pares):</span>
                <span className="font-semibold text-app-text">{formatCOP(selectedPedido.subtotal)}</span>
              </div>
              {selectedPedido.descuentoTotal > 0 && (
                <div className="flex justify-between text-xs text-rose-500">
                  <span>Descuentos aplicados:</span>
                  <span className="font-semibold">-{formatCOP(selectedPedido.descuentoTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-app-muted">
                <span>Costo de Despacho / Envío:</span>
                <span className="font-semibold text-app-text">
                  {selectedPedido.costoEnvio === 0 ? "Gratis (Mayorista)" : formatCOP(selectedPedido.costoEnvio)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-app-border text-base">
                <span className="font-extrabold text-app-text">Total Liquidado:</span>
                <span className="text-xl font-black text-brand-royal dark:text-brand-sky">
                  {formatCOP(selectedPedido.total)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modal Actualizar Estado de Pedido ─── */}
      {pedidoToUpdate && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Actualizar Estado del Pedido"
          description={`Pedido: ${pedidoToUpdate.codigoPedido} • ${pedidoToUpdate.cliente.nombre}`}
          icon={faBoxesStacked}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
              >
                Guardar Cambio
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-app-muted">
              Selecciona la nueva etapa logística para este pedido. Esto actualizará el flujo de despacho en bodega.
            </p>

            <div className="space-y-2">
              {(
                [
                  "Pendiente",
                  "En Preparación",
                  "Enviado",
                  "Entregado",
                  "Cancelado",
                ] as EstadoPedido[]
              ).map((est) => {
                const cfg = ESTADO_CONFIG[est];
                const isSelected = nuevoEstado === est;
                return (
                  <label
                    key={est}
                    onClick={() => setNuevoEstado(est)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-royal/10 dark:bg-brand-sky/15 border-brand-royal dark:border-brand-sky ring-2 ring-brand-sky/20"
                        : "bg-app-surface border-app-border hover:bg-brand-sky/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${cfg.bg} ${cfg.text}`}>
                        <FontAwesomeIcon icon={cfg.icon} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-app-text">{est}</p>
                        <p className="text-[11px] text-app-muted">
                          {est === "Pendiente" && "Esperando confirmación o pago del cliente"}
                          {est === "En Preparación" && "En empaque y alistamiento en bodega"}
                          {est === "Enviado" && "En camino con guía transportadora"}
                          {est === "Entregado" && "Entregado satisfactoriamente al cliente"}
                          {est === "Cancelado" && "Pedido anulado o devuelto"}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="estadoPedido"
                      value={est}
                      checked={isSelected}
                      onChange={() => setNuevoEstado(est)}
                      className="text-brand-royal focus:ring-brand-sky"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

