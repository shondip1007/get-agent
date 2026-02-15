"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";

export default function AssistantExperience() {
  const [showCTA, setShowCTA] = useState(false);

  const todayTasks = [
    {
      id: 1,
      title: "Review Q4 budget proposal",
      priority: "High",
      completed: false,
    },
    { id: 2, title: "Team standup meeting", priority: "High", completed: true },
    {
      id: 3,
      title: "Update project documentation",
      priority: "Medium",
      completed: false,
    },
    {
      id: 4,
      title: "Reply to client emails",
      priority: "Medium",
      completed: false,
    },
    {
      id: 5,
      title: "Schedule dentist appointment",
      priority: "Low",
      completed: false,
    },
  ];

  const upcomingMeetings = [
    { id: 1, title: "Product Strategy Meeting", time: "2:00 PM", attendees: 5 },
    { id: 2, title: "1-on-1 with Sarah", time: "3:30 PM", attendees: 2 },
    { id: 3, title: "Client Demo", time: "Tomorrow 10:00 AM", attendees: 8 },
  ];

  const handleMessageCount = (count: number) => {
    if (count >= 5 && !showCTA) {
      setShowCTA(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-xl font-bold ml-2">Agentic Services</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Experience Center: Personal Assistant
            </span>
            <Link
              href="/"
              className="text-sm hover:text-orange-500 transition-colors"
            >
              ← Back
            </Link>
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

      <div className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Personal Dashboard</h1>
            <p className="text-gray-400">
              Your AI Assistant is ready to help manage your day
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Dashboard Content */}
            <div className="lg:col-span-2 overflow-y-auto space-y-6">
              {/* Calendar */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">📅 Today's Schedule</h2>

                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {meeting.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {meeting.time} • {meeting.attendees} attendees
                          </p>
                        </div>
                        <button className="bg-orange-500/20 hover:bg-orange-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors">
                  + Schedule New Meeting
                </button>
              </div>

              {/* Tasks */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">✅ Today's Tasks</h2>

                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="w-5 h-5 rounded border-white/20"
                        />
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-500/20 text-red-400"
                              : task.priority === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors">
                  + Add New Task
                </button>
              </div>

              {/* Email Drafts */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">✉️ Draft Emails</h2>

                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                    <h3 className="font-semibold mb-2">
                      Follow-up with Client
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Draft created 2 hours ago
                    </p>
                    <div className="flex gap-2">
                      <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Review & Send
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left">
                    📧 Check Inbox
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left">
                    📊 View Analytics
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left">
                    📝 Create Note
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left">
                    🔔 Set Reminder
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
              <ChatInterface
                agentName="Personal Assistant"
                agentIcon="📅"
                systemPrompt="You are a helpful personal assistant. Help users manage their schedule, tasks, and communications. Offer to schedule meetings, prioritize tasks, and draft emails."
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
