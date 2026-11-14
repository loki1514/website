import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Confirm your email · OneLocal", robots: { index: false } };

// The partner's confirmation email links here, on the OneLocal domain, instead of to supabase.co.
// The page only shows a button: the token is spent on the button's POST, so email link scanners that open
// every link in advance cannot use it up before the partner clicks.
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = one(q.status);
  const tokenHash = one(q.token_hash);
  const type = one(q.type) || "email";
  // Supabase's own redirect (if the old email template is still in use) reports problems in the URL fragment or
  // as ?error=..., and sends a code we do not need here; both end on this page.
  const error = status === "failed" || Boolean(one(q.error) || one(q.error_description));

  let title: string, body: string;
  if (status === "ok") [title, body] = ["Your email is confirmed.", "You can now sign in to the One Local Partner app with this email and the password you chose. Your shop appears there once it is approved."];
  else if (error) [title, body] = ["This link has expired or was already used.", "If you already confirmed, just sign in to the One Local Partner app. Otherwise our team will help you when we call."];
  else if (tokenHash) [title, body] = ["Confirm your email", "One tap and your OneLocal partner login is ready."];
  else [title, body] = ["Your email is confirmed.", "You can now sign in to the One Local Partner app."];

  return (
    <PageShell centred>
      <h1 className="ol-display text-[clamp(2.2rem,6vw,3.75rem)]">{title}</h1>
      <p className="mt-4 text-lg text-(--ink-soft)">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {tokenHash && !status ? (
          <form method="post" action="/auth/confirm/verify">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <button type="submit" className="ol-pill is-pop">Confirm my email</button>
          </form>
        ) : (
          <Link href="/" className="ol-pill">Go home</Link>
        )}
      </div>
    </PageShell>
  );
}
