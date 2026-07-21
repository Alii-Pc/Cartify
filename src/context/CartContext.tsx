"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { SafeProduct, CartItemData } from "@/types";

export interface CartItem {
  product: SafeProduct;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: SafeProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cartify_cart_items";

// ── Helper: check if user is logged in (client-side) ──
async function fetchAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const json = await res.json();
    return json.success === true && json.data?.id;
  } catch {
    return false;
  }
}

// ── Helper: localStorage operations ──
function loadLocalCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function clearLocalCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isInitialized = useRef(false);

  // ── Initialize: detect auth, load cart from appropriate source ──
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const loggedIn = await fetchAuthStatus();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Merge any localStorage items into server cart, then fetch server cart
        const localItems = loadLocalCart();
        if (localItems.length > 0) {
          // Merge local cart into server
          for (const item of localItems) {
            try {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: item.product._id, quantity: item.quantity }),
              });
            } catch {}
          }
          clearLocalCart();
        }

        // Fetch server cart
        try {
          const res = await fetch("/api/cart", { credentials: "include" });
          const json = await res.json();
          if (json.success && json.data?.items) {
            const serverItems: CartItem[] = json.data.items
              .filter((i: CartItemData) => i.product)
              .map((i: CartItemData) => ({
                product: i.product as SafeProduct,
                quantity: i.quantity,
              }));
            setCartItems(serverItems);
          }
        } catch {
          // Fallback to localStorage if server unreachable
          setCartItems(loadLocalCart());
        }
      } else {
        // Guest: load from localStorage
        setCartItems(loadLocalCart());
      }

      isInitialized.current = true;
      setIsLoading(false);
    }
    init();
  }, []);

  // ── Save to localStorage when cart changes (guest mode persistence) ──
  useEffect(() => {
    if (!isInitialized.current) return;
    if (!isLoggedIn) {
      saveLocalCart(cartItems);
    }
  }, [cartItems, isLoggedIn]);

  // ── Sync cart from server (force refresh) ──
  const syncCart = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data?.items) {
        const serverItems: CartItem[] = json.data.items
          .filter((i: CartItemData) => i.product)
          .map((i: CartItemData) => ({
            product: i.product as SafeProduct,
            quantity: i.quantity,
          }));
        setCartItems(serverItems);
      }
    } catch {}
  }, [isLoggedIn]);

  // ── Add to cart (optimistic) ──
  const addToCart = useCallback(
    (product: SafeProduct, quantity = 1) => {
      // Optimistic update
      setCartItems((prev) => {
        const existing = prev.find((item) => item.product._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: Math.min(product.stock || 99, item.quantity + quantity) }
              : item
          );
        }
        return [...prev, { product, quantity: Math.min(product.stock || 99, quantity) }];
      });

      // Background API sync for logged-in users
      if (isLoggedIn) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product._id, quantity }),
        }).catch(() => {
          // On failure, the optimistic update stays (best effort)
        });
      }
    },
    [isLoggedIn]
  );

  // ── Remove from cart (optimistic) ──
  const removeFromCart = useCallback(
    (productId: string) => {
      setCartItems((prev) => prev.filter((item) => item.product._id !== productId));

      if (isLoggedIn) {
        fetch(`/api/cart/${productId}`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {});
      }
    },
    [isLoggedIn]
  );

  // ── Update quantity (optimistic) ──
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: Math.min(item.product.stock || 99, quantity) }
            : item
        )
      );

      if (isLoggedIn) {
        fetch(`/api/cart/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        }).catch(() => {});
      }
    },
    [isLoggedIn, removeFromCart]
  );

  // ── Clear cart ──
  const clearCart = useCallback(() => {
    setCartItems([]);
    clearLocalCart();

    if (isLoggedIn) {
      fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
