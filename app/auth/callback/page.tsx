"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Get the code from the URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (code) {
          // Exchange the code for a session
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;

          setStatus("success");
          setMessage("Account verified successfully! Redirecting...");

          // Wait a moment before redirecting
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 2000);
        } else {
          // No code, might be a direct OAuth callback
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session) {
            setStatus("success");
            setMessage("Signed in successfully! Redirecting...");

            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          } else {
            throw new Error("No session found");
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(
          error.message || "Failed to verify account. Please try again.",
        );

        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-2xl font-bold">Agentic Services</span>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}

            {status === "success" && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}

            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-scale-in">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold mb-2 ${
                status === "success"
                  ? "text-green-600"
                  : status === "error"
                    ? "text-red-600"
                    : "text-gray-800"
              }`}
            >
              {status === "loading" && "Verifying Account"}
              {status === "success" && "Success!"}
              {status === "error" && "Verification Failed"}
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Progress Dots */}
          {status === "loading" && (
            <div className="flex justify-center gap-2 mt-8">
              <div
                className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
