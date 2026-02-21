import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  ScheduleMeetingSchema,
  DraftEmailSchema,
  ManageTasksSchema,
  CheckCalendarSchema,
} from "../schemas";

// Mock calendar data
const CALENDAR_EVENTS = [
  { day: "Monday", time: "09:00", title: "Team Standup", duration: 30 },
  { day: "Monday", time: "14:00", title: "Client Call", duration: 60 },
  { day: "Tuesday", time: "10:00", title: "Product Review", duration: 90 },
  {
    day: "Wednesday",
    time: "11:00",
    title: "1-on-1 with Manager",
    duration: 60,
  },
  {
    day: "Thursday",
    time: "09:00",
    title: "Workshop",
    duration: 480,
    allDay: true,
  },
  { day: "Friday", time: "09:00", title: "Weekly Review", duration: 60 },
];

// Mock tasks
const MOCK_TASKS = [
  {
    id: "1",
    title: "Complete quarterly report",
    priority: "urgent",
    dueDate: "2024-02-23",
    status: "in_progress",
  },
  {
    id: "2",
    title: "Review new feature designs",
    priority: "high",
    dueDate: "2024-02-25",
    status: "todo",
  },
  {
    id: "3",
    title: "Team lunch scheduling",
    priority: "medium",
    dueDate: "2024-02-28",
    status: "todo",
  },
  {
    id: "4",
    title: "Email cleanup",
    priority: "low",
    dueDate: null,
    status: "todo",
  },
  {
    id: "5",
    title: "Prepare Q1 presentation",
    priority: "urgent",
    dueDate: "2024-02-22",
    status: "todo",
  },
  {
    id: "6",
    title: "Read industry articles",
    priority: "low",
    dueDate: "2024-03-01",
    status: "todo",
  },
  {
    id: "7",
    title: "Book travel for conference",
    priority: "high",
    dueDate: "2024-02-26",
    status: "todo",
  },
];

/**
 * Tool to schedule meetings
 */
export const scheduleMeetingTool = tool({
  name: "schedule_meeting",
  description:
    "Schedule a meeting by finding available time slots in the calendar. Returns proposed times based on calendar availability. In demo mode, simulates scheduling.",
  parameters: ScheduleMeetingSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const {
      title,
      attendees,
      duration,
      preferredDate,
      preferredTime,
      description,
    } = params;

    // Check calendar availability
    const availableSlots = findAvailableSlots(preferredDate, duration);

    if (availableSlots.length === 0) {
      return {
        success: false,
        message:
          "No available slots found for the requested time. Here are alternative times:",
        alternativeSlots: [
          { date: "2024-02-27", time: "14:00", duration },
          { date: "2024-02-28", time: "10:00", duration },
          { date: "2024-02-29", time: "15:00", duration },
        ],
      };
    }

    // Select best slot (prefer user's choice if available, otherwise first available)
    let selectedSlot = availableSlots[0];
    if (preferredTime) {
      const preferredSlot = availableSlots.find(
        (s) => s.time === preferredTime,
      );
      if (preferredSlot) {
        selectedSlot = preferredSlot;
      }
    }

    // Generate meeting ID
    const meetingId = `MTG-${Date.now().toString().slice(-8)}`;

    return {
      success: true,
      message: `✅ Meeting "${title}" scheduled successfully!`,
      meeting: {
        id: meetingId,
        title,
        attendees,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration,
        description: description || "No description provided",
      },
      calendarInvite: {
        sent: true,
        recipients: attendees,
      },
      reminder: {
        set: true,
        time: "15 minutes before",
      },
      nextSteps: [
        "Calendar invitation sent to all attendees",
        "Reminder set for 15 minutes before the meeting",
        "Add meeting agenda in calendar if needed",
      ],
    };
  },
});

/**
 * Tool to draft emails
 */
export const draftEmailTool = tool({
  name: "draft_email",
  description:
    "Draft a professional email based on purpose and context. Returns a complete email with subject line, greeting, body, and closing. Can adjust tone from formal to casual.",
  parameters: DraftEmailSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { recipient, purpose, context, tone } = params;

    // Generate email based on purpose
    const email = generateEmail(recipient, purpose, context, tone);

    return {
      success: true,
      message: "Email draft created successfully. Review and edit as needed.",
      email,
      suggestions: [
        "Review the email for accuracy and tone",
        "Add any specific details or attachments",
        "Consider adding a meeting link if scheduling a call",
      ],
    };
  },
});

/**
 * Tool to manage tasks
 */
export const manageTasksTool = tool({
  name: "manage_tasks",
  description:
    "Add, list, prioritize, or complete tasks. Supports filtering by priority, due date, and status. Returns task list with priority indicators and due dates.",
  parameters: ManageTasksSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { action, taskTitle, taskDescription, priority, dueDate, filter } =
      params;

    switch (action) {
      case "add":
        if (!taskTitle) {
          return {
            success: false,
            message: "Task title is required to add a task.",
          };
        }

        const newTask = {
          id: `TASK-${Date.now().toString().slice(-8)}`,
          title: taskTitle,
          description: taskDescription || null,
          priority: priority || "medium",
          dueDate: dueDate || null,
          status: "todo",
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          message: `✅ Task "${taskTitle}" added successfully!`,
          task: newTask,
        };

      case "list":
        const filteredTasks = filterTasks(MOCK_TASKS, filter);
        const categorizedTasks = categorizeTasks(filteredTasks);

        return {
          success: true,
          message: `Found ${filteredTasks.length} task(s).`,
          tasks: filteredTasks,
          categorized: categorizedTasks,
          summary: {
            total: filteredTasks.length,
            urgent: filteredTasks.filter((t) => t.priority === "urgent").length,
            high: filteredTasks.filter((t) => t.priority === "high").length,
            overdue: filteredTasks.filter((t) => isOverdue(t.dueDate)).length,
          },
        };

      case "prioritize":
        const prioritized = MOCK_TASKS.sort((a, b) => {
          const priorityOrder: Record<string, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return {
          success: true,
          message:
            "Tasks prioritized. Focus on urgent and high-priority items first.",
          prioritizedTasks: prioritized.slice(0, 5),
          recommendations: [
            `🔴 ${prioritized.filter((t) => t.priority === "urgent").length} urgent task(s) need immediate attention`,
            `🟡 ${prioritized.filter((t) => t.priority === "high").length} high-priority task(s) should be completed this week`,
            "Consider delegating or postponing low-priority tasks",
          ],
        };

      case "complete":
        if (!taskTitle) {
          return {
            success: false,
            message: "Task title is required to complete a task.",
          };
        }

        return {
          success: true,
          message: `✅ Task "${taskTitle}" marked as complete!`,
          completedTask: {
            title: taskTitle,
            completedAt: new Date().toISOString(),
          },
          celebration: "Great work! Keep up the momentum! 🎉",
        };

      default:
        return {
          success: false,
          message: "Invalid action. Use: add, list, prioritize, or complete.",
        };
    }
  },
});

/**
 * Tool to check calendar
 */
export const checkCalendarTool = tool({
  name: "check_calendar",
  description:
    "Check calendar for meetings and availability. Can view daily, weekly, or monthly schedules. Returns meetings with times and shows open time slots.",
  parameters: CheckCalendarSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { date, range, includeAvailability } = params;

    const targetDate = date || new Date().toISOString().split("T")[0];
    const dayOfWeek = getDayOfWeek(targetDate);

    // Filter events based on range
    let events = CALENDAR_EVENTS;
    if (range === "day") {
      events = events.filter((e) => e.day === dayOfWeek);
    } else if (range === "week") {
      // Show all events for the week
      events = CALENDAR_EVENTS;
    }

    // Calculate availability
    const availability = includeAvailability
      ? calculateAvailability(events)
      : null;

    return {
      success: true,
      message: `Calendar for ${range === "day" ? dayOfWeek : "this week"}`,
      date: targetDate,
      events: events.map((e) => ({
        day: e.day,
        time: e.time,
        title: e.title,
        duration: `${e.duration} min`,
        allDay: e.allDay || false,
      })),
      availability,
      summary: {
        totalMeetings: events.length,
        totalHours: Math.round(
          events.reduce((sum, e) => sum + e.duration, 0) / 60,
        ),
        busiestDay: findBusiestDay(CALENDAR_EVENTS),
      },
    };
  },
});

// Helper functions
function findAvailableSlots(preferredDate?: string, duration: number = 60) {
  // Simulate finding available slots
  const baseDate = preferredDate || "2024-02-27";
  return [
    { date: baseDate, time: "14:00", duration },
    { date: baseDate, time: "15:30", duration },
    { date: baseDate, time: "16:00", duration },
  ];
}

function generateEmail(
  recipient: string,
  purpose: string,
  context: string,
  tone: string,
) {
  const templates: Record<string, any> = {
    meeting_request: {
      subject: `Meeting Request: Discussion on ${context.split(" ").slice(0, 3).join(" ")}`,
      body: `Hi ${recipient},\n\nI hope this message finds you well. I'd like to schedule a meeting to discuss ${context}.\n\nWould you be available for a 30-minute call this week? Please let me know your preferred time, and I'll send a calendar invitation.\n\nLooking forward to connecting.\n\nBest regards`,
    },
    follow_up: {
      subject: `Following Up: ${context.split(" ").slice(0, 3).join(" ")}`,
      body: `Hi ${recipient},\n\nI wanted to follow up on ${context}.\n\nPlease let me know if you need any additional information from my end, or if there's anything I can help clarify.\n\nThank you for your time.\n\nBest regards`,
    },
    status_update: {
      subject: `Status Update: ${context.split(" ").slice(0, 3).join(" ")}`,
      body: `Hi ${recipient},\n\nI wanted to provide you with a quick update on ${context}.\n\nEverything is on track, and I'll keep you posted on any significant developments. Please don't hesitate to reach out if you have any questions.\n\nBest regards`,
    },
    thank_you: {
      subject: "Thank You",
      body: `Hi ${recipient},\n\nThank you for ${context}. I really appreciate your time and insights.\n\nLooking forward to staying in touch.\n\nBest regards`,
    },
  };

  const template = templates[purpose] || templates.follow_up;

  return {
    to: recipient,
    subject: template.subject,
    body: template.body,
    tone,
    generatedAt: new Date().toISOString(),
  };
}

function filterTasks(tasks: any[], filter?: string) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  switch (filter) {
    case "today":
      return tasks.filter((t) => t.dueDate === today);
    case "week":
      return tasks.filter((t) => t.dueDate && t.dueDate <= weekFromNow);
    case "overdue":
      return tasks.filter((t) => isOverdue(t.dueDate));
    case "high_priority":
      return tasks.filter(
        (t) => t.priority === "urgent" || t.priority === "high",
      );
    default:
      return tasks;
  }
}

function categorizeTasks(tasks: any[]) {
  return {
    urgent: tasks.filter((t) => t.priority === "urgent"),
    high: tasks.filter((t) => t.priority === "high"),
    medium: tasks.filter((t) => t.priority === "medium"),
    low: tasks.filter((t) => t.priority === "low"),
  };
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
}

function getDayOfWeek(date: string): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(date).getDay()];
}

function calculateAvailability(events: any[]) {
  const workHours = 8; // 9 AM to 5 PM
  const totalWorkMinutes = workHours * 60;
  const bookedMinutes = events.reduce((sum, e) => sum + e.duration, 0);
  const availableMinutes = totalWorkMinutes - bookedMinutes;

  return {
    totalHours: workHours,
    bookedHours: Math.round((bookedMinutes / 60) * 10) / 10,
    availableHours: Math.round((availableMinutes / 60) * 10) / 10,
    utilizationPercent: Math.round((bookedMinutes / totalWorkMinutes) * 100),
  };
}

function findBusiestDay(events: any[]): string {
  const dayCounts: Record<string, number> = {};
  events.forEach((e) => {
    dayCounts[e.day] = (dayCounts[e.day] || 0) + 1;
  });

  let busiestDay = "Monday";
  let maxCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      busiestDay = day;
    }
  });

  return busiestDay;
}
