"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackContent() {
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

        // Get parameters from the URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const type = searchParams.get("type");

        // FIRST PRIORITY: Check if there's already a valid session
        // This handles cases where the user is already authenticated
        // even if there are error parameters in the URL
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          // User is already authenticated, treat as success
          // This happens even if there are error parameters in the URL
          console.log("User already has valid session");
          setStatus("success");
          setMessage(
            type === "signup"
              ? "Account verified successfully! Redirecting..."
              : "Signed in successfully! Redirecting...",
          );

          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
          return;
        }

        // Handle OAuth/verification errors from URL (only if no session exists)
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Try to exchange the code for a session if we have one
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Exchange error:", exchangeError);

            // Check if user got authenticated despite the error
            const {
              data: { session: sessionAfterError },
            } = await supabase.auth.getSession();

            if (sessionAfterError) {
              // Success! User is authenticated despite the error
              console.log("User authenticated despite exchange error");
              setStatus("success");
              setMessage("Account verified successfully! Redirecting...");

              setTimeout(() => {
                router.push("/");
                router.refresh();
              }, 1500);
              return;
            }

            // Only throw if there's truly no session
            throw exchangeError;
          }

          if (data.session) {
            setStatus("success");
            setMessage("Account verified successfully! Redirecting...");

            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1500);
            return;
          }
        }

        // If we get here, no code and no session
        throw new Error(
          "No authentication code found. Please try signing in again.",
        );
      } catch (error: any) {
        console.error("Auth callback error:", error);

        // One final check - see if the user is authenticated anyway
        const supabase = createClient();
        const {
          data: { session: finalSession },
        } = await supabase.auth.getSession();

        if (finalSession) {
          // User is authenticated! Show success despite the error
          console.log("User authenticated on final check");
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");

          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
          return;
        }

        // Truly failed - show error
        setStatus("error");

        let errorMessage = "Failed to verify account. Please try again.";
        if (error.message?.includes("expired")) {
          errorMessage = "Verification link expired. Please request a new one.";
        } else if (error.message?.includes("code verifier")) {
          errorMessage =
            "Authentication session expired. Please sign in again.";
        } else if (error.message?.includes("already been used")) {
          errorMessage =
            "This verification link has already been used. Please try signing in.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setMessage(errorMessage);

        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/auth/login");
        }, 4000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>

      <div className="relative max-w-md w-full mx-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}

            {status === "success" && (
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center animate-scale-in">
                <svg
                  className="w-8 h-8 text-green-400"
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
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center animate-scale-in">
                <svg
                  className="w-8 h-8 text-red-400"
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
                  ? "text-green-400"
                  : status === "error"
                    ? "text-red-400"
                    : "text-white"
              }`}
            >
              {status === "loading" && "Verifying Account"}
              {status === "success" && "Success!"}
              {status === "error" && "Verification Failed"}
            </h2>
            <p className="text-gray-400">{message}</p>
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
