"use client";

// The frame around the Partner app. The app is built for a phone's width, so on a wide screen it sits in a
// phone-shaped panel on the grass field, with a few quiet words beside it, instead of a lost strip in an empty
// page. On a phone it simply fills the screen. Everything inside the panel is the real app: its own sign-in, its
// own onboarding steps, its own POS.
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, RotateCw } from "lucide-react";
import { DitherField } from "@/components/landing/dither-field";

export function Dashboard({ appUrl, fonts }: { appUrl: string | null; fonts: string }) {
  const [loaded, setLoaded] = useState(false);
  const [round, setRound] = useState(0);
  return (
    <div className={`ol-landing ${fonts} relative h-svh overflow-hidden`}>
      <DitherField mood="mint" className="fixed inset-0 size-full max-md:hidden" />
      <div data-tone="mint" className="relative flex h-svh flex-col">
        <header className="z-10 px-3 pt-3 max-md:pb-2">
          <div className="ol-glass mx-auto flex h-12 max-w-5xl items-center gap-2 rounded-full pr-2 pl-1.5" data-tone="mint">
            <Link href="/" aria-label="Back to the website" className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/10"><ChevronLeft className="size-5" /></Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/onelocal-logo.png" alt="OneLocal" className="h-5 w-auto" />
            <span className="ol-display ml-1 truncate text-[0.95rem] text-(--ink-soft) max-sm:hidden">Partner dashboard</span>
            <span className="flex-1" />
            {appUrl && <>
              <button type="button" onClick={() => { setLoaded(false); setRound(n => n + 1); }} aria-label="Reload the dashboard" className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/10"><RotateCw className="size-4" /></button>
              <a href={appUrl} target="_blank" rel="noreferrer" className="ol-bar-cta max-sm:!px-3"><span className="max-sm:hidden">Open full screen</span><ArrowUpRight className="size-4 sm:ml-1.5" aria-hidden /></a>
            </>}
          </div>
        </header>

        <main className="mx-auto grid min-h-0 w-full max-w-5xl flex-1 items-center gap-x-12 md:grid-cols-[minmax(0,1fr)_auto] md:px-8 md:py-6">
          <div className="max-w-sm max-md:hidden">
            <h1 className="ol-display text-4xl leading-tight">Your shop, in one place.</h1>
            <ul className="mt-6 space-y-3 text-lg text-(--ink-soft)">
              <li>Finish your application here: PAN, documents, bank.</li>
              <li>Once our team approves you, your POS opens in the same place.</li>
              <li>Same login as the One Local Partner app on your phone.</li>
            </ul>
          </div>

          <div className="ol-appframe">
            {appUrl ? (
              <>
                {!loaded && <p className="absolute inset-0 grid place-items-center text-(--ink-soft)" role="status">Opening your dashboard…</p>}
                <iframe key={round} src={appUrl} title="One Local Partner dashboard" onLoad={() => setLoaded(true)}
                  allow="camera; microphone; geolocation; clipboard-read; clipboard-write" className="relative size-full border-0" />
              </>
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <p className="ol-display text-2xl">The dashboard isn&apos;t connected yet.</p>
                  <p className="mt-3 text-(--ink-soft)">Your application is safe. Our Latur team will call you, and you can use the One Local Partner app on your phone meanwhile.</p>
                  <Link href="/" className="ol-pill mt-6">Back to home</Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
