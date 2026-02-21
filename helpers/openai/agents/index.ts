/**
 * OpenAI Agents - Centralized Export
 *
 * This file exports all specialized AI agents configured using the
 * OpenAI Agents JS SDK. Each agent has dedicated tools and instructions
 * optimized for specific business use cases.
 */

// Export agent instances
export { SalesAgent } from "./salesAgent";
export { CustomerSupportAgent } from "./supportAgent";
export { WebsiteNavigatorAgent } from "./navigatorAgent";
export { PersonalAssistantAgent } from "./assistantAgent";

// Export tools (for advanced use cases)
export * from "./tools/salesTools";
export * from "./tools/supportTools";
export * from "./tools/navigatorTools";
export * from "./tools/assistantTools";

// Export schemas
export * from "./schemas";

/**
 * Agent Registry - Map agent types to names
 */
export const AGENT_TYPES = {
  SALES: "sales",
  SUPPORT: "support",
  NAVIGATOR: "navigator",
  ASSISTANT: "assistant",
} as const;

export type AgentType = (typeof AGENT_TYPES)[keyof typeof AGENT_TYPES];

/**
 * Get agent instance by type
 */
export function getAgentByType(type: AgentType) {
  // Dynamic imports in case you need lazy loading
  switch (type) {
    case AGENT_TYPES.SALES:
      return import("./salesAgent").then((m) => m.SalesAgent);
    case AGENT_TYPES.SUPPORT:
      return import("./supportAgent").then((m) => m.CustomerSupportAgent);
    case AGENT_TYPES.NAVIGATOR:
      return import("./navigatorAgent").then((m) => m.WebsiteNavigatorAgent);
    case AGENT_TYPES.ASSISTANT:
      return import("./assistantAgent").then((m) => m.PersonalAssistantAgent);
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}

/**
 * Agent metadata for UI purposes
 */
export const AGENT_METADATA = {
  [AGENT_TYPES.SALES]: {
    name: "Sales Agent",
    description: "E-commerce product expert for recommendations and purchases",
    icon: "🛍️",
    route: "/experience/sales",
  },
  [AGENT_TYPES.SUPPORT]: {
    name: "Customer Support Agent",
    description:
      "Help desk specialist for orders, returns, and troubleshooting",
    icon: "🎧",
    route: "/experience/support",
  },
  [AGENT_TYPES.NAVIGATOR]: {
    name: "Website Navigator",
    description: "Site guide for finding pages and understanding content",
    icon: "🧭",
    route: "/experience/navigator",
  },
  [AGENT_TYPES.ASSISTANT]: {
    name: "Personal Assistant",
    description:
      "Productivity expert for scheduling, tasks, and communications",
    icon: "📅",
    route: "/experience/assistant",
  },
} as const;
