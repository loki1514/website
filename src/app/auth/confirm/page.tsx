import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

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
  if (status === "ok") [title, body] = ["Your email is confirmed.", "You can now sign in to the VINII Partner app with this email and the password you chose. Your store appears there once it is approved."];
  else if (error) [title, body] = ["This link has expired or was already used.", "If you already confirmed, just sign in to the VINII Partner app. Otherwise our team will help you when we call."];
  else if (tokenHash) [title, body] = ["Confirm your email", "One tap and your OneLocal partner login is ready."];
  else [title, body] = ["Your email is confirmed.", "You can now sign in to the VINII Partner app."];

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="font-mono text-sm tracking-widest text-primary">ONELOCAL PARTNER</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {tokenHash && !status ? (
            <form method="post" action="/auth/confirm/verify">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value={type} />
              <button type="submit" className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Confirm my email</button>
            </form>
          ) : (
            <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Go home</Link>
          )}
        </div>
      </main>
    </div>
  );
}
