"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";

export default function NavigatorExperience() {
  const [showCTA, setShowCTA] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const pages = {
    home: {
      title: "Welcome to TechCorp",
      content:
        "Leading provider of enterprise software solutions since 2010. We help businesses transform digitally with cutting-edge technology.",
    },
    products: {
      title: "Our Products",
      content:
        "Enterprise Suite • Cloud Platform • Analytics Dashboard • Security Tools • API Gateway",
    },
    pricing: {
      title: "Pricing Plans",
      content:
        "Starter: $99/mo • Professional: $299/mo • Enterprise: Custom pricing",
    },
    docs: {
      title: "Documentation",
      content:
        "Getting Started • API Reference • Integration Guides • Best Practices • Troubleshooting",
    },
    about: {
      title: "About Us",
      content:
        "Founded in 2010, TechCorp has grown to serve over 10,000 enterprise clients worldwide. Our mission is to empower businesses through innovative technology solutions.",
    },
    contact: {
      title: "Contact Us",
      content:
        "Email: hello@techcorp.com • Phone: +1 (555) 123-4567 • Address: 123 Tech Street, San Francisco, CA",
    },
  };

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
              Experience Center: Website Navigator
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
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎉</div>
              <div className="flex-1">
                <h4 className="font-bold mb-1">Impressed?</h4>
                <p className="text-sm mb-3">Get a custom agent for your site</p>
                <Link
                  href="/request-demo"
                  className="inline-block bg-white text-purple-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
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
            <h1 className="text-3xl font-bold mb-2">
              TechCorp - Enterprise Solutions
            </h1>
            <p className="text-gray-400">
              Let our AI Navigator help you find what you need
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Website Content */}
            <div className="lg:col-span-2 overflow-y-auto space-y-6">
              {/* Site Navigation */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(pages).map((pageKey) => (
                    <button
                      key={pageKey}
                      onClick={() => setActivePage(pageKey)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activePage === pageKey
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {pages[pageKey as keyof typeof pages].title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Content */}
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold mb-6">
                  {pages[activePage as keyof typeof pages].title}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {pages[activePage as keyof typeof pages].content}
                </p>

                {activePage === "home" && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-black/50 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl mb-3">🚀</div>
                      <h3 className="font-semibold mb-2">Fast Deployment</h3>
                      <p className="text-sm text-gray-400">
                        Get started in minutes
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl mb-3">🔒</div>
                      <h3 className="font-semibold mb-2">
                        Enterprise Security
                      </h3>
                      <p className="text-sm text-gray-400">
                        Bank-level encryption
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-6 border border-white/10">
                      <div className="text-4xl mb-3">📊</div>
                      <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                      <p className="text-sm text-gray-400">
                        Real-time insights
                      </p>
                    </div>
                  </div>
                )}

                {activePage === "docs" && (
                  <div className="space-y-4">
                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">
                        📘 Getting Started Guide
                      </h4>
                      <p className="text-sm text-gray-400">
                        Learn the basics in 10 minutes
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">🔧 API Reference</h4>
                      <p className="text-sm text-gray-400">
                        Complete API documentation
                      </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold mb-2">🎓 Video Tutorials</h4>
                      <p className="text-sm text-gray-400">
                        Step-by-step video guides
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4">🔍 Site Search</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search documentation, guides, and more..."
                    className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-medium transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
              <ChatInterface
                agentName="Website Navigator"
                agentIcon="🧭"
                systemPrompt="You are a helpful website navigator. Guide users to specific pages, summarize documentation, and help them find information quickly. Provide direct links and clear directions."
                placeholder="Ask me to find something..."
                onMessageCountChange={handleMessageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
