"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinWaitlist() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    companySize: "",
    interest: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const companySizeMap: Record<string, string> = {
    "1-10": "small_2_10",
    "11-50": "medium_11_50",
    "51-200": "large_51_200",
    "201-1000": "enterprise_200_plus",
    "1000+": "enterprise_200_plus",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    const supabase = createClient();

    const { error } = await supabase.from("waitlist_users").insert({
      email: formData.email.trim().toLowerCase(),
      full_name: formData.name.trim(),
      company_name: formData.company.trim() || null,
      company_size: companySizeMap[formData.companySize] ?? null,
      interest_area: formData.interest || null,
      metadata: formData.role.trim() ? { role: formData.role.trim() } : {},
    });

    if (error) {
      if (error.code === "23505") {
        setApiError("You're already on the waitlist! We'll be in touch soon.");
      } else {
        setApiError("Something went wrong. Please try again.");
        console.error("[waitlist] insert error:", error);
      }
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push("/"), 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">🚀</div>
          <h1 className="text-3xl font-bold">You're on the Waitlist!</h1>
          <p className="text-gray-400">
            Thanks for joining. We’ll notify you as soon as early access opens.
          </p>
          <div className="animate-pulse text-orange-500">
            Redirecting to homepage...
          </div>
        </div>
      </div>
    );
  }

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
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <section className="pt-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Join the <span className="text-orange-500">Waitlist</span>
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="
              grid grid-cols-1 md:grid-cols-2 gap-6
              bg-white/5
              backdrop-blur-2xl
              bg-gradient-to-br from-white/10 to-white/5
              border border-white/20
              shadow-2xl shadow-black/40
              rounded-3xl
              p-10
            "
          >
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Work Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                placeholder="john@company.com"
              />
            </div>

            {/* Company */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                placeholder="Your Company"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Your Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
                placeholder="Founder, CTO, Ops Lead..."
              />
            </div>

            {/* Company Size */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Company Size</label>
              <select
                value={formData.companySize}
                onChange={(e) =>
                  setFormData({ ...formData, companySize: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            {/* Interest */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Primary Interest</label>
              <select
                value={formData.interest}
                onChange={(e) =>
                  setFormData({ ...formData, interest: e.target.value })
                }
                className="px-4 py-3 bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 transition"
              >
                <option value="">Select interest</option>
                <option value="sales">AI Sales Agents</option>
                <option value="support">Customer Support Agents</option>
                <option value="automation">Workflow Automation</option>
                <option value="custom">Custom AI Solution</option>
              </select>
            </div>

            {/* Error message */}
            {apiError && (
              <div className="md:col-span-2">
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {apiError}
                </p>
              </div>
            )}

            {/* Button spans full width */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
