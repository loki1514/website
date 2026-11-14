import Link from "next/link";
import { PageShell } from "@/components/page-shell";

// AGPL-3.0: everyone who uses this website over the network may get its complete source code.
// The mascot comes from Bible Strong Avatar Lab (AGPL-3.0, github.com/smontlouis/bible-strong-avatar-lab).
export default function SourcePage() {
  const url = process.env.NEXT_PUBLIC_SOURCE_REPO;
  return (
    <PageShell>
      <h1 className="ol-display text-[clamp(2.2rem,5vw,3.5rem)]">Source code</h1>
      <div className="ol-prose mt-6">
        <p>This website is free software, licensed under the GNU Affero General Public License v3.0. You can get, study, change and share its complete source code.</p>
        <p>{url ? <a href={url}>Download the source code</a> : <>The public source repository will be linked here before the site goes live. Until then, write to the OneLocal team and we will send it.</>}</p>
        <p className="text-sm">Our mascot is built with <a href="https://github.com/smontlouis/bible-strong-avatar-lab">Bible Strong Avatar Lab</a> by Stéphane Montlouis-Calixte (AGPL-3.0).</p>
      </div>
      <Link href="/" className="ol-pill mt-10">Back to home</Link>
    </PageShell>
  );
}
