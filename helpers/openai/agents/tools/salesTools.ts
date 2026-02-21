import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  GetAllProductsSchema,
  SearchProductSchema,
  AddToCartSchema,
  RemoveFromCartSchema,
} from "../schemas";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Tool 1 — Return ALL products from the database
 */
export const getAllProductsTool = tool({
  name: "get_all_products",
  description:
    "Return every product available in the store with name, price, category, and stock. Use this when the user wants to browse or see all products.",
  parameters: GetAllProductsSchema,
  async execute(_params, _runContext?: RunContext<AgentContext>) {
    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("id, name, category, price, stock_quantity, description")
        .order("category", { ascending: true });

      if (error)
        return {
          success: false,
          message: `DB error: ${error.message}`,
          products: [],
        };
      if (!data || data.length === 0)
        return {
          success: false,
          message: "No products found in the store.",
          products: [],
        };

      return {
        success: true,
        total: data.length,
        products: data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: `$${p.price}`,
          rawPrice: p.price,
          description: p.description ?? "",
          stock_quantity: p.stock_quantity,
          in_stock: p.stock_quantity > 0,
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message ?? "Unknown error",
        products: [],
      };
    }
  },
});

/**
 * Tool 2 — Search a product by name and check stock availability
 */
export const searchProductTool = tool({
  name: "search_product",
  description:
    "Search for a specific product by name and check whether it is available in stock. Use this when the user asks about a specific product, its price, or availability.",
  parameters: SearchProductSchema,
  async execute(params, _runContext?: RunContext<AgentContext>) {
    const { name } = params;
    try {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("id, name, category, price, stock_quantity, description")
        .ilike("name", `%${name}%`);

      if (error)
        return {
          success: false,
          message: `DB error: ${error.message}`,
          products: [],
        };
      if (!data || data.length === 0) {
        return {
          success: false,
          message: `No product found matching "${name}".`,
          products: [],
        };
      }

      return {
        success: true,
        found: data.length,
        products: data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: `$${p.price}`,
          rawPrice: p.price,
          description: p.description ?? "",
          stock_quantity: p.stock_quantity,
          in_stock: p.stock_quantity > 0,
          availability:
            p.stock_quantity > 0
              ? `In stock (${p.stock_quantity} units available)`
              : "Out of stock",
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message ?? "Unknown error",
        products: [],
      };
    }
  },
});

/**
 * Tool 3 — Add a number of units of a product to the user's cart
 */
export const addToCartTool = tool({
  name: "add_to_cart",
  description:
    "Add a specific number of units of a product to the user's cart. Use the product id from get_all_products or search_product. If the product is already in the cart, the quantity is increased.",
  parameters: AddToCartSchema,
  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return {
        success: false,
        message: "You need to be logged in to add items to the cart.",
      };
    }

    const { productId, quantity } = params;

    try {
      // Verify product and check stock
      const { data: product, error: pErr } = await supabaseAdmin
        .from("products")
        .select("id, name, stock_quantity, price")
        .eq("id", productId)
        .single();

      if (pErr || !product) {
        return {
          success: false,
          message: `Product not found with id: ${productId}`,
        };
      }

      if (product.stock_quantity < quantity) {
        return {
          success: false,
          message: `Not enough stock. Only ${product.stock_quantity} unit(s) of "${product.name}" available.`,
        };
      }

      // Check if already in cart
      const { data: existing } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const newQty = existing.quantity + quantity;
        await supabaseAdmin
          .from("cart_items")
          .update({ quantity: newQty })
          .eq("id", existing.id);
        return {
          success: true,
          message: `Updated "${product.name}" quantity to ${newQty}x in your cart.`,
          product: {
            id: product.id,
            name: product.name,
            quantity: newQty,
            pricePerUnit: product.price,
          },
        };
      }

      await supabaseAdmin
        .from("cart_items")
        .insert({ user_id: userId, product_id: productId, quantity });

      return {
        success: true,
        message: `Added ${quantity}x "${product.name}" to your cart! Subtotal: $${(product.price * quantity).toFixed(2)}.`,
        product: {
          id: product.id,
          name: product.name,
          quantity,
          pricePerUnit: product.price,
          subtotal: product.price * quantity,
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message ?? "Unknown error" };
    }
  },
});

/**
 * Tool 4 — Remove a product entirely from the user's cart
 */
export const removeFromCartTool = tool({
  name: "remove_from_cart",
  description:
    "Remove a product entirely from the user's cart. Use the product id from get_all_products or search_product. This removes all units of that product from the cart.",
  parameters: RemoveFromCartSchema,
  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return {
        success: false,
        message: "You need to be logged in to modify the cart.",
      };
    }

    const { productId } = params;

    try {
      // Verify the product exists in cart first
      const { data: cartItem, error: findErr } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity, products(name)")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (findErr) {
        return { success: false, message: `DB error: ${findErr.message}` };
      }
      if (!cartItem) {
        return { success: false, message: "That product is not in your cart." };
      }

      await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      const productName = (cartItem as any).products?.name ?? "the product";
      return {
        success: true,
        message: `Removed "${productName}" from your cart.`,
      };
    } catch (err: any) {
      return { success: false, message: err.message ?? "Unknown error" };
    }
  },
});
