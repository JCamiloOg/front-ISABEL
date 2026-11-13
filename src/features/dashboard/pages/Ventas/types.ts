export type TipoVenta = "Contado" | "Crédito";

export type MetodoPagoVenta = "Efectivo" | "Transferencia";

export type EstadoVenta = "Pagada" | "Crédito Pendiente" | "Crédito Parcial" | "Anulada";

export interface Cliente {
  idCliente: string;
  nombre: string;
  documento: string;
  tipoDocumento: string; // "CC" | "NIT" | "CE"
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
}

export interface DetalleVentaItem {
  idDetalle: string;
  idProducto: number;
  nombreProducto: string;
  sku: string;
  idColor: number;
  colorNombre: string;
  idVariante: number;
  idTalla: number;
  numeroTalla: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  imagen?: string;
  stockDisponible: number;
}

export interface Abono {
  idAbono: string;
  idVenta: string;
  codigoVenta: string;
  fecha: string; // ISO
  cajaId: string;
  cajaNombre: string;
  metodoPago: MetodoPagoVenta;
  monto: number;
  comprobanteUrl?: string;
  comprobanteNombre?: string;
  observaciones?: string;
  registradoPor: string;
}

export interface Venta {
  idVenta: string;
  codigoVenta: string;
  fecha: string; // ISO
  cliente: Cliente;
  usuarioResponsable: string;
  tipoVenta: TipoVenta;
  detalles: DetalleVentaItem[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodoPago?: MetodoPagoVenta;
  comprobanteUrl?: string;
  comprobanteNombre?: string;
  cuotaInicial: number;
  saldoPendiente: number;
  estado: EstadoVenta;
  abonos: Abono[];
  notas?: string;
}

export interface FormAbono {
  cajaId: string;
  metodoPago: MetodoPagoVenta;
  monto: string;
  comprobanteFile: File | null;
  comprobanteNombre: string;
  observaciones: string;
}

export type ErroresAbono = Partial<Record<"cajaId" | "monto" | "comprobanteFile", string>>;

