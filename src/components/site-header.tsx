import Link from "next/link";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="OneLocal partners home" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-7 w-auto" />
          <span className="hidden rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:inline">Partners</span>
        </Link>
        {cta && (
          <Link href="/join" className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-sm font-bold whitespace-nowrap text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97] sm:px-5">
            <span className="sm:hidden">Join now</span><span className="hidden sm:inline">Become a partner</span>
          </Link>
        )}
      </div>
    </header>
  );
}
