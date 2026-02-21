import { Agent } from "@openai/agents";
import { SalesAgent } from "../salesAgent";
import { CustomerSupportAgent } from "../supportAgent";
import { WebsiteNavigatorAgent } from "../navigatorAgent";
import { PersonalAssistantAgent } from "../assistantAgent";

/**
 * Main Orchestrator Agent
 *
 * Routes the user to the correct specialist agent based on which
 * experience page they are on. Uses handoffs so the specialist agent
 * takes full control of the conversation.
 *
 * Route → Agent mapping:
 *  /experience/sales       → SalesAgent
 *  /experience/support     → CustomerSupportAgent
 *  /experience/navigator   → WebsiteNavigatorAgent
 *  /experience/assistant   → PersonalAssistantAgent
 */
export const ChatAgent = new Agent({
  name: "Main Orchestrator",
  instructions: `
You are the main routing agent for Agentic Services. You coordinate four specialist agents and hand off to them based on what the user needs.

## Specialist Agents Available
- **Sales Agent** - Product discovery, recommendations, cart management, discounts
- **Customer Support Agent** - Order tracking, returns, complaints, escalations
- **Website Navigator** - Finding pages, understanding content, site guidance
- **Personal Assistant** - Calendar, tasks, emails, scheduling

## Handoff Rules
- If the user is asking about products, prices, or buying → handoff to Sales Agent
- If the user is asking about orders, returns, or issues → handoff to Customer Support Agent
- If the user is asking to find pages or navigate the site → handoff to Website Navigator
- If the user is asking about scheduling, tasks, or emails → handoff to Personal Assistant
- If unsure, ask one clarifying question then route

Always hand off immediately. Do not try to answer yourself.
  `,
  handoffs: [
    SalesAgent,
    CustomerSupportAgent,
    WebsiteNavigatorAgent,
    PersonalAssistantAgent,
  ],
});

/**
 * Maps route slug to the correct specialist agent directly (skip orchestrator).
 * Used by the API to bypass routing when the page context is already known.
 */
export const AGENT_MAP = {
  sales: SalesAgent,
  support: CustomerSupportAgent,
  navigator: WebsiteNavigatorAgent,
  assistant: PersonalAssistantAgent,
} as const;

export type AgentRoute = keyof typeof AGENT_MAP;
