import { useEffect, useMemo, useState } from "react";
import { faPlus, faTrashCan, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Button } from "../../../../../shared/components/Button";
import { Toast } from "../../../../../shared/utils/alerts";
import {
  getCustomersForSale,
  getProductsForSale,
  type CashRegisterOption,
  type CreateSalePayload,
  type PaymentMethodOption,
  type ProductForSaleItem,
  type SaleUserSummary,
} from "../services/salesServices";

interface FlattenedVariantOption {
  variantId: number;
  label: string;
  productName: string;
  colorName: string;
  sizeNumber: string;
  unitPrice: number;
  currentStock: number;
}

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashRegisters: CashRegisterOption[];
  paymentMethods: PaymentMethodOption[];
  defaultSellerId: string;
  onSubmit: (payload: CreateSalePayload) => Promise<void>;
  isLoading: boolean;
}

export function SaleFormModal({
  isOpen,
  onClose,
  cashRegisters,
  paymentMethods,
  defaultSellerId,
  onSubmit,
  isLoading,
}: SaleFormModalProps) {
  const [customers, setCustomers] = useState<SaleUserSummary[]>([]);
  const [products, setProducts] = useState<ProductForSaleItem[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState<boolean>(false);

  // Campos de Sale
  const [customerId, setCustomerId] = useState<string>("");
  const [sellerId, setSellerId] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [vat, setVat] = useState<string>("19");
  const [isCredit, setIsCredit] = useState<boolean>(false);

  // Campos de Payment (abono o pago inicial)
  const [cashRegisterId, setCashRegisterId] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [initialAmount, setInitialAmount] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Selector de producto
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantityToAdd, setQuantityToAdd] = useState<string>("1");
  const [cartItems, setCartItems] = useState<
    { variantId: number; quantity: number; unitPrice: number }[]
  >([]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Aplanar productos -> colores -> tallas con stock > 0
  const availableVariants = useMemo<FlattenedVariantOption[]>(() => {
    const list: FlattenedVariantOption[] = [];
    for (const prod of products) {
      const basePrice = Number(prod.salePrice) || 0;
      for (const pc of prod.productColors || []) {
        for (const v of pc.productVariants || []) {
          if (v.currentStock > 0) {
            list.push({
              variantId: v.id,
              productName: prod.name,
              colorName: pc.color?.name || "",
              sizeNumber: v.size?.sizeNumber || "",
              unitPrice: basePrice,
              currentStock: v.currentStock,
              label: `${prod.name} (${pc.color?.name || "Único"} · Talla ${
                v.size?.sizeNumber || "-"
              }) — ${formatCurrency(basePrice)} [Stock: ${v.currentStock}]`,
            });
          }
        }
      }
    }
    return list;
  }, [products]);

  // Cargar clientes y productos desde GET /sales/customers y GET /sales/products al abrir
  useEffect(() => {
    if (!isOpen) return;

    const loadCatalogs = async () => {
      try {
        setIsLoadingCatalogs(true);
        const [custRes, prodRes] = await Promise.all([
          getCustomersForSale(""),
          getProductsForSale(""),
        ]);
        const loadedCustomers = custRes.data.customers || [];
        const loadedProducts = prodRes.data.products || [];

        setCustomers(loadedCustomers);
        setProducts(loadedProducts);
        setCustomerId(loadedCustomers[0]?.identityDocument || "");
        setSellerId(defaultSellerId || loadedCustomers[0]?.identityDocument || "");
      } catch {
        Toast.fire({
          icon: "error",
          title: "No se pudieron cargar clientes o productos disponibles.",
        });
      } finally {
        setIsLoadingCatalogs(false);
      }
    };

    setDiscount("0");
    setVat("19");
    setIsCredit(false);
    setCashRegisterId(cashRegisters[0] ? String(cashRegisters[0].id) : "");
    setPaymentMethodId(paymentMethods[0] ? String(paymentMethods[0].id) : "");
    setInitialAmount("");
    setPaymentNotes("");
    setQuantityToAdd("1");
    setCartItems([]);

    loadCatalogs();
  }, [isOpen, cashRegisters, paymentMethods, defaultSellerId]);

  useEffect(() => {
    if (availableVariants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(String(availableVariants[0].variantId));
    }
  }, [availableVariants, selectedVariantId]);

  const handleAddItem = () => {
    const vId = Number(selectedVariantId);
    const qty = Number(quantityToAdd);

    if (!vId || qty <= 0) {
      Toast.fire({ icon: "warning", title: "Selecciona una referencia y cantidad válida." });
      return;
    }

    const variantObj = availableVariants.find((v) => v.variantId === vId);
    if (!variantObj) return;

    const existingIdx = cartItems.findIndex((i) => i.variantId === vId);
    const currentQty = existingIdx >= 0 ? cartItems[existingIdx].quantity : 0;

    if (currentQty + qty > variantObj.currentStock) {
      Toast.fire({
        icon: "warning",
        title: `Stock insuficiente. Disponible: ${variantObj.currentStock} unidades.`,
      });
      return;
    }

    if (existingIdx >= 0) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + qty } : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        { variantId: vId, quantity: qty, unitPrice: variantObj.unitPrice },
      ]);
    }
    setQuantityToAdd("1");
  };

  const handleRemoveItem = (variantId: number) => {
    setCartItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const discountPct = Math.min(100, Math.max(0, Number(discount) || 0));
    const vatPct = Math.max(0, Number(vat) || 0);

    const discountAmount = subtotal * (discountPct / 100);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const vatAmount = taxableBase * (vatPct / 100);
    const total = Math.round(taxableBase + vatAmount);

    return { subtotal, discountAmount, vatAmount, total };
  }, [cartItems, discount, vat]);

  // Si es venta de contado, sincronizar automáticamente el monto de pago con el total
  useEffect(() => {
    if (!isCredit) {
      setInitialAmount(totals.total > 0 ? String(totals.total) : "");
    }
  }, [isCredit, totals.total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      Toast.fire({ icon: "warning", title: "Selecciona un cliente para la venta." });
      return;
    }
    if (!sellerId) {
      Toast.fire({ icon: "warning", title: "Selecciona el vendedor responsable." });
      return;
    }
    if (cartItems.length === 0) {
      Toast.fire({ icon: "warning", title: "Agrega al menos un producto a la venta." });
      return;
    }

    const paidNow = Number(initialAmount) || 0;
    if (!isCredit && paidNow < totals.total) {
      Toast.fire({
        icon: "warning",
        title: "En ventas de contado el pago debe cubrir el total de la factura.",
      });
      return;
    }

    if (paidNow > 0 && (!cashRegisterId || !paymentMethodId)) {
      Toast.fire({
        icon: "warning",
        title: "Selecciona la caja y el método de pago para registrar el ingreso.",
      });
      return;
    }

    const payload: CreateSalePayload = {
      saleInfo: {
        customerId,
        userId: sellerId,
        discount: Math.min(100, Math.max(0, Number(discount) || 0)),
        isCredit,
        isDirectSale: true,
        vat: Math.max(0, Number(vat) || 0),
        status: isCredit && paidNow < totals.total ? "Pendiente" : "Entregada",
      },
      saleDetails: cartItems,
      ...(paidNow > 0
        ? {
            initialPayment: {
              cashRegisterId: Number(cashRegisterId),
              userId: sellerId,
              paymentMethodId: Number(paymentMethodId),
              amount: paidNow,
              notes: paymentNotes.trim() || null,
            },
          }
        : {}),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nueva Venta"
      description="Completa los datos del cliente, referencias vendidas y el recaudo en caja"
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={faCartPlus}
            onClick={handleSubmit}
            disabled={isLoading || cartItems.length === 0}
          >
            {isLoading ? "Registrando..." : `Confirmar Venta (${formatCurrency(totals.total)})`}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente y Vendedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente *"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={
              isLoadingCatalogs
                ? [{ value: "", label: "Cargando clientes..." }]
                : customers.length > 0
                ? customers.map((c) => ({
                    value: c.identityDocument,
                    label: `${c.firstName} ${c.lastName} (${c.identityDocument})`,
                  }))
                : [{ value: "", label: "No hay clientes activos" }]
            }
          />

          <Select
            label="Vendedor Responsable *"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            options={
              customers.length > 0
                ? customers.map((u) => ({
                    value: u.identityDocument,
                    label: `${u.firstName} ${u.lastName} (${u.identityDocument})`,
                  }))
                : [{ value: "", label: "Sin usuarios disponibles" }]
            }
          />
        </div>

        {/* Descuento, IVA y Modalidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="number"
            label="Descuento (%)"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <Input
            type="number"
            label="IVA (%)"
            min={0}
            max={100}
            value={vat}
            onChange={(e) => setVat(e.target.value)}
          />
          <Select
            label="Modalidad de Venta"
            value={isCredit ? "credit" : "cash"}
            onChange={(e) => setIsCredit(e.target.value === "credit")}
            options={[
              { value: "cash", label: "Contado (Pago inmediato)" },
              { value: "credit", label: "Crédito / Abonos" },
            ]}
          />
        </div>

        {/* Selector de Producto */}
        <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
            Agregar Producto al Detalle
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-8">
              <Select
                label="Referencia / Talla con Stock"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                options={
                  isLoadingCatalogs
                    ? [{ value: "", label: "Cargando inventario disponible..." }]
                    : availableVariants.length > 0
                    ? availableVariants.map((v) => ({
                        value: String(v.variantId),
                        label: v.label,
                      }))
                    : [{ value: "", label: "No hay variantes con stock disponible" }]
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                type="number"
                label="Cant."
                min={1}
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="primary"
                icon={faPlus}
                onClick={handleAddItem}
                className="w-full"
                disabled={availableVariants.length === 0}
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla del Carrito */}
        <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface max-h-48 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase sticky top-0">
              <tr>
                <th className="px-3 py-2 font-bold">Producto</th>
                <th className="px-2 py-2 font-bold text-center">Cant.</th>
                <th className="px-2 py-2 font-bold text-right">Unitario</th>
                <th className="px-3 py-2 font-bold text-right">Subtotal</th>
                <th className="px-2 py-2 font-bold text-center">Quitar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-app-muted">
                    Aún no has agregado productos a esta venta.
                  </td>
                </tr>
              ) : (
                cartItems.map((item) => {
                  const v = availableVariants.find((x) => x.variantId === item.variantId);
                  return (
                    <tr key={item.variantId}>
                      <td className="px-3 py-2">
                        <p className="font-bold text-app-text">
                          {v?.productName || `Variante #${item.variantId}`}
                        </p>
                        {v && (
                          <p className="text-[10px] text-app-muted">
                            {v.colorName} · Talla {v.sizeNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-app-muted">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-app-text">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          icon={faTrashCan}
                          onClick={() => handleRemoveItem(item.variantId)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pago / Abono en Caja */}
        <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {isCredit ? "Abono Inicial (Opcional)" : "Pago en Caja *"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Caja Destino"
              value={cashRegisterId}
              onChange={(e) => setCashRegisterId(e.target.value)}
              options={
                cashRegisters.length > 0
                  ? cashRegisters.map((cr) => ({
                      value: String(cr.id),
                      label: cr.name,
                    }))
                  : [{ value: "", label: "Sin cajas activas" }]
              }
            />

            <Select
              label="Método de Pago"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              options={
                paymentMethods.length > 0
                  ? paymentMethods.map((pm) => ({
                      value: String(pm.id),
                      label: pm.method,
                    }))
                  : [{ value: "", label: "Sin métodos" }]
              }
            />

            <Input
              type="number"
              label={isCredit ? "Monto Abono ($)" : "Monto Recibido ($)"}
              min={0}
              max={totals.total || undefined}
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              disabled={!isCredit}
            />
          </div>
          <Input
            label="Observaciones del Pago (opcional)"
            placeholder="Ej. Pago en efectivo o transferencia Nequi"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
          />
        </div>

        {/* Resumen Financiero */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-app-border bg-app-surface-alt px-4 py-3 text-xs">
          <div className="flex gap-4 text-app-muted">
            <span>
              Subtotal: <strong className="text-app-text">{formatCurrency(totals.subtotal)}</strong>
            </span>
            <span>
              Desc.:{" "}
              <strong className="text-rose-600 dark:text-rose-400">
                -{formatCurrency(totals.discountAmount)}
              </strong>
            </span>
            <span>
              IVA: <strong className="text-app-text">+{formatCurrency(totals.vatAmount)}</strong>
            </span>
          </div>
          <div className="text-sm font-black text-brand-royal dark:text-brand-sky font-mono">
            Total: {formatCurrency(totals.total)}
          </div>
        </div>
      </form>
    </Modal>
  );
}