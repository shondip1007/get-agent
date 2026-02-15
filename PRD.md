Product Requirements Document (PRD): Agentic AI Demo Platform

1. Vision & Objectives
   Vision: To provide a highly immersive, interactive platform where prospective clients can test-drive specialized AI agents in simulated environments, bridging the gap between theoretical AI capabilities and practical business value.

Objectives & KPIs:

Demonstrate Capability: Users must clearly distinguish the specialized behaviors of the 4 unique agents.

Lead Conversion: Achieve a 5% conversion rate from "Demo Interaction" to "Lead Form Submission".

Performance: Agent response latency must remain under 1.5 seconds (Time to First Token) using streaming.

Stability: Zero UI blocking during agent generation; graceful fallbacks if the LLM provider fails.

2. Target Audience & Personas
   Enterprise Decision Makers (CTOs, VPs of Ops): Looking for secure, scalable customer service or sales automation. They care about latency, accuracy, and data security.

Small Business Owners: Seeking a "Personal Assistant" or "Website Navigator" to reduce their daily manual workload. They care about ease of use and cost.

Technical Evaluators: Developers checking the UI/UX quality and underlying infrastructure before recommending the product.

3. Core Features & "Experience Centers"
   Instead of a generic chat box, each agent will live in a specialized Experience Center—a UI that mocks a real-world software environment to provide context to the demo.

Landing Page:

Dynamic hero section with a terminal/typing effect value proposition.

Grid navigation to the 4 Experience Centers.

Persistent CTA: "Deploy this AI to your business."

Experience Center 1: The Sales Agent

UI Context: A mock e-commerce product page (e.g., selling tech gadgets).

Agent Capabilities: Recommends products, answers pricing queries, applies mock discount codes, and pushes for a "checkout."

Experience Center 2: Customer Support

UI Context: A mock ticketing portal or helpdesk.

Agent Capabilities: Handles "where is my order" queries, references a mock return policy, and simulates escalating to a human.

Experience Center 3: Website Navigator

UI Context: A complex, multi-page mock corporate site.

Agent Capabilities: Deep-links users to specific pages, summarizes long documentation, and guides users to the contact form.

Experience Center 4: Personal Assistant

UI Context: A mock calendar and task-management dashboard.

Agent Capabilities: "Schedules" mock meetings, summarizes daily tasks, and drafts short emails.

Lead Generation / Request Flow:

Slide-out panel or dedicated route for lead capture.

Fields: Name, Work Email, Company Size, Desired Agent Type.

4. Technical Architecture & Specifications
   Frontend:

Framework: Next.js (App Router) for Server-Side Rendering (SSR) and SEO.

Language: TypeScript (strict mode enabled).

Styling: Tailwind CSS + shadcn/ui (for fast, accessible, and clean component architecture).

State Management: React Context or Zustand for maintaining chat history across route changes.

Backend (Supabase as BaaS):

Database (PostgreSQL): \* users and leads tables.

chat_sessions and messages tables to store demo logs for admin analytics.

pgvector extension: To store embeddings for the agents' mock knowledge bases (e.g., the Customer Support return policy).

Authentication: Supabase Auth (Anonymous sign-ins for public demo users to persist their session without forcing a signup barrier).

Compute (Supabase Edge Functions):

LLM API calls (OpenAI/Anthropic) must be securely handled in Edge Functions. Never expose API keys on the Next.js client.

Functions will handle streaming text responses back to the Next.js client.

Realtime: Supabase Realtime subscriptions to show "Agent is typing..." indicators seamlessly.

Security: Row Level Security (RLS) policies ensuring anonymous users can only read/write their own generated chat session IDs.

5. AI Agent Constraints & Rules
   AI products require specific guardrails defined in the PRD to prevent scope creep and liability.

System Prompts: Each agent must have a hardcoded system prompt defining its persona, tone, and boundaries (e.g., “You are a Sales Agent. Do not answer coding questions.”).

Hallucination Handling: If an agent does not know the answer, it must explicitly output a fallback string: "I don't have that information in my current demo environment, but a fully trained agent would handle this seamlessly!"

Context Window Limits: Cap the conversation history sent to the LLM to the last 10 messages to optimize latency and cost.

6. User Flows
   Flow: The Immersive Demo

User lands on homepage -> clicks "Try Sales Agent".

User is routed to /experience/sales (a mock e-commerce store).

Supabase quietly generates an anonymous user session.

User types: "What's the best laptop for a developer?"

Next.js calls Supabase Edge Function -> Edge function queries LLM -> Streams response back to UI.

After 5 messages, a subtle toast notification appears: "Impressed? Get a custom agent for your site."
