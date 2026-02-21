"use client";

import React, { createContext, useContext, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, CartItemWithProduct } from "@/helpers/products";

interface ProductContextType {
  products: Product[];
  cartItems: CartItemWithProduct[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  setProducts: (products: Product[]) => void;
  setCartItems: (items: CartItemWithProduct[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserId: (id: string | null) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!userId) throw new Error("Please sign in to add items to cart");
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: userId, product_id: productId, quantity });
    }

    const { data } = await supabase
      .from("cart_items")
      .select("*, products (*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    setCartItems((data as CartItemWithProduct[]) || []);
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!userId) throw new Error("Please sign in to remove items from cart");
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", userId);
    const { data } = await supabase
      .from("cart_items")
      .select("*, products (*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    setCartItems((data as CartItemWithProduct[]) || []);
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (!userId) throw new Error("Please sign in to update cart");
    if (quantity <= 0) { await removeFromCart(cartItemId); return; }
    const supabase = createClient();
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", userId);
    const { data } = await supabase
      .from("cart_items")
      .select("*, products (*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    setCartItems((data as CartItemWithProduct[]) || []);
  };

  return (
    <ProductContext.Provider
      value={{
        products, setProducts,
        cartItems, setCartItems,
        loading, setLoading,
        error, setError,
        userId, setUserId,
        addToCart, removeFromCart, updateCartQuantity,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider");
  return context;
}
