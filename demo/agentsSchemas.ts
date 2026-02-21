import z from "zod";

export interface AgentContext {
  userId: string;
  workspaceId: string;
  supabaseClient: any;
}

export const GoalSchema = z.object({
  title: z.string().describe("The title of the goal"),
  description: z
    .string()
    .nullable()
    .default(null)
    .describe("Detailed goal description (optional)"),
  due_date: z
    .string()
    .nullable()
    .default(null)
    .describe("Goal due date in ISO format YYYY-MM-DD (optional)"),
  priority: z
    .enum(["low", "medium", "high"])
    .default("medium")
    .describe("Goal priority"),
});

export const MilestoneSchema = z.object({
  goal_id: z
    .string()
    .describe("Parent goal ID - REQUIRED to link milestone to a goal"),
  title: z.string().describe("Milestone title"),
  description: z
    .string()
    .nullable()
    .default(null)
    .describe("Milestone description (optional)"),
  due_date: z
    .string()
    .nullable()
    .default(null)
    .describe("Milestone due date in ISO format YYYY-MM-DD (optional)"),
});

export const TaskSchema = z.object({
  milestone_id: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "Parent milestone ID to link task to a milestone. Set to null for standalone tasks.",
    ),
  title: z.string().describe("The short title of the task"),
  description: z
    .string()
    .nullable()
    .default(null)
    .describe("Detailed task description (optional)"),
  due_date: z
    .string()
    .nullable()
    .default(null)
    .describe("Due date in ISO format YYYY-MM-DD (optional)"),
  priority: z
    .enum(["low", "medium", "high"])
    .default("medium")
    .describe("Task priority"),
});
