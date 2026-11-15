import type { Venta } from "../Ventas/types";
import type { Devolucion } from "./types";

// Reutilizamos los formateadores del módulo de Ventas para mantener consistencia.
export { formatCOP, formatDate, generarId } from "../Ventas/utils";

export function generarCodigoDevolucion(devoluciones: Devolucion[]): string {
  const anio = new Date().getFullYear();
  const maximo = devoluciones.reduce((max, d) => {
    const partes = d.codigoDevolucion.split("-");
    const num = Number(partes[partes.length - 1]);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return `DEV-${anio}-${String(maximo + 1).padStart(4, "0")}`;
}

/**
 * Unidades de un ítem de la venta que todavía se pueden devolver.
 * Las devoluciones Pendientes y Aprobadas "reservan" unidades; las Rechazadas no.
 * `excluirIdDevolucion` se usa al editar para no contarse a sí misma.
 */
export function calcularDisponibleDevolver(
  venta: Venta,
  idDetalle: string,
  devoluciones: Devolucion[],
  excluirIdDevolucion?: string,
): number {
  const detalle = venta.detalles.find((d) => d.idDetalle === idDetalle);
  if (!detalle) return 0;

  const reservadas = devoluciones
    .filter(
      (d) =>
        d.idVenta === venta.idVenta &&
        d.idDetalle === idDetalle &&
        d.estado !== "Rechazada" &&
        d.idDevolucion !== excluirIdDevolucion,
    )
    .reduce((acc, d) => acc + d.cantidad, 0);

  return Math.max(0, detalle.cantidad - reservadas);
}

/** Una venta es elegible si no está anulada y aún tiene unidades por devolver. */
export function ventaTieneDisponible(venta: Venta, devoluciones: Devolucion[]): boolean {
  if (venta.estado === "Anulada") return false;
  return venta.detalles.some(
    (d) => calcularDisponibleDevolver(venta, d.idDetalle, devoluciones) > 0,
  );
}

export function soloEnteros(texto: string, maxDigitos = 3): string {
  return texto.replace(/\D/g, "").slice(0, maxDigitos).replace(/^0+(?=\d)/, "");
}
