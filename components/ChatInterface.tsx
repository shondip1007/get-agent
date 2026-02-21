"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentRoute } from "@/helpers/openai/agents/Agent/ChatAgent";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentType: AgentRoute;
  agentName: string;
  agentIcon: string;
  placeholder?: string;
  onMessageCountChange?: (count: number) => void;
}

export default function ChatInterface({
  agentType,
  agentName,
  agentIcon,
  placeholder = "Type your message...",
  onMessageCountChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const authTokenRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Grab auth token once on mount so the API can persist sessions/messages
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      authTokenRef.current = data.session?.access_token ?? null;
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (onMessageCountChange) {
      onMessageCountChange(messages.filter((m) => m.role === "user").length);
    }
  }, [messages, onMessageCountChange]);

  const sendMessage = async (userText: string): Promise<string> => {
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const payload = [...history, { role: "user" as const, content: userText }];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authTokenRef.current) {
      headers["Authorization"] = `Bearer ${authTokenRef.current}`;
    }

    const res = await fetch("/api/agent/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: payload,
        agentType,
        sessionId, // pass current session so messages append to same session
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // Persist sessionId for subsequent messages in this conversation
    if (data.sessionId && !sessionId) {
      setSessionId(data.sessionId);
    }

    return data.response as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, something went wrong: ${error?.message ?? "unknown error"}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-xl border border-white/10 min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-white/10">
        <div className="text-4xl">{agentIcon}</div>
        <div>
          <h3 className="font-semibold text-md">{agentName}</h3>
          <p className="text-xs text-gray-400">
            {isTyping ? "Typing..." : "Online"}
          </p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-md mb-2">Welcome!</p>
            <p className="text-xs">Start a conversation with the {agentName}</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {message.role === "user" ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div
                  className="prose prose-invert prose-sm max-w-none
                  prose-headings:font-semibold prose-headings:text-white
                  prose-h2:text-base prose-h3:text-sm
                  prose-p:text-gray-100 prose-p:leading-relaxed
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:pl-4 prose-ul:space-y-1
                  prose-ol:pl-4 prose-ol:space-y-1
                  prose-li:text-gray-100
                  prose-code:bg-white/10 prose-code:text-orange-300 prose-code:px-1 prose-code:rounded prose-code:text-xs
                  prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10
                  prose-blockquote:border-orange-400 prose-blockquote:text-gray-300
                  prose-hr:border-white/20"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-4 border-t border-white/10"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isTyping}
            className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
