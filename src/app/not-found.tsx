import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell centred>
      <h1 className="ol-display text-[clamp(2.2rem,6vw,3.75rem)]">This page took a wrong turn.</h1>
      <p className="mt-4 text-lg text-(--ink-soft)">The link may be old or mistyped.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="ol-pill">Go home</Link>
        <Link href="/join" className="ol-pill is-quiet">Become a partner</Link>
      </div>
    </PageShell>
  );
}
