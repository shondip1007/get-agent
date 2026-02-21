/**
 * Product and Cart Types for Supabase Tables
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products?: Product; // Joined product data
}

export interface CartItemWithProduct extends CartItem {
  products: Product;
}

/**
 * Get emoji for product category
 */
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    laptops: "💻",
    laptop: "💻",
    keyboards: "⌨️",
    keyboard: "⌨️",
    monitors: "🖥️",
    monitor: "🖥️",
    mouse: "🖱️",
    headphones: "🎧",
    webcam: "📷",
    speaker: "🔊",
    audio: "🎧",
    accessories: "🖱️",
    default: "📦",
  };

  return emojiMap[category.toLowerCase()] || emojiMap.default;
}

/**
 * Format price to USD currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
