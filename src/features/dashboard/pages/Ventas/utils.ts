import type { DetalleVentaItem, Venta } from "./types";
import { IVA_RATE } from "./constants";

export function formatCOP(val: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, 12).replace(/^0+(?=\d)/, "");
}

export function formatoMiles(digitos: string): string {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generarCodigoVenta(ventas: Venta[]): string {
  const anio = new Date().getFullYear();
  const maximo = ventas.reduce((max, v) => {
    const partes = v.codigoVenta.split("-");
    const num = Number(partes[partes.length - 1]);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return `VTA-${anio}-${String(maximo + 1).padStart(4, "0")}`;
}

export function calcularTotalesVenta(items: DetalleVentaItem[], descuento: number = 0) {
  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const descuentoAplicado = Math.min(Math.max(0, descuento), subtotal);
  const baseGravable = Math.max(0, subtotal - descuentoAplicado);
  const iva = Math.round(baseGravable * IVA_RATE);
  const total = baseGravable + iva;

  return {
    subtotal,
    descuento: descuentoAplicado,
    iva,
    total,
  };
}
