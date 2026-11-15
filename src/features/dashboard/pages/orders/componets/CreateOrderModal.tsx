import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import { Toast } from "../../../../../shared/utils/alerts";
import type { Pedido, ItemPedido, MetodoPago } from "../../../../../@types/Orders";
import type { Client } from "../../../../../@types/client";

// Opcional: Define una interfaz para tus productos si la tienes en otro archivo, 
// o puedes ajustarla según tu tipo de producto real.
export interface ProductItem {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  color: string;
  talla: string;
  imagen: string;
}

// Mock de ejemplo de productos (puedes reemplazarlo por tus productos reales o recibirlos por props)
const MOCK_PRODUCTS: ProductItem[] = [
  { id: 1, nombre: "Nike Air Force 1 '07", sku: "NK-AF1-001", precio: 289900, color: "Blanco Puro", talla: "42", imagen: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80" },
  { id: 2, nombre: "Adidas Ultraboost Light", sku: "AD-UBL-002", precio: 389900, color: "Negro Obsidiana", talla: "41", imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80" },
  { id: 3, nombre: "Puma Suede Classic XXI", sku: "PM-SDC-003", precio: 199900, color: "Azul Real", talla: "43", imagen: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=500&q=80" },
  { id: 4, nombre: "New Balance 574 Core", sku: "NB-574-004", precio: 249900, color: "Gris Platino", talla: "38", imagen: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=500&q=80" },
];

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products?: ProductItem[]; // Puedes pasar los productos reales por props si los tienes
  onSaveOrder: (nuevoPedido: Pedido) => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  clients,
  products = MOCK_PRODUCTS,
  onSaveOrder,
}: CreateOrderModalProps) {
  // Estados del formulario general
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Wompi / PSE");
  const [costoEnvio, setCostoEnvio] = useState<number>(0);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemPedido[]>([]);

  // Estado del producto seleccionado actualmente en el selector temporal
  const [selectedProductId, setSelectedProductId] = useState("");
  const [tempCantidad, setTempCantidad] = useState(1);
  const [tempPrecio, setTempPrecio] = useState(0);
  const [tempTalla, setTempTalla] = useState("38");
  const [tempColor, setTempColor] = useState("");
  const [tempSku, setTempSku] = useState("");
  const [tempNombre, setTempNombre] = useState("");
  const [tempImagen, setTempImagen] = useState("");

  // Función que se ejecuta al seleccionar un producto del desplegable
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const found = products.find((p) => p.id.toString() === productId);

    if (found) {
      // Autocompleta automáticamente los campos con la información del producto
      setTempNombre(found.nombre);
      setTempSku(found.sku);
      setTempPrecio(found.precio);
      setTempColor(found.color);
      setTempTalla(found.talla);
      setTempImagen(found.imagen);
    } else {
      // Limpiar si no selecciona nada
      setTempNombre("");
      setTempSku("");
      setTempPrecio(0);
      setTempColor("");
      setTempTalla("38");
      setTempImagen("/shoesGreenSplash.jpg");
    }
  };

  const handleAddItem = () => {
    if (!tempNombre || tempPrecio <= 0) {
      Toast.fire({ icon: "error", title: "Selecciona o ingresa un producto válido con precio" });
      return;
    }

    const newItem: ItemPedido = {
      idItem: Date.now(),
      idProducto: Number(selectedProductId) || Math.floor(Math.random() * 1000),
      nombreProducto: tempNombre,
      sku: tempSku || "ZAP-GEN-01",
      color: tempColor || "Único",
      talla: tempTalla,
      cantidad: tempCantidad,
      precioUnitario: tempPrecio,
      descuento: 0,
      subtotal: tempPrecio * tempCantidad,
      imagen: tempImagen || "/shoesGreenSplash.jpg",
    };

    setItems([...items, newItem]);

    // Resetear selección temporal
    setSelectedProductId("");
    setTempNombre("");
    setTempSku("");
    setTempPrecio(0);
    setTempColor("");
    setTempCantidad(1);
  };

  const handleRemoveItem = (idItem: number) => {
    setItems(items.filter((i) => i.idItem !== idItem));
  };

  // Cálculos de totales
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = subtotal + Number(costoEnvio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      Toast.fire({ icon: "error", title: "Selecciona un cliente para el pedido" });
      return;
    }
    if (items.length === 0) {
      Toast.fire({ icon: "error", title: "Agrega al menos un artículo al pedido" });
      return;
    }

    const nuevoPedido: Pedido = {
      idPedido: Date.now(),
      codigoPedido: `PED-2026-${Math.floor(100 + Math.random() * 900)}`,
      fecha: new Date().toISOString(),
      clienteId,
      items,
      metodoPago,
      estado: "Pendiente",
      subtotal,
      costoEnvio: Number(costoEnvio),
      descuentoTotal: 0,
      total,
      observaciones: notas,
      transportadora: "Coordinadora",
      guiaTransportadora: `CRD-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    onSaveOrder(nuevoPedido);
    Toast.fire({ icon: "success", title: "Pedido creado exitosamente" });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Pedido"
      description="Crea un pedido seleccionando un cliente del directorio y productos del catálogo."
      icon={faShoppingCart}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Guardar Pedido
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {/* Selección de Cliente y Método de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">Cliente Registrado</label>
            <Select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              options={[
                { value: "", label: "Selecciona un cliente..." },
                ...clients.map((c) => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName} (${c.documentNumber})`,
                })),
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-app-text mb-1">Método de Pago</label>
            <Select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              options={[
                { value: "Wompi / PSE", label: "Wompi / PSE" },
                { value: "Transferencia Bancaria", label: "Transferencia Bancaria" },
                { value: "Contra Entrega", label: "Contra Entrega" },
                { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
                { value: "Efectivo Bodega", label: "Efectivo Bodega" },
              ]}
            />
          </div>
        </div>

        {/* Sección de Selección de Productos con Autocompletado */}
        <div className="space-y-3 pt-3 border-t border-app-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-app-text">
            Agregar Artículos al Pedido
          </h3>

          <div className="p-3.5 rounded-2xl bg-app-surface-alt border border-app-border space-y-3">
            {/* Selector principal del catálogo */}
            <div>
              <label className="block text-[11px] font-bold text-app-text mb-1">
                Seleccionar Producto del Catálogo (Autocompleta datos)
              </label>
              <Select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                options={[
                  { value: "", label: "-- Elige un calzado del inventario --" },
                  ...products.map((prod) => ({
                    value: prod.id.toString(),
                    label: `${prod.nombre} (SKU: ${prod.sku}) - $${prod.precio.toLocaleString()}`,
                  })),
                ]}
              />
            </div>

            {/* Campos autocompletados o editables */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-app-muted mb-1">Nombre / Referencia</label>
                <Input
                  value={tempNombre}
                  onChange={(e) => setTempNombre(e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-app-muted mb-1">Talla</label>
                <Input value={tempTalla} onChange={(e) => setTempTalla(e.target.value)} placeholder="38" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-app-muted mb-1">Color</label>
                <Input value={tempColor} onChange={(e) => setTempColor(e.target.value)} placeholder="Color" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-app-muted mb-1">Cant.</label>
                <Input
                  type="number"
                  value={tempCantidad}
                  onChange={(e) => setTempCantidad(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-app-muted mb-1">Precio Unit. ($)</label>
                <Input
                  type="number"
                  value={tempPrecio || ""}
                  onChange={(e) => setTempPrecio(Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end pt-2">
                <Button type="button" variant="primary" icon={faPlus} onClick={handleAddItem} className="text-xs">
                  Añadir al Pedido
                </Button>
              </div>
            </div>
          </div>

          {/* Listado de ítems agregados al pedido */}
          {items.length > 0 && (
            <div className="space-y-2 pt-2">
              {items.map((item) => (
                <div key={item.idItem} className="flex items-center justify-between p-2.5 rounded-xl bg-app-surface border border-app-border text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={item.imagen} alt="" className="w-10 h-10 rounded-lg object-cover bg-white border" />
                    <div>
                      <span className="font-bold text-app-text block">{item.nombreProducto}</span>
                      <span className="text-app-muted">
                        SKU: {item.sku} | Talla: {item.talla} | Color: {item.color} | Cant: {item.cantidad} x ${item.precioUnitario.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-brand-royal dark:text-brand-sky">
                      ${item.subtotal.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.idItem)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Costo de envío y Notas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-app-border">
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">Costo de Envío ($)</label>
            <Input
              type="number"
              value={costoEnvio}
              onChange={(e) => setCostoEnvio(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">Notas de Entrega</label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Instrucciones especiales..."
              rows={2}
            />
          </div>
        </div>

        {/* Resumen Total */}
        <div className="p-3 rounded-2xl bg-app-surface-alt border border-app-border flex justify-between items-center text-sm">
          <span className="font-bold text-app-text">Total a Pagar:</span>
          <span className="text-xl font-black text-brand-royal dark:text-brand-sky">
            ${total.toLocaleString()} COP
          </span>
        </div>
      </form>
    </Modal>
  );
}