import api from "../../../../../../app/api/api";

export interface BrandRecord {
  id: number;
  name: string;
  status: boolean;
  productsCount?: number;
}

export interface CategoryRecord {
  id: number;
  name: string;
  description: string;
  productsCount?: number;
}

export interface ColorRecord {
  id: number;
  color: string;
  hex: string;
  productsCount?: number;
}

export interface SizeRecord {
  id: number;
  sizeNumber: string;
  gender: string;
  internationalSize: string;
  variantsCount?: number;
}

export interface ShoeTypeRecord {
  id: number;
  name: string;
  productsCount?: number;
}

export async function getProductBrands() {
  return await api.get<{ message: string; brands: BrandRecord[] }>("/products/brands");
}

export async function getProductCategories() {
  return await api.get<{ message: string; categories: CategoryRecord[] }>(
    "/products/categories"
  );
}

export async function getProductColors() {
  return await api.get<{ message: string; colors: ColorRecord[] }>("/products/colors");
}

export async function getProductSizes() {
  return await api.get<{ message: string; sizes: SizeRecord[] }>("/products/sizes");
}

export async function getProductShoeTypes() {
  return await api.get<{ message: string; shoeTypes: ShoeTypeRecord[] }>(
    "/products/types"
  );
}

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

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface DraftSizeVariant {
  sizeId: string;
  currentStock: string;
  discount: string;
}

export interface DraftColorBlock {
  colorId: string;
  images: string[];
  sizes: DraftSizeVariant[];
}

export function serializeColorBlocks(blocks: DraftColorBlock[]): ProductColorInput[] {
  return blocks
    .filter((b) => Boolean(b.colorId))
    .map((b) => {
      const validImages = b.images.map((url) => url.trim()).filter(Boolean);
      return {
        colorId: Number(b.colorId),
        ...(validImages.length > 0 ? { colorImages: validImages } : {}),
        status: true,
        sizes: b.sizes
          .filter((s) => Boolean(s.sizeId))
          .map((s) => ({
            sizeId: Number(s.sizeId),
            currentStock: Math.max(0, Number(s.currentStock) || 0),
            discount: Math.max(0, Number(s.discount) || 0),
            status: true,
          })),
      };
    });
}

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
