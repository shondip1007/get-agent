"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/helpers/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatSession {
  id: string;
  agent_type: string;
  agent_name: string;
  message_count: number;
  created_at: string;
  last_message_at: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  added_at: string;
  products: { name: string; price: number; category: string } | null;
}

interface Invoice {
  id: string;
  invoice_number: number;
  status: string;
  subtotal: number;
  total_amount: number;
  billing_email: string | null;
  created_at: string;
  paid_at: string | null;
  invoice_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

type NavKey =
  | "profile"
  | "sessions"
  | "cart"
  | "invoices"
  | "tasks"
  | "tickets";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, string> = {
  sales_agent: "🛍️",
  customer_support: "🎧",
  website_navigator: "🧭",
  personal_assistant: "📅",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-gray-500/20 text-gray-400",
  paid: "bg-green-500/20 text-green-400",
  draft: "bg-gray-500/20 text-gray-400",
  void: "bg-red-500/20 text-red-400",
  todo: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  archived: "bg-gray-500/20 text-gray-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-4xl mb-3">🪹</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-white/5 animate-pulse border border-white/5"
        />
      ))}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<NavKey>("profile");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    setActivityLoading(true);
    try {
      const [cartRes, invoiceRes, taskRes, ticketRes, dbUserRes] =
        await Promise.all([
          supabase
            .from("cart_items")
            .select("id, quantity, added_at, products(name, price, category)")
            .eq("user_id", user.id)
            .order("added_at", { ascending: false }),
          supabase
            .from("invoices")
            .select(
              "id, invoice_number, status, subtotal, total_amount, billing_email, created_at, paid_at, invoice_items(id, product_name, quantity, unit_price, total_price)",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("agent_tasks")
            .select(
              "id, title, description, status, priority, due_at, completed_at, created_at",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("support_tickets")
            .select("id, subject, message, status, priority, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle(),
        ]);

      const normalizedCart: CartItem[] = (cartRes.data ?? []).map(
        (item: any) => ({
          ...item,
          products: Array.isArray(item.products)
            ? (item.products[0] ?? null)
            : item.products,
        }),
      );
      setCartItems(normalizedCart);
      setInvoices((invoiceRes.data as Invoice[]) ?? []);
      setTasks((taskRes.data as Task[]) ?? []);
      setTickets((ticketRes.data as SupportTicket[]) ?? []);

      if (dbUserRes.data?.id) {
        const { data: sessionData } = await supabase
          .from("chat_sessions")
          .select(
            "id, agent_type, agent_name, message_count, created_at, last_message_at",
          )
          .eq("user_id", dbUserRes.data.id)
          .order("last_message_at", { ascending: false })
          .limit(20);
        setSessions((sessionData as ChatSession[]) ?? []);
      }
    } finally {
      setActivityLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMsg(null);
    try {
      await updateUserProfile({ full_name: fullName });
      setSaveMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setSaveMsg({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + (i.products?.price ?? 0) * i.quantity,
    0,
  );

  // ─── Nav items ────────────────────────────────────────────────────────────

  const NAV: {
    key: NavKey;
    label: string;
    icon: string;
    count?: number;
  }[] = [
    { key: "profile", label: "Profile Settings", icon: "⚙️" },
    {
      key: "sessions",
      label: "Chat Sessions",
      icon: "💬",
      count: sessions.length,
    },
    { key: "cart", label: "Current Cart", icon: "🛒", count: cartItems.length },
    {
      key: "invoices",
      label: "Purchase Invoices",
      icon: "🧾",
      count: invoices.length,
    },
    { key: "tasks", label: "Personal Tasks", icon: "✅", count: tasks.length },
    {
      key: "tickets",
      label: "Support Tickets",
      icon: "🎧",
      count: tickets.length,
    },
  ];

  // ─── Section renderers ────────────────────────────────────────────────────

  const renderProfile = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        {saveMsg && (
          <div
            className={`p-3 rounded-lg text-sm ${
              saveMsg.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {saveMsg.text}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white opacity-60 cursor-not-allowed text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="Enter your name"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );

  const renderSessions = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Chat Sessions</h2>
      {activityLoading ? (
        <Skeleton />
      ) : sessions.length === 0 ? (
        <EmptyState label="No chat sessions yet. Try one of the agent experiences!" />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
            >
              <span className="text-2xl shrink-0">
                {AGENT_ICONS[s.agent_type] ?? "🤖"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.agent_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {s.message_count} messages · Started {fmt(s.created_at)}
                </p>
              </div>
              {s.last_message_at && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Last activity</p>
                  <p className="text-xs text-gray-500">
                    {fmt(s.last_message_at)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Current Cart</h2>
      {activityLoading ? (
        <Skeleton />
      ) : cartItems.length === 0 ? (
        <EmptyState label="Your cart is empty." />
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl shrink-0">
                  🛍️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {item.products?.name ?? "Unknown product"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.products?.category} · Added {fmt(item.added_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-orange-400">
                    {fmtMoney((item.products?.price ?? 0) * item.quantity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {fmtMoney(item.products?.price ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end px-5 py-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Cart Total</p>
              <p className="text-lg font-bold text-orange-400">
                {fmtMoney(cartTotal)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Purchase Invoices</h2>
      {activityLoading ? (
        <Skeleton />
      ) : invoices.length === 0 ? (
        <EmptyState label="No invoices yet. Complete a checkout to generate one." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const invNum = `INV-${String(inv.invoice_number).padStart(4, "0")}`;
            const open = expandedInvoice === inv.id;
            return (
              <div
                key={inv.id}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedInvoice(open ? null : inv.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-xl shrink-0">
                    🧾
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{invNum}</span>
                      <Badge
                        label={inv.status}
                        color={
                          STATUS_COLORS[inv.status] ??
                          "bg-gray-500/20 text-gray-400"
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmt(inv.created_at)}
                      {inv.billing_email && ` · ${inv.billing_email}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-orange-400">
                      {fmtMoney(inv.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {open ? "▲ Hide" : "▼ Details"}
                    </p>
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-white/5">
                    <table className="w-full text-xs mt-4">
                      <thead>
                        <tr className="text-gray-500 border-b border-white/10">
                          <th className="text-left pb-2 font-medium">
                            Product
                          </th>
                          <th className="text-right pb-2 font-medium">Qty</th>
                          <th className="text-right pb-2 font-medium">
                            Unit Price
                          </th>
                          <th className="text-right pb-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {inv.invoice_items.map((li) => (
                          <tr key={li.id}>
                            <td className="py-2 text-gray-300">
                              {li.product_name}
                            </td>
                            <td className="py-2 text-right text-gray-400">
                              {li.quantity}
                            </td>
                            <td className="py-2 text-right text-gray-400">
                              {fmtMoney(li.unit_price)}
                            </td>
                            <td className="py-2 text-right font-semibold">
                              {fmtMoney(li.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-xs">
                      <span className="text-gray-500">Issued by TechStore</span>
                      <span className="font-bold text-orange-400 text-sm">
                        Total: {fmtMoney(inv.total_amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Tasks</h2>
      {activityLoading ? (
        <Skeleton />
      ) : tasks.length === 0 ? (
        <EmptyState label="No tasks yet. Ask your Personal Assistant to create one!" />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-4 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl shrink-0 mt-0.5">
                {task.status === "completed"
                  ? "✅"
                  : task.status === "archived"
                    ? "📦"
                    : "📌"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {task.description}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Created {fmt(task.created_at)}
                  {task.due_at && ` · Due ${fmt(task.due_at)}`}
                  {task.completed_at && ` · Done ${fmt(task.completed_at)}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge
                  label={task.status.replace("_", " ")}
                  color={
                    STATUS_COLORS[task.status] ?? "bg-gray-500/20 text-gray-400"
                  }
                />
                <Badge
                  label={task.priority}
                  color={
                    PRIORITY_COLORS[task.priority] ??
                    "bg-gray-500/20 text-gray-400"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTickets = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Support Tickets</h2>
      {activityLoading ? (
        <Skeleton />
      ) : tickets.length === 0 ? (
        <EmptyState label="No support tickets yet." />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-4 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl shrink-0 mt-0.5">
                🎧
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {t.message}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {fmt(t.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge
                  label={t.status.replace("_", " ")}
                  color={
                    STATUS_COLORS[t.status] ?? "bg-gray-500/20 text-gray-400"
                  }
                />
                <Badge
                  label={t.priority}
                  color={
                    PRIORITY_COLORS[t.priority] ??
                    "bg-gray-500/20 text-gray-400"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const RENDERERS: Record<NavKey, () => React.ReactNode> = {
    profile: renderProfile,
    sessions: renderSessions,
    cart: renderCart,
    invoices: renderInvoices,
    tasks: renderTasks,
    tickets: renderTickets,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
            <div className="w-full max-w-7xl">
              <div className="flex items-center justify-between px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-white/10 hover:border-white/20">
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
                  <h1 className="text-xl font-bold">TechStore</h1>
                  <p className="text-xs text-gray-400">
                    Chat with our AI Sales Agent to find the perfect product
                  </p>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                  <UserMenu />
                </div>
              </div>
            </div>
          </nav>

          {/* ── Layout ── */}
          <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
            <div className="flex w-full gap-6 items-start">
              <aside className="w-64 shrink-0 bg-white/5 rounded-2xl border border-white/10 overflow-hidden sticky top-32">
                <nav className="py-2">
                  {NAV.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveNav(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm ${
                        activeNav === item.key
                          ? "bg-orange-500/15 text-white border-r-2 border-orange-500"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            activeNav === item.key
                              ? "bg-orange-500/30 text-orange-300"
                              : "bg-white/10 text-gray-500"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </aside>
              {/* ── Main content ── */}
              <main className="flex-1 min-w-0 bg-white/5 rounded-2xl border border-white/10 p-8 min-h-[600px] backdrop-blur-sm">
                {RENDERERS[activeNav]()}
              </main>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatSession {
  id: string;
  agent_type: string;
  agent_name: string;
  message_count: number;
  created_at: string;
  last_message_at: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  added_at: string;
  products: { name: string; price: number; category: string } | null;
}

interface Invoice {
  id: string;
  invoice_number: number;
  status: string;
  subtotal: number;
  total_amount: number;
  billing_email: string | null;
  created_at: string;
  paid_at: string | null;
  invoice_items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
