import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotateLeft,
    faReceipt,
    faXmark,
    faFloppyDisk,
    faTag,
    faInfoCircle,
    faCheck,
    faLayerGroup,
    faShoePrints,
    faShirt,
    faTriangleExclamation,
    faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import { Input } from "../../../../../shared/components/Inputs/Input";
import { Textarea } from "../../../../../shared/components/Inputs/Textarea";
import SelectBySearch, { type SelectBySearchOption } from "../../../../../shared/components/Inputs/SelectBySearch";
import type { SaleReturn } from "../../../../../@types";
import {
    createSaleReturn,
    getSales,
    type SaleOptionItem,
} from "../services/salesReturnsServices";
import { Toast } from "../../../../../shared/utils/alerts";
import { isAxiosError } from "axios";

interface ReturnFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
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


    // ── 3. Estados de Selección de Producto, Color y Talla (Extraídos de la Venta) ──
    const [selectedProductName, setSelectedProductName] = useState<string>("");
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    // ── 4. Cantidad y Motivo ──
    const [quantity, setQuantity] = useState<number | string>(1);
    const [reason, setReason] = useState<string>("");

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Búsqueda de Ventas ──
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
                    const doc = s.customer?.identityDocument ? ` • Cédula: ${s.customer.identityDocument}` : "";
                    const itemCount = s.saleDetails?.length || 0;

                    return {
                        value: s.id,
                        label: `Venta #${s.id.slice(0, 8)}`,
                        sublabel: `Cliente: ${clientName}${doc}`,
                        description: `${itemCount} artículo${itemCount === 1 ? "" : "s"} en la venta`,
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

    // Carga inicial al abrir el modal
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line
            setSelectedSaleId("");
            setSelectedSaleRaw(null);
            setSelectedProductName("");
            setSelectedColorId(null);
            setSelectedVariantId(null);
            setQuantity(1);
            setReason("");
            setErrors({});
            setIsSubmitting(false);

            handleSalesSearch("");
        }
    }, [isOpen, handleSalesSearch]);

    // Manejador selección de venta
    const handleSelectSale = (opt?: SelectBySearchOption<SaleOptionItem>) => {
        if (!opt) {
            setSelectedSaleId("");
            setSelectedSaleRaw(null);
            setSelectedProductName("");
            setSelectedColorId(null);
            setSelectedVariantId(null);
            setQuantity(1);
            return;
        }

        const sale = opt.raw || null;
        setSelectedSaleId(String(opt.value));
        setSelectedSaleRaw(sale);

        // Reiniciar selecciones de producto/variante dependientes de la venta anterior
        setSelectedProductName("");
        setSelectedColorId(null);
        setSelectedVariantId(null);
        setQuantity(1);

        if (errors.selectedSaleId) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.selectedSaleId;
                return next;
            });
        }
    };

    // ── Agrupación de Productos, Colores y Tallas presentes en la Venta Seleccionada ──
    const saleProductsGrouped = useMemo(() => {
        const groups: Record<string, SaleProductGroup> = {};
        if (!selectedSaleRaw?.saleDetails) return groups;

        selectedSaleRaw.saleDetails.forEach((detail) => {
            const v = detail.variant;
            if (!v) return;

            const pColor = v.productColor;
            const prod = pColor?.product;
            const col = pColor?.color;

            const pName = prod?.name || `Producto sin nombre (#${v.id})`;
            const pSku = prod?.sku || null;
            const colorId = col?.id || 1;
            const colorName = col?.name || "Color Único";
            const colorHex = col?.hex;
            const image = pColor?.colorImages?.[0]?.image || pColor?.colorImages?.[0]?.imageUrl || null;

            const sizeName =
                v.size?.sizeNumber ||
                v.size?.size ||
                `Talla #${v.id}`;

            const purchasedQty = Number(detail.quantity) || 1;

            if (!groups[pName]) {
                groups[pName] = {
                    name: pName,
                    sku: pSku,
                    colors: {},
                };
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

    // Lista de opciones para el SelectBySearch de productos disponibles en la venta
    const saleProductOptions = useMemo<SelectBySearchOption<{ name: string; sku: string | null }>[]>(() => {
        return Object.keys(saleProductsGrouped).map((pName) => {
            const group = saleProductsGrouped[pName];
            const colorCount = Object.keys(group.colors).length;
            return {
                value: pName,
                label: pName,
                sublabel: group.sku ? `SKU: ${group.sku} • ${colorCount} color${colorCount === 1 ? "" : "es"} comprado${colorCount === 1 ? "" : "s"}` : `${colorCount} color${colorCount === 1 ? "" : "es"} comprado${colorCount === 1 ? "" : "s"}`,
                raw: { name: pName, sku: group.sku },
            };
        });
    }, [saleProductsGrouped]);

    // Producto activo
    const activeProductGroup = selectedProductName ? saleProductsGrouped[selectedProductName] : null;

    // Colores disponibles para el producto activo
    const availableColorsForProduct = useMemo(() => {
        if (!activeProductGroup) return [];
        return Object.values(activeProductGroup.colors);
    }, [activeProductGroup]);

    // Color activo
    const activeColor = selectedColorId && activeProductGroup
        ? activeProductGroup.colors[selectedColorId] || null
        : null;

    // Variantes/Tallas disponibles para el color activo
    const availableVariantsForColor = useMemo(() => {
        if (!activeColor) return [];
        return activeColor.variants;
    }, [activeColor]);

    // Variante activa
    const activeVariant = useMemo(() => {
        if (!selectedVariantId || !availableVariantsForColor) return null;
        return availableVariantsForColor.find((v) => v.variantId === selectedVariantId) || null;
    }, [selectedVariantId, availableVariantsForColor]);

    // Cantidad máxima vendida de la variante seleccionada
    const maxAvailableQty = activeVariant?.purchasedQty || 1;

    // Manejador selección de producto
    const handleSelectProduct = (pName: string) => {
        setSelectedProductName(pName);
        const grp = saleProductsGrouped[pName];
        if (grp) {
            const colorKeys = Object.keys(grp.colors).map(Number);
            if (colorKeys.length > 0) {
                setSelectedColorId(colorKeys[0]);
            } else {
                setSelectedColorId(null);
            }
        } else {
            setSelectedColorId(null);
        }
        setSelectedVariantId(null);
        setQuantity(1);

        if (errors.selectedProduct) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.selectedProduct;
                return next;
            });
        }
    };

    // Manejador selección de color
    const handleSelectColor = (cId: number) => {
        setSelectedColorId(cId);
        setSelectedVariantId(null);
        setQuantity(1);
    };

    // Manejador selección de talla
    const handleSelectVariant = (vId: number, maxQty: number) => {
        setSelectedVariantId(vId);
        // Si la cantidad actual supera el máximo comprado, reajustarla
        if (Number(quantity) > maxQty) {
            setQuantity(maxQty);
        } else if (Number(quantity) <= 0) {
            setQuantity(1);
        }

        if (errors.selectedVariant) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.selectedVariant;
                return next;
            });
        }
        if (errors.quantity) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.quantity;
                return next;
            });
        }
    };

    // Manejador de cambio de cantidad con control de límite máximo
    const handleQuantityChange = (valStr: string) => {
        if (valStr === "") {
            setQuantity("");
            return;
        }

        const val = Number(valStr);
        if (isNaN(val)) return;

        if (val > maxAvailableQty) {
            setQuantity(maxAvailableQty);
            setErrors((prev) => ({
                ...prev,
                quantity: `La cantidad no puede superar los ${maxAvailableQty} pares comprados en esta venta.`,
            }));
            return;
        }

        setQuantity(val);
        if (errors.quantity) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.quantity;
                return next;
            });
        }
    };

    // Validación previa al envío
    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!selectedSaleId) {
            errs.selectedSaleId = "Debes seleccionar una venta.";
        }

        if (!selectedProductName) {
            errs.selectedProduct = "Debes seleccionar el producto comprado en la venta.";
        }

        if (!selectedVariantId) {
            errs.selectedVariant = "Debes seleccionar la talla del calzado que se va a devolver.";
        }

        const qty = Number(quantity);
        if (!quantity || isNaN(qty) || qty <= 0) {
            errs.quantity = "La cantidad debe ser mayor a 0.";
        } else if (qty > maxAvailableQty) {
            errs.quantity = `No puedes devolver más de ${maxAvailableQty} unidades adquiridas en la venta.`;
        }

        if (!reason.trim()) {
            errs.reason = "Debes ingresar el motivo de la devolución.";
        } else if (reason.trim().length < 5) {
            errs.reason = "El motivo debe contener al menos 5 caracteres.";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Envío del formulario a la API
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        try {
            setIsSubmitting(true);
            const payload: Omit<SaleReturn, "id" | "rejectionReason" | "status" | "resolutionDate" | "userId"> = {
                saleId: selectedSaleId,
                variantId: Number(selectedVariantId),
                quantity: Number(quantity),
                reason: reason.trim(),
                requestDate: new Date().toISOString(),
            };

            const response = await createSaleReturn(payload);

            if (response.status === 200 || response.status === 201) {
                Toast.fire({
                    icon: "success",
                    title: response.data?.message || "Devolución registrada exitosamente.",
                });
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.fire({
                    icon: "error",
                    title: error.response?.data?.message || "Error al registrar la devolución.",
                    text: "Verifica los datos de la venta y variante",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Ocurrió un error inesperado al registrar la devolución.",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Nueva Devolución"
            description="Selecciona la venta, el producto calzado facturado, su color y la talla específica con validación de cantidad comprada."
            icon={faRotateLeft}
            size="xl"
            footer={
                <div className="flex w-full items-center justify-between sm:justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={onClose} type="button" disabled={isSubmitting}>
                        <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSubmit}
                        type="button"
                        loadingText="Guardando..."
                        isLoading={isSubmitting}
                        className="shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
                        Guardar Devolución
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Banner Informativo */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-royal/5 border border-brand-royal/15 dark:bg-brand-sky/10 dark:border-brand-sky/20">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/20 dark:text-brand-sky text-xs">
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </span>
                    <div className="text-xs space-y-0.5">
                        <p className="font-bold text-app-text">Trazabilidad de Garantías y Devoluciones</p>
                        <p className="text-app-muted leading-relaxed">
                            La solicitud quedará registrada en estado{" "}
                            <strong className="text-amber-600 dark:text-amber-400 font-semibold">En Revisión</strong>. Los productos y
                            tallas disponibles se filtran automáticamente a partir de los artículos facturados en la venta seleccionada.
                        </p>
                    </div>
                </div>

                {/* Sección 1: Selección de Venta y Documento de Usuario */}
                <div className="p-4 rounded-2xl border border-app-border bg-app-surface-alt/50 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-app-border/70">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                            <FontAwesomeIcon icon={faReceipt} />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted">
                            Venta y Responsable del Registro
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Buscador de Venta vía SelectBySearch */}
                        <div className="lg:col-span-12">
                            <SelectBySearch<SaleOptionItem>
                                label="Venta Asociada *"
                                placeholder="Buscar por ID de venta o nombre de cliente..."
                                searchPlaceholder="Escribe para buscar venta..."
                                options={saleOptions}
                                value={selectedSaleId}
                                onChange={(_, opt) => handleSelectSale(opt)}
                                onSearchChange={handleSalesSearch}
                                isLoading={isSearchingSales}
                                error={errors.selectedSaleId}
                                iconLeft={faReceipt}
                                size="md"
                            />
                        </div>
                    </div>

                    {/* Tarjeta de Resumen de la Venta seleccionada */}
                    {selectedSaleRaw && (
                        <div className="p-3 rounded-xl bg-app-surface border border-app-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-app-text">Cliente Facturado:</span>
                                <span className="text-brand-royal dark:text-brand-sky font-semibold">
                                    {selectedSaleRaw.customer
                                        ? `${selectedSaleRaw.customer.firstName} ${selectedSaleRaw.customer.lastName}`
                                        : "Cliente no registrado"}
                                </span>
                                {selectedSaleRaw.customer?.identityDocument && (
                                    <span className="text-app-muted font-mono">
                                        ({selectedSaleRaw.customer.identityDocument})
                                    </span>
                                )}
                            </div>
                            <div className="text-app-muted font-mono text-[11px]">
                                UUID: <strong className="text-app-text">{selectedSaleRaw.id}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección 2: Selector Interactivo de Productos, Colores y Tallas (Asociados a la Venta) */}
                <div className="rounded-2xl border border-app-border bg-app-surface shadow-xs transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border/70 bg-app-surface-alt/40 px-5 py-3 rounded-t-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-6 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xs">
                                <FontAwesomeIcon icon={faLayerGroup} />
                            </span>
                            <span className="text-xs font-bold tracking-tight text-app-text">
                                Productos Comprados en la Venta
                            </span>
                        </div>
                        <span className="text-[11px] text-app-muted">
                            {selectedSaleRaw
                                ? `${saleProductOptions.length} producto${saleProductOptions.length === 1 ? "" : "s"} disponible${saleProductOptions.length === 1 ? "" : "s"} para devolución`
                                : "Primero selecciona una venta"}
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        {!selectedSaleId ? (
                            <div className="py-8 text-center text-app-muted text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-app-border/80 rounded-xl bg-app-surface-alt/30">
                                <FontAwesomeIcon icon={faReceipt} className="text-xl text-app-muted/60" />
                                <p className="font-semibold">Selecciona una venta arriba para ver los productos comprados</p>
                                <p className="text-[11px] text-app-muted/80">
                                    Podrás elegir el calzado exacto, el color adquirido y la talla a devolver.
                                </p>
                            </div>
                        ) : saleProductOptions.length === 0 ? (
                            <div className="py-8 text-center text-app-muted text-xs flex flex-col items-center justify-center gap-2 border border-dashed border-rose-300 dark:border-rose-900/50 rounded-xl bg-rose-50/30 dark:bg-rose-950/20">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-xl text-rose-500" />
                                <p className="font-bold text-rose-600 dark:text-rose-400">Esta venta no contiene artículos registrados</p>
                            </div>
                        ) : (
                            <>
                                {/* Fila: Seleccionar Producto y Color Disponible */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                    {/* Dropdown de Producto con SelectBySearch de los artículos de la venta */}
                                    <div className="lg:col-span-7">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-app-muted mb-1.5 block">
                                            SELECCIONAR PRODUCTO COMPRADO *
                                        </label>
                                        <SelectBySearch<{ name: string; sku: string | null }>
                                            placeholder="Seleccionar calzado de la venta..."
                                            searchPlaceholder="Filtrar calzado..."
                                            options={saleProductOptions}
                                            value={selectedProductName}
                                            onChange={(val) => handleSelectProduct(String(val))}
                                            iconLeft={faShoePrints}
                                            size="md"
                                            error={errors.selectedProduct}
                                        />
                                    </div>

                                    {/* Pills de Color Disponible */}
                                    <div className="lg:col-span-5">
                                        <label className="text-[11px] font-bold tracking-wider text-app-muted mb-1.5 block">
                                            Color Disponible *
                                        </label>

                                        {!selectedProductName ? (
                                            <div className="text-xs text-app-muted italic py-2.5">
                                                Selecciona un calzado para ver los colores comprados
                                            </div>
                                        ) : availableColorsForProduct.length === 0 ? (
                                            <div className="text-xs text-app-muted italic py-2.5">
                                                Sin colores registrados para este producto
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 pt-0.5">
                                                {availableColorsForProduct.map((col) => {
                                                    const isColorActive = selectedColorId === col.id;

                                                    return (
                                                        <button
                                                            key={col.id}
                                                            type="button"
                                                            onClick={() => handleSelectColor(col.id)}
                                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${isColorActive
                                                                ? "bg-brand-royal text-white shadow-xs dark:bg-brand-royal ring-2 ring-brand-royal/30"
                                                                : "border border-app-border bg-app-surface text-app-text hover:border-brand-royal/40 hover:bg-app-surface-alt"
                                                                }`}
                                                        >
                                                            {col.hex && (
                                                                <span
                                                                    className="size-2.5 rounded-full border border-white/30 inline-block shrink-0 shadow-2xs"
                                                                    style={{ backgroundColor: col.hex }}
                                                                />
                                                            )}
                                                            <span>{col.name}</span>
                                                            {isColorActive && <FontAwesomeIcon icon={faCheck} className="text-[10px] ml-0.5" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-Panel: Tallas Disponibles de la Venta */}
                                {activeProductGroup && activeColor && (
                                    <div className="rounded-xl border border-app-border/80 bg-app-surface-alt/40 p-4 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-app-text">
                                                Tallas compradas para{" "}
                                                <span className="text-brand-royal dark:text-brand-sky">
                                                    {activeColor.name}
                                                </span>
                                                :
                                            </span>
                                            <span className="text-[11px] text-app-muted">
                                                Selecciona la talla exacta que el cliente va a devolver
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5">
                                            {availableVariantsForColor.map((variantObj) => {
                                                const isVariantActive = selectedVariantId === variantObj.variantId;

                                                return (
                                                    <button
                                                        key={variantObj.variantId}
                                                        type="button"
                                                        onClick={() => handleSelectVariant(variantObj.variantId, variantObj.purchasedQty)}
                                                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isVariantActive
                                                            ? "bg-brand-royal text-white shadow-xs dark:bg-brand-royal ring-2 ring-brand-royal/30 font-bold"
                                                            : "border border-app-border bg-app-surface text-app-text hover:border-brand-royal/40 hover:bg-app-surface"
                                                            }`}
                                                    >
                                                        <span>Talla {variantObj.sizeName}</span>
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isVariantActive
                                                                ? "bg-white/20 text-white font-bold"
                                                                : "bg-app-surface-alt text-app-muted"
                                                                }`}
                                                        >
                                                            {variantObj.purchasedQty} comprada{variantObj.purchasedQty === 1 ? "" : "s"}
                                                        </span>
                                                        {isVariantActive && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Resumen de Variante Seleccionada con Límite de Cantidad */}
                                        {activeVariant && (
                                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                                                        <FontAwesomeIcon icon={faShirt} />
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-emerald-800 dark:text-emerald-300">
                                                            {activeProductGroup.name}
                                                        </p>
                                                        <p className="text-emerald-700/80 dark:text-emerald-400/80 text-[11px]">
                                                            Color: {activeColor.name} • Talla: {activeVariant.sizeName} • Variante ID #{activeVariant.variantId}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                                                        <FontAwesomeIcon icon={faBoxesStacked} className="text-[10px]" />
                                                        Máximo a devolver: {maxAvailableQty} {maxAvailableQty === 1 ? "par" : "pares"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                        Seleccionada
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.selectedVariant && (
                                    <p className="text-xs text-rose-500 font-medium">{errors.selectedVariant}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Sección 3: Cantidad con Límite Máximo y Motivo */}
                <div className="p-4 rounded-2xl border border-app-border bg-app-surface space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                        <div className="sm:col-span-1">
                            <Input
                                label={`Cantidad a Devolver (Máx: ${maxAvailableQty}) *`}
                                id="quantity"
                                placeholder="Ej. 1"
                                type="number"
                                min="1"
                                max={maxAvailableQty}
                                step="1"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                error={errors.quantity}
                                iconLeft={faTag}
                                size="md"
                                disabled={!selectedVariantId}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="text-xs font-bold text-app-muted uppercase tracking-wider block mb-1">
                                Motivo o Causa de Devolución *
                            </label>
                            <Textarea
                                id="reason"
                                placeholder="Describe detalladamente el motivo de la devolución (ej. cambio de talla, garantía por defecto de fábrica, despegue de suela)..."
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (errors.reason) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.reason;
                                            return next;
                                        });
                                    }
                                }}
                                error={errors.reason}
                                rows={2}
                                maxLength={100}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default ReturnFormModal;
