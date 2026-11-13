import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBagShopping,
    faMagnifyingGlass,
    faEye,
    faClock,
    faBoxOpen,
    faTruck,
    faCheckCircle,
    faBan,
    faReceipt,
    faLocationDot,
    faPhone,
    faPrint,
    faArrowRight,
    faShieldHalved,
    faCircleInfo,
    faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";

import type { Pedido, EstadoPedido } from "../../../@types/Orders";
import { MOCK_PEDIDOS } from "../../../data/orders";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Select } from "../../../shared/components/Inputs/Select";
import Modal from "../../../shared/components/Modal";
import { useUser } from "../../../shared/hooks/useUser";

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

// Configuraciones visuales por estado adaptadas para el cliente
const ESTADO_CONFIG: Record<
    EstadoPedido,
    { label: string; bg: string; text: string; border: string; icon: typeof faClock; description: string }
> = {
    Pendiente: {
        label: "En Revisión de Pago",
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
        icon: faClock,
        description: "Estamos validando tu comprobante de transferencia bancaria.",
    },
    "En Preparación": {
        label: "En Preparación",
        bg: "bg-brand-sky/15 dark:bg-brand-sky/20",
        text: "text-brand-royal dark:text-brand-sky",
        border: "border-brand-sky/35",
        icon: faBoxOpen,
        description: "Tus pares están siendo empacados y rotulados en bodega.",
    },
    Enviado: {
        label: "En Camino",
        bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-500/30",
        icon: faTruck,
        description: "Tu pedido viaja con la transportadora hacia tu dirección.",
    },
    Entregado: {
        label: "Entregado",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-500/30",
        icon: faCheckCircle,
        description: "Pedido entregado a satisfacción.",
    },
    Cancelado: {
        label: "Cancelado",
        bg: "bg-rose-500/10 dark:bg-rose-500/15",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-500/30",
        icon: faBan,
        description: "Pedido cancelado.",
    },
};

export default function OrdersPageByUser() {
    const { user } = useUser();

    // Lista de pedidos del usuario (mockeados con una experiencia personalizada para B2C)
    const [pedidos] = useState<Pedido[]>(() => {
        // Adaptamos los pedidos asignándoles el nombre y correo del usuario si está en sesión
        const userNombre = user?.name || "Juan Camilo Osorio";
        const userEmail = user?.email || "osoriojuancamilo315@gmail.com";

        return MOCK_PEDIDOS.slice(0, 4).map((p, index) => ({
            ...p,
            cliente: {
                ...p.cliente,
                nombre: userNombre,
                email: userEmail,
                ciudad: index % 2 === 0 ? "Medellín, Antioquia" : "Envigado, Antioquia",
                direccion: "Carrera 45 # 68 - 24, Barrio El Poblado",
            },
        }));
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string>("all");

    // Paginación y ordenación
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(6);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "fecha",
        direction: "desc",
    });

    // Modal Detalle
    const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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
                const matchesQuery =
                    !q ||
                    p.codigoPedido.toLowerCase().includes(q) ||
                    p.items.some((item) => item.nombreProducto.toLowerCase().includes(q)) ||
                    p.items.some((item) => item.sku.toLowerCase().includes(q));

                const matchesEstado = selectedEstado === "all" || p.estado === selectedEstado;

                return matchesQuery && matchesEstado;
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
                return 0;
            });
    }, [pedidos, searchQuery, selectedEstado, sortConfig]);

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

    const handleImprimirComprobante = () => {
        window.print();
    };

    // Definición de columnas de la tabla (enfocada al cliente, sin botones de edición administrativa)
    const columns: TableColumn<Pedido>[] = [
        {
            key: "codigoPedido",
            header: "Pedido / Fecha",
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
            key: "items",
            header: "Calzado Adquirido",
            render: (pedido) => {
                const totalPares = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
                return (
                    <div className="flex items-center gap-2">
                        <span className="badge-navy text-[11px] py-1 px-2.5 font-bold">
                            {totalPares} {totalPares === 1 ? "par" : "pares"}
                        </span>
                        <span
                            className="text-xs text-app-muted truncate hidden sm:inline max-w-56"
                            title={pedido.items.map((i) => i.nombreProducto).join(", ")}
                        >
                            {pedido.items[0]?.nombreProducto}
                            {pedido.items.length > 1 && ` +${pedido.items.length - 1} más`}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "metodoPago",
            header: "Forma de Pago",
            render: (pedido) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-app-surface-alt border border-app-border text-app-text">
                    {pedido.metodoPago}
                </span>
            ),
        },
        {
            key: "total",
            header: "Total Pagado",
            sortable: true,
            align: "right",
            render: (pedido) => (
                <div className="text-right">
                    <span className="font-extrabold text-brand-royal dark:text-brand-sky text-sm">
                        {formatCOP(pedido.total)}
                    </span>
                    {pedido.descuentoTotal > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                            Ahorro: {formatCOP(pedido.descuentoTotal)}
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
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                        <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />
                        <span>{cfg.label}</span>
                    </span>
                );
            },
        },
        {
            key: "acciones",
            header: "Detalles",
            align: "right",
            render: (pedido) => (
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => handleOpenDetail(pedido)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-royal dark:text-brand-sky bg-brand-royal/10 dark:bg-brand-sky/15 hover:bg-brand-royal/20 transition-colors cursor-pointer"
                        title="Ver detalle del pedido"
                    >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                        <span className="hidden sm:inline">Ver Orden</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-app-surface text-app-text pt-10 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
                {/* ─── Encabezado de la Página de Cliente ─── */}
                <div data-aos="fade-down" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-app-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-royal/10 text-brand-royal dark:text-brand-sky border border-brand-royal/20 text-xs font-bold tracking-wider uppercase mb-2">
                            <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                            <span>Mis Compras</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
                            Historial de Mis Pedidos
                        </h1>
                        <p className="text-xs sm:text-sm text-app-muted mt-1 max-w-xl">
                            Revisa el estado de tus compras de calzado, guías de envío y comprobantes de despacho directo de bodega.
                        </p>
                    </div>

                    <Link to="/catalog">
                        <Button variant="primary" icon={faArrowRight}>
                            Hacer Nuevo Pedido
                        </Button>
                    </Link>
                </div>

                {/* ─── Tarjeta Informativa Resumen del Usuario ─── */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="100"
                    className="p-4 sm:p-5 rounded-3xl bg-app-surface-alt border border-app-border flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shrink-0">
                            <FontAwesomeIcon icon={faBoxesStacked} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-app-text">
                                {user?.name || "Juan Camilo Osorio"}
                            </h2>
                            <p className="text-xs text-app-muted">
                                Tienes <strong className="text-brand-royal dark:text-brand-sky">{pedidos.length} pedidos</strong> registrados con nosotros
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-app-muted bg-app-surface px-3 py-2 rounded-xl border border-app-border">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500" />
                        <span>Todos tus pedidos cuentan con garantía de fábrica ISABEL</span>
                    </div>
                </div>

                {/* ─── Filtros y Búsqueda ─── */}
                <div data-aos="fade-up" data-aos-delay="150" className="isabel-card p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                        <div className="sm:col-span-8 lg:col-span-9">
                            <Input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Buscar por código de pedido, modelo de zapato o SKU..."
                                iconLeft={faMagnifyingGlass}
                            />
                        </div>

                        <div className="sm:col-span-4 lg:col-span-3">
                            <Select
                                value={selectedEstado}
                                onChange={(e) => {
                                    setSelectedEstado(e.target.value);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: "all", label: "Todos los Estados" },
                                    { value: "Pendiente", label: "En Revisión de Pago" },
                                    { value: "En Preparación", label: "En Preparación" },
                                    { value: "Enviado", label: "En Camino" },
                                    { value: "Entregado", label: "Entregado" },
                                    { value: "Cancelado", label: "Cancelado" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* ─── Tabla de Pedidos del Usuario ─── */}
                <Table<Pedido>
                    columns={columns}
                    data={paginatedData}
                    rowKey="idPedido"
                    onRowClick={(pedido) => handleOpenDetail(pedido)}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    emptyTitle="No tienes pedidos registrados"
                    emptyDescription="Cuando realices una compra de calzado, podrás monitorear aquí todo el proceso de entrega."
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
                        pageSizeOptions: [4, 6, 10],
                    }}
                />

                {/* ─── Modal Detalle del Pedido (Solo Lectura e Imprimir) ─── */}
                {selectedPedido && (
                    <Modal
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        title={`Detalle de tu Pedido: ${selectedPedido.codigoPedido}`}
                        description={`Registrado el ${formatDate(selectedPedido.fecha)}`}
                        icon={faReceipt}
                        size="xl"
                        footer={
                            <div className="flex items-center justify-between w-full">
                                <Button
                                    variant="outline"
                                    icon={faPrint}
                                    onClick={handleImprimirComprobante}
                                >
                                    Imprimir Comprobante
                                </Button>

                                <Button
                                    variant="primary"
                                    onClick={() => setIsDetailOpen(false)}
                                >
                                    Entendido
                                </Button>
                            </div>
                        }
                    >
                        <div className="space-y-6 text-sm">
                            {/* Encabezado: Estado + Mensaje descriptivo */}
                            <div className="p-4 rounded-2xl bg-app-surface-alt border border-app-border space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-app-muted">Estado del pedido:</span>
                                        {(() => {
                                            const cfg = ESTADO_CONFIG[selectedPedido.estado] || ESTADO_CONFIG.Pendiente;
                                            return (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                                >
                                                    <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />
                                                    <span>{cfg.label}</span>
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-app-muted">Método:</span>
                                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-sky/15 text-brand-royal dark:text-brand-sky border border-brand-sky/30">
                                            {selectedPedido.metodoPago}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-app-muted flex items-center gap-1.5 pt-1 border-t border-app-border/60">
                                    <FontAwesomeIcon icon={faCircleInfo} className="text-brand-royal dark:text-brand-sky" />
                                    {ESTADO_CONFIG[selectedPedido.estado]?.description}
                                </p>
                            </div>

                            {/* Logística y Destino de Envío */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky flex items-center gap-2">
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        Dirección de Entrega
                                    </span>
                                    <p className="font-bold text-app-text">{selectedPedido.cliente.nombre}</p>
                                    <p className="text-xs text-app-muted">{selectedPedido.cliente.direccion}</p>
                                    <p className="text-xs text-app-muted">{selectedPedido.cliente.ciudad}</p>
                                    <div className="text-xs text-app-muted pt-1 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPhone} className="text-emerald-500 text-[10px]" />
                                        <span>{selectedPedido.cliente.telefono}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTruck} />
                                        Información de Envío
                                    </span>
                                    {selectedPedido.transportadora ? (
                                        <div className="space-y-1">
                                            <p className="text-xs text-app-muted">
                                                Transportadora: <strong className="text-app-text">{selectedPedido.transportadora}</strong>
                                            </p>
                                            {selectedPedido.guiaTransportadora && (
                                                <p className="text-xs text-app-muted">
                                                    Número de Guía:{" "}
                                                    <strong className="text-brand-royal dark:text-brand-sky font-mono font-bold">
                                                        {selectedPedido.guiaTransportadora}
                                                    </strong>
                                                </p>
                                            )}
                                            <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                                                Despachado directamente desde Bodega ISABEL
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-app-muted leading-relaxed">
                                            El número de guía y transportadora se asignarán automáticamente una vez empacado el calzado.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Lista de Calzado / Ítems */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-app-text">
                                    Pares en esta orden ({selectedPedido.items.length})
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
                                                    <span>Color: <strong className="text-app-text">{item.color}</strong></span>
                                                    <span>&bull;</span>
                                                    <span>Talla: <strong className="text-app-text">{item.talla}</strong></span>
                                                    <span>&bull;</span>
                                                    <span>Cantidad: <strong className="text-app-text">{item.cantidad}</strong></span>
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

                            {/* Resumen Financiero */}
                            <div className="p-4 rounded-2xl bg-app-surface border border-app-border space-y-2">
                                <div className="flex justify-between text-xs text-app-muted">
                                    <span>Subtotal calzado:</span>
                                    <span className="font-semibold text-app-text">{formatCOP(selectedPedido.subtotal)}</span>
                                </div>
                                {selectedPedido.descuentoTotal > 0 && (
                                    <div className="flex justify-between text-xs text-rose-500">
                                        <span>Descuentos aplicados:</span>
                                        <span className="font-semibold">-{formatCOP(selectedPedido.descuentoTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-app-muted">
                                    <span>Despacho de bodega:</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {selectedPedido.costoEnvio === 0 ? "Gratis" : formatCOP(selectedPedido.costoEnvio)}
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
            </div>
        </div>
    );
}
