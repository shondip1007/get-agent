import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { AgentContext, GoalSchema } from "./agentsSchemas";

export const createGoalTool = tool({
  name: "create_new_goal_in_db",
  description:
    "Creates and inserts a new, high-level goal for the current user in the workspace.",
  parameters: GoalSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { userId, workspaceId, supabaseClient } = runContext?.context || {};

    if (!supabaseClient || !userId || !workspaceId) {
      throw new Error(
        "Missing required context: supabaseClient, userId, or workspaceId.",
      );
    }

    const newGoal = {
      user_id: userId,
      workspace_id: workspaceId,
      title: params.title,
      description: params.description ?? null,
      due_date: params.due_date ?? null,
      priority: params.priority,
      status: "active", // Goals start as 'active'
    };

    const { data, error } = await supabaseClient
      .from("goals") // Assuming your table is named 'goals'
      .insert([newGoal])
      .select("goal_id, title, due_date, priority");

    if (error) {
      throw new Error(`Failed to add new goal: ${error.message}`);
    }

    const addedGoal = data?.[0];

    return {
      success: true,
      goalId: addedGoal.goal_id,
      title: addedGoal.title,
      message: `Successfully created new Goal: "${addedGoal.title}".`,
    };
  },
});
