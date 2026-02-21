"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";

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
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
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
