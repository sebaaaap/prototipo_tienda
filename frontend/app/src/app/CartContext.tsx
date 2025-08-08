'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  clearCartAfterPayment: () => void;
  cartCount: number;
  totalPrice: number;
  userAuthenticated: boolean | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
    
    // Verificar autenticación cada 3 segundos para mayor responsividad
    const interval = setInterval(checkAuthStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/me', {
        credentials: 'include',
      });
      const isAuthenticated = response.ok;
      setUserAuthenticated(isAuthenticated);
      
      // Solo cargar carrito si el usuario está autenticado
      if (isAuthenticated) {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
          }
        }
      } else {
        // Si no está autenticado, limpiar carrito
        setCart([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUserAuthenticated(false);
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  // Guardar carrito en localStorage cuando cambie (solo si está autenticado)
  useEffect(() => {
    if (userAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, userAuthenticated]);

  const addToCart = (product: Product) => {
    // Solo permitir agregar al carrito si está autenticado
    if (!userAuthenticated) {
      console.warn('Usuario no autenticado, no se puede agregar al carrito');
      return;
    }
    
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        // Si el producto ya existe, incrementar cantidad (por ahora solo agregamos uno más)
        return [...prevCart, product];
      } else {
        return [...prevCart, product];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const index = prevCart.findIndex(item => item.id === productId);
      if (index > -1) {
        const newCart = [...prevCart];
        newCart.splice(index, 1);
        return newCart;
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Función para limpiar carrito después de pago exitoso
  const clearCartAfterPayment = () => {
    clearCart();
  };

  const cartCount = cart.length;
  const totalPrice = cart.reduce((total, product) => total + product.price, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      clearCartAfterPayment,
      cartCount,
      totalPrice,
      userAuthenticated
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}