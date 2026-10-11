import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="font-mono text-sm tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">This page took a wrong turn.</h1>
        <p className="mt-3 text-muted-foreground">The link may be old or mistyped. Ol can take you back.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Go home</Link>
          <Link href="/join" className="rounded-full border border-white/15 px-6 py-3 font-semibold">Become a partner</Link>
        </div>
      </main>
    </div>
  );
}
