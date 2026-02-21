"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  message: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function SupportExperience() {
  const [showCTA, setShowCTA] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("support_tickets")
      .select("id, subject, status, priority, created_at, message")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleMessageCount = (count: number) => {
    if (count >= 5 && !showCTA) setShowCTA(true);
    // Re-fetch tickets after each agent reply — a ticket may have just been created
    fetchTickets();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-7xl">
          <div
            className="
      flex items-center justify-between
      px-8 py-4
      rounded-2xl
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      shadow-[0_8px_30px_rgba(0,0,0,0.3)]
      transition-all duration-300
      hover:bg-white/10
      hover:border-white/20
    "
          >
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
              <h1 className="text-xl font-bold">Support</h1>
              <p className="text-xs text-gray-400">
                Get instant help from our AI Support Agent
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
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Impressed?</h4>
                <p className="text-sm mb-3">Get a custom agent for your site</p>
                <Link
                  href="/request-demo"
                  className="inline-block bg-white text-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
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
            {/* Support Dashboard */}
            <div className="lg:col-span-2 overflow-y-auto space-y-6">
              {/* Tickets */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-md font-bold">Your Support Tickets</h2>
                  <button
                    onClick={fetchTickets}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    ↻ Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="bg-black/30 rounded-lg p-4 border border-white/10 animate-pulse"
                      >
                        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <p className="text-red-400 text-sm">{error}</p>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p className="text-3xl mb-3">🎫</p>
                    <p className="text-sm">No tickets yet.</p>
                    <p className="text-xs mt-1">
                      Chat with the support agent to raise an issue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => {
                      const statusKey = ticket.status; // e.g. "open", "in_progress", "resolved", "closed"
                      const statusLabel =
                        statusKey === "in_progress"
                          ? "In Progress"
                          : statusKey.charAt(0).toUpperCase() +
                            statusKey.slice(1);
                      const priorityLabel =
                        ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1);

                      return (
                        <div
                          key={ticket.id}
                          className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <div className="min-w-0">
                              <span className="text-xs text-gray-500 font-mono truncate block">
                                {ticket.id.slice(0, 8).toUpperCase()}
                              </span>
                              <h3 className="text-sm font-semibold leading-snug">
                                {ticket.subject}
                              </h3>
                              {ticket.message && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {ticket.message}
                                </p>
                              )}
                            </div>
                            <span
                              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                                statusKey === "open"
                                  ? "bg-red-500/20 text-red-400"
                                  : statusKey === "in_progress"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : statusKey === "resolved"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span
                              className={
                                ticket.priority === "urgent"
                                  ? "text-red-400"
                                  : ticket.priority === "high"
                                    ? "text-orange-400"
                                    : ticket.priority === "medium"
                                      ? "text-yellow-400"
                                      : "text-gray-400"
                              }
                            >
                              ● {priorityLabel}
                            </span>
                            <span>{timeAgo(ticket.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1 h-full min-h-0">
              <ChatInterface
                agentType="support"
                agentName="Customer Support"
                agentIcon="🎧"
                placeholder="How can we help you today?"
                onMessageCountChange={handleMessageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
