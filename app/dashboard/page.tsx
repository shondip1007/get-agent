"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {user?.user_metadata?.full_name || user?.email}!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
              <p className="text-3xl font-bold text-orange-500">12</p>
              <p className="text-sm text-gray-400 mt-2">+3 this week</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-semibold mb-2">Active Agents</h3>
              <p className="text-3xl font-bold text-orange-500">4</p>
              <p className="text-sm text-gray-400 mt-2">All systems online</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-orange-500">94%</p>
              <p className="text-sm text-gray-400 mt-2">Above average</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/experience/assistant"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="font-semibold mb-1">📅 Personal Assistant</h3>
                <p className="text-sm text-gray-400">
                  Manage your tasks and schedule
                </p>
              </Link>

              <Link
                href="/experience/sales"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="font-semibold mb-1">🛍️ Sales Agent</h3>
                <p className="text-sm text-gray-400">
                  Product recommendations and pricing
                </p>
              </Link>

              <Link
                href="/experience/support"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="font-semibold mb-1">🎧 Customer Support</h3>
                <p className="text-sm text-gray-400">Get help with inquiries</p>
              </Link>

              <Link
                href="/experience/navigator"
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <h3 className="font-semibold mb-1">🧭 Website Navigator</h3>
                <p className="text-sm text-gray-400">
                  Explore and navigate content
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">
                    Completed session with Sales Agent
                  </p>
                  <p className="text-sm text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">
                    Started new task with Personal Assistant
                  </p>
                  <p className="text-sm text-gray-400">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Profile updated</p>
                  <p className="text-sm text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
