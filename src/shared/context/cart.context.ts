import { createContext } from "react";

export interface CartItemType {
    // Identificadores clave
    idVariante: number;
    sku: string;           // Variante específica seleccionada (Color + Talla)
    idProducto: number;           // Para enlaces hacia el detalle del producto
    idProductoColor: number;      // Referencia a la combinación de color

    // Información visual e informativa para la UI
    nombreProducto: string;       // ProductoConRelaciones.nombre
    color: string;                // Color.color
    talla: string;                // Talla.numeroTalla o Talla.tallaInternacional
    imagen: string;               // Primera imagen del arreglo ProductoColor.imagenes[0]

    // Precios y Cálculo
    precioVenta: number;          // ProductoConRelaciones.precioVenta
    descuento: number;            // ProductoVariante.descuento (porcentaje o monto)

    // Control de compra
    cantidad: number;             // Cantidad que el usuario desea comprar
    stockDisponible: number;      // ProductoVariante.stockActual (para validar límites en UI)
}




export interface CartContextType {
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    cartItems: CartItemType[];
    addToCart: (item: CartItemType) => void;
    removeFromCart: (itemId: string | number) => void;
    plusOne: (itemId: string | number) => void;
    deductOne: (itemId: string | number) => void;
    totalCartPrice: () => number;
    totalCartItems: () => number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export default CartContext;