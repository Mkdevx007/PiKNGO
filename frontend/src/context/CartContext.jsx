import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const getCartKey = () => {
        const userId = localStorage.getItem('userId');
        return userId ? `cart_${userId}` : 'cart_guest';
    };

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem(getCartKey());
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        // Keep cart isolated per logged-in user to avoid cross-account carryover.
        const syncCartForCurrentUser = () => {
            const savedCart = localStorage.getItem(getCartKey());
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        };

        syncCartForCurrentUser();
        window.addEventListener('storage', syncCartForCurrentUser);
        return () => window.removeEventListener('storage', syncCartForCurrentUser);
    }, []);

    const addToCart = (item, restaurantId, restaurantName) => {
        setCartItems(prev => {
            // Check if adding from a different restaurant
            if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
                if (window.confirm("You already have items from another restaurant in your cart. Clear cart and add this instead?")) {
                    return [{ ...item, quantity: 1, restaurantId, restaurantName }];
                }
                return prev;
            }

            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, restaurantId, restaurantName }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
