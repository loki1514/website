// Partner sign-ups from this website. The browser (including a phone on the same Wi-Fi) only ever talks to the
// website's server. When SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY are set, the form posts straight into the
// project's Supabase database through the submit_partner_application function, which validates, rate-limits by
// idempotency key and never echoes personal data back. On the final submit the server then creates the partner's
// VINII Partner login through Supabase's normal sign-up. Without those vars the request is forwarded to the One
// Local backend as before. Only the body is passed on; no cookies or other headers.
const BACKEND = (process.env.ONELOCAL_API_ORIGIN ?? "http://localhost:8100").replace(/\/$/, "");
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
// The application function is called with the server-only secret key when one is set, so the public (anon) role
// never needs EXECUTE on it. Supabase's Security Advisor flags anon-executable SECURITY DEFINER functions, and
// revoking that grant is what broke sign-ups on 14 Oct 2026 ("permission denied for function ..."). This key must
// never be exposed to the browser: no NEXT_PUBLIC_ prefix.
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_RPC_KEY = SERVICE_KEY ?? SUPABASE_KEY;
// Where the confirmation email sends people: the website's own /auth/confirm page, never a supabase.co address.
const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");

type Login = "created" | "exists" | "confirm_email" | "failed";
const bad = (detail: string) => Response.json({ detail }, { status: 400 });

// Same rules as the One Local backend (server/partner-applications.ts).
function passwordProblem(password: unknown, phone: string, email: string): string | null {
  if (typeof password !== "string" || password.length < 8) return "Password needs at least 8 characters";
  if (password.length > 72) return "Password is too long";
  if (!/[A-Za-z]/.test(password)) return "Password needs a letter";
  if (!/[0-9]/.test(password)) return "Password needs a number";
  const p = password.toLowerCase();
  if ((phone && p.includes(phone)) || p === email) return "Do not use your phone number or email as the password.";
  return null;
}

// Supabase's own sign-up, so the project's rules apply (password strength, email confirmation when switched on).
// An email that already has an account comes back as a user with no identities (or a 422), never as an error
// that could be used to probe which emails exist.
async function createLogin(email: string, password: string, meta: Record<string, string>, site: string): Promise<{ state: Login; id?: string }> {
  // With the server-only key, the login is created already confirmed through the Auth admin API. No Supabase
  // email goes out and nobody is sent to a supabase.co page; the Latur team verifies the partner on the call.
  if (SUPABASE_RPC_KEY && SUPABASE_RPC_KEY !== SUPABASE_KEY) {
    try {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_RPC_KEY, authorization: `Bearer ${SUPABASE_RPC_KEY}` },
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: meta }),
        cache: "no-store",
      });
      const j = (await r.json().catch(() => ({}))) as { id?: string; error_code?: string; code?: string };
      if (r.ok) return { state: "created", id: j.id };
      return { state: [j.error_code, j.code].some((c) => c === "email_exists" || c === "user_already_exists") ? "exists" : "failed" };
    } catch {
      return { state: "failed" };
    }
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup?redirect_to=${encodeURIComponent(`${site}/auth/confirm`)}`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SUPABASE_KEY!, authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ email, password, data: meta }),
      cache: "no-store",
    });
    const j = (await r.json().catch(() => ({}))) as { access_token?: string; id?: string; user?: { id?: string; identities?: unknown[] }; identities?: unknown[]; error_code?: string; code?: string };
    if (!r.ok) return { state: j.error_code === "user_already_exists" || j.code === "user_already_exists" ? "exists" : "failed" };
    if (j.access_token) return { state: "created", id: j.user?.id ?? j.id };
    const identities = j.user?.identities ?? j.identities;
    return Array.isArray(identities) && identities.length === 0 ? { state: "exists" } : { state: "confirm_email", id: j.user?.id ?? j.id };
  } catch {
    return { state: "failed" };
  }
}

// Links the login that was just created to the application and makes the partner's store (Pending until approved), database
// function ol_partner_application_attach_login (migration 0345). The database only accepts a login created in the last hour with
// the application's own email, so an email that already had an account is never linked. True when the reference now works as the
// app code. Never throws: the sign-up has already worked.
async function attachLogin(reference: string, userId: string): Promise<boolean> {
  if (!SERVICE_KEY) return false;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ol_partner_application_attach_login`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ p_reference: reference, p_user: userId }),
      cache: "no-store",
    });
    if (!r.ok) return false;
    const j = (await r.json().catch(() => ({}))) as { linked?: boolean };
    return j.linked === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 64 * 1024) return Response.json({ detail: "Request too large." }, { status: 413 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  try {
    if (SUPABASE_URL && SUPABASE_KEY) {
      let fields: Record<string, unknown>;
      try {
        fields = JSON.parse(body) as Record<string, unknown>;
      } catch {
        return bad("Please check the form and try again.");
      }
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) return bad("Please check the form and try again.");
      const submit = fields.stage !== "draft";
      const email = String(fields.email ?? "").trim().toLowerCase();
      const phone = String(fields.phone ?? "").replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");
      const password = fields.password;
      // The password is checked here and goes only to Supabase Auth, never into the application row.
      delete fields.password;
      if (submit) {
        const why = passwordProblem(password, phone, email);
        if (why) return bad(why);
      }
      // The function takes one named argument, `payload jsonb`. PostgREST matches body keys to argument names,
      // so the form must be wrapped as { payload: {...} }; a flat body is a 404 (PGRST202).
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_partner_application`, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_RPC_KEY!, authorization: `Bearer ${SUPABASE_RPC_KEY}` },
        body: JSON.stringify({ payload: fields }),
        cache: "no-store",
      });
      if (r.status === 404) return Response.json({ detail: "Sign-ups are not open yet. Please try again soon." }, { status: 503 });
      const text = await r.text();
      if (!r.ok) {
        const parsed = JSON.parse(text || "{}") as { message?: string; detail?: string; code?: string };
        // The function raises form problems with SQLSTATE P0400, which PostgREST reports as a 500.
        const formProblem = parsed.code === "P0400" || r.status < 500;
        return Response.json({ detail: parsed.message ?? parsed.detail ?? "Please check the form and try again." }, { status: formProblem ? 400 : 502 });
      }
      const receipt = JSON.parse(text) as { reference: string; status: string; existing: boolean; login?: Login; app_code?: boolean };
      // The application is saved first; only a new submission creates the login, so a failed save or a repeat
      // submit never makes a stray account. If the login fails the application still stands, and the answer says so.
      if (submit && !receipt.existing) {
        const made = await createLogin(email, password as string, {
          full_name: String(fields.owner_name ?? ""), business_name: String(fields.business_name ?? ""), signup_source: "partner_website",
        }, SITE_URL ?? new URL(request.url).origin);
        receipt.login = made.state;
        // The reference is also the app code, but only when the login really belongs to this application.
        receipt.app_code = made.state === "created" && !!made.id ? await attachLogin(receipt.reference, made.id) : false;
      }
      return Response.json(receipt, { status: 201 });
    }
    const r = await fetch(`${BACKEND}/api/partner-applications`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(forwarded ? { "x-forwarded-for": forwarded } : {}) },
      body,
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status, headers: { "content-type": r.headers.get("content-type") ?? "application/json" } });
  } catch {
    return Response.json({ detail: "We couldn't reach OneLocal right now. Please try again." }, { status: 502 });
  }
}
