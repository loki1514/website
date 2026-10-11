// Partner sign-ups from this website. The browser (including a phone on the same Wi-Fi) only ever talks to the
// website's server. When SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY are set, the form posts straight into the
// project's Supabase database through the submit_partner_application function, which validates, rate-limits by
// idempotency key and never echoes personal data back. Without those vars the request is forwarded to the One
// Local backend as before. Only the body is passed on; no cookies or other headers.
const BACKEND = (process.env.ONELOCAL_API_ORIGIN ?? "http://localhost:8100").replace(/\/$/, "");
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 64 * 1024) return Response.json({ detail: "Request too large." }, { status: 413 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  try {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_partner_application`, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` },
        body,
        cache: "no-store",
      });
      if (r.status === 404) return Response.json({ detail: "Sign-ups are not open yet. Please try again soon." }, { status: 503 });
      const text = await r.text();
      if (!r.ok) {
        const parsed = JSON.parse(text || "{}") as { message?: string; detail?: string };
        return Response.json({ detail: parsed.message ?? parsed.detail ?? "Please check the form and try again." }, { status: r.status >= 500 ? 502 : 400 });
      }
      return new Response(text, { status: 201, headers: { "content-type": "application/json" } });
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
