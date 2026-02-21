"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-4">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>

        <div className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a password reset link to{" "}
              <strong className="text-white">{email}</strong>
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center px-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>

      <div className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400">
            Enter your email and we&apos;ll send you a link to reset your
            password
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
