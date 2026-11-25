import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faReceipt,
  faFloppyDisk,
  faCheck,
  faPlus,
  faTrashCan,
  faTriangleExclamation,
  faBoxesStacked,
  faListCheck,
  faCommentDots,
  faRightLeft,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import { Select } from "../../../../../shared/components/Inputs/Select";
import SelectBySearch, {
  type SelectBySearchOption,
} from "../../../../../shared/components/Inputs/SelectBySearch";
import {
  createSaleReturn,
  getSales,
  TYPE_RESOLUTION_OPTIONS,
  REASONS_RETURN_OPTIONS,
  REASONS_RETURN_LABELS,
  TYPE_RESOLUTION_LABELS,
  type TypeResolution,
  type ReasonsReturn,
  type CreateSaleReturnItem,
  type ExchangeItemInput,
  type SaleOptionItem,
} from "../services/salesReturnsServices";
import { getProducts } from "../../Purchases/services/shoppingsServices";
import type { ProductWithRelations } from "../../../../../@types";
import { Toast } from "../../../../../shared/utils/alerts";
import { isAxiosError } from "axios";

interface ReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ExchangeDraftItem extends ExchangeItemInput {
  id: string;
  productName: string;
  colorName: string;
  sizeName: string;
  salePrice: number;
}

// Estructura de cada línea en el borrador de devolución
export interface ReturnDraftItem {
  id: string;
  variantId: number;
  productName: string;
  sku: string | null;
  colorName: string;
  colorHex?: string;
  sizeName: string;
  purchasedQty: number;
  quantity: number;
  reason: ReasonsReturn;
  details?: string;
  typeResolution: TypeResolution;
  returnToStock: boolean;
  exchangeItems: ExchangeDraftItem[];
  image?: string | null;
}

// Estructuras agrupadas para los productos de la venta seleccionada
interface SaleProductColor {
  id: number;
  name: string;
  hex?: string;
  image?: string | null;
  variants: {
    variantId: number;
    sizeName: string;
    purchasedQty: number;
  }[];
}

interface SaleProductGroup {
  name: string;
  sku: string | null;
  colors: Record<number, SaleProductColor>;
}

export function ReturnFormModal({
  isOpen,
  onClose,
  onSuccess,
}: ReturnFormModalProps) {
  // ── 1. Estado de Selección de Venta ──
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [selectedSaleRaw, setSelectedSaleRaw] = useState<SaleOptionItem | null>(null);
  const [saleOptions, setSaleOptions] = useState<SelectBySearchOption<SaleOptionItem>[]>([]);
  const [isSearchingSales, setIsSearchingSales] = useState(false);
  const salesDebounceTimer = useRef<number | null>(null);

  // ── 2. Lista de ítems a devolver en esta venta ──
  const [returnItems, setReturnItems] = useState<ReturnDraftItem[]>([]);

  // ── 3. Estados del formulario para agregar un nuevo ítem ──
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);

  const [reason, setReason] = useState<ReasonsReturn>("Talla_equivocada");
  const [typeResolution, setTypeResolution] = useState<TypeResolution>("Cambiar_mismo_producto");
  const [returnToStock, setReturnToStock] = useState<boolean>(true);
  const [details, setDetails] = useState<string>("");

  // ── 4. Estados para seleccionar productos de cambio (exchangeItems) ──
  const [exchangeItems, setExchangeItems] = useState<ExchangeDraftItem[]>([]);
  const [catalogOptions, setCatalogOptions] = useState<SelectBySearchOption<ProductWithRelations>[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const catalogDebounceTimer = useRef<number | null>(null);
  const [exProduct, setExProduct] = useState<ProductWithRelations | null>(null);
  const [exColorId, setExColorId] = useState<number | null>(null);
  const [exVariantId, setExVariantId] = useState<number | null>(null);
  const [exQty, setExQty] = useState<number | string>(1);

  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Búsqueda de Ventas con Debounce ──
  const handleSalesSearch = useCallback((search: string) => {
    if (salesDebounceTimer.current) clearTimeout(salesDebounceTimer.current);

    salesDebounceTimer.current = window.setTimeout(async () => {
      try {
        setIsSearchingSales(true);
        const response = await getSales(search);
        const salesList = response.data?.sales || [];

        const opts: SelectBySearchOption<SaleOptionItem>[] = salesList.map((s) => {
          const clientName = s.customer
            ? `${s.customer.firstName} ${s.customer.lastName}`.trim()
            : "Cliente no registrado";
          const doc = s.customer?.identityDocument
            ? ` • Cédula: ${s.customer.identityDocument}`
            : "";
          const itemCount = s.saleDetails?.length || 0;

          return {
            value: s.id,
            label: `Venta #${s.id.slice(0, 8)}`,
            sublabel: `Cliente: ${clientName}${doc}`,
            description: `${itemCount} artículo${itemCount === 1 ? "" : "s"} en la transacción`,
            raw: s,
          };
        });

        setSaleOptions(opts);
      } catch (err) {
        console.error("Error al buscar ventas:", err);
      } finally {
        setIsSearchingSales(false);
      }
    }, 300);
  }, []);

  // ── Búsqueda de Productos del Catálogo para Cambio ──
  const handleCatalogSearch = useCallback((search: string) => {
    if (catalogDebounceTimer.current) clearTimeout(catalogDebounceTimer.current);

    catalogDebounceTimer.current = window.setTimeout(async () => {
      try {
        setIsSearchingCatalog(true);
        const response = await getProducts(search);
        const prods = response.data?.products || [];
        const opts: SelectBySearchOption<ProductWithRelations>[] = prods.map((p) => ({
          value: p.id,
          label: p.name,
          sublabel: p.sku ? `SKU: ${p.sku} • $${Number(p.salePrice).toLocaleString("es-CO")}` : `$${Number(p.salePrice).toLocaleString("es-CO")}`,
          raw: p,
        }));
        setCatalogOptions(opts);
      } catch (err) {
        console.error("Error al buscar productos:", err);
      } finally {
        setIsSearchingCatalog(false);
      }
    }, 300);
  }, []);

  // Reiniciar estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSaleId("");
      setSelectedSaleRaw(null);
      setReturnItems([]);
      setSelectedProductName("");
      setSelectedColorId(null);
      setSelectedVariantId(null);
      setQuantity(1);
      setReason("Talla_equivocada");
      setTypeResolution("Cambiar_mismo_producto");
      setReturnToStock(true);
      setDetails("");
      setExchangeItems([]);
      setExProduct(null);
      setExColorId(null);
      setExVariantId(null);
      setExQty(1);
      setItemErrors({});
      setGlobalError("");
      setIsSubmitting(false);

      handleSalesSearch("");
      handleCatalogSearch("");
    }
  }, [isOpen, handleSalesSearch, handleCatalogSearch]);

  // Ajustar returnToStock automáticamente cuando cambia el motivo
  const handleReasonChange = (newReason: ReasonsReturn) => {
    setReason(newReason);
    const isDamaged =
      newReason === "Producto_dañado" || newReason === "Producto_defectuoso";
    setReturnToStock(!isDamaged);
  };

  // Manejador selección de venta
  const handleSelectSale = (
    val: string | number,
    option?: SelectBySearchOption<SaleOptionItem>
  ) => {
    if (!val || !option) {
      setSelectedSaleId("");
      setSelectedSaleRaw(null);
      setReturnItems([]);
      setSelectedProductName("");
      setSelectedColorId(null);
      setSelectedVariantId(null);
      setQuantity(1);
      return;
    }

    const sale = option.raw || null;
    setSelectedSaleId(String(val));
    setSelectedSaleRaw(sale);
    setReturnItems([]);
    setSelectedProductName("");
    setSelectedColorId(null);
    setSelectedVariantId(null);
    setQuantity(1);
    setGlobalError("");
  };

  // ── Agrupación de Productos, Colores y Tallas de la Venta ──
  const saleProductsGrouped = useMemo(() => {
    const groups: Record<string, SaleProductGroup> = {};
    if (!selectedSaleRaw?.saleDetails) return groups;

    selectedSaleRaw.saleDetails.forEach((detail) => {
      const v = detail.variant;
      if (!v) return;

      const pColor = v.productColor;
      const prod = pColor?.product;
      const col = pColor?.color;

      const pName = prod?.name || `Producto (#${v.id})`;
      const pSku = prod?.sku || null;
      const colorId = col?.id || 1;
      const colorName = col?.name || "Color Base";
      const colorHex = col?.hex;
      const image =
        pColor?.colorImages?.[0]?.image ||
        pColor?.colorImages?.[0]?.imageUrl ||
        null;

      const sizeName = v.size?.sizeNumber || v.size?.size || `Talla #${v.id}`;
      const purchasedQty = Number(detail.quantity) || 1;

      if (!groups[pName]) {
        groups[pName] = { name: pName, sku: pSku, colors: {} };
      }
      if (!groups[pName].colors[colorId]) {
        groups[pName].colors[colorId] = {
          id: colorId,
          name: colorName,
          hex: colorHex,
          image,
          variants: [],
        };
      }
      groups[pName].colors[colorId].variants.push({
        variantId: v.id,
        sizeName,
        purchasedQty,
      });
    });

    return groups;
  }, [selectedSaleRaw]);

  const saleProductOptions = useMemo<
    SelectBySearchOption<{ name: string; sku: string | null }>[]
  >(() => {
    return Object.keys(saleProductsGrouped).map((pName) => {
      const group = saleProductsGrouped[pName];
      const colorCount = Object.keys(group.colors).length;
      return {
        value: pName,
        label: pName,
        sublabel: group.sku
          ? `SKU: ${group.sku} • ${colorCount} color${colorCount === 1 ? "" : "es"}`
          : `${colorCount} color${colorCount === 1 ? "" : "es"}`,
        raw: { name: pName, sku: group.sku },
      };
    });
  }, [saleProductsGrouped]);

  const activeProductGroup = selectedProductName
    ? saleProductsGrouped[selectedProductName]
    : null;

  const availableColorsForProduct = useMemo(() => {
    if (!activeProductGroup) return [];
    return Object.values(activeProductGroup.colors);
  }, [activeProductGroup]);

  const activeColor =
    selectedColorId && activeProductGroup
      ? activeProductGroup.colors[selectedColorId] || null
      : null;

  const availableVariantsForColor = useMemo(() => {
    if (!activeColor) return [];
    return activeColor.variants;
  }, [activeColor]);

  const activeVariant = useMemo(() => {
    if (!selectedVariantId || !availableVariantsForColor) return null;
    return (
      availableVariantsForColor.find((v) => v.variantId === selectedVariantId) ||
      null
    );
  }, [selectedVariantId, availableVariantsForColor]);

  const alreadyAddedQtyForActiveVariant = useMemo(() => {
    if (!selectedVariantId) return 0;
    return returnItems
      .filter((item) => item.variantId === selectedVariantId)
      .reduce((acc, curr) => acc + curr.quantity, 0);
  }, [selectedVariantId, returnItems]);

  const maxAvailableQty = Math.max(
    0,
    (activeVariant?.purchasedQty || 1) - alreadyAddedQtyForActiveVariant
  );

  const handleSelectProduct = (pName: string) => {
    setSelectedProductName(pName);
    const grp = saleProductsGrouped[pName];
    if (grp) {
      const colorKeys = Object.keys(grp.colors).map(Number);
      setSelectedColorId(colorKeys.length > 0 ? colorKeys[0] : null);
    } else {
      setSelectedColorId(null);
    }
    setSelectedVariantId(null);
    setQuantity(1);
    setItemErrors({});
  };

  const handleSelectColor = (cId: number) => {
    setSelectedColorId(cId);
    setSelectedVariantId(null);
    setQuantity(1);
  };

  const handleSelectVariant = (vId: number) => {
    setSelectedVariantId(vId);
    setQuantity(1);
    setItemErrors({});
  };

  const handleQuantityChange = (valStr: string) => {
    if (valStr === "") {
      setQuantity("");
      return;
    }
    const val = Number(valStr);
    if (isNaN(val)) return;

    if (val > maxAvailableQty) {
      setQuantity(maxAvailableQty);
      setItemErrors((prev) => ({
        ...prev,
        quantity: `Máximo disponible: ${maxAvailableQty} unidades restantes.`,
      }));
      return;
    }

    setQuantity(val);
    if (itemErrors.quantity) {
      setItemErrors((prev) => {
        const next = { ...prev };
        delete next.quantity;
        return next;
      });
    }
  };

  // ── Agregar producto de cambio (exchangeItems) ──
  const exColors = useMemo(() => exProduct?.productColors || [], [exProduct]);
  const exActiveColor = useMemo(
    () => exColors.find((c) => c.id === exColorId) || null,
    [exColors, exColorId]
  );
  const exVariants = useMemo(
    () => exActiveColor?.productVariants || [],
    [exActiveColor]
  );

  const handleAddExchangeItem = () => {
    if (!exProduct || !exActiveColor || !exVariantId) {
      setItemErrors((prev) => ({
        ...prev,
        exchange: "Selecciona producto, color y talla de cambio.",
      }));
      return;
    }
    const variantObj = exVariants.find((v) => v.id === exVariantId);
    if (!variantObj) return;

    const qty = Number(exQty) || 1;
    if (qty <= 0 || qty > variantObj.currentStock) {
      setItemErrors((prev) => ({
        ...prev,
        exchange: `Stock disponible para cambio: ${variantObj.currentStock} unidades.`,
      }));
      return;
    }

    const newEx: ExchangeDraftItem = {
      id: `${variantObj.id}-${Date.now()}`,
      variantId: variantObj.id,
      quantity: qty,
      productName: exProduct.name,
      colorName: exActiveColor.color?.name || "Color",
      sizeName: variantObj.size?.sizeNumber || `Var #${variantObj.id}`,
      salePrice: Number(exProduct.salePrice) || 0,
    };

    setExchangeItems((prev) => [...prev, newEx]);
    setExVariantId(null);
    setExQty(1);
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next.exchange;
      return next;
    });
  };

  // Validar y agregar el producto a la lista de devoluciones
  const handleAddItem = () => {
    const errs: Record<string, string> = {};

    if (!selectedSaleId) errs.selectedSaleId = "Primero selecciona una venta.";
    if (!selectedProductName) errs.selectedProduct = "Selecciona el producto adquirido.";
    if (!selectedVariantId || !activeVariant) errs.selectedVariant = "Selecciona la talla a devolver.";

    const qty = Number(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      errs.quantity = "La cantidad debe ser mayor a 0.";
    } else if (qty > maxAvailableQty) {
      errs.quantity = `No puedes devolver más de ${maxAvailableQty} unidades disponibles.`;
    }

    if (details.trim() && details.trim().length > 255) {
      errs.details = "El detalle no puede superar los 255 caracteres.";
    }

    if (typeResolution === "Cambiar_otra_referencia" && exchangeItems.length === 0) {
      errs.exchange = `Debes agregar al menos un producto de cambio para "${TYPE_RESOLUTION_LABELS[typeResolution]}".`;
    }

    if (Object.keys(errs).length > 0) {
      setItemErrors(errs);
      return;
    }

    const newItem: ReturnDraftItem = {
      id: `${selectedVariantId}-${Date.now()}`,
      variantId: Number(selectedVariantId),
      productName: selectedProductName,
      sku: activeProductGroup?.sku || null,
      colorName: activeColor?.name || "Color Base",
      colorHex: activeColor?.hex,
      sizeName: activeVariant?.sizeName || "Talla única",
      purchasedQty: activeVariant?.purchasedQty || 1,
      quantity: qty,
      reason,
      details: details.trim() || undefined,
      typeResolution,
      returnToStock,
      exchangeItems: typeResolution === "Cambiar_otra_referencia" ? exchangeItems : [],
      image: activeColor?.image || null,
    };

    setReturnItems((prev) => [...prev, newItem]);

    // Limpiar campos para permitir agregar otro artículo
    setSelectedVariantId(null);
    setQuantity(1);
    setReason("Talla_equivocada");
    setTypeResolution("Cambiar_mismo_producto");
    setReturnToStock(true);
    setDetails("");
    setExchangeItems([]);
    setExProduct(null);
    setExColorId(null);
    setExVariantId(null);
    setItemErrors({});
    setGlobalError("");

    Toast.fire({
      icon: "success",
      title: "Artículo añadido a la lista de devolución.",
    });
  };

  const handleRemoveItem = (idToRemove: string) => {
    setReturnItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Envío masivo de las devoluciones preparadas
  const handleSubmitAll = async () => {
    if (!selectedSaleId) {
      setGlobalError("Debes seleccionar una venta.");
      return;
    }
    if (returnItems.length === 0) {
      setGlobalError("Debes añadir al menos un artículo a la lista de devolución.");
      return;
    }

    try {
      setIsSubmitting(true);
      setGlobalError("");

      const payload: CreateSaleReturnItem[] = returnItems.map((item) => ({
        saleId: selectedSaleId,
        variantId: item.variantId,
        quantity: item.quantity,
        reason: item.reason,
        details: item.details,
        typeResolution: item.typeResolution,
        returnToStock: item.returnToStock,
        exchangeItems:
          item.typeResolution === "Cambiar_otra_referencia"
            ? item.exchangeItems.map((ex) => ({
              variantId: ex.variantId,
              quantity: ex.quantity,
              unitPrice: ex.salePrice,
            }))
            : undefined,
      }));

      const response = await createSaleReturn(payload);

      if (response.status === 200 || response.status === 201) {
        Toast.fire({
          icon: "success",
          title:
            response.data?.message ||
            `${returnItems.length} devoluciones registradas exitosamente.`,
        });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al registrar las devoluciones.",
          text: "Verifica los datos e intenta nuevamente.",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Ocurrió un error inesperado al registrar.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItemsCount = returnItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Devoluciones de Venta"
      description="Selecciona una venta, define los artículos a devolver, si reingresan a stock y los productos de cambio"
      icon={faRotateLeft}
      size="2xl"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={faFloppyDisk}
            onClick={handleSubmitAll}
            disabled={isSubmitting || returnItems.length === 0}
          >
            {isSubmitting
              ? "Registrando..."
              : `Registrar ${returnItems.length} Devolución${returnItems.length === 1 ? "" : "es"}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {globalError && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{globalError}</span>
          </div>
        )}

        {/* ── PASO 1: Selección de Venta ── */}
        <div className="p-4 rounded-2xl border border-app-border bg-app-surface-alt/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-app-muted">
            <span className="flex size-5 items-center justify-center rounded-full bg-brand-royal text-white text-[10px]">
              1
            </span>
            <span>Seleccionar Venta Registrada</span>
          </div>

          <SelectBySearch<SaleOptionItem>
            label="Buscar Venta por Código o Cliente *"
            placeholder="Buscar por ID de venta, nombre del cliente o cédula..."
            searchPlaceholder="Escribe para buscar venta..."
            options={saleOptions}
            value={selectedSaleId}
            onChange={handleSelectSale}
            onSearchChange={handleSalesSearch}
            isLoading={isSearchingSales}
            size="md"
            helperText="Solo se pueden asociar productos que hayan sido facturados en la venta seleccionada"
            iconLeft={faReceipt}
          />

          {selectedSaleRaw && (
            <div className="mt-2 p-3 rounded-xl bg-app-surface border border-app-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                </span>
                <div>
                  <span className="font-bold text-app-text">
                    Venta #{selectedSaleRaw.id.slice(0, 8)}
                  </span>
                  <span className="text-app-muted ml-2">
                    Cliente:{" "}
                    <strong className="text-app-text font-semibold">
                      {selectedSaleRaw.customer
                        ? `${selectedSaleRaw.customer.firstName} ${selectedSaleRaw.customer.lastName}`.trim()
                        : "Cliente no registrado"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-app-muted bg-app-surface-alt px-2 py-0.5 rounded-md border border-app-border">
                  Doc: {selectedSaleRaw.customer?.identityDocument || "Sin doc"}
                </span>
                <span className="text-[11px] font-bold text-brand-royal dark:text-brand-sky bg-brand-royal/10 dark:bg-brand-sky/20 px-2 py-0.5 rounded-md">
                  {selectedSaleRaw.saleDetails?.length || 0} ítems facturados
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── PASO 2: Constructor para Agregar Artículos a la Devolución ── */}
        {selectedSaleRaw ? (
          <div className="p-4 rounded-2xl border border-app-border bg-app-surface space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-app-muted">
                <span className="flex size-5 items-center justify-center rounded-full bg-brand-royal text-white text-[10px]">
                  2
                </span>
                <span>Agregar Artículo a la Lista de Devolución</span>
              </div>
              <span className="text-[11px] text-app-muted">
                Paso repetible para múltiples devoluciones
              </span>
            </div>

            <SelectBySearch<{ name: string; sku: string | null }>
              label="Producto Vendido *"
              placeholder="Selecciona el producto facturado..."
              searchPlaceholder="Filtrar productos de la venta..."
              options={saleProductOptions}
              value={selectedProductName}
              onChange={(val) => handleSelectProduct(String(val))}
              error={itemErrors.selectedProduct}
              size="sm"
            />

            {activeProductGroup && availableColorsForProduct.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-app-text mb-1.5">
                  Color Facturado
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColorsForProduct.map((col) => {
                    const isSelected = selectedColorId === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleSelectColor(col.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${isSelected
                            ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:text-brand-sky ring-1 ring-brand-royal/30"
                            : "border-app-border bg-app-surface-alt hover:border-brand-royal/40 text-app-text"
                          }`}
                      >
                        {col.hex && (
                          <span
                            className="size-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                        )}
                        <span>{col.name}</span>
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeColor && availableVariantsForColor.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-app-text mb-1.5">
                  Talla del Calzado a Devolver <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableVariantsForColor.map((v) => {
                    const isSelected = selectedVariantId === v.variantId;
                    const usedQty = returnItems
                      .filter((item) => item.variantId === v.variantId)
                      .reduce((acc, curr) => acc + curr.quantity, 0);
                    const remaining = Math.max(0, v.purchasedQty - usedQty);

                    return (
                      <button
                        key={v.variantId}
                        type="button"
                        disabled={remaining <= 0}
                        onClick={() => handleSelectVariant(v.variantId)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${remaining <= 0
                            ? "opacity-40 cursor-not-allowed bg-app-surface-alt border-app-border"
                            : isSelected
                              ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:text-brand-sky ring-2 ring-brand-royal/20"
                              : "border-app-border bg-app-surface hover:border-brand-royal/40"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-app-text">
                            Talla {v.sizeName}
                          </span>
                          {isSelected && (
                            <FontAwesomeIcon icon={faCheck} className="text-xs text-brand-royal" />
                          )}
                        </div>
                        <span className="text-[10px] text-app-muted mt-1">
                          {remaining <= 0
                            ? "Todo asignado"
                            : `${remaining} disponible${remaining === 1 ? "" : "s"}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {itemErrors.selectedVariant && (
                  <p className="mt-1 text-xs text-rose-500">{itemErrors.selectedVariant}</p>
                )}
              </div>
            )}

            {selectedVariantId && (
              <div className="space-y-4 pt-3 border-t border-app-border/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Input
                      label={`Cantidad (Máx: ${maxAvailableQty}) *`}
                      type="number"
                      min={1}
                      max={maxAvailableQty}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      error={itemErrors.quantity}
                      size="sm"
                    />
                  </div>

                  <div>
                    <Select
                      label="Motivo de Devolución *"
                      id="select-reason"
                      value={reason}
                      onChange={(e) => handleReasonChange(e.target.value as ReasonsReturn)}
                      options={REASONS_RETURN_OPTIONS}
                      size="sm"
                    />
                  </div>

                  <div>
                    <Select
                      label="Tipo de Resolución Solicitada *"
                      id="select-type-resolution"
                      value={typeResolution}
                      onChange={(e) => {
                        setTypeResolution(e.target.value as TypeResolution);
                        setExchangeItems([]);
                      }}
                      options={TYPE_RESOLUTION_OPTIONS}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Toggle de Reingreso a Stock */}
                {(() => {
                  const isDamagedReason =
                    reason === "Producto_dañado" || reason === "Producto_defectuoso";
                  return (
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border border-app-border bg-app-surface-alt/40 transition-colors ${isDamagedReason
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer hover:border-brand-royal/40"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={returnToStock}
                        disabled={isDamagedReason}
                        onChange={(e) => setReturnToStock(e.target.checked)}
                        className="size-4 rounded border-app-border text-brand-royal focus:ring-brand-royal disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-app-text block">
                          Reingresar producto al inventario vendible
                        </span>
                        <span className="text-app-muted text-[11px]">
                          {isDamagedReason
                            ? "Bloqueado automáticamente: por producto dañado o defectuoso no puede reingresar a stock."
                            : returnToStock
                              ? "Al aprobarse, las unidades volverán a sumar en el stock disponible."
                              : "El producto se marcará como merma/no vendible y no sumará al stock."}
                        </span>
                      </div>
                    </label>
                  );
                })()}

                {/* Sub-sección de Productos de Cambio solo si es Cambiar por otra referencia */}
                {typeResolution === "Cambiar_otra_referencia" && (
                  <div className="p-3.5 rounded-xl border border-brand-royal/25 bg-brand-royal/5 dark:bg-brand-sky/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-royal dark:text-brand-sky">
                        <FontAwesomeIcon icon={faRightLeft} />
                        <span>Productos Entregados a Cambio *</span>
                      </div>
                      <span className="text-[11px] text-app-muted">
                        {exchangeItems.length} agregado{exchangeItems.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                      <div className="sm:col-span-5">
                        <SelectBySearch<ProductWithRelations>
                          label="Producto de Cambio"
                          placeholder="Buscar zapato en catálogo..."
                          options={catalogOptions}
                          value={exProduct?.id || ""}
                          onChange={(_, opt) => {
                            const p = opt?.raw || null;
                            setExProduct(p);
                            setExColorId(p?.productColors?.[0]?.id || null);
                            setExVariantId(null);
                          }}
                          onSearchChange={handleCatalogSearch}
                          isLoading={isSearchingCatalog}
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Select
                          label="Color"
                          id="ex-color"
                          value={exColorId ? String(exColorId) : ""}
                          onChange={(e) => {
                            setExColorId(Number(e.target.value));
                            setExVariantId(null);
                          }}
                          disabled={!exProduct}
                          options={[
                            { value: "", label: "Color..." },
                            ...exColors.map((c) => ({
                              value: String(c.id),
                              label: c.color?.name || `Color #${c.id}`,
                            })),
                          ]}
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Select
                          label="Talla"
                          id="ex-variant"
                          value={exVariantId ? String(exVariantId) : ""}
                          onChange={(e) => setExVariantId(Number(e.target.value))}
                          disabled={!exActiveColor}
                          options={[
                            { value: "", label: "Talla..." },
                            ...exVariants.map((v) => ({
                              value: String(v.id),
                              label: `${v.size?.sizeNumber || v.id} (${v.currentStock})`,
                            })),
                          ]}
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-2 flex gap-1.5">
                        <Input
                          label="Cant."
                          type="number"
                          min={1}
                          value={exQty}
                          onChange={(e) => setExQty(e.target.value)}
                          size="sm"
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          icon={faPlus}
                          onClick={handleAddExchangeItem}
                          title="Agregar producto de cambio"
                          className="mb-0.5 shrink-0"
                        />
                      </div>
                    </div>

                    {itemErrors.exchange && (
                      <p className="text-xs text-rose-500 font-medium">{itemErrors.exchange}</p>
                    )}

                    {exchangeItems.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {exchangeItems.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-app-surface border border-app-border text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FontAwesomeIcon icon={faBoxOpen} className="text-brand-royal dark:text-brand-sky text-[11px]" />
                              <span className="font-bold text-app-text truncate">{ex.productName}</span>
                              <span className="text-app-muted">({ex.colorName} • Talla {ex.sizeName})</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono font-bold text-brand-royal dark:text-brand-sky">
                                x{ex.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExchangeItems((prev) => prev.filter((i) => i.id !== ex.id))
                                }
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Textarea
                    label="Detalles Adicionales de la Devolución"
                    placeholder="Describe especificaciones o notas adicionales para este producto..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    error={itemErrors.details}
                    rows={2}
                    size="sm"
                    iconLeft={faCommentDots}
                    maxLength={255}
                    showCount
                    currentLength={details.length}
                    helper="Campo opcional para brindar mayor claridad al evaluar la garantía"
                  />
                </div>
              </div>
            )}

            {selectedVariantId && (
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={faPlus}
                  onClick={handleAddItem}
                  className="hover:border-brand-royal text-brand-royal dark:text-brand-sky hover:bg-brand-royal/10"
                >
                  Añadir a la Lista de Devolución
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-alt/30 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky mb-3">
              <FontAwesomeIcon icon={faReceipt} className="text-lg" />
            </div>
            <h4 className="text-sm font-bold text-app-text">
              Paso 2 bloqueado: Esperando selección de venta
            </h4>
            <p className="mt-1 text-xs text-app-muted max-w-sm mx-auto">
              Utiliza el buscador del paso 1 para seleccionar la venta correspondiente. Se cargarán automáticamente los artículos facturados para tramitar la devolución.
            </p>
          </div>
        )}

        {/* ── PASO 3: Lista de Devoluciones Preparadas para Envío Masivo ── */}
        {selectedSaleRaw && (
          <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden shadow-xs">
            <div className="p-4 border-b border-app-border/70 bg-app-surface-alt/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                  <FontAwesomeIcon icon={faListCheck} />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-app-text">
                    Artículos Listos para Devolución ({returnItems.length})
                  </h4>
                  <p className="text-[11px] text-app-muted">
                    {totalItemsCount} unidad{totalItemsCount === 1 ? "" : "es"} en total a procesar
                  </p>
                </div>
              </div>
            </div>

            {returnItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-2xl text-app-muted/60 mb-2" />
                <p className="text-xs font-bold text-app-text">Aún no has agregado artículos</p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  Selecciona producto, talla, motivo y tipo de resolución, y haz clic en "Añadir a la Lista".
                </p>
              </div>
            ) : (
              <div className="divide-y divide-app-border/60">
                {returnItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-app-surface-alt/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-app-surface-alt font-mono text-[11px] font-bold text-app-muted border border-app-border">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-app-text truncate">
                          {item.productName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-app-muted flex-wrap">
                          {item.sku && <span className="font-mono">SKU: {item.sku}</span>}
                          <span className="inline-flex items-center gap-1">
                            {item.colorHex && (
                              <span
                                className="size-2 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            {item.colorName}
                          </span>
                          <span className="font-mono font-bold text-app-text">
                            Talla: {item.sizeName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-400">
                            Motivo: {REASONS_RETURN_LABELS[item.reason] || item.reason}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-700 dark:text-blue-400">
                            Resolución: {TYPE_RESOLUTION_LABELS[item.typeResolution] || item.typeResolution}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-app-surface-alt px-2 py-0.5 font-medium text-app-muted border border-app-border">
                            {item.returnToStock ? "Reingresa a stock" : "Merma / No vendible"}
                          </span>
                        </div>

                        {item.exchangeItems.length > 0 && (
                          <div className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Cambio por:{" "}
                            {item.exchangeItems
                              .map((ex) => `${ex.productName} (Talla ${ex.sizeName}) x${ex.quantity}`)
                              .join(", ")}
                          </div>
                        )}

                        {item.details && (
                          <p className="text-[11px] text-app-muted mt-1 italic">
                            Detalles: <span className="text-app-text font-medium">{item.details}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-royal/10 px-2.5 py-0.5 text-xs font-bold text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky">
                          {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrashCan}
                        onClick={() => handleRemoveItem(item.id)}
                        title="Eliminar de la lista"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 size-8 p-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ReturnFormModal;
