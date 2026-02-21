import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  GetAllProductsSchema,
  SearchProductSchema,
  AddToCartSchema,
  RemoveFromCartSchema,
  ClearCartSchema,
  CheckoutSchema,
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

/**
 * Tool 5 — Clear the entire cart or remove a single item
 */
export const clearCartTool = tool({
  name: "clear_cart",
  description:
    "Clear all items from the user's cart at once, or remove a single specific product. Always confirm with the user before clearing the entire cart.",
  parameters: ClearCartSchema,
  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return {
        success: false,
        message: "You need to be logged in to modify the cart.",
      };
    }

    const { mode, product_id } = params;

    try {
      if (mode === "all") {
        const { error } = await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("user_id", userId);

        if (error) {
          return {
            success: false,
            message: `Failed to clear cart: ${error.message}`,
          };
        }

        return { success: true, message: "🗑️ Your cart has been cleared." };
      }

      // mode === "item"
      if (!product_id.trim()) {
        return {
          success: false,
          message: "product_id is required when mode is 'item'.",
        };
      }

      const { data: cartItem, error: findErr } = await supabaseAdmin
        .from("cart_items")
        .select("id, products(name)")
        .eq("user_id", userId)
        .eq("product_id", product_id)
        .maybeSingle();

      if (findErr) {
        return { success: false, message: `DB error: ${findErr.message}` };
      }
      if (!cartItem) {
        return { success: false, message: "That product is not in your cart." };
      }

      const { error: delErr } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", product_id);

      if (delErr) {
        return {
          success: false,
          message: `Failed to remove item: ${delErr.message}`,
        };
      }

      const productName = (cartItem as any).products?.name ?? "the product";
      return {
        success: true,
        message: `🗑️ Removed "${productName}" from your cart.`,
      };
    } catch (err: any) {
      return { success: false, message: err.message ?? "Unknown error" };
    }
  },
});

/**
 * Tool 6 — Checkout: snapshot cart → create invoice + items → clear cart
 */
export const checkoutTool = tool({
  name: "checkout",
  description:
    "Checkout the user's cart: internally fetches the user's actual cart items and their prices from the database, generates a TechStore invoice with a line-item price snapshot, stores the invoice and all items in the database, then clears the cart. Call this directly after user confirmation — do NOT call get_all_products or any other tool first. The tool handles all cart fetching internally.",
  parameters: CheckoutSchema,
  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return {
        success: false,
        message: "You need to be logged in to checkout.",
      };
    }

    try {
      // 1. Fetch cart items with product details
      const { data: cartItems, error: cartErr } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity, product_id, products(id, name, price)")
        .eq("user_id", userId);

      if (cartErr) {
        return {
          success: false,
          message: `Failed to fetch cart: ${cartErr.message}`,
        };
      }
      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          message: "Your cart is empty. Add some products before checking out.",
        };
      }

      // 2. Resolve billing email
      let billingEmail = params.billing_email?.trim() || "";
      if (!billingEmail) {
        const { data: userData } =
          await supabaseAdmin.auth.admin.getUserById(userId);
        billingEmail = userData?.user?.email ?? "";
      }

      // 3. Calculate totals
      const lineItems = cartItems.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.products.name as string,
        unit_price: item.products.price as number,
        quantity: item.quantity as number,
        total_price:
          (item.products.price as number) * (item.quantity as number),
      }));

      const subtotal = lineItems.reduce((sum, i) => sum + i.total_price, 0);
      const taxTotal = 0;
      const totalAmount = subtotal + taxTotal;

      // 4. Create invoice header
      const { data: invoice, error: invErr } = await supabaseAdmin
        .from("invoices")
        .insert({
          user_id: userId,
          status: "paid",
          currency: "USD",
          subtotal,
          tax_total: taxTotal,
          total_amount: totalAmount,
          billing_email: billingEmail || null,
          paid_at: new Date().toISOString(),
        })
        .select(
          "id, invoice_number, status, subtotal, total_amount, created_at",
        )
        .single();

      if (invErr || !invoice) {
        return {
          success: false,
          message: `Failed to create invoice: ${invErr?.message}`,
        };
      }

      // 5. Insert invoice line items
      const { error: itemsErr } = await supabaseAdmin
        .from("invoice_items")
        .insert(lineItems.map((li) => ({ ...li, invoice_id: invoice.id })));

      if (itemsErr) {
        return {
          success: false,
          message: `Failed to save invoice items: ${itemsErr.message}`,
        };
      }

      // 6. Clear the cart
      await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);

      const invoiceNumber = `INV-${String(invoice.invoice_number).padStart(4, "0")}`;

      return {
        success: true,
        message: `✅ Order placed successfully!`,
        invoice: {
          invoice_number: invoiceNumber,
          status: "paid",
          billing_email: billingEmail,
          company: "TechStore",
          items: lineItems.map((li) => ({
            name: li.product_name,
            quantity: li.quantity,
            unit_price: `$${li.unit_price.toFixed(2)}`,
            total: `$${li.total_price.toFixed(2)}`,
          })),
          subtotal: `$${subtotal.toFixed(2)}`,
          tax: `$${taxTotal.toFixed(2)}`,
          total: `$${totalAmount.toFixed(2)}`,
          created_at: invoice.created_at,
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message ?? "Unknown error" };
    }
  },
});
