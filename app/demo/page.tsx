"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function DemoPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: "sales",
      title: "Sales Agent",
      icon: "🛍️",
      description:
        "Transform visitors into customers with AI-powered product recommendations and conversational selling.",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      hoverColor: "group-hover:border-blue-500/50",
      route: "/experience/sales",
      capabilities: [
        "Product recommendations based on user needs",
        "Pricing inquiries and discount application",
        "Cart management and checkout guidance",
        "Upselling and cross-selling strategies",
      ],
      metrics: [
        { label: "Conversion Lift", value: "+32%" },
        { label: "Avg Order Value", value: "+18%" },
        { label: "Response Time", value: "<2s" },
      ],
    },
    {
      id: "support",
      title: "Customer Support Agent",
      icon: "🎧",
      description:
        "Deliver instant, accurate support 24/7 with AI that understands context and escalates when needed.",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      hoverColor: "group-hover:border-green-500/50",
      route: "/experience/support",
      capabilities: [
        'Handle "Where is my order?" queries with tracking',
        "Reference return policies and documentation",
        "Troubleshoot common technical issues",
        "Smart escalation to human agents",
      ],
      metrics: [
        { label: "Resolution Rate", value: "87%" },
        { label: "Ticket Deflection", value: "64%" },
        { label: "CSAT Score", value: "4.8/5" },
      ],
    },
    {
      id: "navigator",
      title: "Website Navigator",
      icon: "🧭",
      description:
        "Guide users through complex websites with AI that understands your entire site structure and content.",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      hoverColor: "group-hover:border-purple-500/50",
      route: "/experience/navigator",
      capabilities: [
        "Deep-link users to specific pages instantly",
        "Summarize long documentation and articles",
        "Search across your entire knowledge base",
        "Contextual guidance based on user intent",
      ],
      metrics: [
        { label: "Time on Site", value: "+45%" },
        { label: "Bounce Rate", value: "-28%" },
        { label: "Page Discovery", value: "+156%" },
      ],
    },
    {
      id: "assistant",
      title: "Personal Assistant",
      icon: "📅",
      description:
        "Automate daily tasks with an AI assistant that manages schedules, drafts communications, and keeps you organized.",
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      hoverColor: "group-hover:border-orange-500/50",
      route: "/experience/assistant",
      capabilities: [
        "Schedule and manage calendar meetings",
        "Draft emails and communications",
        "Summarize daily tasks and priorities",
        "Set reminders and follow-ups",
      ],
      metrics: [
        { label: "Time Saved", value: "8h/week" },
        { label: "Task Completion", value: "+41%" },
        { label: "Accuracy", value: "96%" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/10 hover:border-white/20">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Agentic Services Logo"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
              <span className="text-xl font-bold ml-2 tracking-tight">
                Agentic Services
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              Live Interactive Demo
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight max-w-5xl mx-auto">
              Test-Drive Specialized{" "}
              <span className="text-orange-500">AI Agents</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Experience the power of domain-specific AI in realistic business
              scenarios. Each agent is designed to excel in its specialized
              role—try them all.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#agents"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-medium hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-105"
              >
                Explore AI Agents
              </a>
              <Link
                href="/request-demo"
                className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Request Custom Demo
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl font-bold text-orange-500 mb-1">4</div>
              <div className="text-sm text-gray-400">Specialized Agents</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                &lt;1.5s
              </div>
              <div className="text-sm text-gray-400">Response Time</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                24/7
              </div>
              <div className="text-sm text-gray-400">Availability</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl font-bold text-orange-500 mb-1">96%</div>
              <div className="text-sm text-gray-400">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section id="agents" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Choose Your Experience Center
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Each agent operates in a simulated environment that mirrors
              real-world business scenarios. Click to interact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`group relative rounded-2xl p-8 bg-gradient-to-br ${agent.color} backdrop-blur-xl border ${agent.borderColor} ${agent.hoverColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] cursor-pointer`}
                onClick={() =>
                  selectedAgent === agent.id
                    ? setSelectedAgent(null)
                    : setSelectedAgent(agent.id)
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{agent.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{agent.title}</h3>
                      <p className="text-sm text-gray-400">Experience Center</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      Click to expand
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {agent.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {agent.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 rounded-lg p-3 text-center"
                    >
                      <div className="text-lg font-bold text-white">
                        {metric.value}
                      </div>
                      <div className="text-xs text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expandable Capabilities */}
                {selectedAgent === agent.id && (
                  <div className="animate-slide-in">
                    <div className="border-t border-white/10 pt-6 mb-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="text-orange-500">✦</span>
                        Key Capabilities
                      </h4>
                      <ul className="space-y-3">
                        {agent.capabilities.map((capability, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-gray-300"
                          >
                            <span className="text-orange-500 mt-0.5">→</span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={agent.route}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-lg font-medium hover:bg-white/20 transition-all duration-300 group-hover:bg-white/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  Launch Experience
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">
              Three simple steps to experience AI transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-500">
                1
              </div>
              <h3 className="text-xl font-semibold">Choose Your Agent</h3>
              <p className="text-gray-400">
                Select from Sales, Support, Navigator, or Personal Assistant
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-500">
                2
              </div>
              <h3 className="text-xl font-semibold">Interact in Real-Time</h3>
              <p className="text-gray-400">
                Chat with the AI in a realistic simulated environment
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-500">
                3
              </div>
              <h3 className="text-xl font-semibold">Deploy to Your Business</h3>
              <p className="text-gray-400">
                Request a custom agent tailored to your specific needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 text-center space-y-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join leading companies using specialized AI agents to automate
                operations, boost conversions, and deliver exceptional customer
                experiences.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/request-demo"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-medium hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-105"
                >
                  Request Custom Demo
                </Link>
                <a
                  href="#agents"
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Try More Agents
                </a>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                No credit card required • 5-minute setup • Enterprise-ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 Agentic Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
