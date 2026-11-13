import type { Almacen, Caja, ErroresCaja, ErroresGasto, FormCaja, FormGasto, Gasto } from "./types";
import { ALMACEN_INICIAL, MAX_DIGITOS, STORAGE_KEY } from "./constants";

export function formatoMiles(digitos: string): string {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatoCOP(valor: number): string {
  return `$${formatoMiles(String(Math.round(valor)))}`;
}

export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, MAX_DIGITOS).replace(/^0+(?=\d)/, "");
}

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function limpiarEspacios(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function esFechaValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return (
    anio >= 1900 &&
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

export function formatoFecha(iso: string): string {
  return iso.split("-").reverse().join("/");
}

export function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function siguienteCodigo(gastos: Gasto[]): string {
  const maximo = gastos.reduce((max, g) => {
    const numero = Number(g.codigo.replace(/\D/g, ""));
    return Number.isFinite(numero) && numero > max ? numero : max;
  }, 0);
  return `GAS-${String(maximo + 1).padStart(4, "0")}`;
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function esAlmacen(valor: unknown): valor is Almacen {
  if (!esObjeto(valor)) return false;
  const { cajas, gastos, conceptos } = valor;
  if (!Array.isArray(cajas) || !Array.isArray(gastos) || !Array.isArray(conceptos)) return false;
  return (
    cajas.every(
      (c: unknown) =>
        esObjeto(c) &&
        typeof c.id === "string" &&
        typeof c.nombre === "string" &&
        (c.tipo === "Cuenta bancaria" || c.tipo === "Efectivo") &&
        typeof c.saldo === "number",
    ) &&
    gastos.every(
      (g: unknown) =>
        esObjeto(g) &&
        typeof g.id === "string" &&
        typeof g.codigo === "string" &&
        typeof g.concepto === "string" &&
        typeof g.fecha === "string" &&
        typeof g.cajaId === "string" &&
        typeof g.cajaNombre === "string" &&
        typeof g.valor === "number" &&
        typeof g.descripcion === "string",
    ) &&
    conceptos.every((c: unknown) => typeof c === "string")
  );
}

export function cargarAlmacen(): Almacen {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY);
    if (!crudo) return ALMACEN_INICIAL;
    const parseado: unknown = JSON.parse(crudo);
    if (esAlmacen(parseado) && parseado.cajas.length > 0) return parseado;
  } catch {
    /* Si el almacenamiento falla o está corrupto, usar datos iniciales */
  }
  return ALMACEN_INICIAL;
}

export function guardarAlmacen(almacen: Almacen): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
  } catch {
    /* Si localStorage está bloqueado, se preserva en memoria */
  }
}

export function validarGasto(form: FormGasto, cajas: Caja[]): ErroresGasto {
  const errores: ErroresGasto = {};

  if (!form.concepto) {
    errores.concepto = "Selecciona un concepto.";
  }

  if (!form.fecha) {
    errores.fecha = "La fecha es obligatoria.";
  } else if (!esFechaValida(form.fecha)) {
    errores.fecha = "Ingresa una fecha válida.";
  } else if (form.fecha > hoyISO()) {
    errores.fecha = "La fecha no puede ser futura.";
  }

  const caja = cajas.find((c) => c.id === form.cajaId);
  if (!form.cajaId) {
    errores.cajaId = "Selecciona la caja de origen.";
  } else if (!caja) {
    errores.cajaId = "La caja seleccionada ya no existe.";
  }

  if (!form.valor) {
    errores.valor = "El valor es obligatorio.";
  } else {
    const valor = Number(form.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      errores.valor = "El valor debe ser mayor que cero.";
    } else if (caja && valor > caja.saldo) {
      errores.valor = `El valor supera el saldo disponible de ${caja.nombre} (${formatoCOP(caja.saldo)}).`;
    }
  }

  return errores;
}

export function validarCaja(form: FormCaja, cajas: Caja[]): ErroresCaja {
  const errores: ErroresCaja = {};
  const nombre = limpiarEspacios(form.nombre);

  if (!nombre) {
    errores.nombre = "El nombre de la caja es obligatorio.";
  } else if (nombre.length > 40) {
    errores.nombre = "El nombre no puede superar los 40 caracteres.";
  } else if (cajas.some((c) => normalizar(c.nombre) === normalizar(nombre))) {
    errores.nombre = "Ya existe una caja con ese nombre.";
  }

  if (!form.tipo) {
    errores.tipo = "Selecciona el tipo de caja.";
  }

  if (!form.saldo) {
    errores.saldo = "El saldo inicial es obligatorio (puede ser 0).";
  }

  return errores;
}

