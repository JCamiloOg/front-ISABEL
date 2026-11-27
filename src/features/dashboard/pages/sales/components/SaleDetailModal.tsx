import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faUser,
  faCalendarDays,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Button } from "../../../../../shared/components/Button";
import { Toast } from "../../../../../shared/utils/alerts";
import type {
  CashRegisterOption,
  PaymentMethodOption,
  SalePayload,
} from "../services/salesServices";

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SalePayload | null;
  isLoading: boolean;
  cashRegisters: CashRegisterOption[];
  paymentMethods: PaymentMethodOption[];
  onAddPayment: (
    saleId: string,
    payment: {
      cashRegisterId: number;
      userId: string;
      paymentMethodId: number;
      amount: number;
      notes?: string | null;
    }
  ) => Promise<void>;
  isSavingPayment: boolean;
}

export function SaleDetailModal({
  isOpen,
  onClose,
  sale,
  isLoading,
  cashRegisters,
  paymentMethods,
  onAddPayment,
  isSavingPayment,
}: SaleDetailModalProps) {
  const [cashRegisterId, setCashRegisterId] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Sin fecha";
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtotal =
    sale?.saleDetails?.reduce(
      (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    ) || 0;
  const discountPct = Number(sale?.discount) || 0;
  const discountAmount = subtotal * (discountPct / 100);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const vatPct = Number(sale?.vat) || 0;
  const vatAmount = taxableBase * (vatPct / 100);
  const grandTotal = taxableBase + vatAmount;

  const totalPaid =
    sale?.payments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0;
  const pendingBalance = Math.max(0, grandTotal - totalPaid);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const selectedCash = Number(cashRegisterId || cashRegisters[0]?.id);
    const selectedMethod = Number(paymentMethodId || paymentMethods[0]?.id);
    const payVal = Number(amount);

    if (!selectedCash || !selectedMethod || payVal <= 0) {
      Toast.fire({
        icon: "warning",
        title: "Completa la caja, método y un monto válido para el abono.",
      });
      return;
    }

    await onAddPayment(sale.id, {
      cashRegisterId: selectedCash,
      userId: sale.seller?.identityDocument || sale.customer?.identityDocument || "",
      paymentMethodId: selectedMethod,
      amount: payVal,
      notes: notes.trim() || null,
    });
    setAmount("");
    setNotes("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sale ? `Factura #${sale.id.slice(0, 8).toUpperCase()}` : "Detalle de Venta"}
      description={
        sale
          ? `Modalidad: ${sale.isCredit ? "Crédito" : "Contado"} · Canal: ${
              sale.isDirectSale ? "Punto de Venta" : "Pedido Web"
            }`
          : "Cargando información..."
      }
      size="lg"
      footer={
        <div className="flex w-full justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      {isLoading || !sale ? (
        <div className="space-y-3 py-4">
          <div className="h-16 w-full rounded-xl bg-app-border/70 animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-app-border/70 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Cabecera */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-app-border bg-app-surface-alt p-4">
            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon
                icon={faUser}
                className="text-brand-royal dark:text-brand-sky mt-0.5"
              />
              <div>
                <p className="text-app-muted font-semibold">Cliente</p>
                <p className="font-bold text-app-text mt-0.5">
                  {sale.customer
                    ? `${sale.customer.firstName} ${sale.customer.lastName}`
                    : "Sin cliente"}
                </p>
                <p className="font-mono text-[11px] text-app-muted">
                  {sale.customer?.identityDocument}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="text-brand-royal dark:text-brand-sky mt-0.5"
              />
              <div>
                <p className="text-app-muted font-semibold">Fecha y Vendedor</p>
                <p className="font-bold text-app-text mt-0.5">{formatDate(sale.saleDate)}</p>
                {sale.seller && (
                  <p className="text-[11px] text-app-muted">
                    Atendió: {sale.seller.firstName} {sale.seller.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon
                icon={faReceipt}
                className="text-brand-royal dark:text-brand-sky mt-0.5"
              />
              <div>
                <p className="text-app-muted font-semibold">Estado</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  {sale.status}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-app-surface-alt border-b border-app-border text-app-muted uppercase">
                <tr>
                  <th className="px-4 py-2 font-bold">Producto / Variante</th>
                  <th className="px-3 py-2 font-bold text-center">Cant.</th>
                  <th className="px-3 py-2 font-bold text-right">Precio Unit.</th>
                  <th className="px-4 py-2 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {sale.saleDetails.map((item, idx) => (
                  <tr key={item.id ?? idx}>
                    <td className="px-4 py-2">
                      <p className="font-bold text-app-text">
                        {item.variant?.productColor?.product?.name || `Variante #${item.variantId}`}
                      </p>
                      <p className="text-[11px] text-app-muted">
                        {item.variant?.productColor?.color?.name || ""} · Talla{" "}
                        {item.variant?.size?.sizeNumber || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono text-app-muted">
                      {formatCurrency(Number(item.unitPrice) || 0)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-app-text">
                      {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Historial de Abonos y Totales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 space-y-2">
              <p className="font-bold text-app-text flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-500" />
                Pagos / Abonos Registrados ({sale.payments?.length || 0})
              </p>
              {sale.payments && sale.payments.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {sale.payments.map((pay) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between rounded-lg bg-app-surface px-2.5 py-1.5 border border-app-border"
                    >
                      <div>
                        <p className="font-bold text-app-text">
                          {pay.paymentMethod?.method || "Pago"} · {pay.cashRegister?.name}
                        </p>
                        <p className="text-[10px] text-app-muted">{formatDate(pay.paymentDate)}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(pay.amount) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-app-muted">Sin abonos registrados aún.</p>
              )}
            </div>

            <div className="space-y-1.5 rounded-xl border border-app-border bg-app-surface-alt p-4">
              <div className="flex justify-between text-app-muted">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-app-text">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-app-muted">
                <span>Descuento ({discountPct}%):</span>
                <span className="font-mono font-semibold text-rose-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
              <div className="flex justify-between text-app-muted">
                <span>IVA ({vatPct}%):</span>
                <span className="font-mono font-semibold text-app-text">
                  +{formatCurrency(vatAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-app-border flex justify-between font-bold text-app-text">
                <span>Total Factura:</span>
                <span className="font-mono text-brand-royal dark:text-brand-sky">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Total Abonado:</span>
                <span className="font-mono">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between font-black text-amber-600 dark:text-amber-400">
                <span>Saldo Pendiente:</span>
                <span className="font-mono">{formatCurrency(pendingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Formulario rápido para abonar si hay saldo pendiente y no está cancelada */}
          {pendingBalance > 0 && sale.status !== "Cancelada" && (
            <form
              onSubmit={handleRegisterPayment}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3"
            >
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                Registrar Nuevo Abono (Saldo: {formatCurrency(pendingBalance)})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                <Select
                  label="Caja"
                  value={cashRegisterId || String(cashRegisters[0]?.id || "")}
                  onChange={(e) => setCashRegisterId(e.target.value)}
                  options={cashRegisters.map((c) => ({ value: String(c.id), label: c.name }))}
                />
                <Select
                  label="Método"
                  value={paymentMethodId || String(paymentMethods[0]?.id || "")}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  options={paymentMethods.map((m) => ({ value: String(m.id), label: m.method }))}
                />
                <Input
                  type="number"
                  label="Monto ($)"
                  min={1}
                  max={Math.ceil(pendingBalance)}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingPayment}
                  className="w-full"
                >
                  {isSavingPayment ? "Abonando..." : "Abonar"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}