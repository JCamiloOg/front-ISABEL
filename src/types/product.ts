export type GeneroCalzado = 'Hombre' | 'Mujer' | 'Unisex' | 'Infantil';

export interface CategoriaProducto {
  id_categoria_producto: number;
  nombre: string;
  descripcion: string;
}

export interface Marca {
  id_marca: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo';
}

export interface TipoZapato {
  id_tipo_zapato: number;
  nombre: string;
}

export interface Color {
  id_color: number;
  color: string;
  hexCode?: string; // Para renderizar la muestra de color en la UI
}

export interface ProductoColor {
  id_producto_color: number;
  id_producto: number;
  id_color: number;
  color: Color;
  imagen: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Talla {
  id_talla: number;
  numero_talla: string;
  genero: GeneroCalzado;
  talla_internacional: string;
}

export interface ProductoVariante {
  id_variante: number;
  id_producto_color: number;
  id_talla: number;
  talla: Talla;
  sku: string;
  stock_actual: number;
  descuento: number; // Porcentaje de descuento (ej: 15.00 = 15%)
  estado: 'Activo' | 'Inactivo';
}

export interface Producto {
  id_producto: number;
  nombre: string;
  id_categoria_producto: number;
  categoria: CategoriaProducto;
  id_marca: number;
  marca: Marca;
  id_tipo_zapato: number;
  tipo_zapato: TipoZapato;
  precio_compra: number;
  precio_venta: number;
  publico: boolean;
  genero: GeneroCalzado;
  estado: 'Activo' | 'Inactivo';
  colores: ProductoColor[];
  variantes: ProductoVariante[];
}

export interface CartItem {
  id_variante: number;
  producto: Producto;
  colorSeleccionado: ProductoColor;
  varianteSeleccionada: ProductoVariante;
  cantidad: number;
  precioFinal: number;
}

