"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
