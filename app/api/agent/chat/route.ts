import { NextRequest, NextResponse } from "next/server";
import { run } from "@openai/agents";
import {
  AGENT_MAP,
  ChatAgent,
  type AgentRoute,
} from "@/helpers/openai/agents/Agent/ChatAgent";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Map frontend agentType → DB agent_type enum value
const AGENT_TYPE_DB: Record<string, string> = {
  sales: "sales_agent",
  support: "customer_support",
  navigator: "website_navigator",
  assistant: "personal_assistant",
};

// Map frontend agentType → display name
const AGENT_NAME_DISPLAY: Record<string, string> = {
  sales: "Sales Agent",
  support: "Customer Support Agent",
  navigator: "Website Navigator",
  assistant: "Personal Assistant",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      agentType,
      sessionId: incomingSessionId,
    } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      agentType: AgentRoute;
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages is required" },
        { status: 400 },
      );
    }

    // ── 1. Authenticate user from Bearer token (optional — graceful fallback) ──
    let authUserId: string | null = null;
    let dbUserId: string | null = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const {
        data: { user },
        error: authErr,
      } = await supabaseAdmin.auth.getUser(token);
      if (!authErr && user) {
        authUserId = user.id;

        // Upsert into the custom users table
        const { data: dbUser } = await supabaseAdmin
          .from("users")
          .upsert(
            {
              auth_user_id: user.id,
              email: user.email ?? null,
              is_anonymous: false,
              user_status: "registered",
              last_active_at: new Date().toISOString(),
            },
            { onConflict: "auth_user_id", ignoreDuplicates: false },
          )
          .select("id")
          .single();
        dbUserId = dbUser?.id ?? null;
      }
    }

    // ── 2. Create or reuse chat session (only for authenticated users) ────────
    let activeSessionId: string | null = incomingSessionId ?? null;

    if (dbUserId) {
      if (!activeSessionId) {
        const { data: session, error: sessErr } = await supabaseAdmin
          .from("chat_sessions")
          .insert({
            user_id: dbUserId,
            agent_type: AGENT_TYPE_DB[agentType] ?? "sales_agent",
            agent_name: AGENT_NAME_DISPLAY[agentType] ?? agentType,
            is_active: true,
          })
          .select("id")
          .single();

        if (!sessErr && session) {
          activeSessionId = session.id;
        }
      }

      // ── 3. Persist the incoming user message ────────────────────────────────
      const userMessage = messages[messages.length - 1];
      if (activeSessionId) {
        // Count existing messages for sequence_number
        const { count: existingCount } = await supabaseAdmin
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("session_id", activeSessionId);

        await supabaseAdmin.from("messages").insert({
          session_id: activeSessionId,
          user_id: dbUserId,
          role: "user",
          content: userMessage.content,
          sequence_number: (existingCount ?? 0) + 1,
        });
      }
    }

    // ── 4. Build conversation input for the agent ─────────────────────────────
    const agent = AGENT_MAP[agentType] ?? ChatAgent;

    const lastUserMessage = messages[messages.length - 1].content;
    let input: string;
    if (messages.length <= 1) {
      input = lastUserMessage;
    } else {
      const history = messages
        .slice(0, -1)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      input = `Previous conversation:\n${history}\n\nUser: ${lastUserMessage}`;
    }

    // ── 5. Run the agent (pass userId so tools can interact with the DB) ──────
    const result = await run(agent, input, {
      context: {
        userId: authUserId, // auth.users.id — used by tools for cart queries
        sessionId: activeSessionId,
      },
    });

    const responseText =
      typeof result.finalOutput === "string"
        ? result.finalOutput
        : JSON.stringify(result.finalOutput);

    // ── 6. Persist the assistant response ────────────────────────────────────
    if (dbUserId && activeSessionId) {
      const { count: existingCount } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("session_id", activeSessionId);

      await supabaseAdmin.from("messages").insert({
        session_id: activeSessionId,
        user_id: dbUserId,
        role: "assistant",
        content: responseText,
        sequence_number: (existingCount ?? 0) + 1,
      });

      // Update session metadata
      await supabaseAdmin
        .from("chat_sessions")
        .update({
          last_message_at: new Date().toISOString(),
          last_user_message: lastUserMessage,
          last_ai_message: responseText,
        })
        .eq("id", activeSessionId);
    }

    return NextResponse.json({
      response: responseText,
      sessionId: activeSessionId,
    });
  } catch (err: any) {
    console.error("[/api/agent/chat] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
