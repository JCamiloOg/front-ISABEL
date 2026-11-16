export type EstadoPedido = "Pendiente" | "En Preparación" | "Enviado" | "Entregado" | "Cancelado";
export type MetodoPago = "Transferencia Bancaria" | "Contra Entrega" | "Wompi / PSE" | "Tarjeta de Crédito" | "Efectivo Bodega";

export interface ItemPedido {
  idItem: number;
  idProducto: number;
  idVariante?: number;
  nombreProducto: string;
  sku: string;
  color: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  imagen: string;
}

export interface ClientePedido {
  nombre: string;
  email: string;
  telefono: string;
  tipoDocumento: "CC" | "CE" | "NIT" | "PASAPORTE";
  documento: string;
  ciudad: string;
  direccion: string;
}

export interface Pedido {
  idPedido: number;
  codigoPedido: string;
  fecha: string;
  clienteId: string;
  cliente?: ClientePedido;
  items: ItemPedido[];
  metodoPago: MetodoPago;
  estado: EstadoPedido;
  subtotal: number;
  costoEnvio: number;
  descuentoTotal: number;
  iva?: number;
  ivaPorcentaje?: number;
  total: number;
  montoAbono?: number;
  imagenComprobante?: string;
  comprobanteNombre?: string;
  observaciones?: string;
  notas?: string;
  guiaTransportadora?: string;
  transportadora?: string;
}