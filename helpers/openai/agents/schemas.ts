import z from "zod";

/**
 * Agent Context - shared across all agents
 * This is passed through RunContext to access user/workspace info
 */
export interface AgentContext {
  userId: string;
  sessionId?: string;
  [key: string]: any;
}

// ==================== SALES AGENT SCHEMAS ====================

/** Tool 1 — no parameters needed */
export const GetAllProductsSchema = z.object({});

/** Tool 2 — search by name and return stock status */
export const SearchProductSchema = z.object({
  name: z
    .string()
    .describe(
      "Product name or keyword to search for, e.g. 'laptop' or 'mechanical keyboard'",
    ),
});

/** Tool 3 — add N items of a product to cart */
export const AddToCartSchema = z.object({
  productId: z
    .string()
    .describe(
      "UUID of the product — from get_all_products or search_product result",
    ),
  quantity: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Number of units to add"),
});

/** Tool 4 — remove ALL units of a product from cart */
export const RemoveFromCartSchema = z.object({
  productId: z
    .string()
    .describe("UUID of the product to remove entirely from the cart"),
});

/** Tool 5 — clear all items or a single item from the cart */
export const ClearCartSchema = z.object({
  mode: z
    .enum(["all", "item"])
    .describe(
      "'all' clears every item from the cart. 'item' removes one specific product.",
    ),
  product_id: z
    .string()
    .describe(
      "UUID of the product to remove when mode is 'item'. Use empty string '' when mode is 'all'.",
    ),
});

/** Tool 6 — checkout: create an invoice and clear the cart */
export const CheckoutSchema = z.object({
  confirm: z
    .enum(["yes"])
    .describe(
      "Must be 'yes' to confirm the checkout and generate the invoice.",
    ),
  billing_email: z
    .string()
    .describe(
      "Email for the invoice. Use empty string '' to fall back to the user's account email.",
    ),
});

// ==================== CUSTOMER SUPPORT SCHEMAS ====================

/**
 * Tool 1 — load all KB articles & categories, then answer the user
 * No parameters needed; the tool fetches everything from the database.
 */
export const LoadKBSchema = z.object({
  query: z
    .string()
    .describe(
      "The user's question or topic so the tool can return the most relevant articles",
    ),
});

/**
 * Tool 2 — create a support ticket in the database
 * All fields are required (no .optional()) so OpenAI validation passes.
 * Set referenced_kb_id to an empty string "" when there is no related article.
 */
export const CreateSupportTicketSchema = z.object({
  subject: z
    .string()
    .describe("Short subject line summarising the user's issue"),
  message: z
    .string()
    .describe("Full description of the user's issue or request"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .describe("Urgency level of the ticket"),
  referenced_kb_id: z
    .string()
    .describe(
      "UUID of a related KB article, or empty string '' if not applicable",
    ),
});

// ==================== WEBSITE NAVIGATOR SCHEMAS ====================

/**
 * Single tool: search nav_modules + nav_paths from the database.
 * All fields required (no .optional()) to satisfy OpenAI's schema validation.
 */
export const NavSearchSchema = z.object({
  query: z
    .string()
    .describe(
      "The user's intent or question, e.g. 'how do I change my plan' or 'billing settings'",
    ),
});

// ==================== PERSONAL ASSISTANT SCHEMAS ====================

/**
 * All fields are required (no .optional()) to satisfy OpenAI's strict schema validation.
 * Use empty string "" as a sentinel where a field is not applicable.
 */

/** Tool 1 — fetch tasks, filtered by status/priority */
export const FetchTasksSchema = z.object({
  filter: z
    .enum([
      "all",
      "todo",
      "in_progress",
      "completed",
      "archived",
      "high_priority",
      "overdue",
    ])
    .describe(
      "Filter tasks: 'all' returns everything, others filter by status/priority/due date",
    ),
});

/** Tool 2 — create / edit / delete / complete a task */
export const ManageTaskSchema = z.object({
  action: z
    .enum(["create", "edit", "delete", "complete", "archive"])
    .describe("Action to perform on a task"),
  task_id: z
    .string()
    .describe(
      "UUID of the task for edit/delete/complete/archive. Use empty string '' for create.",
    ),
  title: z
    .string()
    .describe(
      "Task title. Required for create. Use empty string '' when not changing on edit.",
    ),
  description: z
    .string()
    .describe("Task description. Use empty string '' if not applicable."),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .describe("Task priority level"),
  due_at: z
    .string()
    .describe(
      "Due date/time in ISO 8601 format, e.g. '2026-02-25T17:00:00Z'. Use empty string '' if none.",
    ),
});

/** Tool 3 — send an email via Gmail SMTP */
export const SendEmailSchema = z.object({
  to: z.string().describe("Recipient email address"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body — plain text or basic HTML"),
});
