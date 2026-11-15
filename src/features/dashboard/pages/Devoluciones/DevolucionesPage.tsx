import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateLeft,
  faClock,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Toast } from "../../../../shared/utils/alerts";
import { MOCK_VENTAS } from "../Ventas/constants";
import type { Venta } from "../Ventas/types";
import type { Devolucion, FormDevolucion } from "./types";
import { MOCK_DEVOLUCIONES } from "./constants";
import { generarCodigoDevolucion, generarId } from "./utils";

import { TablaDevoluciones } from "./components/TablaDevoluciones";
import { ModalFormDevolucion } from "./components/ModalFormDevolucion";
import { ModalDetalleDevolucion } from "./components/ModalDetalleDevolucion";
import { ModalCambiarEstado, type AccionEstado } from "./components/ModalCambiarEstado";

const USUARIO_ACTUAL = "Administrador Isabel";

export function DevolucionesPage() {
  // TODO(backend): reemplazar por la consulta de ventas y devoluciones del API.
  const [ventas] = useState<Venta[]>(MOCK_VENTAS);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(MOCK_DEVOLUCIONES);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [idAEditar, setIdAEditar] = useState<string | null>(null);

  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);

  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [idEstado, setIdEstado] = useState<string | null>(null);
  const [accionEstado, setAccionEstado] = useState<AccionEstado>("Aprobada");

  // Las referencias se derivan de la lista para que siempre estén actualizadas
  const devolucionAEditar = useMemo(
    () => devoluciones.find((d) => d.idDevolucion === idAEditar) ?? null,
    [devoluciones, idAEditar],
  );
  const devolucionDetalle = useMemo(
    () => devoluciones.find((d) => d.idDevolucion === idDetalle) ?? null,
    [devoluciones, idDetalle],
  );
  const devolucionEstado = useMemo(
    () => devoluciones.find((d) => d.idDevolucion === idEstado) ?? null,
    [devoluciones, idEstado],
  );

  const codigoSiguiente = useMemo(() => generarCodigoDevolucion(devoluciones), [devoluciones]);

  // Métricas ejecutivas
  const metricas = useMemo(() => {
    const pendientes = devoluciones.filter((d) => d.estado === "Pendiente");
    const aprobadas = devoluciones.filter((d) => d.estado === "Aprobada");
    const rechazadas = devoluciones.filter((d) => d.estado === "Rechazada");
    return {
      total: devoluciones.length,
      pendientes: pendientes.length,
      aprobadas: aprobadas.length,
      unidadesAprobadas: aprobadas.reduce((acc, d) => acc + d.cantidad, 0),
      rechazadas: rechazadas.length,
    };
  }, [devoluciones]);

  // ── Registrar / Actualizar ──
  const handleGuardar = (datos: FormDevolucion, idDevolucion?: string) => {
    if (idDevolucion) {
      setDevoluciones((prev) =>
        prev.map((d) =>
          d.idDevolucion === idDevolucion
            ? { ...d, cantidad: datos.cantidad, motivo: datos.motivo }
            : d,
        ),
      );

      Toast.fire({
        icon: "success",
        title: "Devolución actualizada",
        text: "Se guardaron los cambios de la solicitud.",
      });
    } else {
      const venta = ventas.find((v) => v.idVenta === datos.idVenta);
      const detalle = venta?.detalles.find((d) => d.idDetalle === datos.idDetalle);
      if (!venta || !detalle) return;

      const nueva: Devolucion = {
        idDevolucion: generarId("dev"),
        codigoDevolucion: codigoSiguiente,
        idVenta: venta.idVenta,
        codigoVenta: venta.codigoVenta,
        fechaVenta: venta.fecha,
        cliente: venta.cliente,
        idDetalle: detalle.idDetalle,
        idVariante: detalle.idVariante,
        nombreProducto: detalle.nombreProducto,
        sku: detalle.sku,
        colorNombre: detalle.colorNombre,
        numeroTalla: detalle.numeroTalla,
        imagen: detalle.imagen,
        precioUnitario: detalle.precioUnitario,
        cantidadVendida: detalle.cantidad,
        cantidad: datos.cantidad,
        motivo: datos.motivo,
        estado: "Pendiente",
        fechaSolicitud: new Date().toISOString(),
        usuarioResponsable: USUARIO_ACTUAL,
      };

      setDevoluciones((prev) => [nueva, ...prev]);

      Toast.fire({
        icon: "success",
        title: "Devolución registrada",
        text: `Se creó la solicitud ${nueva.codigoDevolucion} en estado Pendiente.`,
      });
    }

    setIsFormOpen(false);
    setIdAEditar(null);
  };

  // ── Cambiar estado (aprobar / rechazar) ──
  const handleConfirmarEstado = (
    devolucion: Devolucion,
    accion: AccionEstado,
    motivoRechazo?: string,
  ) => {
    setDevoluciones((prev) =>
      prev.map((d) =>
        d.idDevolucion === devolucion.idDevolucion
          ? {
              ...d,
              estado: accion,
              motivoRechazo: accion === "Rechazada" ? motivoRechazo : undefined,
              fechaResolucion: new Date().toISOString(),
            }
          : d,
      ),
    );

    Toast.fire({
      icon: accion === "Aprobada" ? "success" : "info",
      title: accion === "Aprobada" ? "Devolución aprobada" : "Devolución rechazada",
      text: `${devolucion.codigoDevolucion} ahora se encuentra ${accion.toLowerCase()}.`,
    });

    setIsEstadoOpen(false);
    setIdEstado(null);
  };

  // ── Apertura de modales ──
  const handleAbrirRegistrar = () => {
    setIdAEditar(null);
    setIsFormOpen(true);
  };

  const handleAbrirEditar = (d: Devolucion) => {
    setIdAEditar(d.idDevolucion);
    setIsFormOpen(true);
  };

  const handleAbrirDetalle = (d: Devolucion) => {
    setIdDetalle(d.idDevolucion);
    setIsDetalleOpen(true);
  };

  const handleAbrirEstado = (d: Devolucion, accion: AccionEstado) => {
    setIdEstado(d.idDevolucion);
    setAccionEstado(accion);
    setIsEstadoOpen(true);
  };

  return (
    <div className="min-h-full bg-app-bg p-6 text-app-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ── Encabezado Principal ── */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
              Dashboard / Gestión de Ventas / Devoluciones
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-app-text tracking-tight">
              Gestión de Devoluciones
            </h1>
            <div className="mt-2.5 h-1 w-10 rounded-full bg-brand-sky" />
            <p className="mt-3 max-w-2xl text-sm text-app-muted leading-relaxed">
              Registra y da seguimiento a las devoluciones de calzado por garantía u otros motivos, controlando
              el producto, la talla y la cantidad devuelta, y resolviendo cada solicitud con trazabilidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md" icon={faPlus} onClick={handleAbrirRegistrar}>
              Registrar Devolución
            </Button>
          </div>
        </header>

        {/* ── Tarjetas de Métricas ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Total Devoluciones</p>
              <p className="mt-1 text-2xl font-extrabold text-app-text">{metricas.total}</p>
              <span className="text-[11px] text-app-muted">Solicitudes registradas</span>
            </div>
            <div className="size-11 rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faRotateLeft} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Pendientes</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {metricas.pendientes}
              </p>
              <span className="text-[11px] text-app-muted">Por aprobar o rechazar</span>
            </div>
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Aprobadas</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metricas.aprobadas}
              </p>
              <span className="text-[11px] text-app-muted">
                {metricas.unidadesAprobadas} pares devueltos
              </span>
            </div>
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Rechazadas</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {metricas.rechazadas}
              </p>
              <span className="text-[11px] text-rose-500">No cumplen condiciones</span>
            </div>
            <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faCircleXmark} />
            </div>
          </div>
        </section>

        {/* ── Tabla principal ── */}
        <TablaDevoluciones
          devoluciones={devoluciones}
          onVerDetalle={handleAbrirDetalle}
          onEditar={handleAbrirEditar}
          onAprobar={(d) => handleAbrirEstado(d, "Aprobada")}
          onRechazar={(d) => handleAbrirEstado(d, "Rechazada")}
        />
      </div>

      {/* ── Modal Registrar / Editar ── */}
      <ModalFormDevolucion
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setIdAEditar(null);
        }}
        ventas={ventas}
        devoluciones={devoluciones}
        devolucionAEditar={devolucionAEditar}
        codigoSiguiente={codigoSiguiente}
        onGuardar={handleGuardar}
      />

      {/* ── Modal Detalle ── */}
      <ModalDetalleDevolucion
        isOpen={isDetalleOpen}
        onClose={() => {
          setIsDetalleOpen(false);
          setIdDetalle(null);
        }}
        devolucion={devolucionDetalle}
        onEditar={handleAbrirEditar}
        onAprobar={(d) => handleAbrirEstado(d, "Aprobada")}
        onRechazar={(d) => handleAbrirEstado(d, "Rechazada")}
      />

      {/* ── Modal Aprobar / Rechazar ── */}
      <ModalCambiarEstado
        isOpen={isEstadoOpen}
        onClose={() => {
          setIsEstadoOpen(false);
          setIdEstado(null);
        }}
        devolucion={devolucionEstado}
        accion={accionEstado}
        onConfirmar={handleConfirmarEstado}
      />
    </div>
  );
}

export default DevolucionesPage;
