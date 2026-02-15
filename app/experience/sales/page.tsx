"use client";

import { useState } from "react";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";

export default function SalesExperience() {
  const [showCTA, setShowCTA] = useState(false);

  const products = [
    {
      id: 1,
      name: "Pro Developer Laptop",
      price: "$1,299",
      image: "💻",
      rating: 4.8,
      reviews: 234,
    },
    {
      id: 2,
      name: "Wireless Keyboard",
      price: "$89",
      image: "⌨️",
      rating: 4.6,
      reviews: 156,
    },
    {
      id: 3,
      name: "4K Monitor",
      price: "$449",
      image: "🖥️",
      rating: 4.9,
      reviews: 312,
    },
    {
      id: 4,
      name: "Ergonomic Mouse",
      price: "$59",
      image: "🖱️",
      rating: 4.7,
      reviews: 189,
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
              Experience Center: Sales Agent
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
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 shadow-2xl max-w-sm">
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
            <h1 className="text-3xl font-bold mb-2">
              TechStore - Premium Gadgets
            </h1>
            <p className="text-gray-400">
              Chat with our AI Sales Agent to find the perfect product
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Product Catalog */}
            <div className="lg:col-span-2 overflow-y-auto bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-black/50 rounded-lg p-6 border border-white/10 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="text-6xl mb-4 text-center">
                      {product.image}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-gray-400">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-500">
                        {product.price}
                      </span>
                      <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promotional Banner */}
              <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-xl font-bold mb-2">🎁 Special Offer!</h3>
                <p className="text-gray-300">
                  Use code{" "}
                  <span className="font-mono bg-black/50 px-2 py-1 rounded">
                    DEMO15
                  </span>{" "}
                  for 15% off your first order
                </p>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-1">
              <ChatInterface
                agentName="Sales Agent"
                agentIcon="🛍️"
                systemPrompt="You are a helpful sales agent for TechStore. Help customers find products, answer questions about pricing and features, and encourage purchases. Be friendly and persuasive."
                placeholder="Ask about products, pricing, or deals..."
                onMessageCountChange={handleMessageCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
