import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { AgentContext, NavSearchSchema } from "../schemas";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Fetches nav_modules and nav_paths from the database, scores them
 * against the user's query, and returns the top matches with full
 * step-by-step instructions for the agent to present.
 */
export const searchNavigationTool = tool({
  name: "search_navigation",
  description:
    "Search the navigation knowledge base (modules and paths) to find how to reach a specific feature or page. Always call this first before answering any navigation question.",
  parameters: NavSearchSchema,

  async execute(params, _runContext?: RunContext<AgentContext>) {
    const { query } = params;

    const { data: paths, error } = await supabaseAdmin
      .from("nav_paths")
      .select(
        `
        id,
        intent_keyword,
        display_label,
        route_path,
        required_permissions,
        steps,
        nav_modules (
          id,
          name,
          base_url,
          description
        )
      `,
      )
      .eq("is_active", true);

    if (error) {
      return {
        success: false,
        message: `Failed to load navigation data: ${error.message}`,
        results: [],
      };
    }

    if (!paths || paths.length === 0) {
      return {
        success: true,
        message:
          "The navigation knowledge base is empty. Let the user know and suggest they contact support.",
        results: [],
      };
    }

    // Relevance scoring
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter((w) => w.length > 2);

    const scored = paths.map((path) => {
      let score = 0;
      const label = path.display_label.toLowerCase();
      const intent = path.intent_keyword.toLowerCase().replace(/_/g, " ");
      const mod = Array.isArray(path.nav_modules)
        ? path.nav_modules[0]
        : (path.nav_modules as any);
      const modName = (mod?.name ?? "").toLowerCase();
      const modDesc = (mod?.description ?? "").toLowerCase();

      if (label.includes(queryLower)) score += 20;
      if (intent.includes(queryLower)) score += 15;
      if (modName.includes(queryLower)) score += 10;
      if (modDesc.includes(queryLower)) score += 5;

      words.forEach((word) => {
        if (label.includes(word)) score += 6;
        if (intent.includes(word)) score += 5;
        if (modName.includes(word)) score += 3;
        if (modDesc.includes(word)) score += 1;
      });

      return { ...path, _score: score, _mod: mod };
    });

    const top = scored
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const results =
      top.length > 0
        ? top
        : paths.slice(0, 5).map((p) => ({
            ...p,
            _score: 0,
            _mod: Array.isArray(p.nav_modules)
              ? p.nav_modules[0]
              : p.nav_modules,
          }));

    return {
      success: true,
      message: `Found ${results.length} navigation path(s) for your query.`,
      results: results.map((r) => ({
        id: r.id,
        displayLabel: r.display_label,
        routePath: r.route_path,
        requiredPermissions: r.required_permissions ?? [],
        steps: r.steps,
        module: r._mod
          ? {
              name: (r._mod as any).name,
              baseUrl: (r._mod as any).base_url,
              description: (r._mod as any).description,
            }
          : null,
      })),
    };
  },
});
