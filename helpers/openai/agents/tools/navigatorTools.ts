import { tool } from "@openai/agents";
import type { RunContext } from "@openai/agents";
import {
  AgentContext,
  SearchPagesSchema,
  GetPageContentSchema,
  FindRelatedPagesSchema,
} from "../schemas";

// Mock website structure
interface Page {
  path: string;
  title: string;
  section: string;
  description: string;
  content: string;
  keywords: string[];
  relatedPages: string[];
}

const WEBSITE_PAGES: Page[] = [
  // Documentation
  {
    path: "/docs/quickstart",
    title: "Getting Started Guide",
    section: "docs",
    description: "Quick 5-minute setup guide to get started with our platform",
    content:
      "Welcome to the quickstart guide. Follow these steps: 1) Sign up for an account, 2) Generate your API key, 3) Install the SDK, 4) Make your first API call. Full code examples included in Python, JavaScript, and Ruby.",
    keywords: [
      "getting started",
      "quickstart",
      "setup",
      "beginner",
      "tutorial",
    ],
    relatedPages: ["/docs/api", "/docs/authentication"],
  },
  {
    path: "/docs/api",
    title: "API Reference",
    section: "docs",
    description:
      "Complete API documentation with endpoints, parameters, and examples",
    content:
      "API Reference: Our REST API supports the following endpoints - POST /api/v1/process, GET /api/v1/status, DELETE /api/v1/cancel. Rate limits: 1000 requests/hour on free tier, unlimited on Enterprise. Authentication via Bearer tokens.",
    keywords: ["api", "reference", "endpoints", "rest", "documentation"],
    relatedPages: ["/docs/authentication", "/docs/rate-limits"],
  },
  {
    path: "/docs/integrations",
    title: "Integration Guides",
    section: "docs",
    description: "Step-by-step guides for popular integrations",
    content:
      "Integrate with: Slack (15-min setup), GitHub (CI/CD automation), Salesforce (CRM sync), Zapier (no-code automation). Each integration includes webhook configuration, authentication setup, and code examples.",
    keywords: [
      "integrations",
      "slack",
      "github",
      "salesforce",
      "zapier",
      "webhooks",
    ],
    relatedPages: ["/docs/webhooks", "/docs/api"],
  },
  {
    path: "/docs/authentication",
    title: "Authentication & Security",
    section: "docs",
    description: "OAuth 2.0, API keys, and security best practices",
    content:
      "Authentication methods: 1) API Keys (simple, for server-side), 2) OAuth 2.0 (recommended for user-facing apps). Best practices: Rotate keys every 90 days, use environment variables, never commit keys to Git. Key management available in dashboard.",
    keywords: ["authentication", "oauth", "api keys", "security", "tokens"],
    relatedPages: ["/docs/api", "/docs/best-practices"],
  },
  // Products
  {
    path: "/products/dev-tools",
    title: "Developer Tools",
    section: "products",
    description: "SDKs, CLI tools, and development resources",
    content:
      "Developer Tools: SDK available for Python, JavaScript, Ruby, Go. CLI tool for automation. VS Code extension for in-editor access. GitHub Actions for CI/CD. Real-time debugging dashboard. Code generation tools.",
    keywords: ["developer", "sdk", "cli", "tools", "development"],
    relatedPages: ["/docs/quickstart", "/products/enterprise"],
  },
  {
    path: "/products/enterprise",
    title: "Enterprise Platform",
    section: "products",
    description: "Enterprise-grade features, dedicated support, and SLA",
    content:
      "Enterprise Platform: Unlimited API calls, 99.9% uptime SLA, dedicated support team, priority feature requests, private cloud deployment option, custom integrations, SSO/SAML, audit logs, advanced analytics.",
    keywords: ["enterprise", "business", "support", "sla", "dedicated"],
    relatedPages: ["/pricing", "/support/contact"],
  },
  // Support
  {
    path: "/support/help",
    title: "Help Center",
    section: "support",
    description: "FAQs, troubleshooting guides, and common solutions",
    content:
      "Help Center: 100+ articles covering common issues. Topics: Account management, Billing, Technical troubleshooting, API errors, Integration setup, Performance optimization. Search by keyword or browse by category.",
    keywords: ["help", "faq", "support", "troubleshooting", "issues"],
    relatedPages: ["/support/contact", "/docs/api"],
  },
  {
    path: "/support/contact",
    title: "Contact Support",
    section: "support",
    description: "Get in touch with our support team",
    content:
      "Contact Support: Email: support@demo.com, Live chat: Available 9 AM - 6 PM EST, Phone: +1-555-DEMO (Enterprise only). Average response time: < 2 hours. 24/7 emergency support for Enterprise customers.",
    keywords: ["contact", "support", "help", "email", "phone"],
    relatedPages: ["/support/help", "/products/enterprise"],
  },
  // Pricing
  {
    path: "/pricing",
    title: "Pricing Plans",
    section: "products",
    description: "Flexible pricing for teams of all sizes",
    content:
      "Pricing: Starter $29/mo (10K API calls, 2 team members), Professional $99/mo (100K API calls, 10 team members, priority support), Enterprise (custom pricing, unlimited calls, dedicated support, SLA). All plans include: Core features, 99.9% uptime, Email support",
    keywords: ["pricing", "plans", "cost", "billing", "subscription"],
    relatedPages: ["/products/enterprise", "/docs/quickstart"],
  },
];

/**
 * Tool to search website pages
 */
export const searchPagesTool = tool({
  name: "search_website_pages",
  description:
    "Search across the entire website to find relevant pages based on user query. Returns page titles, descriptions, paths, and relevance scores. Use this when users ask 'where can I find...' or 'how do I...'",
  parameters: SearchPagesSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { query, section, maxResults } = params;

    // Filter by section if specified
    let pages =
      section === "all"
        ? WEBSITE_PAGES
        : WEBSITE_PAGES.filter((p) => p.section === section);

    // Score pages based on query relevance
    const queryLower = query.toLowerCase();
    const scoredPages = pages.map((page) => {
      let score = 0;

      // Title match (highest weight)
      if (page.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Keyword matches (high weight)
      page.keywords.forEach((keyword) => {
        if (queryLower.includes(keyword) || keyword.includes(queryLower)) {
          score += 5;
        }
      });

      // Description match (medium weight)
      if (page.description.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      // Content match (lower weight)
      const queryWords = queryLower.split(" ");
      queryWords.forEach((word) => {
        if (word.length > 3 && page.content.toLowerCase().includes(word)) {
          score += 1;
        }
      });

      return { ...page, relevanceScore: score };
    });

    // Sort by relevance
    const results = scoredPages
      .filter((p) => p.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    if (results.length === 0) {
      return {
        success: false,
        message: `No pages found for "${query}". Try different keywords or browse our main sections.`,
        suggestions: [
          "Check the /docs section for documentation",
          "Visit /products for product information",
          "See /support for help and FAQs",
        ],
      };
    }

    return {
      success: true,
      message: `Found ${results.length} page(s) matching "${query}".`,
      results: results.map((p) => ({
        path: p.path,
        title: p.title,
        section: p.section,
        description: p.description,
        relevance:
          p.relevanceScore > 10
            ? "high"
            : p.relevanceScore > 5
              ? "medium"
              : "low",
      })),
      searchQuery: query,
    };
  },
});

/**
 * Tool to get page content
 */
export const getPageContentTool = tool({
  name: "get_page_content",
  description:
    "Retrieve detailed content from a specific page. Can return full content or a summary. Use when user asks about specific page details or wants to understand what's on a page.",
  parameters: GetPageContentSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { pagePath, summarize } = params;

    const page = WEBSITE_PAGES.find((p) => p.path === pagePath);

    if (!page) {
      return {
        success: false,
        message: `Page "${pagePath}" not found. Please verify the path.`,
        suggestion:
          "Use the search_website_pages tool to find the correct page path.",
      };
    }

    const content = summarize ? page.description : page.content;

    return {
      success: true,
      page: {
        path: page.path,
        title: page.title,
        section: page.section,
        description: page.description,
        content,
        keywords: page.keywords,
        relatedPages: page.relatedPages,
      },
      message: summarize
        ? "Showing page summary. Set 'summarize: false' for full content."
        : "Showing full page content.",
    };
  },
});

/**
 * Tool to find related pages
 */
export const findRelatedPagesTool = tool({
  name: "find_related_pages",
  description:
    "Find pages related to the current page or topic. Useful for suggesting next steps or related resources. Use when user finishes reading a page or asks 'what else should I read'.",
  parameters: FindRelatedPagesSchema,

  async execute(params, runContext?: RunContext<AgentContext>) {
    const { currentPage, topic } = params;

    const page = WEBSITE_PAGES.find((p) => p.path === currentPage);

    if (!page) {
      return {
        success: false,
        message: `Page "${currentPage}" not found.`,
      };
    }

    // Get explicitly related pages
    const relatedPaths = page.relatedPages;
    let relatedPages = WEBSITE_PAGES.filter((p) =>
      relatedPaths.includes(p.path),
    );

    // If topic is provided, also find pages matching that topic
    if (topic) {
      const topicLower = topic.toLowerCase();
      const topicMatches = WEBSITE_PAGES.filter(
        (p) =>
          p.path !== currentPage &&
          !relatedPaths.includes(p.path) &&
          (p.keywords.some(
            (k) => topicLower.includes(k) || k.includes(topicLower),
          ) ||
            p.title.toLowerCase().includes(topicLower)),
      );
      relatedPages = [...relatedPages, ...topicMatches.slice(0, 2)];
    }

    if (relatedPages.length === 0) {
      return {
        success: true,
        message: "No related pages found.",
        currentPage: {
          path: page.path,
          title: page.title,
        },
        relatedPages: [],
      };
    }

    return {
      success: true,
      message: `Found ${relatedPages.length} related page(s).`,
      currentPage: {
        path: page.path,
        title: page.title,
      },
      relatedPages: relatedPages.map((p) => ({
        path: p.path,
        title: p.title,
        description: p.description,
        section: p.section,
      })),
    };
  },
});
