import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faPenToSquare,
  faBuilding,
  faCalendarDay,
  faPercent,
  faPlus,
  faTrash,
  faBoxesStacked,
  faFloppyDisk,
  faXmark,
  faShoePrints,
  faCheck,
  faLayerGroup,
  faCartShopping,
  faImage,
  faBan,
  faReceipt,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import SelectBySearch, { type SelectBySearchOption } from "../../../../../shared/components/Inputs/SelectBySearch";
import { addVariantShopping, changePaymentsInfo, deletePaymentInfo, deleteVariantInShopping, getProducts, getSupplier, updateVariantInShopping } from "../services/shoppingsServices";
import { Toast } from "../../../../../shared/utils/alerts";
import { isAxiosError } from "axios";
import type { PurchaseWithRelations } from "../../../../../@types/purchases";
import type { CashRegister } from "../../../../../@types/cash-registers";
import type { ProductColorWithRelations, ProductVariantWithRelations, ProductWithRelations } from "../../../../../@types/products";
import type { Supplier } from "../../../../../@types/suppliers";

// Fila añadida a la tabla de detalle
export interface PurchaseDetailRow {
  variantId: number;
  quantity: number;
  unitPrice: number;
  // Metadata enriquecida para mostrar en la tabla inferior
  productName: string;
  sku: string;
  colorName: string;
  colorHex?: string;
  image?: string | null;
  sizeNumber: string | number;
  currentStock: number;
}

export interface PurchaseFormDataCreate {
  purchaseInfo: {
    id?: string;
    supplierId: string;
    orderDate: string;
    vat: number;
  };
  purchaseDetails: {
    variantId: number;
    quantity: number;
    unitPrice: number;
  }[];
  purchasePayments: {
    cashRegisterId: number;
    amount: number;
  }[];
}

export interface PurchaFormDataEdit {
  purchaseInfo: {
    supplierId: string;
    cashRegisterId: number;
    orderDate: string;
    vat: number;
  }
}

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  purchase: PurchaseWithRelations | null;
  onSubmit?: (data: PurchaseFormDataCreate | PurchaFormDataEdit, onClose: () => void) => void;
  isLoading?: boolean;
  cashRegisters?: Pick<CashRegister, "name" | "id" | "currentBalance">[];
  onSubmitLoading: boolean;
}

export function PurchaseFormModal({
  isOpen,
  onClose,
  mode,
  purchase,
  onSubmit,
  isLoading = false,
  onSubmitLoading,
  cashRegisters = [],
}: PurchaseFormModalProps) {
  // Estado general de la compra
  const [supplierId, setSupplierId] = useState<string>("");
  const [cashRegisterId, setCashRegisterId] = useState<number | string>(1);
  const [purchasePayments, setPurchasePayments] = useState<{ cashRegisterId: number; amount: number, id?: number }[]>([]);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [vat, setVat] = useState<number | string>(19);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");


  // Lista definitiva de detalles agregados a la tabla inferior
  const [addedDetails, setAddedDetails] = useState<PurchaseDetailRow[]>([]);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Estados temporales del Selector Superior (Builder de Variante)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColorWithRelations | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, { quantity: number; unitPrice: number }>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Búsqueda de Proveedores vía API
  const [supplierOptions, setSupplierOptions] = useState<SelectBySearchOption<Supplier>[]>([]);
  const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
  const supplierDebounceTimer = useRef<number | null>(null);

  // Búsqueda de Productos vía API
  const [productOptions, setProductOptions] = useState<SelectBySearchOption<ProductWithRelations>[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const productDebounceTimer = useRef<number | null>(null);

  const handleSupplierSearch = useCallback((search: string) => {
    if (supplierDebounceTimer.current) clearTimeout(supplierDebounceTimer.current);

    supplierDebounceTimer.current = setTimeout(async () => {
      try {
        setIsSearchingSupplier(true);
        const response = await getSupplier(search);
        const suppliersList = response.data?.suppliers || [];

        const opts: SelectBySearchOption<Supplier>[] = suppliersList.map((sup) => ({
          value: sup.document,
          label: sup.businessName,
          sublabel: `NIT / Documento: ${sup.document}`,
          description: sup.email ? `Email: ${sup.email}` : undefined,
          raw: sup,
        }));

        setSupplierOptions(opts);
      } catch (err) {
        console.error("Error al buscar proveedores:", err);
      } finally {
        setIsSearchingSupplier(false);
      }
    }, 300);
  }, []);

  const handleProductSearch = useCallback((search: string) => {
    if (productDebounceTimer.current) clearTimeout(productDebounceTimer.current);

    productDebounceTimer.current = setTimeout(async () => {
      try {
        setIsSearchingProducts(true);
        const response = await getProducts(search);
        const prodsList = response.data?.products || [];

        const opts: SelectBySearchOption<ProductWithRelations>[] = prodsList.map((prod) => {
          const price = prod.purchasePrice || prod.salePrice;
          const formattedPrice = price
            ? ` — ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(price))}`
            : "";
          return {
            value: prod.id,
            label: `${prod.name}${formattedPrice}`,
            sublabel: `SKU: ${prod.sku || "N/A"} • Género: ${prod.gender || "General"}`,
            description: prod.brand?.name ? `Marca: ${prod.brand.name}` : undefined,
            raw: prod,
          };
        });

        setProductOptions(opts);
      } catch (err) {
        console.error("Error al buscar productos:", err);
      } finally {
        setIsSearchingProducts(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleSupplierSearch("");
      handleProductSearch("");
    }
  }, [isOpen, handleSupplierSearch, handleProductSearch]);

  const [isUpdatingPayments, setIsUpdatingPayments] = useState(false);

  // Sincronizar datos al editar o crear
  useEffect(() => {
    if (mode === "edit" && purchase) {
      // eslint-disable-next-line
      setSupplierId(purchase.supplierId || purchase.supplier?.document || "");
      setCashRegisterId(purchase.cashRegister?.id || 1);
      if (purchase.purchasePayments && purchase.purchasePayments.length > 0) {
        setPurchasePayments(
          purchase.purchasePayments.map((p) => ({
            id: p.id,
            cashRegisterId: p.cashRegisterId,
            amount: Number(p.amount) || 0,
          }))
        );
      } else {
        setPurchasePayments([
          {
            id: undefined,
            cashRegisterId: purchase.cashRegister?.id || cashRegisters[0]?.id || 1,
            amount: purchase?.purchaseDetails?.reduce((acc, dt) => acc + Number(dt.unitPrice) * dt.quantity, 0) || 0,
          },
        ]);
      }
      setInvoiceNumber(purchase.id || "");
      setOrderDate(
        purchase.orderDate
          ? new Date(purchase.orderDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setVat(purchase.vat ?? 19);

      if (purchase.supplier) {
        setSupplierOptions((prev) => {
          const exists = prev.some((opt) => String(opt.value) === String(purchase.supplier!.document));
          if (!exists) {
            return [
              {
                value: purchase.supplier!.document,
                label: purchase.supplier!.businessName,
                sublabel: `NIT / Documento: ${purchase.supplier!.document}`,
                raw: purchase.supplier,
              },
              ...prev,
            ];
          }
          return prev;
        });
      }

      // Convertir detalles previos a la tabla de detalles
      if (purchase.purchaseDetails && purchase.purchaseDetails.length > 0) {
        const rows: PurchaseDetailRow[] = purchase.purchaseDetails.map((d) => {
          const variant = d.variant;
          const color = variant?.productColor;
          const prod = color?.product;
          return {
            variantId: d.variantId,
            quantity: Number(d.quantity) || 1,
            unitPrice: Number(d.unitPrice) || 0,
            productName: prod?.name || "Calzado",
            sku: prod?.sku || `VAR-${d.variantId}`,
            colorName: color?.color?.name || `Color #${color?.colorId || ""}`,
            colorHex: color?.color?.hex,
            image: color?.colorImages?.[0]?.image || color?.image || null,
            sizeNumber: variant?.size?.sizeNumber || variant?.sizeId || "N/A",
            currentStock: variant?.currentStock || 0,
          };
        });
        setAddedDetails(rows);
      } else {
        setAddedDetails([]);
      }
    } else {
      // Modo Crear
      setSupplierId("");
      setInvoiceNumber("");
      const defaultBoxId = cashRegisters.length > 0 ? cashRegisters[0].id : 1;
      setCashRegisterId(defaultBoxId);
      setPurchasePayments([{ cashRegisterId: defaultBoxId, amount: 0 }]);
      setOrderDate(new Date().toISOString().split("T")[0]);
      setVat(19);
      setAddedDetails([]);
    }

    // Resetear constructor de variante temporal
    setSelectedProduct(null);
    setSelectedColor(null);
    setSelectedVariants({});
    setErrors({});
  }, [mode, purchase, isOpen, cashRegisters]);

  // Selección de Producto
  const handleSelectProduct = (option?: SelectBySearchOption<ProductWithRelations>) => {
    const prod = option?.raw || null;
    setSelectedProduct(prod);

    // Preseleccionar el primer color disponible
    const firstColor = prod?.productColors?.[0] || null;
    setSelectedColor(firstColor);

    // Si el color tiene una primera talla, preseleccionarla para comodidad del usuario
    if (firstColor && firstColor.productVariants && firstColor.productVariants.length > 0) {
      const v = firstColor.productVariants[0];
      const basePrice = Number(prod?.purchasePrice) || Number(prod?.salePrice) || 0;
      setSelectedVariants({
        [v.id]: { quantity: 1, unitPrice: basePrice },
      });
    } else {
      setSelectedVariants({});
    }
  };

  // Selección de Color
  const handleSelectColor = (color: ProductColorWithRelations) => {
    setSelectedColor(color);
    if (color.productVariants && color.productVariants.length > 0) {
      const v = color.productVariants[0];
      const basePrice = Number(selectedProduct?.purchasePrice) || Number(selectedProduct?.salePrice) || 0;
      setSelectedVariants({
        [v.id]: { quantity: 1, unitPrice: basePrice },
      });
    } else {
      setSelectedVariants({});
    }
  };

  // Toggle de selección de Talla (permite una o varias)
  const handleToggleVariant = (variant: ProductVariantWithRelations) => {
    setSelectedVariants((prev) => {
      const copy = { ...prev };
      if (copy[variant.id]) {
        delete copy[variant.id];
      } else {
        const basePrice = Number(selectedProduct?.purchasePrice) || Number(selectedProduct?.salePrice) || 0;
        copy[variant.id] = { quantity: 1, unitPrice: basePrice };
      }
      return copy;
    });
  };

  // Actualizar cantidad o precio en la mini-tabla de configuración
  const handleVariantParamChange = (variantId: number, field: "quantity" | "unitPrice", val: number) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: val,
      },
    }));
  };

  // Agregar las tallas seleccionadas a la tabla de compras definitiva
  const handleAddSelectedToCart = async () => {
    if (!selectedProduct || !selectedColor) return;

    const variantEntries = Object.entries(selectedVariants);
    if (variantEntries.length === 0) return;

    const newRows: PurchaseDetailRow[] = [];
    let updatedSucces = 0;
    let addSuccess = 0;

    for (const [varIdStr, cfg] of variantEntries) {
      const varId = Number(varIdStr);
      const variantObj = selectedColor.productVariants?.find((v) => v.id === varId);
      const existingItem = addedDetails.find((d) => Number(d.variantId) === varId);
      if (existingItem) {
        // Si ya existía, actualizamos cantidad y precio
        const newQuantity = existingItem.quantity + cfg.quantity;

        if (mode === "edit") {
          try {
            setIsEditLoading(true);
            const res = await updateVariantInShopping(
              {
                variantId: varId,
                quantity: newQuantity,
                unitPrice: cfg.unitPrice
              },
              invoiceNumber,
              varId
            );

            if (res.status === 200) {
              updatedSucces++;

              setAddedDetails((prev) =>
                prev.map((row) =>
                  Number(row.variantId) === varId
                    ? { ...row, quantity: newQuantity, unitPrice: cfg.unitPrice }
                    : row
                )
              );
            }
          } catch (error) {
            if (isAxiosError(error)) {
              Toast.fire({
                icon: "error",
                title: error.response?.data.message
              });
            }
          } finally {
            setIsEditLoading(false);
            // Resetear las tallas marcadas tras agregarlas
            setSelectedVariants({});

          }
        } else {
          setAddedDetails((prev) =>
            prev.map((row) =>
              Number(row.variantId) === varId
                ? { ...row, quantity: newQuantity, unitPrice: cfg.unitPrice }
                : row
            )
          );
        }
      } else {
        const rowData: PurchaseDetailRow = {
          variantId: varId,
          quantity: cfg.quantity,
          unitPrice: cfg.unitPrice,
          productName: selectedProduct.name,
          sku: selectedProduct.sku || `VAR-${varId}`,
          colorName: selectedColor.color?.name || `Color #${selectedColor.colorId}`,
          colorHex: selectedColor.color?.hex,
          image: selectedColor.colorImages?.[0]?.image || selectedColor.image || null,
          sizeNumber: variantObj?.size?.sizeNumber || variantObj?.sizeId || "N/A",
          currentStock: variantObj?.currentStock || 0,
        };

        if (mode === "edit") {
          setIsEditLoading(true);
          try {
            const res = await addVariantShopping(
              {
                variantId: varId,
                quantity: cfg.quantity,
                unitPrice: cfg.unitPrice
              },
              invoiceNumber
            );

            if (res.status === 201) {
              addSuccess++;

              newRows.push(rowData);
            }
          } catch (error) {
            if (isAxiosError(error)) {
              Toast.fire({
                icon: "error",
                title: error.response?.data.message
              });
            }
          } finally {
            setIsEditLoading(false);
            // Resetear las tallas marcadas tras agregarlas
            setSelectedVariants({});
          }
        } else {
          newRows.push(rowData);
        }
      }
    }

    let message = "Detalle de la compra actualizado existosamente";
    let icon = "success";

    if (updatedSucces > 0 && addSuccess > 0) {
      message = `Se ${updatedSucces > 1 ? "han actualizado" : "ha actualizado"} ${updatedSucces} y se han añadido ${addSuccess} ${addSuccess > 1 ? "productos" : "producto"}!`; icon = "success";
    }
    if (updatedSucces > 0 && addSuccess == 0) {
      message = `Se ${updatedSucces > 1 ? "han actualizado" : "ha actualizado"} ${updatedSucces} ${updatedSucces > 1 ? "productos" : "producto"}!`;
      icon = "success";
    }
    if (updatedSucces == 0 && addSuccess > 0) {
      message = `Se ${addSuccess > 1 ? "han añadido" : "ha añadido"} ${addSuccess} ${addSuccess > 1 ? "productos" : "producto"}!`;
      icon = "success";
    }


    Toast.fire({
      icon: icon as "success" | "error" | "info" | "warning",
      title: "Detalle de la compra actualizado existosamente",
      titleText: message
    });

    if (newRows.length > 0) setAddedDetails((prev) => [...prev, ...newRows]);

    if (mode === "edit") setSelectedVariants({});


    setErrors((prev) => ({ ...prev, purchaseDetails: "" }));
  };

  // Eliminar un ítem de la tabla inferior
  const handleRemoveAddedRow = async (variantId: number) => {
    try {
      if (mode === "edit") {
        const res = await deleteVariantInShopping(invoiceNumber, variantId);

        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: res.data.message
          });

          setAddedDetails((prev) => prev.filter((row) => row.variantId !== variantId));
        }
      }

      if (mode === "create") setAddedDetails((prev) => prev.filter((row) => row.variantId !== variantId));
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data.message
        });
      }
    }
  };

  const addedDetailsRef = useRef(addedDetails);

  useEffect(() => {
    addedDetailsRef.current = addedDetails;
  }, [addedDetails]);

  // 2. Un timer por cada variantId (así editar una fila no cancela el guardado de otra)
  const debounceTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Limpiar timers pendientes si el componente se desmonta
  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Actualizar cantidad o precio directamente en la tabla inferior
  const handleUpdateAddedRow = async (variantId: number, field: "quantity" | "unitPrice", val: number) => {
    // Actualizar el estado local AL INSTANTE para que el input responda fluido
    setAddedDetails((prev) =>
      prev.map((row) => (row.variantId === variantId ? { ...row, [field]: val } : row))
    );

    if (mode !== "edit") return;

    if (debounceTimersRef.current[variantId]) clearTimeout(debounceTimersRef.current[variantId]);

    debounceTimersRef.current[variantId] = setTimeout(async () => {
      try {
        const currentDetail = addedDetailsRef.current.find(
          (row) => row.variantId === variantId
        );
        if (!currentDetail) return;

        const payLoad = {
          variantId: Number(variantId),
          quantity: field === "quantity" ? val : currentDetail.quantity,
          unitPrice: field === "unitPrice" ? val : currentDetail.unitPrice,
        };

        const res = await updateVariantInShopping(payLoad, invoiceNumber, variantId);

        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: res.data.message,
          });
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data.message,
          });
        }
      } finally {
        delete debounceTimersRef.current[variantId];
      }
    }, 600);
  };

  // Cálculos en tiempo real
  const subtotal = addedDetails.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const vatPercent = Number(vat) || 0;
  const vatAmount = subtotal * (vatPercent / 100);
  const total = subtotal + vatAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!supplierId) {
      errs.supplierId = "Debes seleccionar un proveedor.";
    }

    if (!orderDate) {
      errs.orderDate = "La fecha de la orden es requerida.";
    }

    if (addedDetails.length === 0) {
      errs.purchaseDetails = "Debes agregar al menos una variante de producto a la compra.";
    }

    if (mode === "create") {
      if (purchasePayments.length === 0) {
        errs.purchasePayments = "Debes asignar al menos una caja para el pago.";
      } else {
        const totalAssigned = purchasePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const hasInvalidAmount = purchasePayments.some((p) => !p.amount || Number(p.amount) <= 0);
        if (hasInvalidAmount) {
          errs.purchasePayments = "Cada monto asignado a una caja debe ser mayor a 0.";
        } else if (Math.abs(totalAssigned - total) > 0.01) {
          errs.purchasePayments = `El total asignado en cajas (${formatCurrency(totalAssigned)}) debe coincidir con el total de la compra (${formatCurrency(total)}).`;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdatePayments = async () => {
    if (purchasePayments.length === 0) {
      setErrors((prev) => ({ ...prev, purchasePayments: "Debes asignar al menos una caja para el pago." }));
      return;
    }
    const totalAssigned = purchasePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const hasInvalidAmount = purchasePayments.some((p) => !p.amount || Number(p.amount) <= 0);
    if (hasInvalidAmount) {
      setErrors((prev) => ({ ...prev, purchasePayments: "Cada monto asignado a una caja debe ser mayor a 0." }));
      return;
    }
    if (Math.abs(totalAssigned - total) > 0.01) {
      setErrors((prev) => ({
        ...prev,
        purchasePayments: `El total asignado en cajas (${formatCurrency(totalAssigned)}) debe coincidir con el total de la compra (${formatCurrency(total)}).`,
      }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.purchasePayments;
      return next;
    });


    setIsUpdatingPayments(true);
    try {
      const res = await changePaymentsInfo(purchasePayments, invoiceNumber);
      Toast.fire({
        icon: "success",
        title: res.data.message || "Información de pago actualizada exitosamente",
      });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al actualizar la información de pago",
        });
      }
    } finally {
      setIsUpdatingPayments(false);
    }
  };

  const handleDeletePayment = async (idx: number, id?: number,) => {
    if (id) {
      await deletePaymentInfo(id);
    }
    setPurchasePayments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validate()) return;

    let payload: PurchaseFormDataCreate | PurchaFormDataEdit;

    if (mode === "create") {
      payload = {
        purchaseInfo: {
          id: invoiceNumber.trim(),
          supplierId,
          orderDate,
          vat: Number(vat),
        },
        purchaseDetails: addedDetails.map((row) => ({
          variantId: Number(row.variantId),
          quantity: Number(row.quantity),
          unitPrice: Number(row.unitPrice),
        })),
        purchasePayments: purchasePayments.map((p) => ({
          cashRegisterId: Number(p.cashRegisterId),
          amount: Number(p.amount),
        })),
      };
    } else {
      payload = {
        purchaseInfo: {
          supplierId,
          cashRegisterId: Number(cashRegisterId),
          orderDate,
          vat: Number(vat),
        }
      };
    }

    if (onSubmit) {
      onSubmit(payload, onClose);
    }

  };

  // Listado de tallas y variantes del color activo
  const availableColors = selectedProduct?.productColors || [];
  const availableVariants = selectedColor?.productVariants || [];
  const selectedVariantKeys = Object.keys(selectedVariants).map(Number);
  const selectedCount = selectedVariantKeys.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Registrar Nueva Compra" : `Editar Compra #${purchase?.id?.slice(0, 8) || ""}`}
      description="Selecciona los productos y tallas de forma interactiva y agrégalos al detalle de la compra."
      icon={mode === "create" ? faCartPlus : faPenToSquare}
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>
          {
            mode === "create" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                type="button"
                loadingText="Guardando..."
                isLoading={onSubmitLoading}
                className="shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
                {"Guardar Compra"}
              </Button>
            )
          }
        </div>
      }
    >
      {isLoading && mode === "edit" ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="size-10 rounded-full border-3 border-brand-royal/20 border-t-brand-royal animate-spin" />
          <p className="text-sm font-semibold text-app-muted">Cargando detalles de la compra...</p>
        </div>
      ) : !purchase && mode === "edit" ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-3 border border-rose-200">
            <FontAwesomeIcon icon={faBan} className="text-lg" />
          </div>
          <p className="text-sm font-bold text-app-text">No se pudo cargar la información</p>
          <p className="mt-1 text-xs text-app-muted">
            Intenta nuevamente o contacta al administrador del sistema.
          </p>
        </div>
      ) : (

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Datos de Proveedor, Caja y Fechas */}
          <div className="p-4 rounded-2xl border border-app-border bg-app-surface-alt/50 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-app-border/70">
              <span className="flex size-6 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                Datos Principales de la Orden
              </h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 items-start">
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <Input
                    label="N° de factura (opcional)"
                    placeholder="Ingrese el número de factura"
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    error={errors.invoiceNumber}
                    iconLeft={faReceipt}
                    disabled={mode === "edit"}
                  />
                  <SelectBySearch<Supplier>
                    label="Proveedor *"
                    placeholder="Buscar por razón social, NIT o correo..."
                    searchPlaceholder="Escribe para buscar proveedor..."
                    options={supplierOptions}
                    value={supplierId}
                    onChange={(val) => setSupplierId(String(val))}
                    onSearchChange={handleSupplierSearch}
                    isLoading={isSearchingSupplier}
                    error={errors.supplierId}
                    iconLeft={faBuilding}
                    size="md"
                  />
                </div>

                <div>
                  <Input
                    label="Fecha de la Orden *"
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    error={errors.orderDate}
                    iconLeft={<FontAwesomeIcon icon={faCalendarDay} className="text-app-muted text-xs" />}
                    className="bg-app-surface text-xs"
                  />
                </div>

                <div>
                  <Input
                    label="IVA (%)"
                    id="vat"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={vat}
                    onChange={(e) => setVat(e.target.value)}
                    iconLeft={<FontAwesomeIcon icon={faPercent} className="text-app-muted text-xs" />}
                    className="bg-app-surface text-xs"
                  />
                </div>
              </div>

              {
                mode === "edit" && (
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      type="button"
                      loadingText="Actualizando..."
                      isLoading={onSubmitLoading}
                      className="shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
                      {"Actualizar información de la compra"}
                    </Button>
                  </div>
                )
              }
            </div>
          </div>

          {/* Sección 2: Selector Interactivo de Productos, Colores y Tallas (Exacto a la imagen) */}
          <div className="rounded-2xl border border-app-border bg-app-surface shadow-xs transition-all">
            {/* Header del bloque interactivo */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border/70 bg-app-surface-alt/40 px-5 py-3 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </span>
                <span className="text-xs font-bold tracking-tight text-app-text">
                  Selección de Productos y Tallas en Inventario
                </span>
              </div>
              <span className="text-[11px] text-app-muted">
                Solo se muestran colores y tallas con existencias disponibles
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Fila: Seleccionar Producto y Color Disponible */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Dropdown de Producto */}
                <div className="lg:col-span-7">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-app-muted mb-1.5 block">
                    SELECCIONAR PRODUCTO
                  </label>
                  <SelectBySearch<ProductWithRelations>
                    placeholder="Seleccionar calzado..."
                    searchPlaceholder="Escribe para buscar calzado..."
                    options={productOptions}
                    value={selectedProduct?.id}
                    onChange={(_, opt) => handleSelectProduct(opt)}
                    onSearchChange={handleProductSearch}
                    isLoading={isSearchingProducts}
                    iconLeft={faShoePrints}
                    size="md"
                  />
                </div>

                {/* Pills de Color Disponible */}
                <div className="lg:col-span-5">
                  <label className="text-[11px] font-bold tracking-wider text-app-muted mb-1.5 block">
                    Color Disponible *
                  </label>

                  {!selectedProduct ? (
                    <div className="text-xs text-app-muted italic py-2.5">
                      Selecciona un producto para ver colores
                    </div>
                  ) : availableColors.length === 0 ? (
                    <div className="text-xs text-app-muted italic py-2.5">
                      Sin colores registrados para este producto
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {availableColors.map((colorObj) => {
                        const isColorActive = selectedColor?.id === colorObj.id;
                        const colorName = colorObj.color?.name || `Color #${colorObj.colorId}`;
                        const hex = colorObj.color?.hex;

                        return (
                          <button
                            key={colorObj.id}
                            type="button"
                            onClick={() => handleSelectColor(colorObj)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${isColorActive
                              ? "bg-brand-royal text-white shadow-xs dark:bg-brand-royal ring-2 ring-brand-royal/30"
                              : "border border-app-border bg-app-surface text-app-text hover:border-brand-royal/40 hover:bg-app-surface-alt"
                              }`}
                          >
                            {hex && (
                              <span
                                className="size-2.5 rounded-full border border-white/30 inline-block shrink-0 shadow-2xs"
                                style={{ backgroundColor: hex }}
                              />
                            )}
                            <span>{colorName}</span>
                            {isColorActive && <FontAwesomeIcon icon={faCheck} className="text-[10px] ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Panel: Tallas Disponibles + Cantidades por Talla */}
              {selectedProduct && selectedColor && (
                <div className="rounded-xl border border-app-border/80 bg-app-surface-alt/40 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-app-text">
                      Tallas disponibles para{" "}
                      <span className="text-brand-royal dark:text-brand-sky">
                        {selectedColor.color?.name || "el color seleccionado"}
                      </span>
                      :
                    </span>
                    <span className="text-[11px] text-app-muted">
                      Selecciona una o varias tallas para configurar cantidades
                    </span>
                  </div>

                  {availableVariants.length === 0 ? (
                    <p className="text-xs text-app-muted italic">
                      No hay tallas registradas para esta combinación de color.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {availableVariants.map((variantObj) => {
                        const isVariantActive = Boolean(selectedVariants[variantObj.id]);
                        const sizeNumber = variantObj.size?.sizeNumber || variantObj.sizeId;
                        const stock = variantObj.currentStock;

                        return (
                          <button
                            key={variantObj.id}
                            type="button"
                            onClick={() => handleToggleVariant(variantObj)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isVariantActive
                              ? "bg-brand-royal text-white shadow-xs dark:bg-brand-royal ring-2 ring-brand-royal/30 font-bold"
                              : "border border-app-border bg-app-surface text-app-text hover:border-brand-royal/40 hover:bg-app-surface"
                              }`}
                          >
                            <span>Talla {sizeNumber}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isVariantActive ? "bg-white/20 text-white font-bold" : "bg-app-surface-alt text-app-muted"
                                }`}
                            >
                              {stock} disp.
                            </span>
                            {isVariantActive && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-tabla flotante para configurar cantidad y precio de las tallas marcadas */}
                  {selectedCount > 0 && (
                    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-2xs mt-3">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-app-surface-alt/75 border-b border-app-border text-xs">
                        <span className="font-bold text-app-text">
                          Cantidades y Precios por Talla ({selectedProduct.name} -{" "}
                          {selectedColor.color?.name || "Color seleccionado"})
                        </span>
                        <span className="text-app-muted text-[11px]">
                          {selectedCount} {selectedCount === 1 ? "talla seleccionada" : "tallas seleccionadas"}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-app-border/70 text-app-muted uppercase font-bold text-[10px] tracking-wider bg-app-surface-alt/30">
                              <th className="py-2.5 px-3 w-16">Talla</th>
                              <th className="py-2.5 px-3 w-36 text-center">Cantidad a Comprar</th>
                              <th className="py-2.5 px-3 w-36 text-right">Precio Unitario</th>
                              <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                              <th className="py-2.5 px-3 w-28 text-center">Existencias</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-app-border/60">
                            {selectedVariantKeys.map((vId) => {
                              const variantObj = selectedColor.productVariants?.find((v) => v.id === vId);
                              const cfg = selectedVariants[vId];
                              const lineSubtotal = (cfg.quantity || 0) * (cfg.unitPrice || 0);

                              return (
                                <tr key={vId} className="hover:bg-app-surface-alt/40 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <span className="inline-block rounded-md border border-app-border bg-app-surface-alt px-2.5 py-1 text-xs font-bold text-app-text">
                                      {variantObj?.size?.sizeNumber || variantObj?.sizeId || "N/A"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      value={cfg.quantity}
                                      onChange={(e) =>
                                        handleVariantParamChange(vId, "quantity", Math.max(1, Number(e.target.value)))
                                      }
                                      className="w-20 rounded-lg border border-app-border bg-app-surface py-1 px-2 text-center text-xs font-bold text-app-text outline-none focus:border-brand-royal"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="relative inline-block w-28">
                                      <input
                                        type="number"
                                        min="0"
                                        value={cfg.unitPrice}
                                        onChange={(e) =>
                                          handleVariantParamChange(vId, "unitPrice", Number(e.target.value))
                                        }
                                        className="w-full rounded-lg border border-app-border bg-app-surface py-1 pr-2 pl-5 text-right text-xs font-medium text-app-text outline-none focus:border-brand-royal"
                                      />
                                      <span className="absolute left-2 top-1 text-[11px] text-app-muted">$</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-brand-royal dark:text-brand-sky font-mono">
                                    {formatCurrency(lineSubtotal)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                    {variantObj?.currentStock || 0} unidades disp.
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 bg-app-surface-alt/30 border-t border-app-border flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={faPlus}
                          onClick={handleAddSelectedToCart}
                          type="button"
                          className="shadow-sm"
                          isLoading={isEditLoading}
                          loadingText="Guardando cambios..."
                        >
                          + Agregar tallas seleccionadas ({selectedCount}) a la compra
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sección 3: Tabla Definitiva de Detalles Agregados (Como la imagen inferior) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                  <FontAwesomeIcon icon={faCartShopping} />
                </span>
                <h4 className="text-sm font-bold text-app-text">
                  Detalle de Productos en la Compra
                </h4>
              </div>
              <span className="text-xs text-app-muted font-medium">
                {addedDetails.length} {addedDetails.length === 1 ? "ítem agregado" : "ítems agregados"}
              </span>
            </div>

            {errors.purchaseDetails && (
              <p className="text-xs text-rose-500 font-semibold">{errors.purchaseDetails}</p>
            )}

            {/* Tabla Limpia y Compacta */}
            <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-app-border bg-app-surface-alt/75 text-app-muted uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">PRODUCTO / VARIANTE</th>
                    <th className="py-3 px-4 text-center w-24">TALLA</th>
                    <th className="py-3 px-4 text-center w-28">CANTIDAD</th>
                    <th className="py-3 px-4 text-right w-36">PRECIO UNITARIO</th>
                    <th className="py-3 px-4 text-right w-36">SUBTOTAL</th>
                    <th className="py-3 px-4 text-center w-20">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/70">
                  {addedDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-app-muted italic">
                        <FontAwesomeIcon icon={faBoxesStacked} className="text-xl mb-1.5 opacity-40 block mx-auto" />
                        No has agregado ningún producto todavía. Selecciona arriba un producto y agrega sus tallas.
                      </td>
                    </tr>
                  ) : (
                    addedDetails.map((row) => {
                      const rowSubtotal = row.quantity * row.unitPrice;

                      return (
                        <tr key={row.variantId} className="hover:bg-app-surface-alt/40 transition-colors">
                          {/* Producto y Color */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-app-border bg-app-surface-alt shadow-2xs">
                                {row.image ? (
                                  <img
                                    src={row.image}
                                    alt={row.productName}
                                    className="size-full object-cover object-center"
                                  />
                                ) : (
                                  <FontAwesomeIcon icon={faImage} className="text-app-muted/50 text-sm" />
                                )}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs text-app-text truncate max-w-56" title={row.productName}>
                                  {row.productName}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-app-muted mt-0.5">
                                  <span>Color: {row.colorName}</span>
                                  <span>|</span>
                                  <span className="font-mono font-semibold text-brand-royal dark:text-brand-sky">
                                    SKU: {row.sku}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Talla */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block rounded-md border border-app-border bg-app-surface-alt px-2.5 py-1 text-xs font-bold text-app-text">
                              {row.sizeNumber}
                            </span>
                          </td>

                          {/* Cantidad editable */}
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleUpdateAddedRow(row.variantId, "quantity", Math.max(1, Number(e.target.value)))
                              }
                              className="w-16 rounded-lg border border-app-border bg-app-surface py-1 text-center text-xs font-bold text-app-text outline-none focus:border-brand-royal"
                            />
                          </td>

                          {/* Precio editable */}
                          <td className="py-3 px-4 text-right">
                            <input
                              type="number"
                              min="0"
                              value={row.unitPrice}
                              onChange={(e) =>
                                handleUpdateAddedRow(row.variantId, "unitPrice", Number(e.target.value))
                              }
                              className="w-24 rounded-lg border border-app-border bg-app-surface py-1 px-2 text-right text-xs font-semibold text-app-text outline-none focus:border-brand-royal"
                            />
                          </td>

                          {/* Subtotal */}
                          <td className="py-3 px-4 text-right font-black text-brand-royal dark:text-brand-sky font-mono text-xs">
                            {formatCurrency(rowSubtotal)}
                          </td>

                          {/* Acción eliminar */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAddedRow(row.variantId)}
                              className="text-app-muted hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              title="Eliminar de la compra"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen Financiero Dinámico */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 rounded-2xl border border-app-border bg-app-surface-alt/80 p-4 space-y-2">
                <div className="flex justify-between text-xs text-app-muted">
                  <span>Subtotal ítems:</span>
                  <span className="font-semibold text-app-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-app-muted">
                  <span>IVA ({vatPercent}%):</span>
                  <span className="font-semibold text-app-text">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="border-t border-app-border pt-2 flex justify-between text-sm font-extrabold text-app-text">
                  <span>Total Compra:</span>
                  <span className="text-brand-royal dark:text-brand-sky font-black">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de Cajas: al final para dividir el total ya calculado (crear y editar) */}
            <div className="pt-4 border-t border-app-border/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-app-text block">
                    Distribución de Pago en Cajas *
                  </span>
                  <span className="text-[11px] text-app-muted">
                    Divide el total ({formatCurrency(total)}) entre una o varias cajas activas
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={faPlus}
                  disabled={purchasePayments.length >= cashRegisters.length}
                  onClick={() => {
                    const assigned = purchasePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
                    const remaining = Math.max(0, total - assigned);
                    const usedIds = new Set(purchasePayments.map((p) => p.cashRegisterId));
                    const nextBox = cashRegisters.find((b) => !usedIds.has(b.id))?.id || cashRegisters[0]?.id || 1;
                    setPurchasePayments((prev) => [
                      ...prev,
                      { cashRegisterId: nextBox, amount: remaining },
                    ]);
                  }}
                >
                  Dividir en otra caja
                </Button>
              </div>

              <div className="space-y-2">
                {purchasePayments.map((pay, idx) => {
                  const usedIds = purchasePayments
                    .filter((_, i) => i !== idx)
                    .map((p) => p.cashRegisterId);
                  const availableBoxes = cashRegisters.filter((b) => !usedIds.includes(b.id));

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-2.5 rounded-xl border border-app-border bg-app-surface-alt/40"
                    >
                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-semibold text-app-muted mb-1">
                          Caja o Cuenta
                        </label>
                        <select
                          value={pay.cashRegisterId}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPurchasePayments((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, cashRegisterId: val } : p))
                            );
                          }}
                          className="w-full rounded-lg border border-app-border bg-app-surface px-3 py-1.5 text-xs text-app-text focus:border-brand-royal focus:outline-none"
                        >
                          {availableBoxes.map((box) => (
                            <option key={box.id} value={box.id}>
                              {box.name} (Saldo: {formatCurrency(Number(box.currentBalance) || 0)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <Input
                          label="Monto ($)"
                          type="number"
                          min={1}
                          value={pay.amount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPurchasePayments((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, amount: val } : p))
                            );
                          }}
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        {purchasePayments.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon={faTrashCan}
                            onClick={() => {
                              handleDeletePayment(idx, pay.id);
                            }
                            }
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.purchasePayments && (
                <p className="text-xs text-rose-500 font-medium">{errors.purchasePayments}</p>
              )}

              {mode === "edit" && (
                <div className="pt-1 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleUpdatePayments}
                    isLoading={isUpdatingPayments}
                    loadingText="Actualizando pagos..."
                    className="shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
                    Actualizar información de pago
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      )
      }
    </Modal>
  );
}
