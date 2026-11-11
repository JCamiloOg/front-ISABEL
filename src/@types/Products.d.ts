export type Genero = 'Hombre' | 'Mujer' | 'Unisex' | 'Niño' | 'Niña';
export type Estado = 'Activo' | 'Inactivo';

export interface Talla {
    idTalla: number;
    numeroTalla: string;
    genero: Genero;
    tallaInternacional: string;
}

export interface Color {
    id_color: number;
    color: string;
}

export interface ProductoVariante {
    idVariante: number;
    idProductoColor: number;
    idTalla: number;
    stockActual: number;
    descuento: number;
    estado: Estado;
    talla: Talla;
}

export interface ProductoColor {
    idProductoColor: number;
    idProducto: number;
    idColor: number;
    imagenes: string[];
    estado: Estado;
    variantes: ProductoVariante[];
}

export interface ProductoConRelaciones {
    idProducto: number;
    nombre: string;
    sku: string;
    idCategoriaProducto: number;
    idMarca: number;
    idTipoZapato: number;
    precioCompra: number;
    precioVenta: number;
    publico: boolean;
    genero: Genero;
    estado: Estado;
    colores: ProductoColor[];
}