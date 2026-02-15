"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentName: string;
  agentIcon: string;
  systemPrompt: string;
  placeholder?: string;
  onMessageCountChange?: (count: number) => void;
}

export default function ChatInterface({
  agentName,
  agentIcon,
  systemPrompt,
  placeholder = "Type your message...",
  onMessageCountChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const simulateAgentResponse = async (
    userMessage: string,
  ): Promise<string> => {
    // This will be replaced with actual LLM API call via Supabase Edge Function
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock responses based on agent type
    const responses: Record<string, string[]> = {
      "Sales Agent": [
        "I'd be happy to help you find the perfect product! Based on your needs, I recommend checking out our premium collection. Can you tell me more about what you're looking for?",
        "Great choice! That product is currently on sale with a 15% discount. Would you like me to add it to your cart?",
        "We have excellent options in that category. Let me show you our top-rated products that match your requirements.",
      ],
      "Customer Support": [
        "I understand your concern. Let me look into that for you right away. Can you provide me with your order number?",
        "Thank you for that information. According to our records, your order is currently in transit and should arrive within 2-3 business days.",
        "I apologize for the inconvenience. Let me escalate this to our senior support team to ensure we resolve this quickly.",
      ],
      "Website Navigator": [
        "I can help you navigate our site! The information you're looking for is in our documentation section. Let me guide you there.",
        "That's a great question! You can find detailed information about that on our Features page. Would you like me to summarize it for you?",
        "I've found several relevant pages that might help. Let me provide you with direct links to the most useful resources.",
      ],
      "Personal Assistant": [
        "I've added that to your schedule. You now have a meeting scheduled for tomorrow at 2 PM. Would you like me to send calendar invites?",
        "Here's a summary of your tasks for today: You have 3 high-priority items and 5 regular tasks. Shall I help you prioritize?",
        "I've drafted that email for you. Would you like me to review it before sending, or would you like to make any changes?",
      ],
    };

    const agentResponses = responses[agentName] || [
      "I'm here to help! How can I assist you today?",
    ];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
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
      const response = await simulateAgentResponse(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I don't have that information in my current demo environment, but a fully trained agent would handle this seamlessly!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-xl border border-white/10">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="text-3xl">{agentIcon}</div>
        <div>
          <h3 className="font-semibold">{agentName}</h3>
          <p className="text-sm text-gray-400">
            {isTyping ? "Typing..." : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Start a conversation with the {agentName}</p>
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
              <p className="whitespace-pre-wrap">{message.content}</p>
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
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
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
