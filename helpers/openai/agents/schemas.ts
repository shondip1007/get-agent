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

// ==================== CUSTOMER SUPPORT SCHEMAS ====================

export const OrderLookupSchema = z.object({
  orderId: z.string().optional().describe("Order ID if customer provides it"),
  email: z.string().optional().describe("Customer email to lookup orders"),
  orderType: z
    .enum(["recent", "specific", "all"])
    .default("recent")
    .describe("Type of order lookup"),
});

export const ReturnRequestSchema = z.object({
  orderId: z.string().describe("Order ID for the return request"),
  productName: z.string().describe("Name of product to return"),
  reason: z
    .enum(["defective", "wrong_item", "not_needed", "other"])
    .describe("Reason for return"),
  description: z
    .string()
    .optional()
    .describe("Additional details about the return"),
});

export const EscalateIssueSchema = z.object({
  issueType: z
    .enum(["technical", "billing", "complaint", "urgent"])
    .describe("Type of issue requiring escalation"),
  summary: z.string().describe("Brief summary of the issue"),
  customerDetails: z
    .object({
      orderId: z.string().optional(),
      email: z.string().optional(),
    })
    .optional()
    .describe("Customer information for escalation"),
});

// ==================== WEBSITE NAVIGATOR SCHEMAS ====================

export const SearchPagesSchema = z.object({
  query: z
    .string()
    .describe(
      "Search query to find relevant pages (e.g., 'API documentation', 'pricing')",
    ),
  section: z
    .enum(["all", "docs", "products", "support", "blog", "about"])
    .default("all")
    .describe("Limit search to specific section"),
  maxResults: z
    .number()
    .default(3)
    .describe("Maximum number of results to return"),
});

export const GetPageContentSchema = z.object({
  pagePath: z
    .string()
    .describe(
      "Page path/URL to retrieve content from (e.g., '/docs/quickstart')",
    ),
  summarize: z
    .boolean()
    .default(true)
    .describe("Whether to return a summary or full content"),
});

export const FindRelatedPagesSchema = z.object({
  currentPage: z.string().describe("Current page user is viewing"),
  topic: z
    .string()
    .optional()
    .describe("Specific topic to find related pages for"),
});

// ==================== PERSONAL ASSISTANT SCHEMAS ====================

export const ScheduleMeetingSchema = z.object({
  title: z.string().describe("Meeting title/subject"),
  attendees: z.array(z.string()).describe("List of attendee names or emails"),
  duration: z.number().default(60).describe("Meeting duration in minutes"),
  preferredDate: z
    .string()
    .optional()
    .describe("Preferred date in YYYY-MM-DD format"),
  preferredTime: z
    .string()
    .optional()
    .describe("Preferred time in HH:MM format"),
  description: z.string().optional().describe("Meeting description or agenda"),
});

export const DraftEmailSchema = z.object({
  recipient: z.string().describe("Email recipient name or email address"),
  purpose: z
    .enum([
      "meeting_request",
      "follow_up",
      "status_update",
      "thank_you",
      "decline",
      "general",
    ])
    .describe("Purpose/type of email"),
  context: z.string().describe("Context or key points to include in email"),
  tone: z
    .enum(["formal", "professional", "casual", "friendly"])
    .default("professional")
    .describe("Tone of the email"),
});

export const ManageTasksSchema = z.object({
  action: z
    .enum(["add", "list", "prioritize", "complete"])
    .describe("Action to perform on tasks"),
  taskTitle: z.string().optional().describe("Task title (for add action)"),
  taskDescription: z.string().optional().describe("Task description"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .describe("Task priority"),
  dueDate: z.string().optional().describe("Due date in YYYY-MM-DD format"),
  filter: z
    .enum(["all", "today", "week", "overdue", "high_priority"])
    .optional()
    .default("all")
    .describe("Filter for listing tasks"),
});

export const CheckCalendarSchema = z.object({
  date: z
    .string()
    .optional()
    .describe(
      "Specific date to check in YYYY-MM-DD format. If not provided, checks today",
    ),
  range: z
    .enum(["day", "week", "month"])
    .default("day")
    .describe("Time range to check"),
  includeAvailability: z
    .boolean()
    .default(true)
    .describe("Whether to include available time slots"),
});
