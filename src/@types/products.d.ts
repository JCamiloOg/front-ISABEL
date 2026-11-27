// ============================================================================
// 2. MÓDULO DE INVENTARIO Y PRODUCTOS
// ============================================================================

import type { PurchaseDetail } from './purchases';
import type { SaleDetail, SaleReturn } from './sales';

/** Categorías principales de calzado (ej. Deportivo, Casual, Formal) */
export interface ProductCategory {
  id: number;
  name: string;
  description: string;
}

export interface ProductCategoryWithRelations extends ProductCategory {
  products?: Product[];
}

/** Marcas comerciales de calzado */
export interface Brand {
  id: number;
  name: string;
  status: string;
}

export interface BrandWithRelations extends Brand {
  products?: Product[];
}

/** Estilos o tipos específicos de zapato (ej. Tenis, Bota, Sandalia, Mocasín) */
export interface ShoeType {
  id: number;
  name: string;
}

export interface ShoeTypeWithRelations extends ShoeType {
  products?: Product[];
}

/** Producto base (modelo de zapato) antes de desglosar por color y talla */
export interface Product {
  id: number;
  sku?: string | null;
  name: string;
  productCategoryId: number;
  brandId: number;
  shoeTypeId: number;
  purchasePrice: number | string;
  salePrice: number | string;
  isPublic: boolean;
  gender: string;
  status: string;
}

export interface ProductWithRelations extends Product {
  productCategory?: ProductCategory;
  brand?: Brand;
  shoeType?: ShoeType;
  productColors?: ProductColorWithRelations[];
}

/** Paleta maestra de colores con su código hexadecimal */
export interface Color {
  id: number;
  name: string;
  hex: string;
}

export interface ColorWithRelations extends Color {
  productColors?: ProductColor[];
}

/** Combinación de un producto con un color específico y su imagen principal */
export interface ProductColor {
  id: number;
  productId: number;
  colorId: number;
  image?: string | null;
  status: string;
}

export interface ProductColorWithRelations extends ProductColor {
  product?: Product;
  color?: Color;
  colorImages?: ColorImage[];
  productVariants?: ProductVariantWithRelations[];
}

/** Galería de imágenes adicionales por cada combinación producto-color */
export interface ColorImage {
  id: number;
  productColorId: number;
  image?: string | null;
}

export interface ColorImageWithRelations extends ColorImage {
  productColor?: ProductColor;
}

/** Catálogo de tallas locales e internacionales por género */
export interface Size {
  id: number;
  sizeNumber: string;
  gender: string;
  internationalSize: string;
}

export interface SizeWithRelations extends Size {
  productVariants?: ProductVariant[];
}

/** Unidad mínima inventariable (SKU físico): Producto + Color + Talla con stock real */
export interface ProductVariant {
  id: number;
  productColorId: number;
  sizeId: number;
  currentStock: number;
  discount?: number | string | null;
  status: string;
}

export interface ProductVariantWithRelations extends ProductVariant {
  productColor?: ProductColorWithRelations;
  size?: Size;
  purchaseDetails?: PurchaseDetail[];
  saleDetails?: SaleDetail[];
  saleReturns?: SaleReturn[];
}
