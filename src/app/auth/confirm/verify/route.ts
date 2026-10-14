// Spends the confirmation token from the partner's email on Supabase Auth, server to server, then sends the
// partner back to /auth/confirm on this website with the result. The browser never visits supabase.co.
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
const TYPES = new Set(["email", "signup", "invite", "magiclink", "recovery", "email_change"]);

export async function POST(request: Request) {
  const site = SITE_URL ?? new URL(request.url).origin;
  const back = (status: "ok" | "failed") => Response.redirect(`${site}/auth/confirm?status=${status}`, 303);
  const form = await request.formData().catch(() => null);
  const tokenHash = String(form?.get("token_hash") ?? "");
  const type = String(form?.get("type") ?? "email");
  if (!SUPABASE_URL || !SUPABASE_KEY || !/^[A-Za-z0-9_-]{8,200}$/.test(tokenHash) || !TYPES.has(type)) return back("failed");
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ type, token_hash: tokenHash }),
      cache: "no-store",
    });
    // The session Supabase returns is not kept: partners sign in through the VINII Partner app, not this website.
    return back(r.ok ? "ok" : "failed");
  } catch {
    return back("failed");
  }
}
