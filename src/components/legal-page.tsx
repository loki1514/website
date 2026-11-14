import { PageShell } from "@/components/page-shell";
import { LEGAL } from "@/lib/legal";

// A policy page: a title, who it is from and when it changed, then the text. `.ol-prose` sets how the text reads.
export function LegalPage({ title, updated = LEGAL.updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <PageShell>
      <h1 className="ol-display text-[clamp(2.2rem,5vw,3.5rem)]">{title}</h1>
      <p className="mt-3 text-sm text-(--ink-soft)">{LEGAL.product} · {LEGAL.company} · Last updated {updated}</p>
      <div className="ol-prose mt-8">{children}</div>
    </PageShell>
  );
}
