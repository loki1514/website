// The frame for the site's reading pages (privacy, terms, account deletion, source, email confirmation, not found):
// the same calm cream ground, slim glass bar and typefaces as the rest of the site, with none of the home page's show.
// These pages are for reading, so the lettering stays plain.
import "@/app/landing.css";
import Link from "next/link";
import { siteFonts } from "@/lib/site-fonts";

const LINKS = [["/privacy", "Privacy"], ["/terms", "Terms"], ["/delete-account", "Delete account"], ["/source", "Source code (AGPL-3.0)"]] as const;

export function PageShell({ children, centred = false }: { children: React.ReactNode; centred?: boolean }) {
  return (
    <div className={`ol-landing ${siteFonts} flex min-h-dvh flex-col`}>
      <div className="ol-dots flex flex-1 flex-col">
        <header data-tone="forest" className="sticky top-3 z-30 px-3">
          <div className="ol-glass ol-bar mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full pr-1.5 pl-4">
            <Link href="/" aria-label="OneLocal partners home" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-5 w-auto sm:h-6" />
            </Link>
            <div className="flex items-center gap-1.5">
              <Link href="/dashboard" className="ol-bar-link whitespace-nowrap max-[399px]:hidden">Sign in</Link>
              <Link href="/join" className="ol-bar-cta whitespace-nowrap">Become a partner</Link>
            </div>
          </div>
        </header>
        <main className={centred ? "relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-16 text-center" : "relative mx-auto w-full max-w-3xl flex-1 px-5 pt-14 pb-20 md:pt-20"}>{children}</main>
        <footer className="relative border-t border-(--line) px-5 py-8 text-sm text-(--soft)">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span>© 2026 OneLocal · Made in Latur</span>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">{LINKS.map(([href, label]) => <Link key={href} href={href} className="underline-offset-4 hover:text-(--ink) hover:underline">{label}</Link>)}</nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
