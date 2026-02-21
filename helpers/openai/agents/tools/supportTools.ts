import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  LoadKBSchema,
  CreateSupportTicketSchema,
} from "../schemas";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Tool 1 — Load all KB articles + categories, filter by query relevance
// ---------------------------------------------------------------------------
export const loadKnowledgeBaseTool = tool({
  name: "load_knowledge_base",
  description:
    "Fetches all active knowledge base categories and articles from the database, then returns the most relevant ones for the user's question. Always call this first when a user asks a support question.",
  parameters: LoadKBSchema,

  async execute(params, _runContext?: RunContext<AgentContext>) {
    const { query } = params;

    const { data: articles, error } = await supabaseAdmin
      .from("kb_articles")
      .select(
        `
        id,
        title,
        description,
        content,
        display_order,
        kb_categories (
          id,
          name,
          slug,
          icon_name
        )
      `,
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return {
        success: false,
        message: `Failed to load knowledge base: ${error.message}`,
        articles: [],
      };
    }

    if (!articles || articles.length === 0) {
      return {
        success: true,
        message:
          "The knowledge base is currently empty. Please let the user know and offer to create a support ticket.",
        articles: [],
      };
    }

    // Relevance scoring
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter((w) => w.length > 2);

    const scored = articles.map((article) => {
      let score = 0;
      const title = article.title.toLowerCase();
      const description = article.description.toLowerCase();
      const content = (article.content ?? "").toLowerCase();

      if (title.includes(queryLower)) score += 20;
      if (description.includes(queryLower)) score += 10;
      if (content.includes(queryLower)) score += 5;

      words.forEach((word) => {
        if (title.includes(word)) score += 6;
        if (description.includes(word)) score += 3;
        if (content.includes(word)) score += 1;
      });

      return { ...article, relevanceScore: score };
    });

    const sorted = scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const results = sorted.slice(0, 10);

    const formatted = results.map((a) => {
      const cat = Array.isArray(a.kb_categories)
        ? a.kb_categories[0]
        : a.kb_categories;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        content: a.content ?? null,
        relevanceScore: a.relevanceScore,
        category: cat
          ? { name: (cat as any).name, slug: (cat as any).slug }
          : null,
      };
    });

    return {
      success: true,
      message: `Loaded ${formatted.length} article(s) from the knowledge base.`,
      articles: formatted,
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 2 — Create a support ticket in the database
// ---------------------------------------------------------------------------
export const createSupportTicketTool = tool({
  name: "create_support_ticket",
  description:
    "Creates a support ticket in the database when the user has a specific issue, complaint, or request that needs to be tracked. Use this when the user explicitly asks to raise/open a ticket, or when the knowledge base cannot resolve their issue.",
  parameters: CreateSupportTicketSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;

    if (!userId) {
      return {
        success: false,
        message:
          "You must be signed in to create a support ticket. Please log in and try again.",
      };
    }

    const { subject, message, priority, referenced_kb_id } = params;

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        message,
        priority,
        status: "open",
        referenced_kb_id:
          referenced_kb_id && referenced_kb_id.trim() !== ""
            ? referenced_kb_id
            : null,
      })
      .select("id, subject, status, priority, created_at")
      .single();

    if (error) {
      return {
        success: false,
        message: `Failed to create support ticket: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "✅ Support ticket created successfully.",
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
      },
      nextSteps: [
        `Your ticket ID is: ${ticket.id}`,
        "Our support team will review your request and get back to you shortly.",
        "You will be notified once there is an update on your ticket.",
      ],
    };
  },
});
