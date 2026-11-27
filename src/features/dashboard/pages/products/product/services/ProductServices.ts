import api from "../../../../../../app/api/api";
import type { BrandRecord } from "../../brands/services/brandsServices";
import type { CategoryRecord } from "../../categories/services/categoriesServices";
import type { ShoeTypeRecord } from "../../types/services/TypesServices";

export interface ProductVariantInput {
  sizeId: number;
  currentStock?: number;
  discount?: number;
  status?: boolean;
}

export interface ProductColorInput {
  colorId: number;
  image?: string;
  colorImages?: string[];
  status?: boolean;
  sizes?: ProductVariantInput[];
}

export interface ProductRecord {
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
  status: boolean;
  image?: string | null;
  brand?: Omit<BrandRecord, "productsCount">;
  productCategory?: Omit<CategoryRecord, "productsCount">;
  shoeType?: Omit<ShoeTypeRecord, "productsCount">;
}

export interface ProductColorImageDetail {
  id: number;
  productColorId: number;
  image?: string | null;
}

export interface ProductVariantDetail {
  id: number;
  productColorId: number;
  sizeId: number;
  currentStock: number;
  discount?: number | string | null;
  status: string;
  size?: {
    id: number;
    sizeNumber: string;
    gender: string;
    internationalSize: string;
  };
}

export interface ProductColorDetail {
  id: number;
  productId: number;
  colorId: number;
  status: string;
  color?: {
    id: number;
    name: string;
    hex: string;
  };
  colorImages?: ProductColorImageDetail[];
  productVariants?: ProductVariantDetail[];
}

export interface ProductDetailRecord extends ProductRecord {
  productColors?: ProductColorDetail[];
}

export interface CreateProductDTO {
  name: string;
  sku?: string | null;
  image?: string | null;
  brandId: number;
  productCategoryId: number;
  shoeTypeId: number;
  purchasePrice: number;
  salePrice: number;
  gender: string;
  isPublic?: boolean;
  status?: boolean;
  colors?: ProductColorInput[];
}

export type UpdateProductDTO = Partial<Omit<CreateProductDTO, "colors">>;

export async function getProducts() {
  return await api.get<{
    message: string;
    products: ProductRecord[];
  }>("/products");
}

export async function getProductById(id: number) {
  return await api.get<{
    message: string;
    product: ProductDetailRecord;
  }>(`/products/${id}`);
}

export async function createProduct(data: CreateProductDTO) {
  return await api.post<{
    message: string;
    product: ProductRecord;
  }>("/products", data);
}

export async function updateProduct(id: number, data: UpdateProductDTO) {
  return await api.put<{
    message: string;
    product: ProductRecord;
  }>(`/products/${id}`, data);
}

export async function updateProductStatus(id: number, status: boolean) {
  return await api.patch<{
    message: string;
    status: boolean;
  }>(`/products/status/${id}`, { status });
}

export async function deleteProduct(id: number) {
  return await api.delete<{
    message: string;
  }>(`/products/${id}`);
}
