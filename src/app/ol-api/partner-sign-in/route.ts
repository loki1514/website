// Partner sign-in on the website (partner.onelocal.co/dashboard), the same ways as the Partner app: a code sent to the mobile number
// or email, or the password. This server talks to Supabase Auth, server to server, so the browser never visits supabase.co.
//   {action: "send", login}            → Supabase makes a 6-digit code and sends it (SMS through the POS server's hook and apitxt, or email).
//                                        Only for an existing login: a code never creates an account.
//   {action: "verify", login, code}    → checks the code
//   {login, password}                  → checks the password
// A check that passes answers only the refresh token: the dashboard hands it to the Partner web app once (its address fragment,
// lib/auth/web_handoff.dart in one-local-flutter), which starts its own session from it. Nothing is kept here: no cookie, and no log of
// the password, the code or the token.
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
// Server-only key, used for one thing here: the sign-in limit (database 0733, ol_partner_signin_throttle).
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const say = (detail: string, status = 400) => Response.json({ detail }, { status });

type Who = { email: string } | { phone: string };

// An email, or an Indian mobile number (with or without +91 / 0).
function whoFrom(login: string): Who | null {
  const digits = login.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=[6-9]\d{9}$)/, "");
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(login)) return { email: login.toLowerCase() };
  if (/^[6-9]\d{9}$/.test(digits)) return { phone: `+91${digits}` };
  return null;
}

async function auth(path: string, body: unknown, forwarded: string | undefined) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_KEY!, authorization: `Bearer ${SUPABASE_KEY}`, ...(forwarded ? { "x-forwarded-for": forwarded } : {}) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const j = (await r.json().catch(() => ({}))) as { refresh_token?: string; error_code?: string; code?: string | number; msg?: string; message?: string };
  return { r, j, code: String(j.error_code ?? j.code ?? ""), msg: String(j.msg ?? j.message ?? "").toLowerCase() };
}

// Counts this try per visitor address and per login; false = too many. Without the server key the limit is skipped (Supabase's own
// limits still apply) and the log says so.
async function allowed(kind: "send" | "verify" | "password", ip: string, login: string): Promise<boolean> {
  if (!SERVICE_KEY) { console.warn("[partner-sign-in] no server key: sign-in limit not applied"); return true; }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ol_partner_signin_throttle`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ p_kind: kind, p_ip: ip, p_login: login }),
      cache: "no-store",
    });
    return r.ok ? (await r.json()) !== false : true;
  } catch {
    return true;
  }
}

const signedIn = (token: string) => Response.json({ session: token }, { headers: { "cache-control": "no-store" } });

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return say("Sign-in is not available right now. Please try again later.", 503);
  const text = await request.text();
  if (text.length > 4096) return say("Please check your details and try again.");
  let p: { action?: unknown; login?: unknown; password?: unknown; code?: unknown };
  try { p = JSON.parse(text); } catch { return say("Please check your details and try again."); }
  const login = typeof p.login === "string" ? p.login.trim() : "";
  const who = whoFrom(login);
  if (!who) return say("Type the email or 10-digit mobile number from your application.");
  const byPhone = "phone" in who;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = "phone" in who ? who.phone : who.email;
  const kind = p.action === "send" ? "send" : p.action === "verify" ? "verify" : "password";
  if (!(await allowed(kind, forwarded ?? "", key))) {
    return say(kind === "send" ? "Please wait a few minutes before asking for another code." : "Too many tries. Wait a few minutes and try again.", 429);
  }

  try {
    if (p.action === "send") {
      const { r, code, msg } = await auth("otp", { ...who, create_user: false }, forwarded);
      // The same answer whether or not the login exists, so this cannot be used to find out who has an account.
      if (r.ok || code === "otp_disabled" || msg.includes("signups not allowed") || msg.includes("user not found")) return Response.json({ sent: true });
      if (r.status === 429 || code.includes("rate_limit") || msg.includes("seconds")) return say("Please wait a minute before asking for another code.", 429);
      return say(byPhone ? "We could not send the SMS right now. Try again in a minute, or sign in with your password."
        : "We could not send the email right now. Try your mobile number, or sign in with your password.", 502);
    }

    if (p.action === "verify") {
      const code = typeof p.code === "string" ? p.code.replace(/\D/g, "") : "";
      if (!/^\d{6}$/.test(code)) return say("Type the 6-digit code.");
      const { r, j, code: err, msg } = await auth("verify", { ...who, token: code, type: byPhone ? "sms" : "email" }, forwarded);
      if (r.ok && j.refresh_token) return signedIn(j.refresh_token);
      if (r.status === 429 || err.includes("rate_limit")) return say("Too many tries. Wait a few minutes and ask for a new code.", 429);
      if (err === "otp_expired" || msg.includes("expired") || msg.includes("invalid")) return say("That code is not right, or it has expired. Check it, or ask for a new one.");
      return say("We couldn't sign you in just now. Please try again.", 502);
    }

    const password = typeof p.password === "string" ? p.password : "";
    if (!password || password.length > 72) return say("Type your password.");
    const { r, j, code } = await auth("token?grant_type=password", { ...who, password }, forwarded);
    if (r.ok && j.refresh_token) return signedIn(j.refresh_token);
    if (code === "email_not_confirmed") return say("Confirm your email first: open the link we sent you, then sign in.");
    if (r.status === 429 || code === "over_request_rate_limit") return say("Too many tries. Wait a few minutes and try again.", 429);
    // the same answer for an unknown login and a wrong password, so this cannot be used to find out who has an account
    if (r.status === 400) return say("That email or mobile number and password do not match.");
    return say("We couldn't sign you in just now. Please try again.", 502);
  } catch {
    return say("We couldn't reach OneLocal. Check your connection and try again.", 502);
  }
}
