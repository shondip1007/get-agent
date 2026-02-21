import { z } from "zod";
import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import { AgentContext } from "./agentsSchemas";

// Database response types (different from creation schemas)
interface Goal {
  goal_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
}

interface Milestone {
  milestone_id: string;
  goal_id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  due_date: string | null;
}

interface Task {
  task_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
}

interface GoalAnalysis {
  goalId: string;
  goalTitle: string;
  totalMilestones: number;
  completedMilestones: number;
  activeMilestones: number;
  avgMilestoneProgress: number;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  summary: string;
  recommendations: string[];
}

// Read goals tool with comprehensive analysis
export const readGoalTool = tool({
  name: "read_goals_with_milestones_and_tasks",
  description:
    "Fetch all goals for the user, then for each goal retrieve associated milestones and tasks. Provides comprehensive analysis including progress, completion status, and actionable recommendations.",
  parameters: z.object({
    status: z
      .enum(["active", "completed", "all"])
      .default("active")
      .describe(
        "Filter goals by status: 'active' (default), 'completed', or 'all'.",
      ),
    includeAnalysis: z
      .boolean()
      .default(true)
      .describe("Whether to include detailed analysis and recommendations"),
  }),

  async execute(params, runContext?: RunContext<AgentContext>) {
    // CRITICAL: Extract context variables
    const { userId, workspaceId, supabaseClient } = runContext?.context || {};

    if (!supabaseClient || !userId || !workspaceId) {
      throw new Error(
        "Missing required context: supabaseClient, userId, or workspaceId.",
      );
    }

    try {
      let goalQuery = supabaseClient
        .from("goals")
        .select("goal_id, title, description, due_date, priority, status")
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId);

      // Apply status filter
      if (params.status !== "all") {
        goalQuery = goalQuery.eq("status", params.status);
      } else {
        goalQuery = goalQuery.in("status", ["active", "completed"]);
      }

      const { data: goalsData, error: goalsError } = await goalQuery
        .order("due_date", { ascending: true, nullsFirst: true })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (goalsError) {
        throw new Error(`Failed to fetch goals: ${goalsError.message}`);
      }

      const goals = (goalsData as Goal[]) || [];

      // STEP 2: For each goal, fetch milestones and tasks
      const goalsWithDetails = await Promise.all(
        goals.map(async (goal) => {
          // Fetch milestones for this goal
          const { data: milestonesData, error: milestonesError } =
            await supabaseClient
              .from("milestones")
              .select(
                "milestone_id, goal_id, title, description, status, progress, due_date",
              )
              .eq("goal_id", goal.goal_id)
              .eq("user_id", userId)
              .order("due_date", { ascending: true, nullsFirst: true })
              .order("created_at", { ascending: false });

          const milestones = (milestonesData as Milestone[]) || [];

          // Fetch all milestone IDs for task filtering
          const milestoneIds = milestones.map((m) => m.milestone_id);

          let tasksData: Task[] = [];
          if (milestoneIds.length > 0) {
            const { data: fetchedTasks, error: tasksError } =
              await supabaseClient
                .from("tasks")
                .select(
                  "task_id, title, description, due_date, priority, status",
                )
                .eq("user_id", userId)
                .eq("workspace_id", workspaceId)
                .in("milestone_id", milestoneIds)
                .order("due_date", { ascending: true, nullsFirst: true })
                .order("priority", { ascending: false })
                .order("created_at", { ascending: false });

            tasksData = (fetchedTasks as Task[]) || [];
          }

          // STEP 3: Generate analysis for this goal
          let analysis: GoalAnalysis | null = null;
          if (params.includeAnalysis) {
            analysis = generateGoalAnalysis(goal, milestones, tasksData);
          }

          return {
            goal,
            milestones,
            tasks: tasksData,
            analysis,
          };
        }),
      );

      // STEP 4: Calculate overall summary
      const overallStats = {
        totalGoals: goals.length,
        totalMilestones: goalsWithDetails.reduce(
          (sum, g) => sum + g.milestones.length,
          0,
        ),
        totalTasks: goalsWithDetails.reduce(
          (sum, g) => sum + g.tasks.length,
          0,
        ),
        completedGoals: goals.filter((g) => g.status === "completed").length,
        completedMilestones: goalsWithDetails.reduce(
          (sum, g) =>
            sum + g.milestones.filter((m) => m.status === "completed").length,
          0,
        ),
        completedTasks: goalsWithDetails.reduce(
          (sum, g) => sum + g.tasks.filter((t) => t.status === "done").length,
          0,
        ),
      };

      const message = `Successfully retrieved ${overallStats.totalGoals} goal(s) with ${overallStats.totalMilestones} milestone(s) and ${overallStats.totalTasks} task(s). Completed: ${overallStats.completedGoals} goals, ${overallStats.completedMilestones} milestones, ${overallStats.completedTasks} tasks.`;

      return {
        success: true,
        queryStatus: params.status,
        stats: overallStats,
        goalsWithDetails,
        message,
      };
    } catch (error) {
      throw error;
    }
  },
});

function generateGoalAnalysis(
  goal: Goal,
  milestones: Milestone[],
  tasks: Task[],
): GoalAnalysis {
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const activeMilestones = milestones.filter(
    (m) => m.status === "active",
  ).length;
  const avgMilestoneProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((sum, m) => sum + (m.progress || 0), 0) /
            milestones.length,
        )
      : 0;

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  const now = new Date();
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === "completed") return false;
    return new Date(t.due_date) < now;
  }).length;

  const highPriorityTasks = tasks.filter((t) => t.priority === "high").length;

  // Generate summary
  const summary = generateSummary(
    goal,
    completedMilestones,
    activeMilestones,
    completedTasks,
    activeTasks,
    overdueTasks,
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    goal,
    milestones,
    tasks,
    overdueTasks,
    highPriorityTasks,
    completedTasks,
  );

  return {
    goalId: goal.goal_id,
    goalTitle: goal.title,
    totalMilestones: milestones.length,
    completedMilestones,
    activeMilestones,
    avgMilestoneProgress,
    totalTasks: tasks.length,
    completedTasks,
    activeTasks,
    overdueTasks,
    highPriorityTasks,
    summary,
    recommendations,
  };
}

function generateSummary(
  goal: Goal,
  completedMilestones: number,
  activeMilestones: number,
  completedTasks: number,
  activeTasks: number,
  overdueTasks: number,
): string {
  const milestoneProgress =
    completedMilestones > 0
      ? `${completedMilestones} of ${
          completedMilestones + activeMilestones
        } milestones complete`
      : "No milestones completed yet";

  const taskProgress =
    completedTasks > 0
      ? `${completedTasks} of ${completedTasks + activeTasks} tasks complete`
      : "No tasks completed yet";

  const overdueWarning =
    overdueTasks > 0 ? ` ⚠️ ${overdueTasks} task(s) overdue.` : "";

  return `Goal: "${goal.title}" | ${milestoneProgress} | ${taskProgress}${overdueWarning}`;
}

function generateRecommendations(
  goal: Goal,
  milestones: Milestone[],
  tasks: Task[],
  overdueTasks: number,
  highPriorityTasks: number,
  completedTasks: number,
): string[] {
  const recommendations: string[] = [];

  // Check for overdue tasks
  if (overdueTasks > 0) {
    recommendations.push(
      `⚠️  Address ${overdueTasks} overdue task(s) immediately to get back on track.`,
    );
  }

  // Check for high priority tasks
  if (highPriorityTasks > 0) {
    recommendations.push(
      `🔴 Focus on ${highPriorityTasks} high-priority task(s) that need immediate attention.`,
    );
  }

  // Check goal completion
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed",
  ).length;

  if (completedMilestones === 0 && totalMilestones > 0) {
    recommendations.push(
      `🚀 Start with the first milestone to build momentum toward this goal.`,
    );
  } else if (completedMilestones > 0 && completedMilestones < totalMilestones) {
    const remainingMilestones = totalMilestones - completedMilestones;
    recommendations.push(
      `✅ Great progress! Continue with the remaining ${remainingMilestones} milestone(s).`,
    );
  }

  // Check task completion rate
  const totalTasks = tasks.length;
  if (totalTasks > 0) {
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    if (completionRate < 25) {
      recommendations.push(
        `📈 Increase task completion rate. Currently at ${completionRate}%.`,
      );
    }
  }

  // Check for milestones without tasks
  const emptyMilestones = milestones.filter(
    (m) => !tasks.some((t) => t.task_id),
  );
  if (emptyMilestones.length > 0) {
    recommendations.push(
      `📝 Break down ${emptyMilestones.length} milestone(s) into smaller actionable tasks.`,
    );
  }

  // If no recommendations, add generic positive message
  if (recommendations.length === 0) {
    recommendations.push(`✨ Keep up the excellent work on "${goal.title}"!`);
  }

  return recommendations;
}
