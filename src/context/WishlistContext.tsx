"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { SafeProduct } from "@/types";

interface WishlistContextType {
  wishlistItems: SafeProduct[];
  toggleWishlist: (product: SafeProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  isLoading: boolean;
  syncWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "cartify_wishlist_items";

// ── Helper: check if user is logged in ──
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
function loadLocalWishlist(): SafeProduct[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalWishlist(items: SafeProduct[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function clearLocalWishlist() {
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch {}
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<SafeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isInitialized = useRef(false);

  // ── Sync with server ──
  const syncWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data?.products) {
        setWishlistItems(json.data.products);
      }
    } catch (err) {
      console.error("Error fetching server wishlist:", err);
    }
  }, []);

  // ── Initialize auth and merge guest local wishlist if logged in ──
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const loggedIn = await fetchAuthStatus();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Merge guest local wishlist into server account
        const localItems = loadLocalWishlist();
        if (localItems.length > 0) {
          for (const item of localItems) {
            try {
              await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ productId: item._id }),
              });
            } catch {}
          }
          clearLocalWishlist();
        }
        await syncWishlist();
      } else {
        setWishlistItems(loadLocalWishlist());
      }
      setIsLoading(false);
      isInitialized.current = true;
    }

    init();
  }, [syncWishlist]);

  // ── Save local copy if guest ──
  useEffect(() => {
    if (!isInitialized.current || isLoggedIn) return;
    saveLocalWishlist(wishlistItems);
  }, [wishlistItems, isLoggedIn]);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const toggleWishlist = async (product: SafeProduct) => {
    const exists = isInWishlist(product._id);
    
    // Optimistic UI Update
    setWishlistItems((prev) =>
      exists ? prev.filter((item) => item._id !== product._id) : [...prev, product]
    );

    if (isLoggedIn) {
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product._id }),
        });
      } catch (err) {
        console.error("Failed to update server wishlist:", err);
        // Revert optimistic update if request fails
        await syncWishlist();
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== productId));

    if (isLoggedIn) {
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });
      } catch (err) {
        console.error("Failed to remove item from server wishlist:", err);
        await syncWishlist();
      }
    }
  };

  const clearWishlist = async () => {
    setWishlistItems([]);
    clearLocalWishlist();

    if (isLoggedIn) {
      try {
        await fetch("/api/wishlist", {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to clear server wishlist:", err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlistItems.length,
        isLoading,
        syncWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
