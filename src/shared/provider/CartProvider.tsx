import { useEffect, useState, type ReactNode } from "react";
import type { CartItemType } from "../context/cart.context";
import CartContext from "../context/cart.context";

export default function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItemType[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const compareItem = (item: CartItemType, itemId: string | number) => item.idVariante === itemId;

    useEffect(() => {
        const loadCartFromStorage = () => {
            try {
                const savedCart = localStorage.getItem("cart");
                if (savedCart) {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed)) setCartItems(parsed);
                }
            } catch (err) {
                console.error("Error al cargar carrito:", err);
            }
        };

        loadCartFromStorage();
    }, []);

    useEffect(() => {
        const saveCartToStorage = () => {
            try {
                localStorage.setItem("cart", JSON.stringify(cartItems));
            } catch (err) {
                console.error("Error al guardar carrito:", err);
            }
        };

        saveCartToStorage();
    }, [cartItems]);

    const addToCart = (item: CartItemType) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(p => p.idVariante === item.idVariante);
            if (existingIndex > -1) {
                const updated = [...prev];
                const current = updated[existingIndex];
                const nuevaCantidad = current.cantidad + item.cantidad;
                // Respetar stock disponible si existe
                const finalCantidad = current.stockDisponible
                    ? Math.min(nuevaCantidad, current.stockDisponible)
                    : nuevaCantidad;
                updated[existingIndex] = { ...current, cantidad: finalCantidad };
                return updated;
            }
            return [...prev, { ...item }];
        });
    };

    const removeFromCart = (itemId: string | number) => setCartItems(prev => prev.filter(item => !compareItem(item, itemId)));

    const deductOne = (itemId: string | number) => {
        setCartItems(prev => {
            const item = prev.find(i => compareItem(i, itemId));
            if (!item) return prev;
            if (item.cantidad <= 1) {
                return prev.filter(i => !compareItem(i, itemId));
            }
            return prev.map(i => compareItem(i, itemId) ? { ...i, cantidad: i.cantidad - 1 } : i);
        });
    };

    const plusOne = (itemId: string | number) => {
        setCartItems(prev => {
            return prev.map(i => {
                if (compareItem(i, itemId)) {
                    if (i.stockDisponible && i.cantidad >= i.stockDisponible) return i;
                    return { ...i, cantidad: i.cantidad + 1 };
                }
                return i;
            });
        });
    };

    const calculteDiscount = (price: number, discount: number | null) => {
        if (!discount) return price;
        return price - (price * discount / 100);
    };

    const totalCartPrice = () => {
        const total = cartItems.reduce((acc, item) => {
            const itemPrice = calculteDiscount(item.precioVenta, item.descuento);
            return acc + (Number(itemPrice) * item.cantidad);
        }, 0);

        return total;
    };

    const totalCartItems = () => {
        return cartItems.reduce((acc, item) => acc + item.cantidad, 0);
    };

    const clearCart = () => setCartItems([]);


    return (
        <CartContext.Provider value={{
            isCartOpen,
            setIsCartOpen,
            cartItems,
            addToCart,
            removeFromCart,
            plusOne,
            deductOne,
            totalCartPrice,
            totalCartItems,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}