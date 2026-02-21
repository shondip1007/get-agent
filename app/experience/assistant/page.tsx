"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
}

function priorityColor(p: string) {
  if (p === "urgent") return "bg-red-500/20 text-red-400";
  if (p === "high") return "bg-orange-500/20 text-orange-400";
  if (p === "medium") return "bg-yellow-500/20 text-yellow-400";
  return "bg-gray-500/20 text-gray-400";
}

function isOverdue(due_at: string | null, status: string) {
  if (!due_at || status === "completed" || status === "archived") return false;
  return new Date(due_at) < new Date();
}

export default function AssistantExperience() {
  type FilterStatus =
    | "all"
    | "pending"
    | "in_progress"
    | "completed"
    | "archived";

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "archived", label: "Archived" },
  ];

  const [showCTA, setShowCTA] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("agent_tasks")
      .select("id, title, description, status, priority, due_at, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTasks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMessageCount = (count: number) => {
    if (count >= 5 && !showCTA) setShowCTA(true);
    fetchTasks();
  };

  const filteredTasks =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "archived" &&
      isOverdue(t.due_at, t.status),
  );

  const countByStatus = (s: FilterStatus) =>
    s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/10 hover:border-white/20 ">
            {/* Left Side */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Agentic Services Logo"
                  width={40}
                  height={40}
                  priority
                  className="object-contain"
                />
              </Link>

              <span className="text-xl font-bold ml-2 tracking-tight">
                <Link href="/" className="text-xl font-bold">
                  Agentic Services
                </Link>
              </span>
            </div>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl font-bold">Personal Assistant</h1>
              <p className="text-xs text-gray-400">
                Your AI Assistant is ready to help manage your day
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {showCTA && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Impressed?</h4>
                <p className="text-sm mb-3">Get a custom agent for your site</p>
                <Link
                  href="/request-demo"
                  className="inline-block bg-white text-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Request Demo
                </Link>
              </div>
              <button
                onClick={() => setShowCTA(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Dashboard Content */}
            <div className="lg:col-span-2 overflow-y-auto space-y-6">
              {/* Tasks */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">📋 Tasks</h2>
                  <div className="flex items-center gap-3">
                    {overdueTasks.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                        {overdueTasks.length} overdue
                      </span>
                    )}
                    <button
                      onClick={fetchTasks}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      title="Refresh tasks"
                    >
                      ↻
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 mb-5 bg-black/30 p-1 rounded-lg overflow-x-auto">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeFilter === f.key
                          ? "bg-orange-500 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          activeFilter === f.key
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-gray-500"
                        }`}
                      >
                        {countByStatus(f.key)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Task List */}
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-black/50 rounded-lg p-4 border border-white/10 animate-pulse h-14"
                      />
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p className="text-4xl mb-3">
                      {activeFilter === "completed"
                        ? "✅"
                        : activeFilter === "archived"
                          ? "🗄️"
                          : "🎉"}
                    </p>
                    <p className="font-medium">
                      {activeFilter === "all"
                        ? "No tasks yet"
                        : `No ${activeFilter.replace("_", " ")} tasks`}
                    </p>
                    {activeFilter === "all" && (
                      <p className="text-sm mt-1">
                        Ask the assistant to create one!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-black/50 rounded-lg p-4 border transition-colors ${
                          task.status === "completed"
                            ? "border-green-500/20 opacity-70"
                            : task.status === "archived"
                              ? "border-white/5 opacity-50"
                              : isOverdue(task.due_at, task.status)
                                ? "border-red-500/40 hover:border-red-500/70"
                                : "border-white/10 hover:border-orange-500/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-semibold truncate ${
                                  task.status === "completed"
                                    ? "line-through text-gray-400"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </h3>
                              {task.status === "in_progress" && (
                                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                  in progress
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              {task.due_at && (
                                <p
                                  className={`text-xs ${
                                    isOverdue(task.due_at, task.status)
                                      ? "text-red-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Due{" "}
                                  {new Date(task.due_at).toLocaleDateString()}
                                  {isOverdue(task.due_at, task.status) &&
                                    " — overdue"}
                                </p>
                              )}
                              {task.completed_at &&
                                task.status === "completed" && (
                                  <p className="text-xs text-green-500/70">
                                    Done{" "}
                                    {new Date(
                                      task.completed_at,
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${priorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-gray-500 text-center">
                  Use the chat to create, edit, complete, or archive tasks.
                </p>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1 h-full min-h-0">
              <ChatInterface
                agentType="assistant"
                agentName="Personal Assistant"
                agentIcon="📅"
                placeholder="How can I help you today?"
                onMessageCountChange={handleMessageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
