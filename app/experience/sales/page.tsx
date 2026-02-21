"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useProducts } from "@/context/ProductContext";
import type { Product, CartItemWithProduct } from "@/helpers/products";
import { getCategoryEmoji, formatPrice } from "@/helpers/products";

type SidebarSection = "products" | "cart" | null;

export default function SalesExperience() {
  const [showCTA, setShowCTA] = useState(false);
  const [expandedSection, setExpandedSection] = useState<SidebarSection>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCartItem, setSelectedCartItem] =
    useState<CartItemWithProduct | null>(null);

  const {
    products,
    cartItems,
    loading,
    error,
    userId,
    setProducts,
    setCartItems,
    setLoading,
    setError,
    setUserId,
    addToCart: addToCartContext,
  } = useProducts();

  // Fetch everything directly on every mount
  useEffect(() => {
    const supabase = createClient();

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch products - no auth needed
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (productsError) {
          console.error("Products error:", productsError);
          setError(productsError.message);
        } else {
          console.log("Products loaded:", productsData?.length);
          setProducts(productsData || []);
        }

        // 2. Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        // 3. Fetch cart if logged in
        if (user) {
          const { data: cartData, error: cartError } = await supabase
            .from("cart_items")
            .select("*, products (*)")
            .eq("user_id", user.id)
            .order("added_at", { ascending: false });

          if (cartError) {
            console.error("Cart error:", cartError);
          } else {
            console.log("Cart loaded:", cartData?.length);
            setCartItems((cartData as CartItemWithProduct[]) || []);
          }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []); // runs every time this page mounts (including refresh)

  const handleMessageCount = (count: number) => {
    if (count >= 5 && !showCTA) {
      setShowCTA(true);
    }
  };

  const toggleSection = (section: SidebarSection) => {
    if (expandedSection === section) {
      setExpandedSection(null);
      setSelectedProduct(null);
      setSelectedCartItem(null);
    } else {
      setExpandedSection(section);
      setSelectedProduct(null);
      setSelectedCartItem(null);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCartItem(null);
  };

  const handleCartItemClick = (item: CartItemWithProduct) => {
    setSelectedCartItem(item);
    setSelectedProduct(null);
  };

  const addToCart = async (productId: string) => {
    if (!userId) {
      alert("Please sign in to add items to cart");
      return;
    }

    try {
      await addToCartContext(productId, 1);
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-7xl">
          <div
            className="
      flex items-center justify-between
      px-8 py-4
      rounded-2xl
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      shadow-[0_8px_30px_rgba(0,0,0,0.3)]
      transition-all duration-300
      hover:bg-white/10
      hover:border-white/20
    "
          >
            {/* Left Side */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Agentic Services Logo"
                  width={40}
                  height={40}
                  priority
                  className="object-contain"
                />
              </Link>

              <span className="text-xl font-bold ml-2 tracking-tight">
                <Link href="/" className="text-xl font-bold">
                  Agentic Services
                </Link>
              </span>
            </div>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl font-bold">TechStore</h1>
              <p className="text-xs text-gray-400">
                Chat with our AI Sales Agent to find the perfect product
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {showCTA && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Impressed?</h4>
                <p className="text-sm mb-3">Get a custom agent for your site</p>
                <Link
                  href="/request-demo"
                  className="inline-block bg-white text-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Request Demo
                </Link>
              </div>
              <button
                onClick={() => setShowCTA(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Multi-Level Sidebar */}
            <div className="lg:col-span-2 flex gap-4 h-full min-h-0">
              {/* Main Sidebar - Level 1 */}
              <div className="w-52 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-sm font-bold">Store</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-pulse">Loading...</div>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <div className="text-red-400 text-sm mb-2">⚠️ Error</div>
                      <div className="text-xs text-gray-400">{error}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Make sure tables exist in Supabase
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Products Section */}
                      <button
                        onClick={() => toggleSection("products")}
                        className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/10 ${
                          expandedSection === "products" ? "bg-white/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm">📦</span>
                          <span className="font-semibold text-sm">
                            Products
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
                            {products.length}
                          </span>
                          <span
                            className={`transform transition-transform ${
                              expandedSection === "products" ? "rotate-90" : ""
                            }`}
                          >
                            ▶
                          </span>
                        </div>
                      </button>

                      {/* Cart Section */}
                      <button
                        onClick={() => toggleSection("cart")}
                        className={`w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${
                          expandedSection === "cart" ? "bg-white/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm">🛒</span>
                          <span className="font-semibold text-sm">Cart</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
                            {cartItems.length}
                          </span>
                          <span
                            className={`transform transition-transform ${
                              expandedSection === "cart" ? "rotate-90" : ""
                            }`}
                          >
                            ▶
                          </span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Secondary Sidebar - Level 2 (List) */}
              {expandedSection && (
                <div className="w-60 bg-white/5 rounded-xl border custom-scrollbar border-white/10 flex flex-col animate-slide-in min-h-0">
                  <div className="p-4 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
                    <h3 className="font-bold text-sm">
                      {expandedSection === "products"
                        ? "All Products"
                        : "Cart Items"}
                    </h3>
                    <button
                      onClick={() => toggleSection(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {expandedSection === "products" &&
                      (products.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">📦</div>
                          <p className="text-sm">No products available</p>
                          <p className="text-xs mt-2 text-gray-500">
                            Run the seed SQL script in Supabase
                          </p>
                        </div>
                      ) : (
                        products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className={`w-full text-left p-2 rounded-lg border transition-colors ${
                              selectedProduct?.id === product.id
                                ? "bg-orange-500/20 border-orange-500"
                                : "bg-black/50 border-white/10 hover:border-orange-500/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {getCategoryEmoji(product.category)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold truncate">
                                  {product.name}
                                </h4>
                              </div>
                            </div>
                          </button>
                        ))
                      ))}

                    {expandedSection === "cart" &&
                      (cartItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">🛒</div>
                          <p>Your cart is empty</p>
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleCartItemClick(item)}
                            className={`w-full text-left p-2 rounded-lg border transition-colors ${
                              selectedCartItem?.id === item.id
                                ? "bg-orange-500/20 border-orange-500"
                                : "bg-black/50 border-white/10 hover:border-orange-500/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {getCategoryEmoji(item.products.category)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold truncate">
                                  {item.products.name}
                                </h4>
                              </div>
                            </div>
                          </button>
                        ))
                      ))}
                  </div>
                </div>
              )}

              {/* Details Panel - Level 3 */}
              {(selectedProduct || selectedCartItem) && (
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col animate-slide-in">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Details</h3>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setSelectedCartItem(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
                    {selectedProduct && (
                      <div className="max-w-sm w-full">
                        {/* Product Card */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-4 border-2 border-white/20 shadow-2xl">
                          {/* Product Image */}
                          <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl p-4 mb-6 flex items-center justify-center min-h-[120]">
                            {selectedProduct.image_url ? (
                              <img
                                src={selectedProduct.image_url}
                                alt={selectedProduct.name}
                                className="w-full object-contain rounded-lg"
                              />
                            ) : (
                              <div className="text-7xl">
                                {getCategoryEmoji(selectedProduct.category)}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-3">
                            <div className="flex w-full justify-between items-center mb-4">
                              {/* Product Name */}
                              <h2 className="text-xl font-bold text-white">
                                {selectedProduct.name}
                              </h2>
                              {/* Price */}
                              <div className="text-2xl font-bold text-orange-500">
                                {formatPrice(selectedProduct.price)}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {selectedProduct.description ||
                                "Premium quality product with excellent features and performance. Perfect for your needs."}
                            </p>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 py-2">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className="text-orange-500 text-sm"
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>

                            {/* Stock Info */}
                            <div className="text-xs text-gray-400 pb-2">
                              In Stock: {selectedProduct.stock_quantity} units
                              available
                            </div>

                            {/* Buy Now Button */}
                            <button
                              onClick={() => addToCart(selectedProduct.id)}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedCartItem && (
                      <div className="w-full">
                        <div className="text-center mb-6">
                          <div className="text-8xl mb-4">
                            {getCategoryEmoji(
                              selectedCartItem.products.category,
                            )}
                          </div>
                          <h2 className="text-3xl font-bold mb-2">
                            {selectedCartItem.products.name}
                          </h2>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-xs">
                                Quantity
                              </span>
                              <span className="text-xl font-bold">
                                {selectedCartItem.quantity}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-xs">
                                Unit Price
                              </span>
                              <span className="font-semibold">
                                {formatPrice(selectedCartItem.products.price)}
                              </span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                              <span className="text-gray-400 text-xl">
                                Total
                              </span>
                              <span className="text-3xl font-bold text-orange-500">
                                {formatPrice(
                                  selectedCartItem.products.price *
                                    selectedCartItem.quantity,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Placeholder when nothing is expanded */}
              {!expandedSection && (
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                  <div className="text-center text-gray-400 max-w-md px-6">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-bold mb-2">
                      Welcome to TechStore
                    </h3>
                    <p className="text-sm">
                      Select{" "}
                      <span className="font-semibold text-orange-500">
                        Products
                      </span>{" "}
                      to browse our catalog or{" "}
                      <span className="font-semibold text-orange-500">
                        Cart
                      </span>{" "}
                      to view your items
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1 h-full min-h-0">
              <ChatInterface
                agentType="sales"
                agentName="Sales Agent"
                agentIcon="🛍️"
                placeholder="Ask about products, pricing, or deals..."
                onMessageCountChange={handleMessageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
