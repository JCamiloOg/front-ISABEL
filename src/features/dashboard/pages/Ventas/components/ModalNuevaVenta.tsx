import { useState, useMemo, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faUser,
  faUserTie,
  faCalendarDay,
  faBarcode,
  faTrashCan,
  faPaperclip,
  faPlus,
  faCheck,
  faMoneyBillWave,
  faBuildingColumns,
  faLayerGroup,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { useUser } from "../../../../../shared/hooks/useUser";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../../data/products";
import type { ProductoConRelaciones } from "../../../../../@types/Products";
import type {
  Abono,
  DetalleVentaItem,
  EstadoVenta,
  MetodoPagoVenta,
  TipoVenta,
  Venta,
} from "../types";
import { CAJAS_DISPONIBLES, CLIENTES_REGISTRADOS, COLOR_NOMBRES } from "../constants";
import {
  calcularTotalesVenta,
  formatCOP,
  formatDate,
  formatoMiles,
  generarId,
  soloDigitos,
} from "../utils";

interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  nuevoCodigo: string;
  onGuardarVenta: (nuevaVenta: Venta) => void;
}

export function ModalNuevaVenta({
  isOpen,
  onClose,
  nuevoCodigo,
  onGuardarVenta,
}: ModalNuevaVentaProps) {
  // ── Usuario autenticado (Vendedor) ──
  const { user } = useUser();
  const usuarioResponsable = user
    ? `${user.name} ${user.lastName}`.trim()
    : "Administrador Isabel";

  // ── Estado del Cliente y Venta ──
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>(
    CLIENTES_REGISTRADOS[0]?.idCliente || "",
  );
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>("Contado");
  const [descuentoRaw, setDescuentoRaw] = useState<string>("");

  // ── Condiciones Contado ──
  const [metodoPagoContado, setMetodoPagoContado] = useState<MetodoPagoVenta>("Efectivo");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);

  // ── Condiciones Crédito ──
  const [cuotaInicialRaw, setCuotaInicialRaw] = useState<string>("");
  const [cajaCuotaInicialId, setCajaCuotaInicialId] = useState<string>(
    CAJAS_DISPONIBLES[0]?.id || "",
  );

  // ── Detalle de Productos en la Venta ──
  const [detalles, setDetalles] = useState<DetalleVentaItem[]>([]);

  // ── Estado de Selección de Producto / Variante ──
  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState<number>(
    MOCK_PRODUCTOS_PRISMA[0]?.idProducto || 1,
  );
  const [colorIdSeleccionado, setColorIdSeleccionado] = useState<number>(0);
  // Mapa de tallas seleccionadas con su cantidad: { [idVariante]: cantidad }
  const [cantidadesPorVariante, setCantidadesPorVariante] = useState<Record<number, number>>({});

  // ── Errores ──
  const [errorSubmit, setErrorSubmit] = useState<string>("");

  // Reiniciar estado cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDetalles([]);
      setDescuentoRaw("");
      setCuotaInicialRaw("");
      setComprobanteFile(null);
      setTipoVenta("Contado");
      setMetodoPagoContado("Efectivo");
      setCantidadesPorVariante({});
      setErrorSubmit("");
    }
  }, [isOpen]);

  // Cliente actual
  const clienteActual = useMemo(
    () => CLIENTES_REGISTRADOS.find((c) => c.idCliente === clienteSeleccionadoId) || CLIENTES_REGISTRADOS[0],
    [clienteSeleccionadoId],
  );

  // Producto actual seleccionado para agregar
  const productoActual: ProductoConRelaciones | undefined = useMemo(
    () => MOCK_PRODUCTOS_PRISMA.find((p) => p.idProducto === productoIdSeleccionado),
    [productoIdSeleccionado],
  );

  // Colores del producto actual con al menos una variante con stock
  const coloresDisponibles = useMemo(() => {
    if (!productoActual) return [];
    return productoActual.colores.filter((c) =>
      c.variantes.some((v) => v.stockActual > 0),
    );
  }, [productoActual]);

  // Color activo (si no está seleccionado, tomar el primero disponible)
  const colorActivo = useMemo(() => {
    if (coloresDisponibles.length === 0) return null;
    const encontrado = coloresDisponibles.find((c) => c.idColor === colorIdSeleccionado);
    return encontrado || coloresDisponibles[0];
  }, [coloresDisponibles, colorIdSeleccionado]);

  // Variantes con stock disponible para el color activo
  const variantesConStock = useMemo(() => {
    if (!colorActivo) return [];
    return colorActivo.variantes.filter((v) => v.stockActual > 0);
  }, [colorActivo]);

  // Manejar cambio de producto
  const handleCambiarProducto = (idProd: number) => {
    setProductoIdSeleccionado(idProd);
    setCantidadesPorVariante({});
    const prod = MOCK_PRODUCTOS_PRISMA.find((p) => p.idProducto === idProd);
    const primerColor = prod?.colores.find((c) => c.variantes.some((v) => v.stockActual > 0));
    setColorIdSeleccionado(primerColor?.idColor || 0);
  };

  // Alternar selección de una talla
  const handleToggleTalla = (idVariante: number, stockActual: number) => {
    setCantidadesPorVariante((prev) => {
      const copia = { ...prev };
      if (copia[idVariante] !== undefined) {
        delete copia[idVariante];
      } else {
        copia[idVariante] = Math.min(1, stockActual);
      }
      return copia;
    });
  };

  // Modificar cantidad de una talla seleccionada
  const handleCambiarCantidadTalla = (idVariante: number, cant: number, stockActual: number) => {
    const cantidadClamped = Math.max(1, Math.min(cant, stockActual));
    setCantidadesPorVariante((prev) => ({
      ...prev,
      [idVariante]: cantidadClamped,
    }));
  };

  // Agregar las variantes/tallas seleccionadas al detalle general de la venta
  const handleAgregarAlDetalle = () => {
    if (!productoActual || !colorActivo) return;

    const idsSeleccionados = Object.keys(cantidadesPorVariante).map(Number);
    if (idsSeleccionados.length === 0) return;

    const nuevosDetalles: DetalleVentaItem[] = [];

    idsSeleccionados.forEach((idVar) => {
      const variante = colorActivo.variantes.find((v) => v.idVariante === idVar);
      if (!variante) return;

      const cantidad = cantidadesPorVariante[idVar] || 1;
      const subtotal = cantidad * productoActual.precioVenta;
      const colorNombre = COLOR_NOMBRES[colorActivo.idColor] || `Color #${colorActivo.idColor}`;

      // Verificar si ya existe en la lista para sumar cantidad o agregar nuevo
      const indiceExistente = detalles.findIndex((d) => d.idVariante === idVar);
      if (indiceExistente >= 0) {
        const itemExistente = detalles[indiceExistente];
        const nuevaCant = Math.min(
          variante.stockActual,
          itemExistente.cantidad + cantidad,
        );
        nuevosDetalles.push({
          ...itemExistente,
          cantidad: nuevaCant,
          subtotal: nuevaCant * productoActual.precioVenta,
        });
      } else {
        nuevosDetalles.push({
          idDetalle: generarId("det"),
          idProducto: productoActual.idProducto,
          nombreProducto: productoActual.nombre,
          sku: productoActual.sku,
          idColor: colorActivo.idColor,
          colorNombre,
          idVariante: variante.idVariante,
          idTalla: variante.idTalla,
          numeroTalla: variante.talla.numeroTalla,
          cantidad,
          precioUnitario: productoActual.precioVenta,
          subtotal,
          imagen: colorActivo.imagenes[0],
          stockDisponible: variante.stockActual,
        });
      }
    });

    // Actualizar detalles mezclando existentes y nuevos
    setDetalles((prev) => {
      const actualizados = [...prev];
      nuevosDetalles.forEach((nuevo) => {
        const idx = actualizados.findIndex((d) => d.idVariante === nuevo.idVariante);
        if (idx >= 0) {
          actualizados[idx] = nuevo;
        } else {
          actualizados.push(nuevo);
        }
      });
      return actualizados;
    });

    // Limpiar selección de variantes del formulario
    setCantidadesPorVariante({});
    setErrorSubmit("");
  };

  const handleEliminarDetalle = (idDetalle: string) => {
    setDetalles((prev) => prev.filter((d) => d.idDetalle !== idDetalle));
  };

  // Cálculos de totales en tiempo real
  const descuentoValor = Number(descuentoRaw) || 0;
  const { subtotal, descuento, iva, total } = calcularTotalesVenta(detalles, descuentoValor);

  // Cálculos de cuota inicial y saldo pendiente
  const cuotaInicialValor = Number(cuotaInicialRaw) || 0;
  const cuotaInicialFinal = tipoVenta === "Crédito" ? Math.min(cuotaInicialValor, total) : total;
  const saldoPendiente = tipoVenta === "Crédito" ? Math.max(0, total - cuotaInicialFinal) : 0;

  // Reset y cierre
  const handleResetModal = () => {
    setDetalles([]);
    setDescuentoRaw("");
    setCuotaInicialRaw("");
    setComprobanteFile(null);
    setTipoVenta("Contado");
    setMetodoPagoContado("Efectivo");
    setCantidadesPorVariante({});
    setErrorSubmit("");
    onClose();
  };

  // Enviar Venta
  const handleSubmitVenta = (e: FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      setErrorSubmit("Debes agregar al menos un producto al detalle de la venta.");
      return;
    }

    if (!clienteActual) {
      setErrorSubmit("Debes seleccionar un cliente para registrar la venta.");
      return;
    }

    if (tipoVenta === "Crédito" && cuotaInicialValor > total) {
      setErrorSubmit("La cuota inicial no puede ser superior al total de la venta.");
      return;
    }

    let estadoCalculado: EstadoVenta = "Pagada";
    if (tipoVenta === "Crédito") {
      estadoCalculado = saldoPendiente === 0 ? "Pagada" : cuotaInicialFinal > 0 ? "Crédito Parcial" : "Crédito Pendiente";
    }

    // Abonos automáticos
    const idVentaGenerada = generarId("vta");
    const abonosIniciales: Abono[] = [];
    const fechaActualISO = new Date().toISOString();

    if (tipoVenta === "Contado") {
      abonosIniciales.push({
        idAbono: generarId("abn"),
        idVenta: idVentaGenerada,
        codigoVenta: nuevoCodigo,
        fecha: fechaActualISO,
        cajaId: CAJAS_DISPONIBLES[0]?.id || "caja-1",
        cajaNombre: CAJAS_DISPONIBLES[0]?.nombre || "Caja Principal",
        metodoPago: metodoPagoContado,
        monto: total,
        comprobanteNombre: comprobanteFile ? comprobanteFile.name : undefined,
        comprobanteUrl: comprobanteFile ? URL.createObjectURL(comprobanteFile) : undefined,
        observaciones: `Pago de contado (${metodoPagoContado}) al registrar venta`,
        registradoPor: usuarioResponsable,
      });
    } else if (tipoVenta === "Crédito" && cuotaInicialFinal > 0) {
      const cajaCuota = CAJAS_DISPONIBLES.find((c) => c.id === cajaCuotaInicialId);
      abonosIniciales.push({
        idAbono: generarId("abn"),
        idVenta: idVentaGenerada,
        codigoVenta: nuevoCodigo,
        fecha: fechaActualISO,
        cajaId: cajaCuota?.id || "caja-inicial-3",
        cajaNombre: cajaCuota?.nombre || "Efectivo",
        metodoPago: "Efectivo",
        monto: cuotaInicialFinal,
        observaciones: "Cuota inicial registrada con la venta a crédito",
        registradoPor: usuarioResponsable,
      });
    }

    const nuevaVenta: Venta = {
      idVenta: idVentaGenerada,
      codigoVenta: nuevoCodigo,
      fecha: fechaActualISO,
      cliente: clienteActual,
      usuarioResponsable,
      tipoVenta,
      detalles,
      subtotal,
      descuento,
      iva,
      total,
      metodoPago: tipoVenta === "Contado" ? metodoPagoContado : undefined,
      comprobanteNombre: comprobanteFile ? comprobanteFile.name : undefined,
      comprobanteUrl: comprobanteFile ? URL.createObjectURL(comprobanteFile) : undefined,
      cuotaInicial: cuotaInicialFinal,
      saldoPendiente,
      estado: estadoCalculado,
      abonos: abonosIniciales,
    };

    onGuardarVenta(nuevaVenta);
    handleResetModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title="Registrar Nueva Venta"
      description="Completa los datos del cliente, selecciona productos con sus variantes y define las condiciones de pago."
      icon={faCartPlus}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-xs text-app-muted">
            Total a facturar:{" "}
            <strong className="text-base font-extrabold text-brand-royal dark:text-brand-sky">
              {formatCOP(total)}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="md" onClick={handleResetModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={faCheck}
              type="submit"
              form="form-nueva-venta"
            >
              Registrar Venta
            </Button>
          </div>
        </div>
      }
    >
      <form id="form-nueva-venta" onSubmit={handleSubmitVenta} noValidate className="flex flex-col gap-6 py-1">
        {errorSubmit && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
            <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 text-sm shrink-0" />
            <span>{errorSubmit}</span>
          </div>
        )}

        {/* ── 1. DATOS GENERALES DE LA VENTA ── */}
        <section className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text flex items-center gap-2 border-b border-brand-sky/15 pb-2.5">
            <FontAwesomeIcon icon={faBarcode} className="text-brand-royal dark:text-brand-sky" />
            Información General de la Venta
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Código generado automáticamente */}
            <div>
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Código de Venta
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-brand-sky/30 bg-brand-royal/5 px-3 py-2.5 text-xs font-mono font-bold text-brand-royal dark:bg-brand-sky/10 dark:text-brand-sky">
                <FontAwesomeIcon icon={faBarcode} />
                <span>{nuevoCodigo}</span>
              </div>
            </div>

            {/* Fecha de venta automática */}
            <div>
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Fecha de Emisión
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-brand-sky/30 bg-app-bg px-3 py-2.5 text-xs font-medium text-app-text">
                <FontAwesomeIcon icon={faCalendarDay} className="text-brand-sky text-sm" />
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
            </div>

            {/* Usuario responsable autenticado (solo lectura, no manual) */}
            <div>
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Vendedor Responsable
              </label>
              <div
                className="flex items-center gap-2 rounded-xl border border-brand-sky/30 bg-app-bg px-3 py-2.5 text-xs font-semibold text-app-text truncate"
                title={usuarioResponsable}
              >
                <FontAwesomeIcon icon={faUserTie} className="text-brand-royal dark:text-brand-sky" />
                <span className="truncate">{usuarioResponsable}</span>
              </div>
            </div>

            {/* Tipo de Venta: Contado o Crédito */}
            <div>
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Tipo de Venta *
              </label>
              <div className="grid grid-cols-2 gap-2" role="radiogroup">
                {(["Contado", "Crédito"] as TipoVenta[]).map((t) => {
                  const activo = tipoVenta === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setTipoVenta(t)}
                      className={`flex items-center justify-center rounded-xl border py-2 text-xs font-bold transition ${
                        activo
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selector de Cliente registrado */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-2 border-t border-brand-sky/15">
            <div className="lg:col-span-6">
              <Select
                label="Cliente *"
                value={clienteSeleccionadoId}
                onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                options={CLIENTES_REGISTRADOS.map((c) => ({
                  value: c.idCliente,
                  label: `${c.nombre} (${c.tipoDocumento} ${c.documento})`,
                }))}
                iconLeft={faUser}
              />
            </div>
            {clienteActual && (
              <div className="lg:col-span-6 flex flex-col justify-center rounded-xl bg-app-bg p-3 text-xs text-app-muted">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Tel:</strong> {clienteActual.telefono}</span>
                  <span><strong>Email:</strong> {clienteActual.email}</span>
                </div>
                <div className="mt-1">
                  <span><strong>Dirección:</strong> {clienteActual.direccion}, {clienteActual.ciudad}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. SELECCIÓN DE PRODUCTO Y VARIANTES (COLORES Y TALLAS CON STOCK) ── */}
        <section className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-sky/15 pb-2.5">
            <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
              <FontAwesomeIcon icon={faLayerGroup} className="text-brand-royal dark:text-brand-sky" />
              Selección de Productos y Tallas en Inventario
            </h3>
            <span className="text-[11px] text-app-muted">
              Solo se muestran colores y tallas con existencias disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Selector de Producto */}
            <div className="sm:col-span-6">
              <Select
                label="Seleccionar Producto"
                value={productoIdSeleccionado}
                onChange={(e) => handleCambiarProducto(Number(e.target.value))}
                options={MOCK_PRODUCTOS_PRISMA.map((p) => ({
                  value: p.idProducto,
                  label: `${p.nombre} — ${formatCOP(p.precioVenta)}`,
                }))}
              />
            </div>

            {/* Selector de Color disponible con existencias */}
            <div className="sm:col-span-6">
              <label className="text-xs font-bold text-app-text mb-1.5 block">
                Color Disponible *
              </label>
              {coloresDisponibles.length === 0 ? (
                <div className="text-xs text-rose-600 dark:text-rose-400 py-2">
                  No hay colores con stock disponible para este modelo.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {coloresDisponibles.map((c) => {
                    const nombreCol = COLOR_NOMBRES[c.idColor] || `Color #${c.idColor}`;
                    const activo = colorActivo?.idColor === c.idColor;
                    return (
                      <button
                        key={c.idProductoColor}
                        type="button"
                        onClick={() => {
                          setColorIdSeleccionado(c.idColor);
                          setCantidadesPorVariante({});
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          activo
                            ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                            : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                        }`}
                      >
                        <span>{nombreCol}</span>
                        {activo && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selección de tallas disponibles */}
          {colorActivo && variantesConStock.length > 0 && (
            <div className="rounded-xl border border-brand-sky/20 bg-app-bg p-4 flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-app-text">
                  Tallas disponibles para {COLOR_NOMBRES[colorActivo.idColor]}:
                </span>
                <span className="text-app-muted">Selecciona una o varias tallas para configurar cantidades</span>
              </div>

              {/* Botones de selección de tallas */}
              <div className="flex flex-wrap gap-2">
                {variantesConStock.map((v) => {
                  const seleccionada = cantidadesPorVariante[v.idVariante] !== undefined;
                  return (
                    <button
                      key={v.idVariante}
                      type="button"
                      onClick={() => handleToggleTalla(v.idVariante, v.stockActual)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        seleccionada
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      <span>Talla {v.talla.numeroTalla}</span>
                      <span className={`text-[10px] px-1 rounded ${seleccionada ? "bg-white/20 text-white" : "bg-brand-sky/10 text-app-muted"}`}>
                        {v.stockActual} disp.
                      </span>
                      {seleccionada && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                    </button>
                  );
                })}
              </div>

              {/* Tabla ilustrativa de cantidades por cada talla seleccionada */}
              {Object.keys(cantidadesPorVariante).length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-brand-sky/20 bg-app-surface shadow-sm">
                  <div className="bg-brand-royal/5 dark:bg-brand-sky/10 px-3.5 py-2 border-b border-brand-sky/15 flex items-center justify-between text-xs">
                    <span className="font-bold text-app-text">
                      Cantidades y Precios por Talla ({productoActual?.nombre} - {COLOR_NOMBRES[colorActivo.idColor]})
                    </span>
                    <span className="text-app-muted text-[11px]">
                      {Object.keys(cantidadesPorVariante).length} {Object.keys(cantidadesPorVariante).length === 1 ? "talla seleccionada" : "tallas seleccionadas"}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-brand-sky/15 text-app-muted font-bold uppercase">
                          <th className="py-2.5 px-3">Talla</th>
                          <th className="py-2.5 px-3 text-center">Cantidad a vender</th>
                          <th className="py-2.5 px-3 text-right">Precio unitario</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-3 text-center">Existencias</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-sky/15">
                        {Object.keys(cantidadesPorVariante).map((idVarStr) => {
                          const idVar = Number(idVarStr);
                          const v = variantesConStock.find((item) => item.idVariante === idVar);
                          if (!v) return null;

                          const cant = cantidadesPorVariante[idVar] || 1;
                          const pUnit = productoActual?.precioVenta || 0;
                          const sub = cant * pUnit;

                          return (
                            <tr key={idVar} className="hover:bg-app-bg transition">
                              <td className="py-2.5 px-3 font-extrabold text-app-text">
                                <span className="inline-block rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5">
                                  {v.talla.numeroTalla}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={1}
                                    max={v.stockActual}
                                    value={cant}
                                    onChange={(e) =>
                                      handleCambiarCantidadTalla(
                                        idVar,
                                        Number(e.target.value),
                                        v.stockActual,
                                      )
                                    }
                                    className="w-16 rounded-lg border border-brand-sky/30 bg-app-bg px-2 py-1 text-xs font-bold text-app-text text-center outline-none focus:border-brand-royal"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-app-muted">
                                {formatCOP(pUnit)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-brand-royal dark:text-brand-sky">
                                {formatCOP(sub)}
                              </td>
                              <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {v.stockActual} unidades disp.
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-app-bg border-t border-brand-sky/15 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      icon={faPlus}
                      onClick={handleAgregarAlDetalle}
                    >
                      Agregar tallas seleccionadas ({Object.keys(cantidadesPorVariante).length}) al pedido
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 3. DETALLE DE VENTA (TABLA DE PRODUCTOS AGREGADOS) ── */}
        <section className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text flex items-center justify-between border-b border-brand-sky/15 pb-2.5">
            <span>Detalle de Productos en la Venta</span>
            <span className="text-xs font-normal text-app-muted">
              {detalles.length} {detalles.length === 1 ? "ítem agregado" : "ítems agregados"}
            </span>
          </h3>

          {detalles.length === 0 ? (
            <div className="py-8 text-center text-xs text-app-muted border border-dashed border-brand-sky/30 rounded-xl">
              No has agregado productos a esta venta aún. Selecciona un calzado, color y tallas arriba.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-sky/20 text-app-muted font-bold uppercase">
                    <th className="py-2.5 px-3">Producto / Variante</th>
                    <th className="py-2.5 px-3 text-center">Talla</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-center w-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sky/15">
                  {detalles.map((item) => (
                    <tr key={item.idDetalle} className="hover:bg-app-bg transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.imagen && (
                            <img
                              src={item.imagen}
                              alt={item.nombreProducto}
                              className="size-9 rounded-lg object-cover border border-brand-sky/20"
                            />
                          )}
                          <div>
                            <span className="font-bold text-app-text block">
                              {item.nombreProducto}
                            </span>
                            <span className="text-[11px] text-app-muted">
                              Color: {item.colorNombre} | SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-app-text">
                        <span className="inline-block rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5">
                          {item.numeroTalla}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-app-text">
                        {item.cantidad}
                      </td>
                      <td className="py-2.5 px-3 text-right text-app-muted font-medium">
                        {formatCOP(item.precioUnitario)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-brand-royal dark:text-brand-sky">
                        {formatCOP(item.subtotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleEliminarDetalle(item.idDetalle)}
                          className="text-app-muted hover:text-rose-600 transition p-1"
                          title="Eliminar ítem"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 4. CONDICIONES DE PAGO Y TOTALES DINÁMICOS ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Condiciones de pago dinámicas (Contado vs Crédito) */}
          <div className="lg:col-span-7 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-app-text border-b border-brand-sky/15 pb-2.5">
              Condiciones de Pago — {tipoVenta}
            </h3>

            {tipoVenta === "Contado" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-app-text mb-1.5 block">
                    Método de Pago *
                  </label>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup">
                    {(["Efectivo", "Transferencia"] as MetodoPagoVenta[]).map((metodo) => {
                      const activo = metodoPagoContado === metodo;
                      return (
                        <button
                          key={metodo}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          onClick={() => setMetodoPagoContado(metodo)}
                          className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                            activo
                              ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                              : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                          }`}
                        >
                          <FontAwesomeIcon icon={metodo === "Efectivo" ? faMoneyBillWave : faBuildingColumns} />
                          <span>{metodo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comprobante de pago (adjunto opcional/recomendado para transferencias) */}
                <div className="flex flex-col gap-1.5 rounded-xl border border-brand-sky/20 bg-app-bg p-3">
                  <label className="text-xs font-bold text-app-text flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPaperclip} className="text-brand-sky" />
                    Comprobante de pago {metodoPagoContado === "Transferencia" ? "(Recomendado)" : "(Opcional)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setComprobanteFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-app-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-royal/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-royal hover:file:bg-brand-royal/20 dark:file:bg-brand-sky/15 dark:file:text-brand-sky"
                  />
                  {comprobanteFile && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      ✓ Adjunto: {comprobanteFile.name}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Cuota Inicial (Opcional)"
                      placeholder="0"
                      inputMode="numeric"
                      value={formatoMiles(cuotaInicialRaw)}
                      onChange={(e) => setCuotaInicialRaw(soloDigitos(e.target.value))}
                      iconLeft={<span className="text-xs font-bold text-app-muted">$</span>}
                      helper="Si no se ingresa, el saldo será el total de la venta."
                    />
                  </div>

                  <div>
                    <Select
                      label="Caja de destino (Cuota Inicial)"
                      value={cajaCuotaInicialId}
                      onChange={(e) => setCajaCuotaInicialId(e.target.value)}
                      options={CAJAS_DISPONIBLES.map((c) => ({
                        value: c.id,
                        label: `${c.nombre} (${c.tipo})`,
                      }))}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-brand-sky/20 bg-app-bg p-3 flex items-center justify-between text-xs">
                  <span className="text-app-muted">Saldo pendiente después de la cuota:</span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                    {formatCOP(saldoPendiente)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de Totales e Impuestos */}
          <div className="lg:col-span-5 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold text-app-text border-b border-brand-sky/15 pb-2.5">
              Resumen de la Venta
            </h3>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Subtotal:</span>
                <span className="font-bold text-app-text">{formatCOP(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-app-muted">Descuento aplicado:</span>
                <div className="w-32">
                  <Input
                    placeholder="0"
                    size="sm"
                    inputMode="numeric"
                    value={formatoMiles(descuentoRaw)}
                    onChange={(e) => setDescuentoRaw(soloDigitos(e.target.value))}
                    iconLeft={<span className="text-xs font-bold text-app-muted">$</span>}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-app-muted">IVA (19%):</span>
                <span className="font-bold text-app-text">{formatCOP(iva)}</span>
              </div>

              <div className="border-t border-brand-sky/20 pt-2.5 flex items-center justify-between text-base">
                <span className="font-extrabold text-app-text">Total de la Venta:</span>
                <span className="font-extrabold text-brand-royal dark:text-brand-sky">
                  {formatCOP(total)}
                </span>
              </div>

              {tipoVenta === "Crédito" && (
                <div className="border-t border-brand-sky/15 pt-2 flex items-center justify-between text-xs">
                  <span className="text-app-muted">Saldo Pendiente a Cobrar:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">
                    {formatCOP(saldoPendiente)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ModalNuevaVenta;
