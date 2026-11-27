import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faBarcode,
  faCertificate,
  faDollarSign,
  faFloppyDisk,
  faImage,
  faLayerGroup,
  faPenToSquare,
  faShoePrints,
  faVenusMars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Modal from "../../../../../../shared/components/Modal";
import { Button } from "../../../../../../shared/components/Button";
import { Input } from "../../../../../../shared/components/Inputs/Input";
import { Select } from "../../../../../../shared/components/Inputs/Select";
import { Switcher } from "../../../../components/Switcher";
import {
  serializeColorBlocks,
  type BrandRecord,
  type CategoryRecord,
  type ColorRecord,
  type DraftColorBlock,
  type ProductDetailRecord,
  type ProductRecord,
  type ShoeTypeRecord,
  type SizeRecord,
  type UpdateProductDTO,
} from "../services/ProductServices";
import ProductColorsEditor from "./ProductColorsEditor";

export interface ProductUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  productItem: ProductRecord | null;
  productDetail: ProductDetailRecord | null;
  isLoadingDetail?: boolean;
  categories: CategoryRecord[];
  brands: BrandRecord[];
  shoeTypes: ShoeTypeRecord[];
  colors: ColorRecord[];
  sizes: SizeRecord[];
  onSubmit: (
    id: number,
    data: UpdateProductDTO,
    onClose: () => void
  ) => Promise<void> | void;
  onSubmitLoading?: boolean;
}

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "Unisex", label: "Unisex" },
];

const mapDetailToColorBlocks = (detail: ProductDetailRecord | null): DraftColorBlock[] => {
  if (!detail?.productColors) return [];
  return detail.productColors.map((pc) => ({
    colorId: String(pc.colorId),
    images:
      pc.colorImages && pc.colorImages.length > 0
        ? pc.colorImages.map((ci) => ci.image || "").filter(Boolean)
        : [""],
    sizes: (pc.productVariants || []).map((v) => ({
      sizeId: String(v.sizeId),
      currentStock: String(v.currentStock ?? 0),
      discount: String(Number(v.discount) || 0),
    })),
  }));
};

export const ProductUpdateModal: React.FC<ProductUpdateModalProps> = ({
  isOpen,
  onClose,
  productItem,
  productDetail,
  isLoadingDetail = false,
  categories,
  brands,
  shoeTypes,
  colors,
  sizes,
  onSubmit,
  onSubmitLoading = false,
}) => {
  const sourceItem = productDetail ?? productItem;

  const [trackedOpen, setTrackedOpen] = useState<boolean>(isOpen);
  const [trackedItem, setTrackedItem] = useState<ProductRecord | null>(productItem);
  const [trackedDetail, setTrackedDetail] = useState<ProductDetailRecord | null>(productDetail);
  const [name, setName] = useState<string>(sourceItem?.name ?? "");
  const [sku, setSku] = useState<string>(sourceItem?.sku ?? "");
  const [image, setImage] = useState<string>(sourceItem?.image ?? "");
  const [productCategoryId, setProductCategoryId] = useState<string>(
    sourceItem ? String(sourceItem.productCategoryId) : ""
  );
  const [brandId, setBrandId] = useState<string>(
    sourceItem ? String(sourceItem.brandId) : ""
  );
  const [shoeTypeId, setShoeTypeId] = useState<string>(
    sourceItem ? String(sourceItem.shoeTypeId) : ""
  );
  const [gender, setGender] = useState<string>(sourceItem?.gender ?? "Femenino");
  const [purchasePrice, setPurchasePrice] = useState<string>(
    sourceItem ? String(sourceItem.purchasePrice) : ""
  );
  const [salePrice, setSalePrice] = useState<string>(
    sourceItem ? String(sourceItem.salePrice) : ""
  );
  const [isPublic, setIsPublic] = useState<boolean>(sourceItem?.isPublic ?? true);
  const [status, setStatus] = useState<boolean>(sourceItem?.status ?? true);
  const [colorBlocks, setColorBlocks] = useState<DraftColorBlock[]>(() =>
    mapDetailToColorBlocks(productDetail)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (
    isOpen &&
    (!trackedOpen || trackedItem !== productItem || trackedDetail !== productDetail)
  ) {
    const target = productDetail ?? productItem;
    setTrackedOpen(true);
    setTrackedItem(productItem);
    setTrackedDetail(productDetail);
    setName(target?.name ?? "");
    setSku(target?.sku ?? "");
    setImage(target?.image ?? "");
    setProductCategoryId(target ? String(target.productCategoryId) : "");
    setBrandId(target ? String(target.brandId) : "");
    setShoeTypeId(target ? String(target.shoeTypeId) : "");
    setGender(target?.gender ?? "Femenino");
    setPurchasePrice(target ? String(target.purchasePrice) : "");
    setSalePrice(target ? String(target.salePrice) : "");
    setIsPublic(target?.isPublic ?? true);
    setStatus(target?.status ?? true);
    setColorBlocks(mapDetailToColorBlocks(productDetail));
    setErrors({});
  } else if (!isOpen && trackedOpen) {
    setTrackedOpen(false);
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nombre del calzado es obligatorio.";
    } else if (name.trim().length > 120) {
      newErrors.name = "El nombre no puede superar los 120 caracteres.";
    }

    if (sku.trim().length > 50) {
      newErrors.sku = "El SKU no puede superar los 50 caracteres.";
    }

    if (image.trim().length > 255) {
      newErrors.image = "La URL de imagen no puede superar los 255 caracteres.";
    }

    if (!productCategoryId) {
      newErrors.productCategoryId = "Selecciona una categoría.";
    }
    if (!brandId) {
      newErrors.brandId = "Selecciona una marca.";
    }
    if (!shoeTypeId) {
      newErrors.shoeTypeId = "Selecciona un tipo de calzado.";
    }

    const numPurchase = Number(purchasePrice);
    if (purchasePrice === "" || Number.isNaN(numPurchase) || numPurchase < 0) {
      newErrors.purchasePrice = "Ingresa un precio de compra válido (>= 0).";
    }

    const numSale = Number(salePrice);
    if (salePrice === "" || Number.isNaN(numSale) || numSale < 0) {
      newErrors.salePrice = "Ingresa un precio de venta válido (>= 0).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productItem || !validate()) return;

    const preparedColors = serializeColorBlocks(colorBlocks);

    await onSubmit(
      productItem.id,
      {
        name: name.trim(),
        sku: sku.trim() || null,
        image: image.trim() || null,
        productCategoryId: Number(productCategoryId),
        brandId: Number(brandId),
        shoeTypeId: Number(shoeTypeId),
        gender,
        purchasePrice: Number(purchasePrice),
        salePrice: Number(salePrice),
        isPublic,
        status,
        colors: preparedColors,
      },
      onClose
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Producto"
      description={
        productItem
          ? `Actualiza los datos principales, colores, imágenes y tallas de "${productItem.name}" (#${productItem.id}).`
          : "Actualiza la información del producto."
      }
      icon={faPenToSquare}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={onSubmitLoading}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="product-update-form"
            disabled={isLoadingDetail}
            isLoading={onSubmitLoading}
            loadingText="Guardando..."
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Cambios
          </Button>
        </div>
      }
    >
      {isLoadingDetail ? (
        <div className="space-y-4 py-6 animate-pulse">
          <div className="h-10 bg-app-border/40 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="h-10 bg-app-border/40 rounded-xl" />
            <div className="h-10 bg-app-border/40 rounded-xl" />
            <div className="h-10 bg-app-border/40 rounded-xl" />
          </div>
          <div className="h-28 bg-app-border/40 rounded-2xl" />
        </div>
      ) : (
        <form id="product-update-form" onSubmit={handleSubmit} className="space-y-4">
          {productItem && (
            <div className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-alt/70 px-4 py-2.5">
              <span className="text-xs font-semibold text-app-muted">
                Producto seleccionado
              </span>
              <span className="badge-sky font-mono">ID #{productItem.id}</span>
            </div>
          )}

          {/* Fila 1: Nombre + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-8">
              <Input
                id="edit-product-name"
                name="name"
                label="Nombre del Calzado"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Ej. Tenis Urban Runner Classic"
                iconLeft={faShoePrints}
                error={errors.name}
              />
            </div>

            <div className="sm:col-span-4">
              <Input
                id="edit-product-sku"
                name="sku"
                label="SKU (Opcional)"
                type="text"
                maxLength={50}
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
                }}
                placeholder="Ej. ISB-001"
                iconLeft={faBarcode}
                error={errors.sku}
              />
            </div>
          </div>

          {/* URL Imagen Principal */}
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <Input
                id="edit-product-image"
                name="image"
                label="URL de Imagen Principal (Opcional)"
                type="text"
                maxLength={255}
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
                }}
                placeholder="https://..."
                iconLeft={faImage}
                error={errors.image}
              />
            </div>
            {image.trim() && (
              <img
                src={image.trim()}
                alt="Vista previa"
                onError={(e) => {
                  e.currentTarget.src = "/shoesGreenSplash.jpg";
                }}
                className="size-10.5 shrink-0 rounded-xl object-cover border border-app-border bg-app-surface-alt"
              />
            )}
          </div>

          {/* Fila 2: Categoría + Marca + Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Select
              id="edit-product-category"
              name="productCategoryId"
              label="Categoría"
              value={productCategoryId}
              onChange={(e) => {
                setProductCategoryId(e.target.value);
                if (errors.productCategoryId) {
                  setErrors((prev) => ({ ...prev, productCategoryId: "" }));
                }
              }}
              iconLeft={faLayerGroup}
              options={
                categories.length > 0
                  ? categories.map((c) => ({ value: String(c.id), label: c.name }))
                  : [{ value: "", label: "Sin categorías" }]
              }
              error={errors.productCategoryId}
            />

            <Select
              id="edit-product-brand"
              name="brandId"
              label="Marca"
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                if (errors.brandId) setErrors((prev) => ({ ...prev, brandId: "" }));
              }}
              iconLeft={faAward}
              options={
                brands.length > 0
                  ? brands.map((b) => ({ value: String(b.id), label: b.name }))
                  : [{ value: "", label: "Sin marcas" }]
              }
              error={errors.brandId}
            />

            <Select
              id="edit-product-type"
              name="shoeTypeId"
              label="Tipo de Calzado"
              value={shoeTypeId}
              onChange={(e) => {
                setShoeTypeId(e.target.value);
                if (errors.shoeTypeId) setErrors((prev) => ({ ...prev, shoeTypeId: "" }));
              }}
              iconLeft={faCertificate}
              options={
                shoeTypes.length > 0
                  ? shoeTypes.map((t) => ({ value: String(t.id), label: t.name }))
                  : [{ value: "", label: "Sin tipos" }]
              }
              error={errors.shoeTypeId}
            />
          </div>

          {/* Fila 3: Género + Precio Compra + Precio Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Select
              id="edit-product-gender"
              name="gender"
              label="Género"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              iconLeft={faVenusMars}
              options={GENDER_OPTIONS}
            />

            <Input
              id="edit-product-purchase-price"
              name="purchasePrice"
              label="Precio de Compra"
              type="number"
              min="0"
              step="any"
              required
              value={purchasePrice}
              onChange={(e) => {
                setPurchasePrice(e.target.value);
                if (errors.purchasePrice) setErrors((prev) => ({ ...prev, purchasePrice: "" }));
              }}
              placeholder="0"
              iconLeft={faDollarSign}
              error={errors.purchasePrice}
            />

            <Input
              id="edit-product-sale-price"
              name="salePrice"
              label="Precio de Venta"
              type="number"
              min="0"
              step="any"
              required
              value={salePrice}
              onChange={(e) => {
                setSalePrice(e.target.value);
                if (errors.salePrice) setErrors((prev) => ({ ...prev, salePrice: "" }));
              }}
              placeholder="0"
              iconLeft={faDollarSign}
              error={errors.salePrice}
            />
          </div>

          {/* Fila 4: Visibilidad y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-surface p-3.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-app-text block">
                  Visible en Tienda
                </span>
                <p className="text-[11px] text-app-muted mt-0.5">
                  Mostrar producto en el catálogo público
                </p>
              </div>
              <Switcher
                checked={isPublic}
                onChange={setIsPublic}
                size="sm"
                labels={{ active: "Público", inactive: "Oculto" }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-surface p-3.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-app-text block">
                  Estado del Producto
                </span>
                <p className="text-[11px] text-app-muted mt-0.5">
                  Habilitar para ventas y compras
                </p>
              </div>
              <Switcher checked={status} onChange={setStatus} size="sm" />
            </div>
          </div>

          {/* Editar colores, imágenes y tallas o agregar más */}
          <ProductColorsEditor
            colorBlocks={colorBlocks}
            onChange={setColorBlocks}
            colors={colors}
            sizes={sizes}
            title="Colores, Imágenes y Tallas"
            subtitle="Edita los colores, sus múltiples imágenes y tallas existentes, o agrega nuevos"
          />
        </form>
      )}
    </Modal>
  );
};

export default ProductUpdateModal;
