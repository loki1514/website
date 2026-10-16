import { SiteHeader } from "@/components/site-header";
import { LEGAL } from "@/lib/legal";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 leading-relaxed text-foreground/90 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:mt-1.5 [&_p]:mt-3 [&_table]:mt-4 [&_table]:w-full [&_table]:text-left [&_table]:text-sm [&_td]:border-t [&_td]:border-white/10 [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_th]:pb-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{LEGAL.product} · {LEGAL.company} · Last updated {LEGAL.updated}</p>
        {children}
      </main>
    </div>
  );
}
