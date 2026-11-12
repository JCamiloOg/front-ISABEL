export type EstadoPedido = "Pendiente" | "En Preparación" | "Enviado" | "Entregado" | "Cancelado";
export type MetodoPago = "Transferencia Bancaria" | "Contra Entrega" | "Wompi / PSE" | "Tarjeta de Crédito" | "Efectivo Bodega";

export interface ItemPedido {
  idItem: number;
  idProducto: number;
  nombreProducto: string;
  sku: string;
  color: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number; // Porcentaje
  subtotal: number;
  imagen: string;
}

export interface ClientePedido {
  nombre: string;
  email: string;
  telefono: string;
  tipoDocumento: "CC" | "NIT" | "CE";
  documento: string;
  ciudad: string;
  direccion: string;
}

export interface Pedido {
  idPedido: number;
  codigoPedido: string; // ej: "PED-2026-001"
  fecha: string; // ISO o formato fecha
  cliente: ClientePedido;
  items: ItemPedido[];
  metodoPago: MetodoPago;
  estado: EstadoPedido;
  subtotal: number;
  costoEnvio: number;
  descuentoTotal: number;
  total: number;
  notas?: string;
  guiaTransportadora?: string;
  transportadora?: string;
}

