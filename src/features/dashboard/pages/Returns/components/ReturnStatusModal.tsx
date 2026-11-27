import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faBan,
  faSliders,
  faFloppyDisk,
  faPlus,
  faTrashCan,
  faCashRegister,
  faTriangleExclamation,
  faBoxesStacked,
  faRightLeft,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../shared/components/Inputs/Select";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import { getAllBoxes } from "../../Boxes/services/boxesServices";
import {
  TYPE_RESOLUTION_LABELS,
  type ApproveSaleReturnBody,
  type ReturnPaymentInput,
  type SaleReturnDetailItem,
} from "../services/salesReturnsServices";
import type { CashRegister } from "../../../../../@types/cash-registers";

interface ReturnStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleReturn: SaleReturnDetailItem | null;
  onApproveReturn: (
    returnId: string,
    payload: ApproveSaleReturnBody
  ) => Promise<void> | void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: "1", label: "Efectivo" },
  { value: "2", label: "Transferencia" },
  { value: "3", label: "Nequi" },
  { value: "4", label: "Tarjeta" },
];

export function ReturnStatusModal({
  isOpen,
  onClose,
  saleReturn,
  onApproveReturn,
  isLoading = false,
}: ReturnStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<"Aprobada" | "Rechazada">("Aprobada");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [returnToStock, setReturnToStock] = useState<boolean>(true);
  const [boxes, setBoxes] = useState<CashRegister[]>([]);
  const [payments, setPayments] = useState<ReturnPaymentInput[]>([]);
  const [error, setError] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const typeResolution = saleReturn?.typeResolution;
  const isAlreadyResolved =
    Boolean(saleReturn?.status) &&
    saleReturn?.status.trim().toLowerCase() !== "pendiente";
  const isRefundMoney = typeResolution === "Devolver_dinero";
  const isSameProduct = typeResolution === "Cambiar_mismo_producto";
  const isOtherReference = typeResolution === "Cambiar_otra_referencia";

  // Cálculo financiero
  const refundAmount = Number(saleReturn?.refundAmount) || 0;
  const totalExchangeValue = useMemo(() => {
    if (!saleReturn || isRefundMoney) return 0;
    return (saleReturn.exchangeItems || []).reduce(
      (acc, item) => acc + Number(item.unitPrice) * item.quantity,
      0
    );
  }, [saleReturn, isRefundMoney]);

  const netDifference = isSameProduct
    ? 0
    : Number((totalExchangeValue - refundAmount).toFixed(2));
  const expectedAmount = isRefundMoney
    ? refundAmount
    : isOtherReference
      ? Math.abs(netDifference)
      : 0;
  const paymentType = isRefundMoney
    ? "Egreso"
    : netDifference > 0
      ? "Ingreso"
      : "Egreso";

  useEffect(() => {
    if (isOpen && saleReturn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStatus("Aprobada");
      setRejectionReason("");
      setReturnToStock(saleReturn.returnToStock ?? true);
      setError("");

      getAllBoxes()
        .then((res) => {
          const activeBoxes = (res.data?.Boxes || []).filter((b) => b.status);
          setBoxes(activeBoxes);

          if (expectedAmount > 0 && activeBoxes.length > 0) {
            setPayments([
              {
                cashRegisterId: activeBoxes[0].id,
                paymentMethodId: 1,
                amount: expectedAmount,
                notes: "",
              },
            ]);
          } else {
            setPayments([]);
          }
        })
        .catch(() => setBoxes([]));
    }
  }, [isOpen, saleReturn, expectedAmount]);

  const totalPaymentsSent = payments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );

  const handleAddPayment = () => {
    if (boxes.length === 0) return;
    const remaining = Math.max(0, expectedAmount - totalPaymentsSent);
    setPayments((prev) => [
      ...prev,
      {
        cashRegisterId: boxes[0].id,
        paymentMethodId: 1,
        amount: remaining,
        notes: "",
      },
    ]);
  };

  const handleUpdatePayment = (
    idx: number,
    field: keyof ReturnPaymentInput,
    value: string | number
  ) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
    setError("");
  };

  const handleRemovePayment = (idx: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleReturn) return;

    if (selectedStatus === "Rechazada") {
      if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
        setError("Debes ingresar el motivo del rechazo (mínimo 5 caracteres).");
        return;
      }

      await onApproveReturn(saleReturn.id, {
        status: "Rechazada",
        rejectionReason: rejectionReason.trim(),
      });
      return;
    }

    // Validación para Aprobada
    if (expectedAmount > 0) {
      if (payments.length === 0) {
        setError("Debes registrar al menos un movimiento de caja.");
        return;
      }
      if (Math.abs(totalPaymentsSent - expectedAmount) > 0.01) {
        setError(
          `El total de pagos (${formatCurrency(totalPaymentsSent)}) debe ser igual a ${formatCurrency(expectedAmount)}.`
        );
        return;
      }
      for (const p of payments) {
        if (!p.amount || p.amount <= 0) {
          setError("Cada monto de pago debe ser mayor a 0.");
          return;
        }
      }
    }

    await onApproveReturn(saleReturn.id, {
      status: "Aprobada",
      returnToStock,
      payments: expectedAmount > 0 ? payments : [],
    });
  };

  const exchangeItems = saleReturn?.exchangeItems || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolver Solicitud de Devolución"
      description={
        saleReturn
          ? `Devolución #${saleReturn.id.slice(0, 8)} • ${TYPE_RESOLUTION_LABELS[saleReturn.typeResolution] || saleReturn.typeResolution}`
          : "Resolución financiera e inventario"
      }
      icon={faSliders}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={selectedStatus === "Rechazada" ? "danger" : "primary"}
            size="sm"
            icon={faFloppyDisk}
            onClick={handleSubmit}
            disabled={isLoading || isAlreadyResolved}
          >
            {isLoading
              ? "Procesando..."
              : selectedStatus === "Rechazada"
                ? "Rechazar Devolución"
                : "Aprobar Devolución"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {isAlreadyResolved && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>
              Esta devolución ya fue procesada con estado <strong>{saleReturn?.status}</strong> y no puede modificarse.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{error}</span>
          </div>
        )}

        {/* Selector Aprobar / Rechazar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("Aprobada");
              setError("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedStatus === "Aprobada"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
              : "border-app-border bg-app-surface hover:border-emerald-500/40 text-app-text"
              }`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} />
            </span>
            <div>
              <span className="block text-xs font-bold">Aprobar</span>
              <span className="block text-[10px] opacity-80">Procesar resolución</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus("Rechazada");
              setError("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedStatus === "Rechazada"
              ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/20"
              : "border-app-border bg-app-surface hover:border-rose-500/40 text-app-text"
              }`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <FontAwesomeIcon icon={faBan} />
            </span>
            <div>
              <span className="block text-xs font-bold">Rechazar</span>
              <span className="block text-[10px] opacity-80">Denegar solicitud</span>
            </div>
          </button>
        </div>

        {/* Vista de Rechazo */}
        {selectedStatus === "Rechazada" ? (
          <Textarea
            label="Motivo del Rechazo *"
            placeholder="Explica por qué se rechaza esta solicitud de devolución..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setError("");
            }}
            rows={3}
            size="sm"
            iconLeft={faCommentDots}
            maxLength={255}
            showCount
            currentLength={rejectionReason.length}
          />
        ) : (
          <div className="space-y-4">
            {/* Si es Cambiar por otra referencia: mostrar info de productos a entregar */}
            {isOtherReference && (
              <div className="p-3.5 rounded-xl border border-brand-royal/25 bg-brand-royal/5 dark:bg-brand-sky/5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
                  <FontAwesomeIcon icon={faRightLeft} />
                  <span>Productos que se entregarán a cambio ({exchangeItems.length})</span>
                </div>
                {exchangeItems.length === 0 ? (
                  <p className="text-xs text-app-muted italic">
                    No hay productos de cambio registrados.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {exchangeItems.map((ex) => {
                      const prod = ex.variant?.productColor?.product;
                      const col = ex.variant?.productColor?.color;
                      const size = ex.variant?.size;
                      return (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-app-surface border border-app-border text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-app-text block truncate">
                              {prod?.name || `Variante #${ex.variantId}`}
                            </span>
                            <span className="text-[11px] text-app-muted">
                              {col?.name || "Color"} • Talla {size?.sizeNumber || ex.variantId}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="font-mono font-bold text-app-text block">
                              x{ex.quantity}
                            </span>
                            <span className="text-[10px] font-mono text-app-muted">
                              {formatCurrency(Number(ex.unitPrice))} c/u
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Control de Reingreso a Stock */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-app-border bg-app-surface cursor-pointer hover:border-brand-royal/40 transition-colors">
              <input
                type="checkbox"
                checked={returnToStock}
                onChange={(e) => setReturnToStock(e.target.checked)}
                className="size-4 rounded border-app-border text-brand-royal focus:ring-brand-royal"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-app-text">
                  <FontAwesomeIcon icon={faBoxesStacked} className="text-brand-royal dark:text-brand-sky" />
                  <span>Reingresar {saleReturn?.quantity || 0} unidad(es) al inventario vendible</span>
                </div>
                <p className="text-[11px] text-app-muted mt-0.5">
                  Desmarca esta casilla si al inspeccionar el calzado confirmas que no es apto para reventa.
                </p>
              </div>
            </label>

            {/* Si es Devolver_dinero o hay diferencia en Cambiar_otra_referencia: Movimientos de Caja */}
            {expectedAmount > 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-app-border bg-app-surface-alt/50 flex items-center justify-between text-xs">
                  <span className="font-bold text-app-text">
                    {isRefundMoney
                      ? "Monto total a transferir/devolver al cliente:"
                      : netDifference > 0
                        ? "Diferencia a cobrar al cliente (Ingreso):"
                        : "Diferencia a devolver al cliente (Egreso):"}
                  </span>
                  <span className="font-mono text-sm font-black text-brand-royal dark:text-brand-sky">
                    {formatCurrency(expectedAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-app-text">
                    <FontAwesomeIcon icon={faCashRegister} className="text-brand-royal dark:text-brand-sky" />
                    <span>Distribución en Cajas ({paymentType})</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={faPlus}
                    onClick={handleAddPayment}
                  >
                    Dividir en otra caja
                  </Button>
                </div>

                {payments.map((pay, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-app-border bg-app-surface space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Select
                        label="Caja *"
                        id={`pay-box-${idx}`}
                        value={String(pay.cashRegisterId)}
                        onChange={(e) =>
                          handleUpdatePayment(idx, "cashRegisterId", Number(e.target.value))
                        }
                        options={boxes.map((b) => ({
                          value: String(b.id),
                          label: `${b.name} (${formatCurrency(Number(b.currentBalance))})`,
                        }))}
                        size="sm"
                      />

                      <Select
                        label="Método de Pago *"
                        id={`pay-method-${idx}`}
                        value={String(pay.paymentMethodId)}
                        onChange={(e) =>
                          handleUpdatePayment(idx, "paymentMethodId", Number(e.target.value))
                        }
                        options={PAYMENT_METHODS}
                        size="sm"
                      />

                      <div className="flex items-end gap-1.5">
                        <Input
                          label="Monto *"
                          type="number"
                          min={1}
                          value={pay.amount}
                          onChange={(e) =>
                            handleUpdatePayment(idx, "amount", Number(e.target.value))
                          }
                          size="sm"
                        />
                        {payments.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon={faTrashCan}
                            onClick={() => handleRemovePayment(idx)}
                            className="text-rose-500 mb-0.5"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                <FontAwesomeIcon icon={faCircleCheck} />
                <span>
                  {isSameProduct
                    ? "Cambio por el mismo producto: no requiere movimientos de dinero."
                    : "Cambio sin diferencia de dinero: solo se actualizará el inventario."}
                </span>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}

export default ReturnStatusModal;
