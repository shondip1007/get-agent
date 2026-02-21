import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  OrderLookupSchema,
  ReturnRequestSchema,
  EscalateIssueSchema,
} from "../schemas";

// Mock order database
const MOCK_ORDERS = [
  {
    orderId: "ORD-2024-001",
    email: "demo@example.com",
    date: "2024-02-15",
    status: "shipped",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-02-22",
    items: [{ name: "Pro Developer Laptop", price: 1299, quantity: 1 }],
    total: 1299,
    shippingMethod: "Standard (5-7 days)",
  },
  {
    orderId: "ORD-2024-002",
    email: "demo@example.com",
    date: "2024-02-10",
    status: "delivered",
    trackingNumber: "TRK987654321",
    deliveredDate: "2024-02-17",
    items: [
      { name: "Wireless Mechanical Keyboard", price: 89, quantity: 1 },
      { name: "Ergonomic Wireless Mouse", price: 59, quantity: 1 },
    ],
    total: 148,
    shippingMethod: "Express (2-3 days)",
  },
  {
    orderId: "ORD-2024-003",
    email: "demo@example.com",
    date: "2024-01-28",
    status: "delivered",
    trackingNumber: "TRK555666777",
    deliveredDate: "2024-02-05",
    items: [{ name: '4K Monitor 27"', price: 449, quantity: 1 }],
    total: 449,
    shippingMethod: "Standard (5-7 days)",
  },
];

/**
 * Tool to lookup order status and tracking information
 */
export const lookupOrderTool = tool({
  name: "lookup_order_status",
  description:
    "Look up order status, tracking information, and delivery estimates. Can search by order ID or email address. Returns detailed order information including items, status, and tracking.",
  parameters: OrderLookupSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { orderId, email, orderType } = params;

    let orders = [...MOCK_ORDERS];

    // Filter by order ID if provided
    if (orderId) {
      orders = orders.filter(
        (o) => o.orderId.toLowerCase() === orderId.toLowerCase(),
      );

      if (orders.length === 0) {
        return {
          success: false,
          message: `Order ID "${orderId}" not found. Please check the order number and try again.`,
          suggestion:
            "Check your email for the correct order number, or provide your email address to see all orders.",
        };
      }
    } else if (email) {
      // Filter by email
      orders = orders.filter(
        (o) => o.email.toLowerCase() === email.toLowerCase(),
      );

      if (orders.length === 0) {
        return {
          success: false,
          message: `No orders found for email "${email}".`,
          suggestion:
            "Double-check the email address or contact support if you believe this is an error.",
        };
      }
    }

    // Apply order type filter
    if (orderType === "recent") {
      orders = orders.slice(0, 1); // Most recent order
    }

    // Format response
    const formattedOrders = orders.map((order) => {
      let statusMessage = "";
      let trackingInfo = "";

      switch (order.status) {
        case "shipped":
          statusMessage = `📦 Order shipped on ${order.date}`;
          trackingInfo = `Tracking: ${order.trackingNumber}\nEstimated delivery: ${order.estimatedDelivery}\nShipping method: ${order.shippingMethod}`;
          break;
        case "delivered":
          statusMessage = `✅ Order delivered on ${order.deliveredDate}`;
          trackingInfo = `Tracking: ${order.trackingNumber}\nDelivered: ${order.deliveredDate}`;
          break;
        case "processing":
          statusMessage = `⏳ Order is being processed`;
          trackingInfo = `Expected to ship within 1-2 business days`;
          break;
      }

      return {
        orderId: order.orderId,
        orderDate: order.date,
        status: order.status,
        statusMessage,
        trackingInfo,
        items: order.items,
        total: order.total,
        canReturn:
          order.status === "delivered" && order.deliveredDate
            ? isWithinReturnWindow(order.deliveredDate)
            : false,
      };
    });

    return {
      success: true,
      message: `Found ${formattedOrders.length} order(s).`,
      orders: formattedOrders,
      trackingLink:
        formattedOrders.length > 0 ? "https://demo-store.com/track" : undefined,
    };
  },
});

/**
 * Tool to process return requests
 */
export const processReturnTool = tool({
  name: "process_return_request",
  description:
    "Process a return request for an order. Validates return eligibility based on return policy (30-day window). Creates return label and provides next steps.",
  parameters: ReturnRequestSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { orderId, productName, reason, description } = params;

    // Find the order
    const order = MOCK_ORDERS.find(
      (o) => o.orderId.toLowerCase() === orderId.toLowerCase(),
    );

    if (!order) {
      return {
        success: false,
        message: `Order ID "${orderId}" not found. Please verify the order number.`,
      };
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return {
        success: false,
        message: `Order ${orderId} has not been delivered yet. Returns can only be processed after delivery.`,
        currentStatus: order.status,
      };
    }

    // Check return window (30 days)
    const isEligible = isWithinReturnWindow(order.deliveredDate!);

    if (!isEligible) {
      return {
        success: false,
        message: `Return window has expired for order ${orderId}. Returns must be initiated within 30 days of delivery.`,
        deliveredDate: order.deliveredDate,
        returnDeadline: getReturnDeadline(order.deliveredDate!),
      };
    }

    // Check if product exists in order
    const product = order.items.find((item) =>
      item.name.toLowerCase().includes(productName.toLowerCase()),
    );

    if (!product) {
      return {
        success: false,
        message: `Product "${productName}" not found in order ${orderId}.`,
        orderItems: order.items.map((i) => i.name),
      };
    }

    // Calculate refund amount
    const restockingFee = reason === "defective" ? 0 : 15;
    const refundAmount = product.price * product.quantity - restockingFee;

    // Generate return authorization
    const returnAuth = `RMA-${Date.now().toString().slice(-8)}`;

    return {
      success: true,
      message: `✅ Return request approved for "${product.name}".`,
      returnAuthorization: returnAuth,
      orderId,
      productName: product.name,
      reason,
      refundAmount: parseFloat(refundAmount.toFixed(2)),
      restockingFee,
      returnLabel: "https://demo-store.com/returns/label/demo123",
      nextSteps: [
        `1. Print the return label from the link above`,
        `2. Pack the item in original packaging (if possible)`,
        `3. Drop off at any shipping location`,
        `4. Refund will be processed within 5-7 business days after we receive the item`,
      ],
      estimatedRefundDate: getEstimatedRefundDate(),
    };
  },
});

/**
 * Tool to escalate issues to human support
 */
export const escalateIssueTool = tool({
  name: "escalate_to_human_agent",
  description:
    "Escalate complex issues to human support agents. Use for frustrated customers, billing disputes, technical issues beyond troubleshooting, or urgent matters requiring special attention.",
  parameters: EscalateIssueSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { issueType, summary, customerDetails } = params;

    // Generate ticket number
    const ticketNumber = `TICKET-${Date.now().toString().slice(-8)}`;

    // Determine priority based on issue type
    const priorityMap: Record<string, string> = {
      urgent: "HIGH",
      complaint: "MEDIUM",
      billing: "MEDIUM",
      technical: "LOW",
    };

    const priority = priorityMap[issueType] || "MEDIUM";

    // Estimated wait time based on priority
    const waitTimeMap: Record<string, string> = {
      HIGH: "1-2 minutes",
      MEDIUM: "3-5 minutes",
      LOW: "5-10 minutes",
    };

    return {
      success: true,
      message: `🎧 Connecting you to a senior support specialist...`,
      ticketNumber,
      issueType,
      priority,
      estimatedWaitTime: waitTimeMap[priority],
      summary,
      nextSteps: [
        "Your issue has been escalated to our senior support team",
        `Ticket number: ${ticketNumber} (save this for reference)`,
        `Estimated wait time: ${waitTimeMap[priority]}`,
        "A specialist will reach out shortly via email or phone",
      ],
      customerDetails,
    };
  },
});

// Helper functions
function isWithinReturnWindow(deliveredDate: string): boolean {
  const delivered = new Date(deliveredDate);
  const now = new Date();
  const daysDifference = Math.floor(
    (now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24),
  );
  return daysDifference <= 30;
}

function getReturnDeadline(deliveredDate: string): string {
  const delivered = new Date(deliveredDate);
  const deadline = new Date(delivered);
  deadline.setDate(deadline.getDate() + 30);
  return deadline.toISOString().split("T")[0];
}

function getEstimatedRefundDate(): string {
  const now = new Date();
  const refundDate = new Date(now);
  refundDate.setDate(refundDate.getDate() + 7);
  return refundDate.toISOString().split("T")[0];
}
