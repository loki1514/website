// The join form proves the partner's mobile number with an SMS code (database 0740), so the login made at the end carries a number the
// partner really owns and phone-code sign-in works. Server to server with Supabase Auth; the browser never sees a session or a token.
//   {action: "send", phone, submit_key}             → Supabase texts a 6-digit code (through the POS server's SMS hook and apitxt).
//                                                     A number with no login gets one made for it, holding only the number.
//   {action: "verify", phone, code, submit_key, email} → checks the code, then records on the draft which login holds the proven number.
// Limited per visitor and per number (0733). Nothing is kept here.
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const say = (detail: string, status = 400) => Response.json({ detail }, { status });
const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");

async function rpc<T>(fn: string, body: unknown): Promise<T | null> {
  if (!SERVICE_KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return r.ok ? ((await r.json().catch(() => null)) as T) : null;
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !SERVICE_KEY) return say("Confirming numbers is not available right now. Please try again later.", 503);
  const text = await request.text();
  if (text.length > 2048) return say("Please check your details and try again.");
  let p: { action?: unknown; phone?: unknown; code?: unknown; submit_key?: unknown; email?: unknown };
  try { p = JSON.parse(text); } catch { return say("Please check your details and try again."); }
  const phone = String(p.phone ?? "").replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");
  const key = String(p.submit_key ?? "");
  if (!/^[6-9]\d{9}$/.test(phone)) return say("Type a 10-digit mobile number.");
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(key)) return say("Please reload the page and try again.");
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const kind = p.action === "verify" ? "verify" : "send";
  if ((await rpc<boolean>("ol_partner_signin_throttle", { p_kind: kind, p_ip: forwarded, p_login: `+91${phone}` })) === false) {
    return say(kind === "send" ? "Please wait a few minutes before asking for another code." : "Too many tries. Wait a few minutes and ask for a new code.", 429);
  }
  const auth = (path: string, body: unknown) => fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}`, ...(forwarded ? { "x-forwarded-for": forwarded } : {}) },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  try {
    if (kind === "send") {
      const r = await auth("otp", { phone: `+91${phone}`, create_user: true, data: { signup_source: "partner_website" } });
      if (r.ok) return Response.json({ sent: true });
      const j = (await r.json().catch(() => ({}))) as { error_code?: string; msg?: string };
      if (r.status === 429 || String(j.error_code ?? "").includes("rate_limit")) return say("Please wait a minute before asking for another code.", 429);
      return say("We could not send the SMS right now. Please try again in a minute.", 502);
    }

    const code = String(p.code ?? "").replace(/\D/g, "");
    if (!/^\d{6}$/.test(code)) return say("Type the 6-digit code.");
    const r = await auth("verify", { phone: `+91${phone}`, token: code, type: "sms" });
    const j = (await r.json().catch(() => ({}))) as { user?: { id?: string; email?: string } };
    if (!r.ok || !j.user?.id) return say("That code is not right, or it has expired. Check it, or ask for a new one.");
    const marked = await rpc<{ marked?: boolean; reason?: string; login_email?: string | null }>("ol_partner_application_mark_phone", { p_submit_key: key, p_user: j.user.id });
    if (!marked?.marked) return say("Please go back one step, tap Next again, and confirm the number once more.");
    // the number already belongs to a login with another email (the same person in the customer app, say): that login must be used
    const email = String(p.email ?? "").trim().toLowerCase();
    const theirs = (marked.login_email ?? "").toLowerCase();
    if (theirs && email && theirs !== email) {
      return Response.json({ verified: true, other_email: maskEmail(theirs) });
    }
    return Response.json({ verified: true });
  } catch {
    return say("We couldn't reach OneLocal. Check your connection and try again.", 502);
  }
}
