import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCartPlus,
  faHandHoldingDollar,
  faDollarSign,
  faReceipt,
  faFileInvoiceDollar,
  faScaleUnbalanced,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Toast } from "../../../../shared/utils/alerts";
import type { MetodoPagoVenta, Venta } from "./types";
import { MOCK_VENTAS } from "./constants";
import {
  formatCOP,
  generarCodigoVenta,
  generarId,
} from "./utils";

import { ModalNuevaVenta } from "./components/ModalNuevaVenta";
import { ModalRegistrarAbono } from "./components/ModalRegistrarAbono";
import { ModalDetalleVenta } from "./components/ModalDetalleVenta";
import { TablaVentas } from "./components/TablaVentas";
import { TablaAbonos } from "./components/TablaAbonos";

export function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>(MOCK_VENTAS);
  const [tabActiva, setTabActiva] = useState<"ventas" | "abonos">("ventas");

  // Modales
  const [modalNuevaVentaOpen, setModalNuevaVentaOpen] = useState(false);
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Código siguiente automático
  const codigoSiguiente = useMemo(() => generarCodigoVenta(ventas), [ventas]);

  // Métricas ejecutivas
  const metricas = useMemo(() => {
    const totalFacturado = ventas.reduce((acc, v) => acc + v.total, 0);
    const ventasContado = ventas.filter((v) => v.tipoVenta === "Contado");
    const totalContado = ventasContado.reduce((acc, v) => acc + v.total, 0);
    const ventasCredito = ventas.filter((v) => v.tipoVenta === "Crédito");
    const totalCredito = ventasCredito.reduce((acc, v) => acc + v.total, 0);
    const saldoPendienteTotal = ventas.reduce((acc, v) => acc + v.saldoPendiente, 0);

    return {
      totalFacturado,
      countContado: ventasContado.length,
      totalContado,
      countCredito: ventasCredito.length,
      totalCredito,
      saldoPendienteTotal,
    };
  }, [ventas]);

  // Guardar nueva venta
  const handleGuardarVenta = (nuevaVenta: Venta) => {
    setVentas((prev) => [nuevaVenta, ...prev]);
    Toast.fire({
      icon: "success",
      title: "Venta registrada con éxito",
      text: `Se emitió la venta ${nuevaVenta.codigoVenta} por ${formatCOP(nuevaVenta.total)}.`,
    });
  };

  // Guardar abono a crédito
  const handleGuardarAbono = (datos: {
    idVenta: string;
    cajaId: string;
    cajaNombre: string;
    metodoPago: MetodoPagoVenta;
    monto: number;
    comprobanteUrl?: string;
    comprobanteNombre?: string;
    observaciones?: string;
  }) => {
    setVentas((prev) =>
      prev.map((v) => {
        if (v.idVenta !== datos.idVenta) return v;

        const nuevoSaldo = Math.max(0, v.saldoPendiente - datos.monto);
        const nuevoEstado = nuevoSaldo === 0 ? "Pagada" : "Crédito Parcial";

        const nuevoAbono = {
          idAbono: generarId("abn"),
          idVenta: v.idVenta,
          codigoVenta: v.codigoVenta,
          fecha: new Date().toISOString(),
          cajaId: datos.cajaId,
          cajaNombre: datos.cajaNombre,
          metodoPago: datos.metodoPago,
          monto: datos.monto,
          comprobanteUrl: datos.comprobanteUrl,
          comprobanteNombre: datos.comprobanteNombre,
          observaciones: datos.observaciones,
          registradoPor: v.usuarioResponsable,
        };

        return {
          ...v,
          saldoPendiente: nuevoSaldo,
          estado: nuevoEstado,
          abonos: [nuevoAbono, ...v.abonos],
        };
      }),
    );

    const ventaAbonada = ventas.find((v) => v.idVenta === datos.idVenta);
    const codigoVenta = ventaAbonada?.codigoVenta || ventaSeleccionada?.codigoVenta || "crédito";

    Toast.fire({
      icon: "success",
      title: "Abono registrado",
      text: `Se abonaron ${formatCOP(datos.monto)} a la venta ${codigoVenta}.`,
    });
  };

  const handleAbrirAbonar = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setModalAbonoOpen(true);
  };

  const handleAbrirDetalle = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setModalDetalleOpen(true);
  };

  return (
    <div className="min-h-full bg-app-bg p-6 text-app-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ── Encabezado Principal ── */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
              Dashboard / Ventas y Abonos
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-app-text tracking-tight">
              Gestión de Ventas y Abonos
            </h1>
            <div className="mt-2.5 h-1 w-10 rounded-full bg-brand-sky" />
            <p className="mt-3 max-w-2xl text-sm text-app-muted leading-relaxed">
              Registra ventas de calzado al contado y a crédito, controla existencias por color y talla, y gestiona
              los abonos y la cartera de clientes en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={faPlus}
              onClick={() => setModalNuevaVentaOpen(true)}
            >
              Registrar Nueva Venta
            </Button>
          </div>
        </header>

        {/* ── Tarjetas de Métricas Ejecutivas ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Facturado */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Total Facturado</p>
              <p className="mt-1 text-xl font-extrabold text-app-text">
                {formatCOP(metricas.totalFacturado)}
              </p>
              <span className="text-[11px] text-app-muted">
                {ventas.length} ventas emitidas
              </span>
            </div>
            <div className="size-11 rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faReceipt} />
            </div>
          </div>

          {/* Ventas de Contado */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Ventas de Contado</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCOP(metricas.totalContado)}
              </p>
              <span className="text-[11px] text-app-muted">
                {metricas.countContado} operaciones liquidadas
              </span>
            </div>
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
          </div>

          {/* Ventas a Crédito */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Ventas a Crédito</p>
              <p className="mt-1 text-xl font-extrabold text-brand-royal dark:text-brand-sky">
                {formatCOP(metricas.totalCredito)}
              </p>
              <span className="text-[11px] text-app-muted">
                {metricas.countCredito} financiamientos
              </span>
            </div>
            <div className="size-11 rounded-xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
          </div>

          {/* Cartera Pendiente por Cobrar */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Cartera por Cobrar</p>
              <p className="mt-1 text-xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatCOP(metricas.saldoPendienteTotal)}
              </p>
              <span className="text-[11px] text-rose-500">
                Saldo pendiente de abonos
              </span>
            </div>
            <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faScaleUnbalanced} />
            </div>
          </div>
        </section>

        {/* ── Pestañas de Navegación del Módulo ── */}
        <div className="flex border-b border-brand-sky/20 gap-3">
          <button
            type="button"
            onClick={() => setTabActiva("ventas")}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition flex items-center gap-2 ${tabActiva === "ventas"
                ? "border-brand-royal text-brand-royal dark:border-brand-sky dark:text-brand-sky"
                : "border-transparent text-app-muted hover:text-app-text"
              }`}
          >
            <FontAwesomeIcon icon={faCartPlus} />
            <span>Módulo de Ventas</span>
            <span className="rounded-full bg-brand-royal/10 dark:bg-brand-sky/15 px-2 py-0.5 text-xs">
              {ventas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("abonos")}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition flex items-center gap-2 ${tabActiva === "abonos"
                ? "border-brand-royal text-brand-royal dark:border-brand-sky dark:text-brand-sky"
                : "border-transparent text-app-muted hover:text-app-text"
              }`}
          >
            <FontAwesomeIcon icon={faHandHoldingDollar} />
            <span>Gestión de Abonos y Cartera</span>
            {metricas.saldoPendienteTotal > 0 && (
              <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-xs font-extrabold">
                {ventas.filter((v) => v.tipoVenta === "Crédito" && v.saldoPendiente > 0).length} pendientes
              </span>
            )}
          </button>
        </div>

        {/* ── Contenido de la pestaña activa ── */}
        {tabActiva === "ventas" ? (
          <TablaVentas
            ventas={ventas}
            onVerDetalle={handleAbrirDetalle}
            onRegistrarAbono={handleAbrirAbonar}
          />
        ) : (
          <TablaAbonos
            ventas={ventas}
            onRegistrarAbono={handleAbrirAbonar}
            onVerDetalle={handleAbrirDetalle}
          />
        )}
      </div>

      {/* ── Modal Nueva Venta ── */}
      <ModalNuevaVenta
        isOpen={modalNuevaVentaOpen}
        onClose={() => setModalNuevaVentaOpen(false)}
        nuevoCodigo={codigoSiguiente}
        onGuardarVenta={handleGuardarVenta}
      />

      {/* ── Modal Registrar Abono (5 campos estrictos) ── */}
      <ModalRegistrarAbono
        isOpen={modalAbonoOpen}
        onClose={() => {
          setModalAbonoOpen(false);
          setVentaSeleccionada(null);
        }}
        venta={ventaSeleccionada}
        onGuardarAbono={handleGuardarAbono}
      />

      {/* ── Modal Detalle de Venta ── */}
      <ModalDetalleVenta
        isOpen={modalDetalleOpen}
        onClose={() => {
          setModalDetalleOpen(false);
          setVentaSeleccionada(null);
        }}
        venta={ventaSeleccionada}
        onAbrirAbonar={handleAbrirAbonar}
      />
    </div>
  );
}

export default VentasPage;

