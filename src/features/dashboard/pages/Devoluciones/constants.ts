import { MOCK_VENTAS } from "../Ventas/constants";
import type { Devolucion, EstadoDevolucion } from "./types";

export const MOTIVO_MIN_LENGTH = 10;
export const MOTIVO_MAX_LENGTH = 250;

export const ESTADOS_DEVOLUCION: EstadoDevolucion[] = ["Pendiente", "Aprobada", "Rechazada"];

/** Atajos para rellenar el motivo con un clic (el usuario puede editarlo). */
export const MOTIVOS_SUGERIDOS: string[] = [
  "Defecto de fábrica",
  "Talla incorrecta",
  "Producto diferente al pedido",
  "Garantía del producto",
  "Daño durante el transporte",
  "El cliente se arrepintió de la compra",
];

const venta1 = MOCK_VENTAS[0];
const venta2 = MOCK_VENTAS[1];
const venta3 = MOCK_VENTAS[2];

export const MOCK_DEVOLUCIONES: Devolucion[] = [
  {
    idDevolucion: "dev-001",
    codigoDevolucion: "DEV-2026-0001",
    idVenta: venta1.idVenta,
    codigoVenta: venta1.codigoVenta,
    fechaVenta: venta1.fecha,
    cliente: venta1.cliente,
    idDetalle: venta1.detalles[0].idDetalle,
    idVariante: venta1.detalles[0].idVariante,
    nombreProducto: venta1.detalles[0].nombreProducto,
    sku: venta1.detalles[0].sku,
    colorNombre: venta1.detalles[0].colorNombre,
    numeroTalla: venta1.detalles[0].numeroTalla,
    imagen: venta1.detalles[0].imagen,
    precioUnitario: venta1.detalles[0].precioUnitario,
    cantidadVendida: venta1.detalles[0].cantidad,
    cantidad: 1,
    motivo: "La talla 42 le queda grande al cliente, solicita devolución por mal calce.",
    estado: "Aprobada",
    fechaSolicitud: "2026-11-12T09:00:00",
    fechaResolucion: "2026-11-12T15:30:00",
    usuarioResponsable: "Administrador Isabel",
  },
  {
    idDevolucion: "dev-002",
    codigoDevolucion: "DEV-2026-0002",
    idVenta: venta2.idVenta,
    codigoVenta: venta2.codigoVenta,
    fechaVenta: venta2.fecha,
    cliente: venta2.cliente,
    idDetalle: venta2.detalles[0].idDetalle,
    idVariante: venta2.detalles[0].idVariante,
    nombreProducto: venta2.detalles[0].nombreProducto,
    sku: venta2.detalles[0].sku,
    colorNombre: venta2.detalles[0].colorNombre,
    numeroTalla: venta2.detalles[0].numeroTalla,
    imagen: venta2.detalles[0].imagen,
    precioUnitario: venta2.detalles[0].precioUnitario,
    cantidadVendida: venta2.detalles[0].cantidad,
    cantidad: 1,
    motivo: "Suela despegada al primer uso. Se solicita revisión por garantía de fábrica.",
    estado: "Pendiente",
    fechaSolicitud: "2026-11-13T11:20:00",
    usuarioResponsable: "Administrador Isabel",
  },
  {
    idDevolucion: "dev-003",
    codigoDevolucion: "DEV-2026-0003",
    idVenta: venta3.idVenta,
    codigoVenta: venta3.codigoVenta,
    fechaVenta: venta3.fecha,
    cliente: venta3.cliente,
    idDetalle: venta3.detalles[0].idDetalle,
    idVariante: venta3.detalles[0].idVariante,
    nombreProducto: venta3.detalles[0].nombreProducto,
    sku: venta3.detalles[0].sku,
    colorNombre: venta3.detalles[0].colorNombre,
    numeroTalla: venta3.detalles[0].numeroTalla,
    imagen: venta3.detalles[0].imagen,
    precioUnitario: venta3.detalles[0].precioUnitario,
    cantidadVendida: venta3.detalles[0].cantidad,
    cantidad: 1,
    motivo: "El cliente se arrepintió de la compra.",
    estado: "Rechazada",
    motivoRechazo:
      "El par presenta signos de uso y no cumple las condiciones de devolución por arrepentimiento.",
    fechaSolicitud: "2026-11-13T16:10:00",
    fechaResolucion: "2026-11-14T08:45:00",
    usuarioResponsable: "Administrador Isabel",
  },
];
