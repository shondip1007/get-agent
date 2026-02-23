import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ─── Validation helpers ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const VALID_INTERESTS = ["sales", "support", "automation", "custom"];

function sanitize(value: unknown, maxLen = 255): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body.");
  }

  const email = sanitize(body.email).toLowerCase();
  const full_name = sanitize(body.name);
  const company = sanitize(body.company);
  const role = sanitize(body.role);
  const company_size = sanitize(body.companySize);
  const interest = sanitize(body.interest);

  // ── Server-side validation ──────────────────────────────────────────────────
  if (!full_name) return err("Full name is required.");
  if (!email) return err("Email is required.");
  if (!EMAIL_RE.test(email)) return err("Please enter a valid email address.");
  if (company_size && !VALID_COMPANY_SIZES.includes(company_size))
    return err("Invalid company size value.");
  if (interest && !VALID_INTERESTS.includes(interest))
    return err("Invalid interest value.");

  // ── Attribution metadata ────────────────────────────────────────────────────
  const referrer = req.headers.get("referer") ?? null;
  const user_agent = req.headers.get("user-agent") ?? null;
  const ip_address =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  // Parse UTM params from the Referer URL if present
  let utm_source: string | null = null;
  let utm_medium: string | null = null;
  let utm_campaign: string | null = null;
  try {
    if (referrer) {
      const url = new URL(referrer);
      utm_source = url.searchParams.get("utm_source");
      utm_medium = url.searchParams.get("utm_medium");
      utm_campaign = url.searchParams.get("utm_campaign");
    }
  } catch {
    // non-critical — ignore malformed referrer URLs
  }

  // ── Insert into database ────────────────────────────────────────────────────
  const { error } = await supabaseAdmin.from("agent_waitlist").insert({
    email,
    full_name,
    company: company || null,
    role: role || null,
    company_size: company_size || null,
    interest: interest || null,
    referrer,
    user_agent,
    ip_address,
    utm_source,
    utm_medium,
    utm_campaign,
  });

  if (error) {
    // Unique-constraint violation → duplicate email
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "You're already on the waitlist! We'll be in touch soon.",
          duplicate: true,
        },
        { status: 409 },
      );
    }

    console.error("[waitlist] DB insert error:", error);
    return err("Something went wrong. Please try again later.", 500);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
