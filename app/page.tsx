"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const texts = [
    "Transform your business with specialized AI agents",
    "Automate operations with intelligent workflows",
    "Deliver real-time support with AI precision",
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const currentText = texts[textIndex];
    const typingSpeed = isDeleting ? 55 : 75;
    const pauseAfterTyping = 1500;
    const pauseAfterDeleting = 400;

    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentText) {
      // Pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseAfterTyping);
    } else if (isDeleting && displayText === "") {
      // Pause before typing next sentence
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }, pauseAfterDeleting);
    } else {
      // Normal typing/deleting
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentText.slice(0, prev.length - 1)
            : currentText.slice(0, prev.length + 1),
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex]);

  const experienceCenters = [
    {
      id: "sales",
      title: "Sales Agent",
      description:
        "Recommends products, answers pricing queries, and drives conversions",
      icon: "🛍️",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      route: "/experience/sales",
    },
    {
      id: "support",
      title: "Customer Support",
      description:
        "Handles inquiries, references policies, and escalates when needed",
      icon: "🎧",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      route: "/experience/support",
    },
    {
      id: "navigator",
      title: "Website Navigator",
      description:
        "Guides users through complex sites and summarizes documentation",
      icon: "🧭",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      route: "/experience/navigator",
    },
    {
      id: "assistant",
      title: "Personal Assistant",
      description:
        "Manages schedules, tasks, and drafts communications specfically for you",
      icon: "📅",
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      route: "/experience/assistant",
    },
  ];

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

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-sm text-white/80 hover:text-orange-400 transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/request-demo"
                className="
            bg-orange-500/90
            hover:bg-orange-500
            text-white
            px-6 py-2
            rounded-xl
            text-sm font-medium
            transition-all duration-300
            shadow-lg shadow-orange-500/20
            hover:shadow-orange-500/40
          "
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Terminal Effect */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-block">
              <div className="bg-black/50 border border-orange-500/30 rounded-lg p-6 font-mono text-left h-[140px] w-[650px] flex flex-col justify-start">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                <div className="flex items-center text-green-400 h-full">
                  <span className="text-gray-500 mr-2">$</span>

                  <div className="relative h-[24px] overflow-hidden">
                    <span
                      key={textIndex}
                      className={`inline-block transition-all duration-200 ${
                        isDeleting ? "opacity-80" : "opacity-100"
                      }`}
                    >
                      {displayText}
                    </span>
                  </div>

                  <span className="ml-1 animate-pulse">▌</span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto">
              Experience AI Agents in{" "}
              <span className="text-orange-500">Real-World Scenarios</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Don&apos;t just read about AI capabilities—interact with
              specialized agents in immersive, simulated environments. See
              exactly how they&apos;ll transform your business operations.
            </p>
          </div>

          {/* Experience Centers Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {experienceCenters.map((center) => (
              <Link
                key={center.id}
                href={center.route}
                className="group relative"
              >
                <div
                  className="
    relative
    rounded-2xl
    p-8
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-[0_8px_30px_rgba(0,0,0,0.25)]
    transition-all duration-300
    hover:scale-105
    hover:bg-white/10
    hover:border-white/20
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
  "
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{center.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                        {center.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {center.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-orange-500 font-medium">
                    Try it now
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Our AI Agents?
            </h2>
            <p className="text-xl text-gray-400">
              Built for enterprise performance and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Response latency under 1.5 seconds with streaming support
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
              <p className="text-gray-400">
                Row-level security and encrypted data storage
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Specialized Agents</h3>
              <p className="text-gray-400">
                Purpose-built for specific business functions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Deploy AI to Your Business?
          </h2>
          <p className="text-xl text-gray-400">
            Join forward-thinking companies leveraging specialized AI agents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/request-demo"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Request a Demo
            </Link>
            <Link
              href="/experience/sales"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-medium transition-colors border border-white/20"
            >
              Try Sales Agent
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Agents
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 Agentic Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
