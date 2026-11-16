import { useState, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faReceipt,
  faFileInvoiceDollar,
  faTruckFast,
  faTruck,
  faBoxesStacked,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faClock,
  faPrint,
  faChartPie,
  faFilter,
  faBuilding,
  faShoePrints,
  faMoneyBillWave,
  faTriangleExclamation,
  faCheck,
  faBan,
  faWarehouse,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";
import { MOCK_PROVEEDORES } from "../Proveedores/constants";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";

// ==========================================
// Tipos y Modelos de Datos de Compras
// ==========================================

export type EstadoCompra =
  | "Pendiente"
  | "Aprobada"
  | "En Tránsito"
  | "Recibida"
  | "Cancelada";

export type MetodoPagoCompra =
  | "Contado"
  | "Crédito 15 días"
  | "Crédito 30 días"
  | "Crédito 60 días"
  | "Transferencia";

export interface DetalleProductoCompra {
  idDetalle: string;
  idProducto: number;
  nombreProducto: string;
  sku: string;
  color: string;
  talla: string;
  cantidad: number;
  precioUnitarioCompra: number;
  subtotal: number;
  imagen?: string;
}

export interface HistorialSeguimiento {
  id: string;
  estado: EstadoCompra;
  fecha: string; // ISO
  usuario: string;
  comentario: string;
}

export interface Compra {
  idCompra: string;
  numeroOrden: string; // Ej: OC-2026-0001
  fechaEmision: string; // ISO
  fechaEntregaEsperada: string; // YYYY-MM-DD
  fechaRecepcionReal?: string; // ISO
  idProveedor: string;
  nombreProveedor: string;
  nitProveedor: string;
  telefonoProveedor: string;
  emailProveedor: string;
  ciudadProveedor: string;
  direccionProveedor: string;
  numeroFacturaProveedor?: string;
  usuarioResponsable: string;
  metodoPago: MetodoPagoCompra;
  estado: EstadoCompra;
  transportadora?: string;
  numeroGuia?: string;
  detalles: DetalleProductoCompra[];
  subtotal: number;
  descuento: number;
  fleteEnvio: number;
  iva: number;
  total: number;
  observaciones?: string;
  motivoCancelacion?: string;
  historialEstados: HistorialSeguimiento[];
}

// Configuración de Estados con estilos y flujo
const ESTADO_CONFIG: Record<
  EstadoCompra,
  {
    label: string;
    badgeClass: string;
    icon: IconDefinition;
    step: number;
    colorTexto: string;
    descripcion: string;
  }
> = {
  Pendiente: {
    label: "Pendiente",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    icon: faClock,
    step: 1,
    colorTexto: "text-amber-600 dark:text-amber-400",
    descripcion: "Orden de compra generada, en espera de aprobación administrativa.",
  },
  Aprobada: {
    label: "Aprobada",
    badgeClass:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    icon: faCircleCheck,
    step: 2,
    colorTexto: "text-blue-600 dark:text-blue-400",
    descripcion: "Autorizada por gerencia y enviada formalmente al proveedor.",
  },
  "En Tránsito": {
    label: "En Tránsito",
    badgeClass:
      "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: faTruckFast,
    step: 3,
    colorTexto: "text-purple-600 dark:text-purple-400",
    descripcion: "Despachada por el proveedor y en camino con transportadora.",
  },
  Recibida: {
    label: "Recibida",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    icon: faBoxesStacked,
    step: 4,
    colorTexto: "text-emerald-600 dark:text-emerald-400",
    descripcion: "Mercancía recibida e inspeccionada en bodega de Calzado Isabel.",
  },
  Cancelada: {
    label: "Cancelada",
    badgeClass:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    icon: faBan,
    step: 0,
    colorTexto: "text-rose-600 dark:text-rose-400",
    descripcion: "Orden de compra cancelada / anulada por la organización.",
  },
};

// Transportadoras comunes en Colombia
const TRANSPORTADORAS = [
  "Servientrega",
  "Envía Colvanes",
  "Coordinadora Mercantil",
  "Interrapidísimo",
  "TCC",
  "Deprisa",
  "Vehículo Propio / Recogida en Fábrica",
];

// Opciones de Forma de Pago
const METODOS_PAGO: MetodoPagoCompra[] = [
  "Contado",
  "Crédito 15 días",
  "Crédito 30 días",
  "Crédito 60 días",
  "Transferencia",
];

// Formateadores auxiliares
const formatCOP = (val: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
};

const formatDateShort = (isoString?: string): string => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
    }).format(d);
  } catch {
    return isoString;
  }
};

const generarId = (prefijo: string) =>
  `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ==========================================
// Datos Iniciales de Prueba (Órdenes de Compra)
// ==========================================

const MOCK_COMPRAS_INICIALES: Compra[] = [
  {
    idCompra: "cmp-001",
    numeroOrden: "OC-2026-0001",
    fechaEmision: "2026-02-05T09:30:00",
    fechaEntregaEsperada: "2026-02-14",
    fechaRecepcionReal: "2026-02-14T11:20:00",
    idProveedor: "prov-001",
    nombreProveedor: "Curtidos La Sabana S.A.S.",
    nitProveedor: "900.842.105-3",
    telefonoProveedor: "+57 (601) 789 4520",
    emailProveedor: "ventas@curtidoslasabana.com",
    ciudadProveedor: "Bogotá D.C.",
    direccionProveedor: "Calle 17 # 68D-42 Zona Industrial",
    numeroFacturaProveedor: "FAC-8842",
    usuarioResponsable: "Carlos Mendoza (Jefe de Compras)",
    metodoPago: "Crédito 30 días",
    estado: "Recibida",
    transportadora: "Servientrega",
    numeroGuia: "SER-78452109",
    detalles: [
      {
        idDetalle: "det-101",
        idProducto: 1,
        nombreProducto: "Nike Air Force 1 '07",
        sku: "NK-AF1-001",
        color: "Blanco Clásico",
        talla: "42 (US 9)",
        cantidad: 20,
        precioUnitarioCompra: 160000,
        subtotal: 3200000,
        imagen:
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80",
      },
      {
        idDetalle: "det-102",
        idProducto: 1,
        nombreProducto: "Nike Air Force 1 '07",
        sku: "NK-AF1-001",
        color: "Negro Total",
        talla: "43 (US 10)",
        cantidad: 15,
        precioUnitarioCompra: 160000,
        subtotal: 2400000,
        imagen:
          "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=80",
      },
      {
        idDetalle: "det-103",
        idProducto: 2,
        nombreProducto: "Adidas Ultraboost Light",
        sku: "AD-UBL-002",
        color: "Rojo Escarlata",
        talla: "41 (US 8.5)",
        cantidad: 10,
        precioUnitarioCompra: 220000,
        subtotal: 2200000,
        imagen:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
      },
    ],
    subtotal: 7800000,
    descuento: 0,
    fleteEnvio: 60000,
    iva: 1482000,
    total: 9342000,
    observaciones:
      "Pedido de reposición para el inicio de temporada. Calzado recibido en perfectas condiciones y verificado en bodega.",
    historialEstados: [
      {
        id: "hst-001",
        estado: "Pendiente",
        fecha: "2026-02-05T09:30:00",
        usuario: "Carlos Mendoza",
        comentario: "Orden de compra generada y emitida al proveedor.",
      },
      {
        id: "hst-002",
        estado: "Aprobada",
        fecha: "2026-02-06T11:00:00",
        usuario: "Administración Isabel",
        comentario: "Orden aprobada por gerencia de finanzas. Despacho confirmado.",
      },
      {
        id: "hst-003",
        estado: "En Tránsito",
        fecha: "2026-02-10T16:45:00",
        usuario: "Carlos Mendoza",
        comentario: "Proveedor despachó vía Servientrega Guía SER-78452109.",
      },
      {
        id: "hst-004",
        estado: "Recibida",
        fecha: "2026-02-14T11:20:00",
        usuario: "Almacén Central",
        comentario:
          "45 pares recibidos, inventario ingresado al ERP con total conformidad.",
      },
    ],
  },
  {
    idCompra: "cmp-002",
    numeroOrden: "OC-2026-0002",
    fechaEmision: "2026-02-11T14:15:00",
    fechaEntregaEsperada: "2026-02-20",
    idProveedor: "prov-002",
    nombreProveedor: "Industrias Caucho SuelaFlex Ltda.",
    nitProveedor: "890.312.440-1",
    telefonoProveedor: "+57 (604) 448 9110",
    emailProveedor: "contacto@suelaflex.com.co",
    ciudadProveedor: "Medellín",
    direccionProveedor: "Carrera 50 # 32-85",
    numeroFacturaProveedor: "SFX-5120",
    usuarioResponsable: "Carlos Mendoza (Jefe de Compras)",
    metodoPago: "Contado",
    estado: "En Tránsito",
    transportadora: "Envía Colvanes",
    numeroGuia: "ENV-9932014",
    detalles: [
      {
        idDetalle: "det-201",
        idProducto: 3,
        nombreProducto: "Puma Suede Classic XXI",
        sku: "PM-SDC-003",
        color: "Negro Gamuzado",
        talla: "40 (US 7.5)",
        cantidad: 25,
        precioUnitarioCompra: 140000,
        subtotal: 3500000,
        imagen:
          "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80",
      },
      {
        idDetalle: "det-202",
        idProducto: 4,
        nombreProducto: "Vans Old Skool Classic",
        sku: "VN-OSK-004",
        color: "Azul Marino / Blanco",
        talla: "39 (US 7)",
        cantidad: 20,
        precioUnitarioCompra: 135000,
        subtotal: 2700000,
        imagen:
          "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80",
      },
    ],
    subtotal: 6200000,
    descuento: 100000,
    fleteEnvio: 80000,
    iva: 1159000,
    total: 7339000,
    observaciones:
      "Despacho desde planta Medellín. Cajas y empaques individuales con sello de garantía.",
    historialEstados: [
      {
        id: "hst-005",
        estado: "Pendiente",
        fecha: "2026-02-11T14:15:00",
        usuario: "Carlos Mendoza",
        comentario: "Creación de la orden tras cotización aprobada.",
      },
      {
        id: "hst-006",
        estado: "Aprobada",
        fecha: "2026-02-12T09:00:00",
        usuario: "Administración Isabel",
        comentario: "Pago de contado realizado por tesorería vía transferencia.",
      },
      {
        id: "hst-007",
        estado: "En Tránsito",
        fecha: "2026-02-13T17:10:00",
        usuario: "Carlos Mendoza",
        comentario: "Guía Envía Colvanes ENV-9932014 activa. En ruta Medellín - Bogotá.",
      },
    ],
  },
  {
    idCompra: "cmp-003",
    numeroOrden: "OC-2026-0003",
    fechaEmision: "2026-02-13T10:00:00",
    fechaEntregaEsperada: "2026-02-25",
    idProveedor: "prov-003",
    nombreProveedor: "Hernando Silva (Herrajes El Artesano)",
    nitProveedor: "79.845.210",
    telefonoProveedor: "+57 314 258 7963",
    emailProveedor: "h.silva.artesano@gmail.com",
    ciudadProveedor: "Bogotá D.C.",
    direccionProveedor: "Carrera 22 # 11-14 Barrio Restrepo",
    usuarioResponsable: "Carlos Mendoza (Jefe de Compras)",
    metodoPago: "Crédito 15 días",
    estado: "Aprobada",
    detalles: [
      {
        idDetalle: "det-301",
        idProducto: 5,
        nombreProducto: "New Balance 574 Core",
        sku: "NB-574-005",
        color: "Gris Heritage",
        talla: "41 (US 8.5)",
        cantidad: 15,
        precioUnitarioCompra: 175000,
        subtotal: 2625000,
        imagen:
          "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=500&q=80",
      },
      {
        idDetalle: "det-302",
        idProducto: 6,
        nombreProducto: "Converse Chuck Taylor All Star",
        sku: "CV-CTA-006",
        color: "Negro Lona",
        talla: "38 (US 6)",
        cantidad: 20,
        precioUnitarioCompra: 120000,
        subtotal: 2400000,
        imagen:
          "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=500&q=80",
      },
    ],
    subtotal: 5025000,
    descuento: 0,
    fleteEnvio: 0,
    iva: 954750,
    total: 5979750,
    observaciones:
      "Entrega directa en local del Restrepo sin costo de flete. Calzado y materiales certificados.",
    historialEstados: [
      {
        id: "hst-008",
        estado: "Pendiente",
        fecha: "2026-02-13T10:00:00",
        usuario: "Carlos Mendoza",
        comentario: "Orden de compra generada para producción y distribución local.",
      },
      {
        id: "hst-009",
        estado: "Aprobada",
        fecha: "2026-02-14T08:30:00",
        usuario: "Administración Isabel",
        comentario: "Aprobada para entrega directa en fábrica.",
      },
    ],
  },
  {
    idCompra: "cmp-004",
    numeroOrden: "OC-2026-0004",
    fechaEmision: "2026-02-15T15:40:00",
    fechaEntregaEsperada: "2026-02-28",
    idProveedor: "prov-001",
    nombreProveedor: "Curtidos La Sabana S.A.S.",
    nitProveedor: "900.842.105-3",
    telefonoProveedor: "+57 (601) 789 4520",
    emailProveedor: "ventas@curtidoslasabana.com",
    ciudadProveedor: "Bogotá D.C.",
    direccionProveedor: "Calle 17 # 68D-42 Zona Industrial",
    numeroFacturaProveedor: "FAC-8991",
    usuarioResponsable: "Carlos Mendoza (Jefe de Compras)",
    metodoPago: "Crédito 60 días",
    estado: "Pendiente",
    detalles: [
      {
        idDetalle: "det-401",
        idProducto: 7,
        nombreProducto: "Botas Croydon Urban Leather",
        sku: "CY-BL-007",
        color: "Miel Encerado",
        talla: "40 (US 7.5)",
        cantidad: 18,
        precioUnitarioCompra: 145000,
        subtotal: 2610000,
        imagen:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
      },
    ],
    subtotal: 2610000,
    descuento: 50000,
    fleteEnvio: 35000,
    iva: 486400,
    total: 3081400,
    observaciones: "Orden pendiente de confirmación de cupo de crédito por gerencia.",
    historialEstados: [
      {
        id: "hst-010",
        estado: "Pendiente",
        fecha: "2026-02-15T15:40:00",
        usuario: "Carlos Mendoza",
        comentario: "Orden emitida a la espera de firma de tesorería.",
      },
    ],
  },
  {
    idCompra: "cmp-005",
    numeroOrden: "OC-2026-0005",
    fechaEmision: "2026-01-20T11:00:00",
    fechaEntregaEsperada: "2026-01-30",
    idProveedor: "prov-002",
    nombreProveedor: "Industrias Caucho SuelaFlex Ltda.",
    nitProveedor: "890.312.440-1",
    telefonoProveedor: "+57 (604) 448 9110",
    emailProveedor: "contacto@suelaflex.com.co",
    ciudadProveedor: "Medellín",
    direccionProveedor: "Carrera 50 # 32-85",
    usuarioResponsable: "Carlos Mendoza (Jefe de Compras)",
    metodoPago: "Contado",
    estado: "Cancelada",
    motivoCancelacion:
      "El proveedor notificó falta de inventario en la suela y materia prima importada. Se acordó anular la orden sin penalidad.",
    detalles: [
      {
        idDetalle: "det-501",
        idProducto: 8,
        nombreProducto: "Mocasin Clásico Cuero Café",
        sku: "MC-CC-008",
        color: "Café Chocolate",
        talla: "42 (US 9)",
        cantidad: 30,
        precioUnitarioCompra: 110000,
        subtotal: 3300000,
      },
    ],
    subtotal: 3300000,
    descuento: 0,
    fleteEnvio: 0,
    iva: 627000,
    total: 3927000,
    observaciones: "Orden cancelada.",
    historialEstados: [
      {
        id: "hst-011",
        estado: "Pendiente",
        fecha: "2026-01-20T11:00:00",
        usuario: "Carlos Mendoza",
        comentario: "Orden de compra enviada.",
      },
      {
        id: "hst-012",
        estado: "Cancelada",
        fecha: "2026-01-22T16:00:00",
        usuario: "Carlos Mendoza",
        comentario:
          "Cancelada formalmente por desabastecimiento de materia prima en planta.",
      },
    ],
  },
];

// ==========================================
// Componente Principal Compras
// ==========================================

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>(MOCK_COMPRAS_INICIALES);

  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [proveedorFilter, setProveedorFilter] = useState<string>("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [modalImprimirOpen, setModalImprimirOpen] = useState(false);
  const [modalReporteOpen, setModalReporteOpen] = useState(false);

  // Orden seleccionada para ver, editar o cambiar estado
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);

  // ==========================================
  // Formulario de Nueva Orden de Compra
  // ==========================================
  const proximoNumeroOrden = useMemo(() => {
    const anio = new Date().getFullYear();
    const max = compras.reduce((acc, c) => {
      const parts = c.numeroOrden.split("-");
      const num = parseInt(parts[parts.length - 1], 10);
      return !isNaN(num) && num > acc ? num : acc;
    }, 0);
    return `OC-${anio}-${String(max + 1).padStart(4, "0")}`;
  }, [compras]);

  const [formProveedorId, setFormProveedorId] = useState<string>("");
  const [formFechaEntrega, setFormFechaEntrega] = useState<string>("");
  const [formFacturaProveedor, setFormFacturaProveedor] = useState<string>("");
  const [formMetodoPago, setFormMetodoPago] = useState<MetodoPagoCompra>("Crédito 30 días");
  const [formResponsable, setFormResponsable] = useState<string>(
    "Carlos Mendoza (Jefe de Compras)"
  );
  const [formObservaciones, setFormObservaciones] = useState<string>("");
  const [formDescuento, setFormDescuento] = useState<number>(0);
  const [formFlete, setFormFlete] = useState<number>(0);
  const [formAplicaIVA, setFormAplicaIVA] = useState<boolean>(true);

  // Items de la orden en construcción
  const [formItems, setFormItems] = useState<DetalleProductoCompra[]>([]);

  // Item individual siendo agregado
  const [itemProductoId, setItemProductoId] = useState<string>("");
  const [itemColor, setItemColor] = useState<string>("");
  const [itemTalla, setItemTalla] = useState<string>("");
  const [itemCantidad, setItemCantidad] = useState<number>(10);
  const [itemPrecioUnitario, setItemPrecioUnitario] = useState<number>(0);

  // Opciones de colores y tallas dinámicas al elegir producto
  const productoSeleccionado = useMemo(() => {
    const id = parseInt(itemProductoId, 10);
    return MOCK_PRODUCTOS_PRISMA.find((p) => p.idProducto === id) || null;
  }, [itemProductoId]);

  // Al cambiar el producto seleccionado para el ítem
  const handleSelectProducto = (idStr: string) => {
    setItemProductoId(idStr);
    const prod = MOCK_PRODUCTOS_PRISMA.find((p) => p.idProducto === parseInt(idStr, 10));
    if (prod) {
      setItemPrecioUnitario(prod.precioCompra || 150000);
      // Pre-seleccionar primer color si existe
      setItemColor("Estándar / Surtido");
      setItemTalla("40 (US 7.5)");
    }
  };

  // Agregar ítem al listado temporal de la orden
  const handleAgregarItem = () => {
    if (!itemProductoId) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona un producto de calzado",
      });
      return;
    }
    if (itemCantidad <= 0) {
      Toast.fire({
        icon: "warning",
        title: "La cantidad de pares debe ser mayor a 0",
      });
      return;
    }
    if (itemPrecioUnitario <= 0) {
      Toast.fire({
        icon: "warning",
        title: "El costo unitario debe ser mayor a $0",
      });
      return;
    }

    const prod = productoSeleccionado;
    const subtotal = itemCantidad * itemPrecioUnitario;
    const nuevoDetalle: DetalleProductoCompra = {
      idDetalle: generarId("det"),
      idProducto: prod ? prod.idProducto : 999,
      nombreProducto: prod ? prod.nombre : "Calzado / Maquila Personalizado",
      sku: prod ? prod.sku : "CALZ-PERS-01",
      color: itemColor || "Único",
      talla: itemTalla || "Surtida",
      cantidad: itemCantidad,
      precioUnitarioCompra: itemPrecioUnitario,
      subtotal,
      imagen: prod?.colores?.[0]?.imagenes?.[0],
    };

    setFormItems((prev) => [...prev, nuevoDetalle]);

    // Resetear inputs de ítem
    setItemProductoId("");
    setItemColor("");
    setItemTalla("");
    setItemCantidad(10);
    setItemPrecioUnitario(0);

    Toast.fire({
      icon: "success",
      title: "Calzado añadido a la orden",
      timer: 1500,
    });
  };

  const handleEliminarItem = (idDetalle: string) => {
    setFormItems((prev) => prev.filter((it) => it.idDetalle !== idDetalle));
  };

  // Cálculos de totales del formulario
  const calculosNuevaOrden = useMemo(() => {
    const subtotal = formItems.reduce((acc, it) => acc + it.subtotal, 0);
    const subtotalConDescuento = Math.max(0, subtotal - formDescuento);
    const iva = formAplicaIVA ? Math.round(subtotalConDescuento * 0.19) : 0;
    const total = subtotalConDescuento + iva + formFlete;
    const totalPares = formItems.reduce((acc, it) => acc + it.cantidad, 0);
    return { subtotal, iva, total, totalPares };
  }, [formItems, formDescuento, formFlete, formAplicaIVA]);

  // Guardar nueva orden de compra
  const handleGuardarNuevaCompra = () => {
    if (!formProveedorId) {
      Toast.fire({
        icon: "error",
        title: "Selección requerida",
        text: "Por favor selecciona un proveedor registrado.",
      });
      return;
    }

    if (formItems.length === 0) {
      Toast.fire({
        icon: "error",
        title: "Sin productos",
        text: "Debes agregar al menos un producto de calzado a la orden de compra.",
      });
      return;
    }

    const proveedorObj = MOCK_PROVEEDORES.find((p) => p.idProveedor === formProveedorId);
    if (!proveedorObj) return;

    const nuevaCompra: Compra = {
      idCompra: generarId("cmp"),
      numeroOrden: proximoNumeroOrden,
      fechaEmision: new Date().toISOString(),
      fechaEntregaEsperada:
        formFechaEntrega ||
        new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
      idProveedor: proveedorObj.idProveedor,
      nombreProveedor: proveedorObj.razonSocial,
      nitProveedor: proveedorObj.numeroDocumento,
      telefonoProveedor: proveedorObj.telefono,
      emailProveedor: proveedorObj.email,
      ciudadProveedor: proveedorObj.ciudad || "No especificada",
      direccionProveedor: proveedorObj.direccion || "No especificada",
      numeroFacturaProveedor: formFacturaProveedor || undefined,
      usuarioResponsable: formResponsable,
      metodoPago: formMetodoPago,
      estado: "Pendiente",
      detalles: formItems,
      subtotal: calculosNuevaOrden.subtotal,
      descuento: formDescuento,
      fleteEnvio: formFlete,
      iva: calculosNuevaOrden.iva,
      total: calculosNuevaOrden.total,
      observaciones: formObservaciones,
      historialEstados: [
        {
          id: generarId("hst"),
          estado: "Pendiente",
          fecha: new Date().toISOString(),
          usuario: formResponsable,
          comentario: "Orden de compra generada en el sistema.",
        },
      ],
    };

    setCompras((prev) => [nuevaCompra, ...prev]);
    setModalNuevaOpen(false);

    // Limpiar formulario
    setFormProveedorId("");
    setFormFechaEntrega("");
    setFormFacturaProveedor("");
    setFormObservaciones("");
    setFormDescuento(0);
    setFormFlete(0);
    setFormItems([]);

    Toast.fire({
      icon: "success",
      title: "Orden de Compra Generada",
      text: `Se emitió con éxito la orden ${nuevaCompra.numeroOrden} por ${formatCOP(
        nuevaCompra.total
      )}.`,
    });
  };

  // ==========================================
  // Formulario de Edición de Compra
  // ==========================================
  const [editFacturaProveedor, setEditFacturaProveedor] = useState("");
  const [editFechaEntrega, setEditFechaEntrega] = useState("");
  const [editMetodoPago, setEditMetodoPago] = useState<MetodoPagoCompra>("Contado");
  const [editTransportadora, setEditTransportadora] = useState("");
  const [editNumeroGuia, setEditNumeroGuia] = useState("");
  const [editObservaciones, setEditObservaciones] = useState("");

  const handleAbrirEditar = (compra: Compra) => {
    setSelectedCompra(compra);
    setEditFacturaProveedor(compra.numeroFacturaProveedor || "");
    setEditFechaEntrega(compra.fechaEntregaEsperada || "");
    setEditMetodoPago(compra.metodoPago);
    setEditTransportadora(compra.transportadora || "");
    setEditNumeroGuia(compra.numeroGuia || "");
    setEditObservaciones(compra.observaciones || "");
    setModalEditarOpen(true);
  };

  const handleGuardarEdicion = () => {
    if (!selectedCompra) return;

    setCompras((prev) =>
      prev.map((c) => {
        if (c.idCompra !== selectedCompra.idCompra) return c;
        const nuevoHistorial = [
          ...c.historialEstados,
          {
            id: generarId("hst"),
            estado: c.estado,
            fecha: new Date().toISOString(),
            usuario: "Carlos Mendoza",
            comentario: "Información de la orden actualizada (Factura, fechas o logística).",
          },
        ];
        return {
          ...c,
          numeroFacturaProveedor: editFacturaProveedor || undefined,
          fechaEntregaEsperada: editFechaEntrega,
          metodoPago: editMetodoPago,
          transportadora: editTransportadora || undefined,
          numeroGuia: editNumeroGuia || undefined,
          observaciones: editObservaciones,
          historialEstados: nuevoHistorial,
        };
      })
    );

    setModalEditarOpen(false);
    Toast.fire({
      icon: "success",
      title: "Orden actualizada",
      text: `La orden ${selectedCompra.numeroOrden} ha sido actualizada con éxito.`,
    });
  };

  // ==========================================
  // Cambio de Estado & Seguimiento
  // ==========================================
  const [nuevoEstado, setNuevoEstado] = useState<EstadoCompra>("Aprobada");
  const [comentarioEstado, setComentarioEstado] = useState("");
  const [estadoTransportadora, setEstadoTransportadora] = useState("Servientrega");
  const [estadoGuia, setEstadoGuia] = useState("");
  const [motivoCancelacionInput, setMotivoCancelacionInput] = useState("");

  const handleAbrirCambiarEstado = (compra: Compra) => {
    setSelectedCompra(compra);
    // Sugerir el siguiente estado natural
    if (compra.estado === "Pendiente") setNuevoEstado("Aprobada");
    else if (compra.estado === "Aprobada") setNuevoEstado("En Tránsito");
    else if (compra.estado === "En Tránsito") setNuevoEstado("Recibida");
    else setNuevoEstado(compra.estado);

    setComentarioEstado("");
    setEstadoTransportadora(compra.transportadora || "Servientrega");
    setEstadoGuia(compra.numeroGuia || "");
    setMotivoCancelacionInput("");
    setModalEstadoOpen(true);
  };

  const handleGuardarCambioEstado = () => {
    if (!selectedCompra) return;

    if (nuevoEstado === "Cancelada" && !motivoCancelacionInput.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Motivo obligatorio",
        text: "Debes ingresar el motivo de la cancelación de la orden.",
      });
      return;
    }

    if (nuevoEstado === "En Tránsito" && !estadoGuia.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Número de guía requerido",
        text: "Ingresa el número de guía de la transportadora para el seguimiento.",
      });
      return;
    }

    const fechaAhora = new Date().toISOString();

    const nuevoItemHistorial: HistorialSeguimiento = {
      id: generarId("hst"),
      estado: nuevoEstado,
      fecha: fechaAhora,
      usuario: "Carlos Mendoza (Jefe de Compras)",
      comentario:
        comentarioEstado.trim() ||
        (nuevoEstado === "Recibida"
          ? "Recepción en bodega y verificación de pares completada."
          : nuevoEstado === "En Tránsito"
          ? `Despachado vía ${estadoTransportadora} con guía ${estadoGuia}.`
          : nuevoEstado === "Aprobada"
          ? "Orden aprobada por gerencia de operaciones."
          : `Orden marcada como ${nuevoEstado}.`),
    };

    setCompras((prev) =>
      prev.map((c) => {
        if (c.idCompra !== selectedCompra.idCompra) return c;
        return {
          ...c,
          estado: nuevoEstado,
          transportadora:
            nuevoEstado === "En Tránsito" || c.transportadora
              ? estadoTransportadora
              : c.transportadora,
          numeroGuia:
            nuevoEstado === "En Tránsito" || c.numeroGuia ? estadoGuia : c.numeroGuia,
          fechaRecepcionReal:
            nuevoEstado === "Recibida" ? fechaAhora : c.fechaRecepcionReal,
          motivoCancelacion:
            nuevoEstado === "Cancelada"
              ? motivoCancelacionInput.trim()
              : c.motivoCancelacion,
          historialEstados: [...c.historialEstados, nuevoItemHistorial],
        };
      })
    );

    // Actualizar también la orden seleccionada en memoria
    setSelectedCompra((prev) =>
      prev
        ? {
            ...prev,
            estado: nuevoEstado,
            transportadora:
              nuevoEstado === "En Tránsito" || prev.transportadora
                ? estadoTransportadora
                : prev.transportadora,
            numeroGuia:
              nuevoEstado === "En Tránsito" || prev.numeroGuia
                ? estadoGuia
                : prev.numeroGuia,
            fechaRecepcionReal:
              nuevoEstado === "Recibida" ? fechaAhora : prev.fechaRecepcionReal,
            motivoCancelacion:
              nuevoEstado === "Cancelada"
                ? motivoCancelacionInput.trim()
                : prev.motivoCancelacion,
            historialEstados: [...prev.historialEstados, nuevoItemHistorial],
          }
        : null
    );

    setModalEstadoOpen(false);

    Toast.fire({
      icon: "success",
      title: "Estado de Compra Actualizado",
      text: `La orden ${selectedCompra.numeroOrden} ahora está en estado "${nuevoEstado}".`,
    });
  };

  // ==========================================
  // Reportes y Analítica de Compras
  // ==========================================
  const [reportePeriodo, setReportePeriodo] = useState<"todos" | "mes" | "trimestre" | "anio">("todos");
  const [reporteProveedor, setReporteProveedor] = useState<string>("TODOS");

  const datosReporte = useMemo(() => {
    let filtradas = [...compras];

    // Filtro por proveedor en reporte
    if (reporteProveedor !== "TODOS") {
      filtradas = filtradas.filter((c) => c.idProveedor === reporteProveedor);
    }

    // Filtro de tiempo en reporte
    const ahora = new Date();
    if (reportePeriodo === "mes") {
      filtradas = filtradas.filter((c) => {
        const d = new Date(c.fechaEmision);
        return (
          d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear()
        );
      });
    } else if (reportePeriodo === "trimestre") {
      const hace90Dias = new Date();
      hace90Dias.setDate(hace90Dias.getDate() - 90);
      filtradas = filtradas.filter((c) => new Date(c.fechaEmision) >= hace90Dias);
    } else if (reportePeriodo === "anio") {
      filtradas = filtradas.filter(
        (c) => new Date(c.fechaEmision).getFullYear() === ahora.getFullYear()
      );
    }

    const totalInvertido = filtradas
      .filter((c) => c.estado !== "Cancelada")
      .reduce((acc, c) => acc + c.total, 0);

    const totalPares = filtradas
      .filter((c) => c.estado !== "Cancelada")
      .reduce(
        (acc, c) => acc + c.detalles.reduce((pAcc, d) => pAcc + d.cantidad, 0),
        0
      );

    const promedioPorOrden =
      filtradas.length > 0 ? Math.round(totalInvertido / filtradas.length) : 0;

    // Desglose por Proveedor
    const gastoPorProveedor: Record<string, { nombre: string; monto: number; ordenes: number }> =
      {};
    filtradas.forEach((c) => {
      if (c.estado === "Cancelada") return;
      if (!gastoPorProveedor[c.idProveedor]) {
        gastoPorProveedor[c.idProveedor] = {
          nombre: c.nombreProveedor,
          monto: 0,
          ordenes: 0,
        };
      }
      gastoPorProveedor[c.idProveedor].monto += c.total;
      gastoPorProveedor[c.idProveedor].ordenes += 1;
    });

    const rankingProveedores = Object.values(gastoPorProveedor).sort(
      (a, b) => b.monto - a.monto
    );

    // Modelos de calzado más adquiridos
    const paresPorZapato: Record<string, { nombre: string; pares: number; subtotal: number }> =
      {};
    filtradas.forEach((c) => {
      if (c.estado === "Cancelada") return;
      c.detalles.forEach((det) => {
        if (!paresPorZapato[det.nombreProducto]) {
          paresPorZapato[det.nombreProducto] = {
            nombre: det.nombreProducto,
            pares: 0,
            subtotal: 0,
          };
        }
        paresPorZapato[det.nombreProducto].pares += det.cantidad;
        paresPorZapato[det.nombreProducto].subtotal += det.subtotal;
      });
    });

    const rankingZapatos = Object.values(paresPorZapato).sort(
      (a, b) => b.pares - a.pares
    );

    return {
      filtradas,
      totalInvertido,
      totalPares,
      promedioPorOrden,
      rankingProveedores,
      rankingZapatos,
    };
  }, [compras, reportePeriodo, reporteProveedor]);

  // ==========================================
  // Métricas Principales (KPI Cards)
  // ==========================================
  const metricas = useMemo(() => {
    const validas = compras.filter((c) => c.estado !== "Cancelada");
    const totalGasto = validas.reduce((acc, c) => acc + c.total, 0);
    const enTransito = compras.filter((c) => c.estado === "En Tránsito").length;
    const pendientes = compras.filter((c) => c.estado === "Pendiente").length;
    const recibidas = compras.filter((c) => c.estado === "Recibida").length;
    const totalPares = validas.reduce(
      (acc, c) => acc + c.detalles.reduce((dAcc, d) => dAcc + d.cantidad, 0),
      0
    );

    return {
      totalGasto,
      totalOrdenes: compras.length,
      enSeguimiento: enTransito + pendientes,
      recibidas,
      totalPares,
    };
  }, [compras]);

  // ==========================================
  // Filtro de la Tabla Principal
  // ==========================================
  const comprasFiltradas = useMemo(() => {
    return compras.filter((c) => {
      // Búsqueda libre
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const coincideOrden = c.numeroOrden.toLowerCase().includes(query);
        const coincideProv = c.nombreProveedor.toLowerCase().includes(query);
        const coincideNit = c.nitProveedor.toLowerCase().includes(query);
        const coincideFactura = c.numeroFacturaProveedor?.toLowerCase().includes(query);
        const coincideResp = c.usuarioResponsable.toLowerCase().includes(query);
        const coincideProducto = c.detalles.some((d) =>
          d.nombreProducto.toLowerCase().includes(query)
        );
        if (
          !coincideOrden &&
          !coincideProv &&
          !coincideNit &&
          !coincideFactura &&
          !coincideResp &&
          !coincideProducto
        ) {
          return false;
        }
      }

      // Filtro de Estado
      if (estadoFilter !== "TODOS" && c.estado !== estadoFilter) {
        return false;
      }

      // Filtro de Proveedor
      if (proveedorFilter !== "TODOS" && c.idProveedor !== proveedorFilter) {
        return false;
      }

      // Filtro de Fechas
      if (fechaDesde) {
        const dEmision = new Date(c.fechaEmision).toISOString().split("T")[0];
        if (dEmision < fechaDesde) return false;
      }
      if (fechaHasta) {
        const dEmision = new Date(c.fechaEmision).toISOString().split("T")[0];
        if (dEmision > fechaHasta) return false;
      }

      return true;
    });
  }, [compras, searchTerm, estadoFilter, proveedorFilter, fechaDesde, fechaHasta]);

  // Datos paginados
  const totalPages = Math.ceil(comprasFiltradas.length / itemsPerPage) || 1;
  const paginatedCompras = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return comprasFiltradas.slice(start, start + itemsPerPage);
  }, [comprasFiltradas, currentPage, itemsPerPage]);

  // ==========================================
  // Columnas de la Tabla
  // ==========================================
  const columns: TableColumn<Compra>[] = [
    {
      key: "orden",
      header: "Orden de Compra",
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
              {row.numeroOrden}
            </span>
            {row.numeroFacturaProveedor && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Fact: {row.numeroFacturaProveedor}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(row.fechaEmision)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Por: {row.usuarioResponsable.split("(")[0].trim()}
          </span>
        </div>
      ),
    },
    {
      key: "proveedor",
      header: "Proveedor",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {row.nombreProveedor}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>NIT: {row.nitProveedor}</span>
            <span>•</span>
            <span>{row.ciudadProveedor}</span>
          </div>
        </div>
      ),
    },
    {
      key: "detalles",
      header: "Calzado Adquirido",
      render: (row) => {
        const totalPares = row.detalles.reduce((acc, d) => acc + d.cantidad, 0);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon
                icon={faShoePrints}
                className="text-xs text-indigo-500 dark:text-indigo-400"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {row.detalles.length} modelo(s) • {totalPares} pares
              </span>
            </div>
            <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {row.detalles.map((d) => `${d.nombreProducto} (${d.cantidad})`).join(", ")}
            </p>
          </div>
        );
      },
    },
    {
      key: "total",
      header: "Total (COP)",
      align: "right",
      render: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {formatCOP(row.total)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {row.metodoPago}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado & Seguimiento",
      render: (row) => {
        const conf = ESTADO_CONFIG[row.estado];
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs ${conf.badgeClass}`}
            >
              <FontAwesomeIcon icon={conf.icon} className="text-xs" />
              {conf.label}
            </span>
            {row.estado === "En Tránsito" && row.numeroGuia && (
              <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
                Guía: {row.numeroGuia} ({row.transportadora})
              </span>
            )}
            {row.estado === "Recibida" && row.fechaRecepcionReal && (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Recibido: {formatDateShort(row.fechaRecepcionReal)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          {/* Ver Detalle */}
          <button
            type="button"
            title="Ver Detalle de Compra y Seguimiento"
            onClick={() => {
              setSelectedCompra(row);
              setModalDetalleOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <FontAwesomeIcon icon={faEye} className="text-sm" />
          </button>

          {/* Actualizar / Editar */}
          <button
            type="button"
            title="Editar Información de Compra"
            onClick={() => handleAbrirEditar(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
          </button>

          {/* Cambiar Estado */}
          <button
            type="button"
            title="Cambiar Estado y Registrar Seguimiento"
            onClick={() => handleAbrirCambiarEstado(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
          >
            <FontAwesomeIcon icon={faTruck} className="text-sm" />
          </button>

          {/* Imprimir / Ver Orden de Compra */}
          <button
            type="button"
            title="Generar e Imprimir Orden de Compra"
            onClick={() => {
              setSelectedCompra(row);
              setModalImprimirOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            <FontAwesomeIcon icon={faPrint} className="text-sm" />
          </button>
        </div>
      ),
    },
  ];

  // Referencia para impresión de documento
  const printableRef = useRef<HTMLDivElement>(null);
  const handleImprimirDocumento = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ==========================================
          Encabezado Principal
      ========================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Gestión de Compras y Órdenes
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Registro, consulta, seguimiento logístico y emisión de órdenes de compra
                para calzado y suministros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Reportes */}
          <Button
            variant="outline"
            icon={faChartPie}
            onClick={() => setModalReporteOpen(true)}
            className="border-slate-300 dark:border-slate-700"
          >
            Generar Reporte
          </Button>

          {/* Botón Nueva Orden */}
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => {
              // Limpiar datos
              setFormProveedorId("");
              setFormFechaEntrega("");
              setFormFacturaProveedor("");
              setFormObservaciones("");
              setFormDescuento(0);
              setFormFlete(0);
              setFormItems([]);
              setModalNuevaOpen(true);
            }}
            className="bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Nueva Orden de Compra
          </Button>
        </div>
      </div>

      {/* ==========================================
          Tarjetas de Métricas (KPIs)
      ========================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invertido */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inversión en Compras
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-sm" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatCOP(metricas.totalGasto)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Acumulado en órdenes activas
          </p>
        </div>

        {/* Órdenes Registradas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Órdenes Emitidas
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-sm" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {metricas.totalOrdenes} órdenes
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {metricas.totalPares} pares de zapatos en total
          </p>
        </div>

        {/* En Seguimiento (Pendientes + Tránsito) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              En Seguimiento / Tránsito
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <FontAwesomeIcon icon={faTruckFast} className="text-sm" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {metricas.enSeguimiento} activas
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Pendientes de recepción o despacho
          </p>
        </div>

        {/* Recibidas en Bodega */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recibidas en Bodega
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-sm" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {metricas.recibidas} órdenes
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Inventario cargado y verificado
          </p>
        </div>
      </div>

      {/* ==========================================
          Filtros y Búsqueda
      ========================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Búsqueda por texto */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Buscar por N° orden, factura, proveedor o zapato..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={faMagnifyingGlass}
              size="sm"
            />
          </div>

          {/* Filtro de Estado */}
          <div>
            <Select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setCurrentPage(1);
              }}
              size="sm"
              iconLeft={faFilter}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="En Tránsito">En Tránsito</option>
              <option value="Recibida">Recibida</option>
              <option value="Cancelada">Cancelada</option>
            </Select>
          </div>

          {/* Filtro de Proveedor */}
          <div>
            <Select
              value={proveedorFilter}
              onChange={(e) => {
                setProveedorFilter(e.target.value);
                setCurrentPage(1);
              }}
              size="sm"
              iconLeft={faBuilding}
            >
              <option value="TODOS">Todos los Proveedores</option>
              {MOCK_PROVEEDORES.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>
                  {p.razonSocial}
                </option>
              ))}
            </Select>
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={faArrowRotateRight}
              onClick={() => {
                setSearchTerm("");
                setEstadoFilter("TODOS");
                setProveedorFilter("TODOS");
                setFechaDesde("");
                setFechaHasta("");
                setCurrentPage(1);
              }}
              className="w-full text-slate-600 dark:text-slate-400"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Filtro opcional de Rango de Fechas */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Filtrar por Fecha de Emisión:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>
          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              onClick={() => {
                setFechaDesde("");
                setFechaHasta("");
              }}
              className="text-xs text-indigo-600 underline dark:text-indigo-400"
            >
              Quitar rango
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          Tabla de Compras
      ========================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Table<Compra>
          columns={columns}
          data={paginatedCompras}
          rowKey="idCompra"
          emptyTitle="No se encontraron órdenes de compra"
          emptyDescription="Ajusta los filtros de búsqueda o registra una nueva orden de compra para comenzar."
          pagination={{
            currentPage,
            totalPages,
            totalItems: comprasFiltradas.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* ==========================================
          MODAL 1: REGISTRAR NUEVA ORDEN DE COMPRA
      ========================================== */}
      <Modal
        isOpen={modalNuevaOpen}
        onClose={() => setModalNuevaOpen(false)}
        title="Nueva Orden de Compra"
        description="Genera una orden formal para adquisición de calzado a un proveedor."
        icon={faCartShopping}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{calculosNuevaOrden.totalPares} pares de zapatos</span>
              <span>•</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Total: {formatCOP(calculosNuevaOrden.total)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setModalNuevaOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={faCheck}
                onClick={handleGuardarNuevaCompra}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Generar Orden
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Sección 1: Datos de Proveedor y Generales */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              1. Selección de Proveedor y Datos Generales
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* N° Orden (Automático) */}
              <Input
                label="N° Orden de Compra"
                value={proximoNumeroOrden}
                disabled
                className="bg-slate-100 font-mono font-bold dark:bg-slate-800"
              />

              {/* Selector de Proveedor */}
              <Select
                label="Proveedor *"
                value={formProveedorId}
                onChange={(e) => setFormProveedorId(e.target.value)}
                iconLeft={faBuilding}
              >
                <option value="">Selecciona un proveedor...</option>
                {MOCK_PROVEEDORES.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>
                    {p.razonSocial} (NIT: {p.numeroDocumento})
                  </option>
                ))}
              </Select>

              {/* Forma de Pago */}
              <Select
                label="Condición / Forma de Pago"
                value={formMetodoPago}
                onChange={(e) => setFormMetodoPago(e.target.value as MetodoPagoCompra)}
                iconLeft={faMoneyBillWave}
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>

              {/* Fecha Estimada de Entrega */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fecha Esperada de Entrega
                </label>
                <input
                  type="date"
                  value={formFechaEntrega}
                  onChange={(e) => setFormFechaEntrega(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* N° Factura / Remisión de Referencia */}
              <Input
                label="N° Factura o Cotización del Proveedor"
                placeholder="Ej: FAC-4580 o COT-012"
                value={formFacturaProveedor}
                onChange={(e) => setFormFacturaProveedor(e.target.value)}
              />

              {/* Responsable */}
              <Input
                label="Usuario Comprador Responsable"
                value={formResponsable}
                onChange={(e) => setFormResponsable(e.target.value)}
              />
            </div>
          </div>

          {/* Sección 2: Detalle de Productos Adquiridos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              2. Detalle de Calzado Adquirido
            </h3>

            {/* Fila para agregar ítem */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {/* Selector de Zapato */}
                <div className="lg:col-span-2">
                  <Select
                    label="Modelo de Calzado *"
                    value={itemProductoId}
                    onChange={(e) => handleSelectProducto(e.target.value)}
                    iconLeft={faShoePrints}
                  >
                    <option value="">Selecciona zapato del catálogo...</option>
                    {MOCK_PRODUCTOS_PRISMA.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>
                        {p.nombre} ({p.sku})
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Color */}
                <Input
                  label="Color *"
                  placeholder="Ej: Blanco, Negro, Rojo..."
                  value={itemColor}
                  onChange={(e) => setItemColor(e.target.value)}
                />

                {/* Talla */}
                <Input
                  label="Talla *"
                  placeholder="Ej: 40 (US 7.5)"
                  value={itemTalla}
                  onChange={(e) => setItemTalla(e.target.value)}
                />

                {/* Cantidad */}
                <Input
                  label="Cantidad (Pares) *"
                  type="number"
                  min="1"
                  value={itemCantidad}
                  onChange={(e) => setItemCantidad(parseInt(e.target.value, 10) || 0)}
                />

                {/* Costo Unitario */}
                <div className="lg:col-span-2">
                  <Input
                    label="Costo Unitario de Compra (COP) *"
                    type="number"
                    min="0"
                    step="1000"
                    value={itemPrecioUnitario}
                    onChange={(e) =>
                      setItemPrecioUnitario(parseInt(e.target.value, 10) || 0)
                    }
                    helperText={
                      itemPrecioUnitario > 0 ? formatCOP(itemPrecioUnitario) : ""
                    }
                  />
                </div>

                {/* Botón Agregar Ítem */}
                <div className="flex items-end lg:col-span-3">
                  <Button
                    variant="primary"
                    icon={faPlus}
                    onClick={handleAgregarItem}
                    fullWidth
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Agregar Calzado a la Orden
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabla de Items Agregados */}
            {formItems.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Zapato</th>
                      <th className="py-2.5 px-3">Color / Talla</th>
                      <th className="py-2.5 px-3 text-center">Pares</th>
                      <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {formItems.map((it) => (
                      <tr key={it.idDetalle}>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {it.imagen ? (
                              <img
                                src={it.imagen}
                                alt={it.nombreProducto}
                                className="h-9 w-9 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <FontAwesomeIcon icon={faShoePrints} />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {it.nombreProducto}
                              </p>
                              <p className="text-xs text-slate-400">SKU: {it.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300">
                          <div>Color: {it.color}</div>
                          <div>Talla: {it.talla}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-100">
                          {it.cantidad}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {formatCOP(it.precioUnitarioCompra)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCOP(it.subtotal)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleEliminarItem(it.idDetalle)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Aún no has añadido zapatos a esta orden. Usa el selector de arriba para
                añadir productos.
              </div>
            )}
          </div>

          {/* Sección 3: Totales y Liquidación */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Observaciones o Instrucciones de Despacho
              </label>
              <textarea
                rows={3}
                value={formObservaciones}
                onChange={(e) => setFormObservaciones(e.target.value)}
                placeholder="Especificaciones de embalaje, lugar de entrega, persona de contacto en bodega..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Subtotal Calzado:</span>
                <span className="font-mono font-semibold">
                  {formatCOP(calculosNuevaOrden.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Descuento (COP):</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formDescuento}
                  onChange={(e) => setFormDescuento(parseInt(e.target.value, 10) || 0)}
                  className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Flete / Envío (COP):</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formFlete}
                  onChange={(e) => setFormFlete(parseInt(e.target.value, 10) || 0)}
                  className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAplicaIVA}
                    onChange={(e) => setFormAplicaIVA(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Aplica IVA (19%)</span>
                </label>
                <span className="font-mono font-semibold">
                  {formatCOP(calculosNuevaOrden.iva)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total a Pagar:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {formatCOP(calculosNuevaOrden.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ==========================================
          MODAL 2: CONSULTAR Y VER DETALLE DE COMPRA
      ========================================== */}
      {selectedCompra && (
        <Modal
          isOpen={modalDetalleOpen}
          onClose={() => setModalDetalleOpen(false)}
          title={`Detalle de Orden ${selectedCompra.numeroOrden}`}
          description={`Emitida el ${formatDate(selectedCompra.fechaEmision)}`}
          icon={faReceipt}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  icon={faPrint}
                  onClick={() => {
                    setModalDetalleOpen(false);
                    setModalImprimirOpen(true);
                  }}
                >
                  Imprimir Orden
                </Button>
                <Button
                  variant="outline"
                  icon={faTruck}
                  onClick={() => {
                    setModalDetalleOpen(false);
                    handleAbrirCambiarEstado(selectedCompra);
                  }}
                >
                  Cambiar Estado
                </Button>
              </div>
              <Button
                variant="primary"
                onClick={() => setModalDetalleOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Seguimiento / Línea de Tiempo del Workflow */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Seguimiento del Proceso de Compra
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${
                    ESTADO_CONFIG[selectedCompra.estado].badgeClass
                  }`}
                >
                  <FontAwesomeIcon
                    icon={ESTADO_CONFIG[selectedCompra.estado].icon}
                    className="text-xs"
                  />
                  {selectedCompra.estado}
                </span>
              </div>

              {/* Stepper de 4 etapas */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { stage: 1, label: "1. Emitida", icon: faReceipt },
                  { stage: 2, label: "2. Aprobada", icon: faCircleCheck },
                  { stage: 3, label: "3. En Tránsito", icon: faTruckFast },
                  { stage: 4, label: "4. Recibida", icon: faBoxesStacked },
                ].map((step) => {
                  const currentStep = ESTADO_CONFIG[selectedCompra.estado].step;
                  const isCompleted =
                    selectedCompra.estado !== "Cancelada" && currentStep >= step.stage;
                  const isCurrent =
                    selectedCompra.estado !== "Cancelada" && currentStep === step.stage;

                  return (
                    <div key={step.stage} className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-xs transition-colors ${
                          isCurrent
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                        }`}
                      >
                        <FontAwesomeIcon icon={step.icon} />
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          isCompleted
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Motivo de cancelación si aplica */}
              {selectedCompra.estado === "Cancelada" && (
                <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  <div className="flex items-center gap-2 font-bold">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>Orden Cancelada:</span>
                  </div>
                  <p className="mt-1">
                    {selectedCompra.motivoCancelacion || "Sin motivo registrado."}
                  </p>
                </div>
              )}
            </div>

            {/* Ficha Proveedor e Información Logística */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Proveedor */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Proveedor
                </h4>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCompra.nombreProveedor}
                </p>
                <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>NIT: {selectedCompra.nitProveedor}</p>
                  <p>Teléfono: {selectedCompra.telefonoProveedor}</p>
                  <p>Email: {selectedCompra.emailProveedor}</p>
                  <p>
                    Ciudad: {selectedCompra.ciudadProveedor} —{" "}
                    {selectedCompra.direccionProveedor}
                  </p>
                </div>
              </div>

              {/* Logística y Pagos */}
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Logística y Condiciones
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Forma de Pago:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCompra.metodoPago}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Factura Proveedor:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCompra.numeroFacturaProveedor || "Pendiente de radicación"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fecha Entrega Requerida:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCompra.fechaEntregaEsperada}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transportadora:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCompra.transportadora || "Por definir"}
                    </span>
                  </div>
                  {selectedCompra.numeroGuia && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Número de Guía:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedCompra.numeroGuia}
                      </span>
                    </div>
                  )}
                  {selectedCompra.fechaRecepcionReal && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha de Recepción Bodega:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatDate(selectedCompra.fechaRecepcionReal)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de Productos Adquiridos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Productos de Calzado Adquiridos
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Zapato</th>
                      <th className="py-2.5 px-3">Color</th>
                      <th className="py-2.5 px-3">Talla</th>
                      <th className="py-2.5 px-3 text-center">Pares</th>
                      <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedCompra.detalles.map((det) => (
                      <tr key={det.idDetalle}>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {det.imagen ? (
                              <img
                                src={det.imagen}
                                alt={det.nombreProducto}
                                className="h-8 w-8 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <FontAwesomeIcon icon={faShoePrints} />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {det.nombreProducto}
                              </p>
                              <p className="text-xs text-slate-400">SKU: {det.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300">
                          {det.color}
                        </td>
                        <td className="py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {det.talla}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                          {det.cantidad}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {formatCOP(det.precioUnitarioCompra)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCOP(det.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liquidación de Totales */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatCOP(selectedCompra.subtotal)}
                  </span>
                </div>
                {selectedCompra.descuento > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span>Descuento Aplicado:</span>
                    <span className="font-mono font-semibold">
                      -{formatCOP(selectedCompra.descuento)}
                    </span>
                  </div>
                )}
                {selectedCompra.fleteEnvio > 0 && (
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Flete / Transporte:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      +{formatCOP(selectedCompra.fleteEnvio)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>IVA Liquidado (19%):</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatCOP(selectedCompra.iva)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total General:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCOP(selectedCompra.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de Cambios / Bitácora de Auditoría */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bitácora de Seguimiento y Auditoría
              </h4>
              <div className="space-y-2">
                {selectedCompra.historialEstados.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span
                      className={`mt-0.5 inline-block h-2 w-2 rounded-full ${
                        h.estado === "Recibida"
                          ? "bg-emerald-500"
                          : h.estado === "En Tránsito"
                          ? "bg-purple-500"
                          : h.estado === "Aprobada"
                          ? "bg-blue-500"
                          : h.estado === "Cancelada"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {h.estado} — {h.usuario}
                        </span>
                        <span className="text-slate-400">{formatDate(h.fecha)}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {h.comentario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ==========================================
          MODAL 3: ACTUALIZAR / EDITAR COMPRA
      ========================================== */}
      {selectedCompra && (
        <Modal
          isOpen={modalEditarOpen}
          onClose={() => setModalEditarOpen(false)}
          title={`Actualizar Información - ${selectedCompra.numeroOrden}`}
          description="Modifica los datos de remisión, fechas y logística de la orden."
          icon={faPenToSquare}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setModalEditarOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={faCheck}
                onClick={handleGuardarEdicion}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Guardar Cambios
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
              <p>
                <strong>Proveedor:</strong> {selectedCompra.nombreProveedor} (NIT:{" "}
                {selectedCompra.nitProveedor})
              </p>
              <p>
                <strong>Monto Total:</strong> {formatCOP(selectedCompra.total)} •{" "}
                {selectedCompra.detalles.reduce((acc, d) => acc + d.cantidad, 0)} pares
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="N° Factura del Proveedor"
                value={editFacturaProveedor}
                onChange={(e) => setEditFacturaProveedor(e.target.value)}
                placeholder="Ej: FAC-9842"
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fecha Estimada de Entrega
                </label>
                <input
                  type="date"
                  value={editFechaEntrega}
                  onChange={(e) => setEditFechaEntrega(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <Select
                label="Condición de Pago"
                value={editMetodoPago}
                onChange={(e) => setEditMetodoPago(e.target.value as MetodoPagoCompra)}
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>

              <Select
                label="Empresa Transportadora"
                value={editTransportadora}
                onChange={(e) => setEditTransportadora(e.target.value)}
              >
                <option value="">Selecciona transportadora...</option>
                {TRANSPORTADORAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>

              <div className="sm:col-span-2">
                <Input
                  label="Número de Guía de Transporte"
                  value={editNumeroGuia}
                  onChange={(e) => setEditNumeroGuia(e.target.value)}
                  placeholder="Ej: SER-99238472"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Observaciones / Notas Internas
                </label>
                <textarea
                  rows={3}
                  value={editObservaciones}
                  onChange={(e) => setEditObservaciones(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ==========================================
          MODAL 4: CAMBIAR ESTADO Y SEGUIMIENTO
      ========================================== */}
      {selectedCompra && (
        <Modal
          isOpen={modalEstadoOpen}
          onClose={() => setModalEstadoOpen(false)}
          title={`Cambiar Estado - ${selectedCompra.numeroOrden}`}
          description="Avanza o actualiza la etapa logística en el seguimiento de la compra."
          icon={faTruck}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setModalEstadoOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={faCheck}
                onClick={handleGuardarCambioEstado}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Confirmar Cambio
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-500">Estado Actual:</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-bold ${
                  ESTADO_CONFIG[selectedCompra.estado].badgeClass
                }`}
              >
                <FontAwesomeIcon
                  icon={ESTADO_CONFIG[selectedCompra.estado].icon}
                  className="text-xs"
                />
                {selectedCompra.estado}
              </span>
            </div>

            {/* Selector de Nuevo Estado */}
            <Select
              label="Nuevo Estado de la Orden *"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoCompra)}
            >
              <option value="Pendiente">Pendiente (En revisión)</option>
              <option value="Aprobada">Aprobada (Autorizada para despacho)</option>
              <option value="En Tránsito">En Tránsito (Despachada con guía)</option>
              <option value="Recibida">Recibida (Ingreso a bodega e inventario)</option>
              <option value="Cancelada">Cancelada (Anular orden)</option>
            </Select>

            {/* Campos condicionales si es "En Tránsito" */}
            {nuevoEstado === "En Tránsito" && (
              <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/50 dark:bg-purple-950/20">
                <p className="text-xs font-bold text-purple-800 dark:text-purple-300">
                  Datos del Despacho y Transporte
                </p>
                <Select
                  label="Empresa Transportadora *"
                  value={estadoTransportadora}
                  onChange={(e) => setEstadoTransportadora(e.target.value)}
                >
                  {TRANSPORTADORAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Número de Guía de Envío *"
                  placeholder="Ej: SER-9874512"
                  value={estadoGuia}
                  onChange={(e) => setEstadoGuia(e.target.value)}
                />
              </div>
            )}

            {/* Campos condicionales si es "Recibida" */}
            {nuevoEstado === "Recibida" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <FontAwesomeIcon icon={faWarehouse} />
                  <span>Ingreso a Bodega:</span>
                </div>
                <p className="mt-1">
                  Al marcar como Recibida se registrará la recepción física en la bodega
                  principal y se habilitarán los pares para inventario disponible.
                </p>
              </div>
            )}

            {/* Campos condicionales si es "Cancelada" */}
            {nuevoEstado === "Cancelada" && (
              <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/50 dark:bg-rose-950/20">
                <label className="block text-xs font-bold text-rose-800 dark:text-rose-300">
                  Motivo de Cancelación *
                </label>
                <textarea
                  rows={2}
                  value={motivoCancelacionInput}
                  onChange={(e) => setMotivoCancelacionInput(e.target.value)}
                  placeholder="Explica la razón por la cual se cancela la orden..."
                  className="w-full rounded-xl border border-rose-300 bg-white p-2 text-xs text-slate-900 shadow-xs focus:border-rose-500 focus:outline-hidden dark:border-rose-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}

            {/* Comentario general de la bitácora */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nota o Comentario para el Historial (Opcional)
              </label>
              <textarea
                rows={2}
                value={comentarioEstado}
                onChange={(e) => setComentarioEstado(e.target.value)}
                placeholder="Detalle adicional sobre esta actualización de estado..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ==========================================
          MODAL 5: DOCUMENTO FORMAL DE ORDEN DE COMPRA (IMPRIMIBLE)
      ========================================== */}
      {selectedCompra && (
        <Modal
          isOpen={modalImprimirOpen}
          onClose={() => setModalImprimirOpen(false)}
          title={`Orden de Compra - ${selectedCompra.numeroOrden}`}
          description="Formato corporativo imprimible para emisión física o exportación."
          icon={faPrint}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Usa el botón para enviar directamente a la impresora o guardar como PDF.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setModalImprimirOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  icon={faPrint}
                  onClick={handleImprimirDocumento}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Imprimir Documento
                </Button>
              </div>
            </div>
          }
        >
          {/* Vista del Documento Formal */}
          <div
            ref={printableRef}
            className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm print:m-0 print:border-none print:p-0 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {/* Cabecera Documento */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xl">
                  CI
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Calzado Isabel S.A.S.
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    NIT: 901.458.789-2 • Régimen Común
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calle 17 # 68D-42 Barrio Restrepo, Bogotá D.C. • Tel: +57 (601) 320 9980
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-sm font-black text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {selectedCompra.numeroOrden}
                </span>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Fecha: {formatDateShort(selectedCompra.fechaEmision)}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Estado: {selectedCompra.estado}
                </p>
              </div>
            </div>

            {/* Datos Proveedor & Entrega */}
            <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-900/60">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Proveedor
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {selectedCompra.nombreProveedor}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  NIT: {selectedCompra.nitProveedor}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Teléfono: {selectedCompra.telefonoProveedor}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedCompra.ciudadProveedor} — {selectedCompra.direccionProveedor}
                </p>
              </div>

              <div className="space-y-1 text-right">
                <p className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Condiciones Comerciales
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Forma de Pago:</strong> {selectedCompra.metodoPago}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Fecha Entrega:</strong> {selectedCompra.fechaEntregaEsperada}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Factura Ref:</strong>{" "}
                  {selectedCompra.numeroFacturaProveedor || "N/A"}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Comprador:</strong> {selectedCompra.usuarioResponsable}
                </p>
              </div>
            </div>

            {/* Tabla de Calzado en Documento */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="py-2 px-3">Ítem / SKU</th>
                    <th className="py-2 px-3">Descripción del Calzado</th>
                    <th className="py-2 px-3">Color</th>
                    <th className="py-2 px-3">Talla</th>
                    <th className="py-2 px-3 text-center">Cant. Pares</th>
                    <th className="py-2 px-3 text-right">Precio Unit.</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedCompra.detalles.map((d, idx) => (
                    <tr key={d.idDetalle}>
                      <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        {d.nombreProducto}
                        <span className="block font-mono text-[10px] text-slate-400">
                          {d.sku}
                        </span>
                      </td>
                      <td className="py-2 px-3">{d.color}</td>
                      <td className="py-2 px-3 font-semibold">{d.talla}</td>
                      <td className="py-2 px-3 text-center font-bold">{d.cantidad}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatCOP(d.precioUnitarioCompra)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {formatCOP(d.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cuadro de Totales */}
            <div className="mt-4 flex justify-between">
              <div className="max-w-md text-[11px] text-slate-500 dark:text-slate-400">
                <p className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Instrucciones y Observaciones
                </p>
                <p className="mt-1">
                  {selectedCompra.observaciones ||
                    "Entregar la mercancía embalada en cajas individuales con su debida rotulación de modelo, color y talla. La factura debe corresponder exactamente a las cantidades autorizadas."}
                </p>
              </div>

              <div className="w-64 space-y-1 text-xs text-right">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">
                    {formatCOP(selectedCompra.subtotal)}
                  </span>
                </div>
                {selectedCompra.descuento > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento:</span>
                    <span className="font-mono font-semibold">
                      -{formatCOP(selectedCompra.descuento)}
                    </span>
                  </div>
                )}
                {selectedCompra.fleteEnvio > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Flete:</span>
                    <span className="font-mono font-semibold">
                      +{formatCOP(selectedCompra.fleteEnvio)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>IVA (19%):</span>
                  <span className="font-mono font-semibold">
                    {formatCOP(selectedCompra.iva)}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-sm text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total Orden:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCOP(selectedCompra.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Firmas de Autorización */}
            <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-xs dark:border-slate-800">
              <div>
                <div className="mx-auto mb-1 h-10 w-40 border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Elaborado por (Compras)
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedCompra.usuarioResponsable}
                </p>
              </div>

              <div>
                <div className="mx-auto mb-1 h-10 w-40 border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Aprobado por (Gerencia)
                </p>
                <p className="text-[11px] text-slate-500">Calzado Isabel S.A.S.</p>
              </div>

              <div>
                <div className="mx-auto mb-1 h-10 w-40 border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Recibido Conforme (Proveedor)
                </p>
                <p className="text-[11px] text-slate-500">Firma y Sello</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ==========================================
          MODAL 6: GENERADOR DE REPORTES DE COMPRAS
      ========================================== */}
      <Modal
        isOpen={modalReporteOpen}
        onClose={() => setModalReporteOpen(false)}
        title="Reporte Ejecutivo de Compras"
        description="Analítica de adquisición de calzado, gastos por proveedor y modelos más comprados."
        icon={faChartPie}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {datosReporte.filtradas.length} órdenes incluidas en el reporte
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setModalReporteOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                icon={faPrint}
                onClick={() => window.print()}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Imprimir Reporte
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Filtros del Reporte */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Período del Reporte:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: "todos", label: "Histórico Total" },
                { id: "mes", label: "Mes Actual" },
                { id: "trimestre", label: "Últimos 90 Días" },
                { id: "anio", label: "Año 2026" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setReportePeriodo(
                      p.id as "todos" | "mes" | "trimestre" | "anio"
                    )
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    reportePeriodo === p.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Proveedor:
              </span>
              <select
                value={reporteProveedor}
                onChange={(e) => setReporteProveedor(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="TODOS">Todos los Proveedores</option>
                {MOCK_PROVEEDORES.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>
                    {p.razonSocial}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjetas de Resumen Ejecutivo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Invertido en Compras
              </p>
              <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatCOP(datosReporte.totalInvertido)}
              </p>
              <p className="text-[11px] text-slate-400">
                Excluye órdenes canceladas
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Pares Adquiridos
              </p>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                {datosReporte.totalPares} pares
              </p>
              <p className="text-[11px] text-slate-400">Volumen físico de calzado</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Ticket Promedio por Orden
              </p>
              <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {formatCOP(datosReporte.promedioPorOrden)}
              </p>
              <p className="text-[11px] text-slate-400">
                En {datosReporte.filtradas.length} órdenes evaluadas
              </p>
            </div>
          </div>

          {/* Gráfico / Ranking de Proveedores & Modelos */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top Proveedores */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Distribución por Proveedor
              </h4>
              <div className="space-y-3">
                {datosReporte.rankingProveedores.map((item, idx) => {
                  const pct =
                    datosReporte.totalInvertido > 0
                      ? Math.round((item.monto / datosReporte.totalInvertido) * 100)
                      : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <span>
                          {idx + 1}. {item.nombre}
                        </span>
                        <span>
                          {formatCOP(item.monto)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-indigo-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {item.ordenes} orden(es) generadas
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Calzado más Adquirido */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Modelos de Calzado Más Comprados
              </h4>
              <div className="space-y-3">
                {datosReporte.rankingZapatos.slice(0, 5).map((zapato, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {zapato.nombre}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {zapato.pares} pares
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        {formatCOP(zapato.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export { Compras };
