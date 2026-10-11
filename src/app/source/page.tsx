import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

// AGPL-3.0: everyone who uses this website over the network may get its complete source code.
// The mascot comes from Bible Strong Avatar Lab (AGPL-3.0, github.com/smontlouis/bible-strong-avatar-lab).
export default function SourcePage() {
  const url = process.env.NEXT_PUBLIC_SOURCE_REPO;
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-20">
        <h1 className="text-4xl font-extrabold tracking-tight">Source code</h1>
        <p className="mt-4 text-muted-foreground">This website is free software, licensed under the GNU Affero General Public License v3.0. You can get, study, change and share its complete source code.</p>
        <p className="mt-4">{url ? <a className="font-semibold text-primary underline" href={url}>Download the source code</a> : <span className="text-muted-foreground">The public source repository will be linked here before the site goes live. Until then, write to the OneLocal team and we will send it.</span>}</p>
        <p className="mt-8 text-sm text-muted-foreground">Our mascot is built with <a className="underline" href="https://github.com/smontlouis/bible-strong-avatar-lab">Bible Strong Avatar Lab</a> by Stéphane Montlouis-Calixte (AGPL-3.0).</p>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-primary">← Home</Link>
      </main>
    </div>
  );
}
