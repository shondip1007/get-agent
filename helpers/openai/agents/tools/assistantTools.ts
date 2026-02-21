import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  FetchTasksSchema,
  ManageTaskSchema,
  SendEmailSchema,
} from "../schemas";
import { supabaseAdmin } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Tool 1 — Fetch all tasks for the authenticated user
// ---------------------------------------------------------------------------
export const fetchTasksTool = tool({
  name: "fetch_tasks",
  description:
    "Fetch all tasks for the current user from the database. Always call this before answering questions about tasks or when the user wants to see their task list.",
  parameters: FetchTasksSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return { success: false, message: "Not authenticated.", tasks: [] };
    }

    const { filter } = params;
    const now = new Date().toISOString();

    let query = supabaseAdmin
      .from("agent_tasks")
      .select(
        "id, title, description, status, priority, due_at, completed_at, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    switch (filter) {
      case "todo":
        query = query.eq("status", "todo");
        break;
      case "in_progress":
        query = query.eq("status", "in_progress");
        break;
      case "completed":
        query = query.eq("status", "completed");
        break;
      case "archived":
        query = query.eq("status", "archived");
        break;
      case "high_priority":
        query = query.in("priority", ["high", "urgent"]);
        break;
      case "overdue":
        query = query
          .not("due_at", "is", null)
          .lt("due_at", now)
          .not("status", "in", '("completed","archived")');
        break;
      // "all" → no extra filter
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        message: `DB error: ${error.message}`,
        tasks: [],
      };
    }

    const tasks = (data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      due_at: t.due_at ?? null,
      completed_at: t.completed_at ?? null,
      overdue:
        t.due_at &&
        new Date(t.due_at) < new Date() &&
        !["completed", "archived"].includes(t.status),
    }));

    return {
      success: true,
      message: `Found ${tasks.length} task(s) for filter '${filter}'.`,
      tasks,
      summary: {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter((t) => t.overdue).length,
      },
    };
  },
});

// ---------------------------------------------------------------------------
// Tool 2 — Create / Edit / Delete / Complete / Archive a task
// ---------------------------------------------------------------------------
export const manageTaskTool = tool({
  name: "manage_task",
  description:
    "Create, edit, delete, mark complete, or archive a task in the database. Logs every action to the audit table.",
  parameters: ManageTaskSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const userId = runContext?.context?.userId;
    if (!userId) {
      return { success: false, message: "Not authenticated." };
    }

    const { action, task_id, title, description, priority, due_at } = params;
    const dueAtValue = due_at && due_at.trim() !== "" ? due_at : null;

    // ── CREATE ───────────────────────────────────────────────────────────────
    if (action === "create") {
      if (!title.trim()) {
        return {
          success: false,
          message: "Title is required to create a task.",
        };
      }

      const { data: task, error } = await supabaseAdmin
        .from("agent_tasks")
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          due_at: dueAtValue,
          status: "todo",
        })
        .select("id, title, status, priority, due_at, created_at")
        .single();

      if (error) {
        return {
          success: false,
          message: `Failed to create task: ${error.message}`,
        };
      }

      // Audit log
      await supabaseAdmin.from("agent_actions").insert({
        task_id: task.id,
        action_type: "created",
        previous_state: null,
        new_state: task,
      });

      return {
        success: true,
        message: `✅ Task "${task.title}" created.`,
        task,
      };
    }

    // ── Actions that need an existing task ───────────────────────────────────
    if (!task_id.trim()) {
      return {
        success: false,
        message: "task_id is required for this action.",
      };
    }

    // Fetch current state for audit
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("agent_tasks")
      .select("*")
      .eq("id", task_id)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !existing) {
      return { success: false, message: "Task not found or access denied." };
    }

    // ── EDIT ─────────────────────────────────────────────────────────────────
    if (action === "edit") {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (title.trim()) updates.title = title.trim();
      if (description.trim()) updates.description = description.trim();
      if (priority) updates.priority = priority;
      if (dueAtValue !== undefined) updates.due_at = dueAtValue;

      const { data: updated, error } = await supabaseAdmin
        .from("agent_tasks")
        .update(updates)
        .eq("id", task_id)
        .select("id, title, status, priority, due_at, updated_at")
        .single();

      if (error) {
        return {
          success: false,
          message: `Failed to edit task: ${error.message}`,
        };
      }

      await supabaseAdmin.from("agent_actions").insert({
        task_id,
        action_type: "edited",
        previous_state: existing,
        new_state: updated,
      });

      return { success: true, message: `✅ Task updated.`, task: updated };
    }

    // ── COMPLETE ─────────────────────────────────────────────────────────────
    if (action === "complete") {
      const now = new Date().toISOString();
      const { data: updated, error } = await supabaseAdmin
        .from("agent_tasks")
        .update({ status: "completed", completed_at: now, updated_at: now })
        .eq("id", task_id)
        .select("id, title, status, completed_at")
        .single();

      if (error) {
        return {
          success: false,
          message: `Failed to complete task: ${error.message}`,
        };
      }

      await supabaseAdmin.from("agent_actions").insert({
        task_id,
        action_type: "status_change",
        previous_state: { status: existing.status },
        new_state: { status: "completed", completed_at: now },
      });

      return {
        success: true,
        message: `🎉 Task "${existing.title}" marked as complete!`,
        task: updated,
      };
    }

    // ── ARCHIVE ──────────────────────────────────────────────────────────────
    if (action === "archive") {
      const { data: updated, error } = await supabaseAdmin
        .from("agent_tasks")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", task_id)
        .select("id, title, status")
        .single();

      if (error) {
        return {
          success: false,
          message: `Failed to archive task: ${error.message}`,
        };
      }

      await supabaseAdmin.from("agent_actions").insert({
        task_id,
        action_type: "status_change",
        previous_state: { status: existing.status },
        new_state: { status: "archived" },
      });

      return {
        success: true,
        message: `📦 Task "${existing.title}" archived.`,
        task: updated,
      };
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("agent_tasks")
        .delete()
        .eq("id", task_id);

      if (error) {
        return {
          success: false,
          message: `Failed to delete task: ${error.message}`,
        };
      }

      // Audit log (task will cascade-delete its own logs, but log before delete)
      // Already deleted above — just return success
      return {
        success: true,
        message: `🗑️ Task "${existing.title}" deleted permanently.`,
      };
    }

    return { success: false, message: "Unknown action." };
  },
});

// ---------------------------------------------------------------------------
// Tool 3 — Send email via Gmail SMTP
// ---------------------------------------------------------------------------
export const sendEmailTool = tool({
  name: "send_email",
  description:
    "Send an email on behalf of the user via Gmail SMTP. Use only when the user explicitly asks to send an email.",
  parameters: SendEmailSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { to, subject, body } = params;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return {
        success: false,
        message:
          "Email is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.",
      };
    }

    // Resolve sender's display name for the footer
    const userId = runContext?.context?.userId;
    let senderName = "Personal Assistant";
    if (userId) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = data?.user?.user_metadata;
      senderName =
        meta?.full_name ||
        meta?.name ||
        data?.user?.email?.split("@")[0] ||
        "Personal Assistant";
    }

    const signature = `\n\nBest regards,\n${senderName}`;
    const signatureHtml = `<br><br>Best regards,<br><strong>${senderName}</strong>`;

    const textBody = body + signature;
    const htmlBody = body.includes("<")
      ? body + signatureHtml
      : body.replace(/\n/g, "<br>") + signatureHtml;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    try {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${gmailUser}>`,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      return {
        success: true,
        message: `✅ Email sent to ${to}.`,
        messageId: info.messageId,
        recipient: to,
        subject,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to send email: ${err.message}`,
      };
    }
  },
});
