"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";

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
              <h1 className="text-xl font-bold">TechCorp</h1>
              <p className="text-xs text-gray-400">
                Let our AI Navigator help you find what you need
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

      <div className="pt-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
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
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1 h-full min-h-0">
              <ChatInterface
                agentType="navigator"
                agentName="Website Navigator"
                agentIcon="🧭"
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
