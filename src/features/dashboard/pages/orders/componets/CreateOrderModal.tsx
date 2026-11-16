import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCheck,
  faCreditCard,
  faLayerGroup,
  faMoneyBillWave,
  faPaperclip,
  faPlus,
  faShoppingCart,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import { Toast } from "../../../../../shared/utils/alerts";
import type { Pedido, ItemPedido, MetodoPago } from "../../../../../@types/Orders";
import type { Client } from "../../../../../@types/client";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../../data/products";
import type { ProductoConRelaciones } from "../../../../../@types/Products";

const COLOR_NAMES: Record<number, string> = {
  101: "Blanco Puro",
  102: "Negro / Blanco",
  103: "Azul Real",
  104: "Rojo Escarlata",
  105: "Gris Platino",
  106: "Verde Militar",
  107: "Beige / Arena",
};

const PAYMENT_METHODS: MetodoPago[] = [
  "Efectivo Bodega",
  "Transferencia Bancaria",
  "Wompi / PSE",
  "Tarjeta de Crédito",
  "Contra Entrega",
];

const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products?: ProductoConRelaciones[];
  onSaveOrder: (nuevoPedido: Pedido) => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  clients,
  products = MOCK_PRODUCTOS_PRISMA,
  onSaveOrder,
}: CreateOrderModalProps) {
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Efectivo Bodega");
  const [notas, setNotas] = useState("");
  const [descuentoRaw, setDescuentoRaw] = useState("");
  const [ivaPorcentajeRaw, setIvaPorcentajeRaw] = useState("19");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [errorSubmit, setErrorSubmit] = useState("");

  const [productoIdSeleccionado, setProductoIdSeleccionado] = useState(
    products[0]?.idProducto ?? 0,
  );
  const [colorIdSeleccionado, setColorIdSeleccionado] = useState(0);
  const [cantidadesPorVariante, setCantidadesPorVariante] = useState<Record<number, number>>({});
  const [costoEnvioRaw, setCostoEnvioRaw] = useState("0");

  const productosDisponibles = useMemo(
    () =>
      products.filter((product) =>
        product.colores.some((color) => color.variantes.some((variant) => variant.stockActual > 0)),
      ),
    [products],
  );

  const productoActual = useMemo(
    () => products.find((product) => product.idProducto === productoIdSeleccionado),
    [products, productoIdSeleccionado],
  );

  const coloresDisponibles = useMemo(
    () =>
      productoActual?.colores.filter((color) =>
        color.variantes.some((variant) => variant.stockActual > 0),
      ) ?? [],
    [productoActual],
  );

  const colorActivo = useMemo(
    () =>
      coloresDisponibles.find((color) => color.idColor === colorIdSeleccionado) ??
      coloresDisponibles[0] ??
      null,
    [coloresDisponibles, colorIdSeleccionado],
  );

  const variantesConStock = useMemo(
    () => colorActivo?.variantes.filter((variant) => variant.stockActual > 0) ?? [],
    [colorActivo],
  );

  const handleCambiarProducto = (idProducto: number) => {
    setProductoIdSeleccionado(idProducto);
    setCantidadesPorVariante({});
    const producto = products.find((item) => item.idProducto === idProducto);
    const primerColor = producto?.colores.find((color) =>
      color.variantes.some((variant) => variant.stockActual > 0),
    );
    setColorIdSeleccionado(primerColor?.idColor ?? 0);
  };

  const handleToggleTalla = (idVariante: number, stockActual: number) => {
    setCantidadesPorVariante((previous) => {
      const next = { ...previous };
      if (next[idVariante] !== undefined) {
        delete next[idVariante];
      } else {
        next[idVariante] = Math.min(1, stockActual);
      }
      return next;
    });
  };

  const handleCambiarCantidadTalla = (idVariante: number, cantidad: number, stockActual: number) => {
    setCantidadesPorVariante((previous) => ({
      ...previous,
      [idVariante]: Math.max(1, Math.min(Number.isFinite(cantidad) ? cantidad : 1, stockActual)),
    }));
  };

  const handleAgregarAlPedido = () => {
    if (!productoActual || !colorActivo || Object.keys(cantidadesPorVariante).length === 0) {
      Toast.fire({ icon: "error", title: "Selecciona al menos una talla disponible" });
      return;
    }

    setItems((previousItems) => {
      const updatedItems = [...previousItems];
      Object.entries(cantidadesPorVariante).forEach(([variantId, quantity], index) => {
        const idVariante = Number(variantId);
        const variante = variantesConStock.find((item) => item.idVariante === idVariante);
        if (!variante) return;

        const existingIndex = updatedItems.findIndex((item) => item.idVariante === idVariante);
        const existingItem = existingIndex >= 0 ? updatedItems[existingIndex] : undefined;
        const finalQuantity = Math.min(
          variante.stockActual,
          (existingItem?.cantidad ?? 0) + quantity,
        );
        const precioUnitario = productoActual.precioVenta;
        const item: ItemPedido = {
          idItem: existingItem?.idItem ?? Date.now() + index,
          idProducto: productoActual.idProducto,
          idVariante,
          nombreProducto: productoActual.nombre,
          sku: productoActual.sku,
          color: COLOR_NAMES[colorActivo.idColor] ?? `Color #${colorActivo.idColor}`,
          talla: variante.talla.numeroTalla,
          cantidad: finalQuantity,
          precioUnitario,
          descuento: 0,
          subtotal: precioUnitario * finalQuantity,
          imagen: colorActivo.imagenes[0] ?? "",
        };

        if (existingIndex >= 0) updatedItems[existingIndex] = item;
        else updatedItems.push(item);
      });
      return updatedItems;
    });

    setCantidadesPorVariante({});
    setErrorSubmit("");
  };

  const handleRemoveItem = (idItem: number) => {
    setItems((previousItems) => previousItems.filter((item) => item.idItem !== idItem));
  };

  const resetForm = () => {
    setClienteId("");
    setMetodoPago("Efectivo Bodega");
    setNotas("");
    setDescuentoRaw("");
    setIvaPorcentajeRaw("19");
    setComprobanteFile(null);
    setItems([]);
    setErrorSubmit("");
    setCantidadesPorVariante({});
    setCostoEnvioRaw("0");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const descuentoTotal = Math.min(Math.max(Number(descuentoRaw) || 0, 0), subtotal);
  const ivaPorcentaje = Math.min(Math.max(Number(ivaPorcentajeRaw) || 0, 0), 100);
  const iva = Math.round(Math.max(0, subtotal - descuentoTotal) * (ivaPorcentaje / 100));
  const costoEnvioNormalizado = Math.max(Number(costoEnvioRaw) || 0, 0);
  const total = subtotal - descuentoTotal + iva + costoEnvioNormalizado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      setErrorSubmit("Selecciona un cliente para el pedido.");
      return;
    }
    if (items.length === 0) {
      setErrorSubmit("Agrega al menos un artículo al pedido.");
      return;
    }
    const comprobanteUrl = comprobanteFile ? URL.createObjectURL(comprobanteFile) : undefined;
    const nuevoPedido: Pedido = {
      idPedido: Date.now(),
      codigoPedido: `PED-2026-${Math.floor(100 + Math.random() * 900)}`,
      fecha: new Date().toISOString(),
      clienteId,
      items,
      metodoPago,
      estado: "Pendiente",
      subtotal,
      costoEnvio: costoEnvioNormalizado,
      descuentoTotal,
      iva,
      ivaPorcentaje,
      total,
      imagenComprobante: comprobanteUrl,
      comprobanteNombre: comprobanteFile?.name,
      observaciones: notas,
      transportadora: "Coordinadora",
      guiaTransportadora: `CRD-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    onSaveOrder(nuevoPedido);
    Toast.fire({ icon: "success", title: "Pedido creado exitosamente" });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Nuevo Pedido"
      description="Selecciona productos y tallas disponibles, define el pago y revisa el resumen del pedido."
      icon={faShoppingCart}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-xs text-app-muted">
            Total del pedido:{" "}
            <strong className="text-base font-extrabold text-brand-royal dark:text-brand-sky">
              {formatCOP(total)}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" form="create-order-form" variant="primary" icon={faShoppingCart}>
              Guardar Pedido
            </Button>
          </div>
        </div>
      }
    >
      <form id="create-order-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 py-1 text-sm">
        {errorSubmit && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
            {errorSubmit}
          </div>
        )}

        <section className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text border-b border-brand-sky/15 pb-2.5">
            Información General del Pedido
          </h3>
          <Select
            label="Cliente *"
            value={clienteId}
            onChange={(event) => {
              setClienteId(event.target.value);
              setErrorSubmit("");
            }}
            options={[
              { value: "", label: "Selecciona un cliente..." },
              ...clients.map((client) => ({
                value: client.id,
                label: `${client.firstName} ${client.lastName} (${client.documentNumber})`,
              })),
            ]}
          />
        </section>

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
            <div className="sm:col-span-6">
              <Select
                label="Seleccionar Producto"
                value={productoIdSeleccionado}
                onChange={(event) => handleCambiarProducto(Number(event.target.value))}
                options={[
                  {
                    value: 0,
                    label: productosDisponibles.length
                      ? "Selecciona un producto del inventario..."
                      : "No hay productos con stock disponible",
                  },
                  ...productosDisponibles.map((product) => ({
                    value: product.idProducto,
                    label: `${product.nombre} — ${formatCOP(product.precioVenta)}`,
                  })),
                ]}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="text-xs font-bold text-app-text mb-1.5 block">Color Disponible *</label>
              {coloresDisponibles.length === 0 ? (
                <p className="text-xs text-rose-600 dark:text-rose-400 py-2">
                  No hay colores con stock disponible para este modelo.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {coloresDisponibles.map((color) => {
                    const nombreColor = COLOR_NAMES[color.idColor] ?? `Color #${color.idColor}`;
                    const isActive = colorActivo?.idColor === color.idColor;
                    return (
                      <button
                        key={color.idProductoColor}
                        type="button"
                        onClick={() => {
                          setColorIdSeleccionado(color.idColor);
                          setCantidadesPorVariante({});
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                            : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                        }`}
                      >
                        {nombreColor}
                        {isActive && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {colorActivo && variantesConStock.length > 0 && (
            <div className="rounded-xl border border-brand-sky/20 bg-app-bg p-4 flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-app-text">
                  Tallas disponibles para {COLOR_NAMES[colorActivo.idColor] ?? `Color #${colorActivo.idColor}`}:
                </span>
                <span className="text-app-muted">
                  Selecciona una o varias tallas para configurar cantidades
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {variantesConStock.map((variant) => {
                  const isSelected = cantidadesPorVariante[variant.idVariante] !== undefined;
                  return (
                    <button
                      key={variant.idVariante}
                      type="button"
                      onClick={() => handleToggleTalla(variant.idVariante, variant.stockActual)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        isSelected
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      <span>Talla {variant.talla.numeroTalla}</span>
                      <span className={`text-[10px] px-1 rounded ${isSelected ? "bg-white/20 text-white" : "bg-brand-sky/10 text-app-muted"}`}>
                        {variant.stockActual} disp.
                      </span>
                      {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                    </button>
                  );
                })}
              </div>

              {Object.keys(cantidadesPorVariante).length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-brand-sky/20 bg-app-surface shadow-sm">
                  <div className="bg-brand-royal/5 dark:bg-brand-sky/10 px-3.5 py-2 border-b border-brand-sky/15 flex items-center justify-between text-xs">
                    <span className="font-bold text-app-text">
                      Cantidades y Precios por Talla ({productoActual?.nombre} - {COLOR_NAMES[colorActivo.idColor]})
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
                          <th className="py-2.5 px-3 text-center">Cantidad a pedir</th>
                          <th className="py-2.5 px-3 text-right">Precio unitario</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-3 text-center">Existencias</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-sky/15">
                        {Object.entries(cantidadesPorVariante).map(([variantId, quantity]) => {
                          const variant = variantesConStock.find((item) => item.idVariante === Number(variantId));
                          if (!variant || !productoActual) return null;
                          return (
                            <tr key={variant.idVariante} className="hover:bg-app-bg transition">
                              <td className="py-2.5 px-3 font-extrabold text-app-text">
                                <span className="inline-block rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5">
                                  {variant.talla.numeroTalla}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  max={variant.stockActual}
                                  value={quantity}
                                  onChange={(event) =>
                                    handleCambiarCantidadTalla(
                                      variant.idVariante,
                                      Number(event.target.value),
                                      variant.stockActual,
                                    )
                                  }
                                  className="w-16 rounded-lg border border-brand-sky/30 bg-app-bg px-2 py-1 text-xs font-bold text-app-text text-center outline-none focus:border-brand-royal"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-app-muted">
                                {formatCOP(productoActual.precioVenta)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-brand-royal dark:text-brand-sky">
                                {formatCOP(quantity * productoActual.precioVenta)}
                              </td>
                              <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {variant.stockActual} unidades disp.
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
                      onClick={handleAgregarAlPedido}
                    >
                      Agregar tallas seleccionadas ({Object.keys(cantidadesPorVariante).length}) al pedido
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-app-text flex items-center justify-between border-b border-brand-sky/15 pb-2.5">
            <span>Detalle de Productos en el Pedido</span>
            <span className="text-xs font-normal text-app-muted">
              {items.length} {items.length === 1 ? "ítem agregado" : "ítems agregados"}
            </span>
          </h3>
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-app-muted border border-dashed border-brand-sky/30 rounded-xl">
              Selecciona un producto, color y tallas disponibles para agregarlos al pedido.
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
                  {items.map((item) => (
                    <tr key={item.idItem} className="hover:bg-app-bg transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.imagen && (
                            <img src={item.imagen} alt={item.nombreProducto} className="size-9 rounded-lg object-cover border border-brand-sky/20" />
                          )}
                          <div>
                            <span className="font-bold text-app-text block">{item.nombreProducto}</span>
                            <span className="text-[11px] text-app-muted">Color: {item.color} | SKU: {item.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-app-text">
                        <span className="inline-block rounded-md border border-brand-sky/30 bg-brand-sky/10 px-2 py-0.5">{item.talla}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-app-text">{item.cantidad}</td>
                      <td className="py-2.5 px-3 text-right text-app-muted font-medium">{formatCOP(item.precioUnitario)}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-brand-royal dark:text-brand-sky">{formatCOP(item.subtotal)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.idItem)}
                          className="text-app-muted hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Eliminar ítem"
                          aria-label={`Eliminar ${item.nombreProducto}, talla ${item.talla}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-app-text border-b border-brand-sky/15 pb-2.5">
              Condiciones de Pago
            </h3>
            <div>
              <label className="text-xs font-bold text-app-text mb-1.5 block">Método de Pago *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Método de pago">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = metodoPago === method;
                  const icon =
                    method === "Transferencia Bancaria"
                      ? faBuildingColumns
                      : method === "Efectivo Bodega" || method === "Contra Entrega"
                        ? faMoneyBillWave
                        : faCreditCard;
                  return (
                    <button
                      key={method}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => {
                        setMetodoPago(method);
                        setErrorSubmit("");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "border-brand-royal bg-brand-royal text-white shadow-sm dark:border-brand-sky dark:bg-brand-sky dark:text-brand-navy"
                          : "border-brand-sky/30 bg-app-surface text-app-muted hover:border-brand-royal"
                      }`}
                    >
                      <FontAwesomeIcon icon={icon} />
                      <span>{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-xl border border-brand-sky/20 bg-app-bg p-3">
              <label htmlFor="order-proof" className="text-xs font-bold text-app-text flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPaperclip} className="text-brand-sky" />
                Comprobante de pago (Opcional)
              </label>
              <input
                id="order-proof"
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) => {
                  setComprobanteFile(event.target.files?.[0] ?? null);
                  setErrorSubmit("");
                }}
                className="text-xs text-app-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-royal/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-royal hover:file:bg-brand-royal/20 dark:file:bg-brand-sky/15 dark:file:text-brand-sky"
              />
              {comprobanteFile && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  Archivo adjunto: {comprobanteFile.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Costo de Envío"
                type="number"
                min={0}
                value={costoEnvioRaw}
                onChange={(event) => setCostoEnvioRaw(event.target.value)}
                iconLeft={<span className="text-xs font-bold text-app-muted">$</span>}
              />
              <Textarea
                label="Notas de Entrega"
                value={notas}
                onChange={(event) => setNotas(event.target.value)}
                placeholder="Instrucciones especiales..."
                rows={2}
              />
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 sm:p-5 flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold text-app-text border-b border-brand-sky/15 pb-2.5">
              Resumen del Pedido
            </h3>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Subtotal:</span>
                <span className="font-bold text-app-text">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="order-discount" className="text-app-muted">Descuento aplicado:</label>
                <div className="w-32">
                  <Input
                    id="order-discount"
                    type="number"
                    min={0}
                    max={subtotal}
                    placeholder="0"
                    size="sm"
                    value={descuentoRaw}
                    onChange={(event) => setDescuentoRaw(event.target.value)}
                    iconLeft={<span className="text-xs font-bold text-app-muted">$</span>}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="order-iva-rate" className="text-app-muted">IVA (%):</label>
                <div className="w-32">
                  <Input
                    id="order-iva-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={ivaPorcentajeRaw}
                    onChange={(event) => setIvaPorcentajeRaw(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Valor del IVA:</span>
                <span className="font-bold text-app-text">{formatCOP(iva)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Costo de envío:</span>
                <span className="font-bold text-app-text">{formatCOP(costoEnvioNormalizado)}</span>
              </div>
              <div className="border-t border-brand-sky/20 pt-2.5 flex items-center justify-between text-base">
                <span className="font-extrabold text-app-text">Total del Pedido:</span>
                <span className="font-extrabold text-brand-royal dark:text-brand-sky">{formatCOP(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}