"use client";

// The partner dashboard (partner.onelocal.co/dashboard). Two states:
//  1. Sign in: the partner types the email or mobile number and the password from their application. This website's server checks
//     them (ol-api/partner-sign-in) and hands the session to the Partner app once.
//  2. The dashboard: the Partner app (the same app as on the phone, running on the web) fills the whole window under a slim bar.
//     The app keeps its own session after that, so coming back later opens straight into it.
// Signing out here also signs the app out (#ol_signout=1). This browser only remembers *that* someone signed in here (and which
// email, for the bar), never a password or a token.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LogOut, RotateCw } from "lucide-react";
import { ContourField } from "@/components/landing/contour-field";
import { API } from "@/lib/partners";

const SIGNED_IN = "onelocal.partner-dashboard.v1";

type Mode = "checking" | "signin" | "app";

export function Dashboard({ appUrl, fonts }: { appUrl: string | null; fonts: string }) {
  const [mode, setMode] = useState<Mode>("checking");
  const [who, setWho] = useState("");
  const [src, setSrc] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let saved: { login?: string } | null = null;
    try { saved = JSON.parse(localStorage.getItem(SIGNED_IN) ?? "null"); } catch { /* storage blocked */ }
    if (saved?.login && appUrl) { setWho(saved.login); setSrc(appUrl); setMode("app"); } else setMode("signin");
  }, [appUrl]);

  const signedIn = (login: string, session: string) => {
    try { localStorage.setItem(SIGNED_IN, JSON.stringify({ login })); } catch { /* ignore */ }
    setWho(login); setLoaded(false);
    // the app reads the session from the fragment once and wipes it (one-local-flutter lib/auth/web_handoff.dart)
    setSrc(`${appUrl}/#ol_session=${encodeURIComponent(session)}`); setRound(n => n + 1); setMode("app");
  };
  const signOut = () => {
    try { localStorage.removeItem(SIGNED_IN); } catch { /* ignore */ }
    setSigningOut(true); setLoaded(false);
    setSrc(`${appUrl}/#ol_signout=1`); setRound(n => n + 1); setMode("signin");
  };

  return (
    <div className={`ol-landing ol-dashboard ${fonts} relative h-svh overflow-hidden`}>
      {mode !== "app" && <ContourField mood="cream" still className="fixed inset-0 size-full" />}
      <div className="relative flex h-svh flex-col">
        {/* The same bar as the home page: logo home on the left, actions on the right. */}
        <header data-tone="forest" className="z-10 px-3 pt-3 pb-3">
          <div className="ol-glass ol-bar mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full pr-1.5 pl-4">
            <Link href="/" aria-label="OneLocal partners home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-5 w-auto sm:h-6" />
            </Link>
            {mode === "app" ? (
              <div className="flex min-w-0 items-center gap-1">
                <span className="ol-bar-link min-w-0 truncate max-md:hidden" title={who}>{who}</span>
                <button type="button" onClick={() => { setLoaded(false); setSrc(appUrl); setRound(n => n + 1); }} aria-label="Reload the dashboard" className="ol-bar-btn"><RotateCw className="size-4" /></button>
                <button type="button" onClick={signOut} className="ol-bar-cta"><LogOut className="mr-1.5 size-4" aria-hidden />Sign out</button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/" className="ol-bar-link shrink-0 whitespace-nowrap max-[399px]:hidden">Home</Link>
                <Link href="/join" className="ol-bar-cta">Become a partner</Link>
              </div>
            )}
          </div>
        </header>

        {mode === "app" && src && (
          <main className="relative min-h-0 flex-1 px-3 pb-3">
            <div className="relative size-full overflow-hidden rounded-2xl border border-(--line) bg-white shadow-[0_24px_48px_-32px_oklch(0.19_0.045_156/0.55)]">
              {!loaded && <p className="absolute inset-0 grid place-items-center text-(--soft)" role="status">Opening your dashboard…</p>}
              <iframe key={round} src={src} title="OneLocal Partner dashboard" onLoad={() => setLoaded(true)}
                allow="camera; microphone; geolocation; clipboard-read; clipboard-write" className="relative size-full border-0" />
            </div>
          </main>
        )}

        {/* Sign in: lined up with the bar's edges (its logo and its button), the words centred against the box. */}
        {mode === "signin" && (
          <main className="mx-auto grid w-full max-w-5xl flex-1 content-center items-center gap-16 overflow-y-auto px-5 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:pr-2 md:pl-4">
            <div className="max-w-md max-md:hidden">
              <h1 className="ol-title text-[2.6rem] leading-[1.05] text-balance">Your OneLocal partner <em>dashboard</em></h1>
              <dl className="mt-8 grid gap-5 border-t border-(--line) pt-6">
                {[
                  ["While we review you", "Track your application and add your PAN, bank account and documents."],
                  ["Once you are approved", "Bill at the counter, take OneLocal orders and keep your menu or catalogue up to date."],
                  ["On your phone too", "The OneLocal Partner app uses the same login, so your shop is the same everywhere."],
                ].map(([head, body]) => (
                  <div key={head}><dt className="ol-label text-[1.05rem]">{head}</dt><dd className="ol-lead mt-0.5 text-[0.98rem] text-pretty">{body}</dd></div>
                ))}
              </dl>
            </div>
            {appUrl ? <SignIn onSignedIn={signedIn} /> : (
              <div className="ol-card p-7">
                <p className="ol-display text-2xl">The dashboard isn&apos;t connected yet.</p>
                <p className="mt-3 text-(--soft)">Your application is safe. Our Latur team will call you, and you can use the OneLocal Partner app on your phone meanwhile.</p>
                <Link href="/" className="ol-pill mt-6">Back to home</Link>
              </div>
            )}
          </main>
        )}
      </div>
      {/* Signing out: the app is opened once, out of sight, so it drops its own session too. */}
      {signingOut && src && <iframe key={`out-${round}`} src={src} title="" aria-hidden className="hidden" onLoad={() => setTimeout(() => setSigningOut(false), 1500)} />}
    </div>
  );
}

// The ways the Partner app signs in, in the same order: a code to the mobile number or email first, the password below it.
type Way = "code" | "password";
type Channel = "phone" | "email";

const maskPhone = (d: string) => `+91 ${d.slice(0, 2)}xxxxxx${d.slice(-2)}`;
const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");
const RESEND_SECONDS = 30;
// Codes by email need OneLocal's own email sender in Supabase (Authentication → Emails → SMTP) and a template that carries the code
// ({{ .Token }}). Until both are set the built-in sender reaches no partner, so only the mobile number is offered. Switch on after that.
const EMAIL_CODES_ON = false;

async function ask(body: Record<string, string>) {
  const r = await fetch(`${API}/partner-sign-in`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const j = r ? ((await r.json().catch(() => ({}))) as { session?: string; sent?: boolean; detail?: string }) : {};
  return { ok: !!r?.ok, ...j, detail: j.detail ?? (r ? "Something went wrong. Please try again." : "We couldn't reach OneLocal. Check your connection and try again.") };
}

function SignIn({ onSignedIn }: { onSignedIn: (login: string, session: string) => void }) {
  const [way, setWay] = useState<Way>("code");
  const [channel, setChannel] = useState<Channel>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);   // the login a code went to; the code box shows while set
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const codeBox = useRef<HTMLInputElement>(null);

  useEffect(() => { (sentTo ? codeBox : first).current?.focus(); }, [way, channel, sentTo]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(w => w - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const digits = phone.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");
  const target = channel === "phone" ? digits : email.trim().toLowerCase();
  const switchWay = (w: Way) => { setWay(w); setError(null); setSentTo(null); setCode(""); };

  const send = async () => {
    if (channel === "phone" ? !/^[6-9]\d{9}$/.test(digits) : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) {
      setError(channel === "phone" ? "Type your 10-digit mobile number." : "Type a valid email."); return;
    }
    setBusy(true); setError(null);
    const r = await ask({ action: "send", login: target });
    setBusy(false);
    if (r.ok && r.sent) { setSentTo(target); setCode(""); setWait(RESEND_SECONDS); return; }
    setError(r.detail);
  };
  const verify = async (value = code) => {
    if (!sentTo || busy) return;
    if (!/^\d{6}$/.test(value)) { setError("Type the 6-digit code."); return; }
    setBusy(true); setError(null);
    const r = await ask({ action: "verify", login: sentTo, code: value });
    setBusy(false);
    if (r.ok && r.session) { onSignedIn(sentTo, r.session); return; }
    setError(r.detail);
  };
  const withPassword = async () => {
    if (!login.trim()) { setError("Type the email or mobile number from your application."); return; }
    if (!password) { setError("Type your password."); return; }
    setBusy(true); setError(null);
    const r = await ask({ login: login.trim(), password });
    setBusy(false);
    if (r.ok && r.session) { setPassword(""); onSignedIn(login.trim(), r.session); return; }
    setError(r.detail);
  };
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (busy) return; void (way === "password" ? withPassword() : sentTo ? verify() : send()); };

  const sentLabel = sentTo ? (channel === "phone" ? maskPhone(sentTo) : maskEmail(sentTo)) : "";

  return (
    <form noValidate onSubmit={submit} className="ol-card w-full p-6 sm:p-8" aria-labelledby="signin-title">
      <h2 id="signin-title" className="ol-display text-[1.75rem] leading-tight">Sign in</h2>

      {way === "code" && !sentTo && <>
        <p className="ol-lead mt-1.5 text-[0.98rem]">We will send a 6-digit code to the {EMAIL_CODES_ON ? "mobile number or email" : "mobile number"} on your partner account.</p>
        {EMAIL_CODES_ON && <div role="radiogroup" aria-label="Send the code to" className="mt-6 grid grid-cols-2 rounded-full bg-(--chip) p-1">
          {(["phone", "email"] as const).map(c => (
            <button key={c} type="button" role="radio" aria-checked={channel === c} onClick={() => { setChannel(c); setError(null); }}
              className={`min-h-10 rounded-full text-[0.95rem] font-semibold transition-colors ${channel === c ? "bg-white text-(--fg) shadow-[0_2px_8px_-4px_oklch(0.19_0.045_156/0.45)]" : "text-(--soft) hover:text-(--fg)"}`}>
              {c === "phone" ? "Mobile number" : "Email"}
            </button>
          ))}
        </div>}
        <label className="mt-5 block">
          <span className="ol-label mb-2 block text-base">{channel === "phone" ? "Mobile number" : "Email"}</span>
          {channel === "phone" ? (
            <span className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-(--soft)">+91</span>
              <input ref={first} value={phone} onChange={e => { setPhone(e.target.value); setError(null); }} className="ol-field !pl-14" placeholder="98XXXXXXXX"
                inputMode="tel" autoComplete="tel-national" maxLength={14} />
            </span>
          ) : (
            <input ref={first} value={email} onChange={e => { setEmail(e.target.value); setError(null); }} className="ol-field" placeholder="you@business.com"
              type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} />
          )}
        </label>
      </>}

      {way === "code" && sentTo && <>
        <p className="ol-lead mt-1.5 text-[0.98rem]">If <b className="text-(--fg)">{sentLabel}</b> is on a partner account, we have sent it a 6-digit code. Type it here.</p>
        <label className="mt-6 block">
          <span className="ol-label mb-2 block text-base">Code</span>
          <input ref={codeBox} value={code} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setCode(v); setError(null); if (v.length === 6) void verify(v); }}
            className="ol-field text-center font-mono text-xl tracking-[0.5em] indent-[0.5em] tabular-nums" placeholder="••••••" inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.95rem]">
          <button type="button" onClick={() => { setSentTo(null); setCode(""); setError(null); }} className="font-semibold text-(--fg) underline underline-offset-4">
            Change {channel === "phone" ? "number" : "email"}
          </button>
          <button type="button" onClick={() => void send()} disabled={wait > 0 || busy} className="font-semibold text-(--fg) underline underline-offset-4 disabled:text-(--soft) disabled:no-underline">
            {wait > 0 ? `Send again in ${wait}s` : "Send the code again"}
          </button>
        </div>
      </>}

      {way === "password" && <>
        <p className="ol-lead mt-1.5 text-[0.98rem]">Use the email or mobile number and the password from your application.</p>
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="ol-label mb-2 block text-base">Email or mobile number</span>
            <input ref={first} value={login} onChange={e => { setLogin(e.target.value); setError(null); }} className="ol-field" placeholder="you@business.com or 98XXXXXXXX"
              autoComplete="username" autoCapitalize="none" spellCheck={false} inputMode="email" />
          </label>
          <label className="block">
            <span className="ol-label mb-2 block text-base">Password</span>
            <span className="relative block">
              <input type={show ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(null); }} className="ol-field pr-14"
                placeholder="Your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShow(x => !x)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-(--soft) hover:text-(--fg)">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </span>
          </label>
        </div>
      </>}

      {error && <p role="alert" className="ol-card is-error mt-5 px-4 py-2.5 text-[0.95rem] font-semibold">{error}</p>}
      <button type="submit" disabled={busy} className="ol-pill mt-6 w-full">
        {busy ? (way === "code" && !sentTo ? "Sending…" : "Signing in…") : way === "code" && !sentTo ? "Send code" : "Sign in"}
        {!busy && <ArrowRight className="size-5" aria-hidden />}
      </button>

      <div className="mt-5 flex items-center gap-3 text-sm text-(--soft)" aria-hidden><span className="h-px flex-1 bg-(--line)" />or<span className="h-px flex-1 bg-(--line)" /></div>
      <button type="button" onClick={() => switchWay(way === "code" ? "password" : "code")} className="ol-pill is-quiet mt-5 w-full">
        {way === "code" ? "Sign in with password" : "Sign in with a code"}
      </button>

      <p className="mt-6 border-t border-(--line) pt-5 text-[0.95rem] text-(--soft)">
        New to OneLocal? <Link href="/join" className="font-semibold text-(--fg) underline underline-offset-4">Apply to become a partner</Link>
      </p>
    </form>
  );
}
