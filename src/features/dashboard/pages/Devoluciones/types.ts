import type { Cliente } from "../Ventas/types";

/**
 * Estados del flujo de una devolución.
 * Pendiente → (Aprobada | Rechazada). Los estados finales no se revierten.
 */
export type EstadoDevolucion = "Pendiente" | "Aprobada" | "Rechazada";

/**
 * Espejo de `tb_devoluciones_venta`:
 * id_devolucion_venta, id_venta (FK), id_variante (FK), id_usuario (FK),
 * cantidad, motivo, estado, motivo_rechazo, fecha_solicitud, fecha_resolucion.
 *
 * Los campos de venta / cliente / producto son datos "denormalizados" que el
 * backend entregará con los JOIN de tb_ventas, tb_detalle_venta, tb_productos,
 * tb_variante_producto y usuarios.
 */
export interface Devolucion {
  idDevolucion: string;
  codigoDevolucion: string;

  // Venta (FK id_venta)
  idVenta: string;
  codigoVenta: string;
  fechaVenta: string; // ISO
  cliente: Cliente;

  // Producto devuelto (FK id_variante)
  idDetalle: string;
  idVariante: number;
  nombreProducto: string;
  sku: string;
  colorNombre: string;
  numeroTalla: string;
  imagen?: string;
  precioUnitario: number;
  cantidadVendida: number;

  // Datos propios de la devolución
  cantidad: number;
  motivo: string;
  estado: EstadoDevolucion;
  motivoRechazo?: string;
  fechaSolicitud: string; // ISO
  fechaResolucion?: string; // ISO

  // Usuario (FK id_usuario)
  usuarioResponsable: string;
}

/** Campos del formulario de registro / edición. */
export interface FormDevolucion {
  idVenta: string;
  idDetalle: string;
  cantidad: number;
  motivo: string;
}

export type ErroresFormDevolucion = Partial<
  Record<"idVenta" | "idDetalle" | "cantidad" | "motivo", string>
>;
