"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";

export default function SupportExperience() {
  const [showCTA, setShowCTA] = useState(false);

  const tickets = [
    {
      id: "TKT-1234",
      subject: "Order Delivery Delay",
      status: "Open",
      priority: "High",
      created: "2 hours ago",
    },
    {
      id: "TKT-1235",
      subject: "Product Return Request",
      status: "In Progress",
      priority: "Medium",
      created: "1 day ago",
    },
    {
      id: "TKT-1236",
      subject: "Account Access Issue",
      status: "Resolved",
      priority: "Low",
      created: "3 days ago",
    },
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
              Experience Center: Customer Support
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

      <div className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Support Portal</h1>
            <p className="text-gray-400">
              Get instant help from our AI Support Agent
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Support Dashboard */}
            <div className="lg:col-span-2 overflow-y-auto space-y-6">
              {/* Tickets */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">
                  Your Support Tickets
                </h2>

                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm text-gray-400">
                            {ticket.id}
                          </span>
                          <h3 className="text-lg font-semibold">
                            {ticket.subject}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === "Open"
                              ? "bg-red-500/20 text-red-400"
                              : ticket.status === "In Progress"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span
                          className={`${
                            ticket.priority === "High"
                              ? "text-red-400"
                              : ticket.priority === "Medium"
                                ? "text-yellow-400"
                                : "text-gray-400"
                          }`}
                        >
                          Priority: {ticket.priority}
                        </span>
                        <span>Created: {ticket.created}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Base */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-6">📚 Knowledge Base</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">Return Policy</h3>
                    <p className="text-sm text-gray-400">
                      30-day money-back guarantee on all products
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">Shipping Info</h3>
                    <p className="text-sm text-gray-400">
                      Track your order and delivery times
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">Account Help</h3>
                    <p className="text-sm text-gray-400">
                      Manage your account settings
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10 hover:border-green-500/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">Payment Issues</h3>
                    <p className="text-sm text-gray-400">
                      Resolve payment and billing problems
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
                <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Track Order
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Request Return
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Update Address
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Contact Human Agent
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
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
