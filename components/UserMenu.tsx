"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="text-sm text-white/80 hover:text-orange-400 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="bg-orange-500/90 hover:bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const userEmail = user.email || "";
  const userName =
    user.user_metadata?.full_name || userEmail.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
          {userInitial}
        </div>
        <span className="text-sm text-white hidden md:block">{userName}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-gray-400 mt-1">{userEmail}</p>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              Profile
            </Link>
          </div>

          <div className="p-2 border-t border-white/10">
            <button
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
