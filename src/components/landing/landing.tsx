"use client";

// The partner website's home page. Below the journey it follows the team's content document page by page, with the
// document's own words. Three sections carry a picture (the shop front, the market, the three apps); the two between
// them set their words out as a designed object instead: a quiet sheet, and two stops joined by a line.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { MotionConfig, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowRight, ClipboardList, LifeBuoy, Rocket, Route, TrendingUp } from "lucide-react";
import { useMascot } from "@/components/mascot";
import { LANDING, LANG_LABEL, type LandingCopy } from "@/lib/landing-copy";
import { LEGAL } from "@/lib/legal";
import { PARTNERS } from "@/lib/partners";
import type { OlLang } from "@/lib/ol-lines";
import { ContourField } from "./contour-field";
import { Journey, PLACE_ICONS, STOPS } from "./journey";

const EASE = [0.16, 1, 0.3, 1] as const;
const LANGS: OlLang[] = ["en", "hi", "hinglish"];
// The icon on each of the three stages of getting started, and on each kind of help.
const STAGE_ICONS = [ClipboardList, Rocket, TrendingUp];
const HELP_ICONS = [Route, LifeBuoy];
// The three apps of One Local: the customer's, the partner's (in front), the rider's. Captured from each app on main,
// running on the live server, on 18 Nov 2026.
const APPS = [
  { at: "left", src: "/shots/customer-app.jpg", alt: "The One Local customer app's home screen" },
  { at: "right", src: "/shots/rider-app.jpg", alt: "The One Local rider app's first screen" },
  { at: "front", src: "/shots/partner-app.jpg", alt: "The One Local Partner app's welcome screen: become a seller, or sign in" },
] as const;

const WRAP = "relative mx-auto max-w-6xl px-6 py-20 md:py-32 lg:px-10";
const H2 = "ol-display text-[clamp(2rem,4vw,3.1rem)]";

// Smooth scrolling for the whole page. Off for visitors who ask for less motion.
const scroller: { lenis: Lenis | null } = { lenis: null };
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    scroller.lenis = lenis;
    return () => { scroller.lenis = null; lenis.destroy(); };
  }, []);
}

// Jump to one of the journey's stops (1 stores, 2 restaurants, 3 services).
function goToStop(stop: number) {
  const el = document.getElementById("journey");
  if (!el) return;
  const top = el.offsetTop + ((stop + 0.2) / STOPS) * (el.offsetHeight - window.innerHeight);
  if (scroller.lenis) scroller.lenis.scrollTo(top, { duration: 1.2 }); else window.scrollTo({ top });
}

// One slim bar of dark green glass. While the journey is on screen it carries the three kinds of business as
// chapters: the marker slides to the one being shown, and each can be clicked to jump there.
function Header({ t, chapters, stop, lang, setLang }: { t: LandingCopy["nav"]; chapters: string[]; stop: number | null; lang: OlLang; setLang: (l: OlLang) => void }) {
  const active = stop === null ? -1 : stop - 1;
  return (
    <header data-tone="forest" className="fixed inset-x-0 top-3 z-40 px-3">
      <div className="ol-glass ol-bar mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full pr-1.5 pl-4">
        <Link href="/" aria-label="OneLocal partners home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-5 w-auto sm:h-6" />
        </Link>
        <nav aria-label="Kinds of business" className={`hidden items-center transition-opacity duration-500 md:flex ${stop === null ? "pointer-events-none opacity-0" : ""}`}>
          {chapters.map((c, i) => (
            <button key={c} type="button" onClick={() => goToStop(i + 1)} aria-current={active === i ? "step" : undefined} tabIndex={stop === null ? -1 : 0} className="ol-bar-tab">
              {active === i && <motion.span layoutId="ol-chapter" className="absolute inset-0 rounded-full bg-(--lime)" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <div role="group" aria-label="Language" className="flex">
            {LANGS.map(l => <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l === "hi" ? "hi" : undefined} className="ol-bar-link">{LANG_LABEL[l]}</button>)}
          </div>
          <Link href="/dashboard" className="ol-bar-link shrink-0 whitespace-nowrap">{t.signIn}</Link>
          <span className="hidden sm:block"><Link href="/join" className="ol-bar-cta">{t.cta}</Link></span>
        </div>
      </div>
    </header>
  );
}

// A phrase between *stars* is a key point: the page paints it in the ground's green.
const paint = (text: string) => text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));

// The words that open most sections: the title, and the line under it.
function Heading({ title, lead }: { title: string; lead: string }) {
  return <>
    <h2 className={H2}>{title}</h2>
    <p className="ol-display mt-4 text-xl text-(--em) md:text-2xl" style={{ fontWeight: 500, lineHeight: 1.25 }}>{lead}</p>
  </>;
}

// Page 2 of the document: the promise beside a local shop front, then the partners already on One Local, passing
// slowly across a band of the map.
function Together({ t }: { t: LandingCopy["together"] }) {
  // The row is laid out four times over and slides by half its length, so it loops without a seam on any screen.
  const row = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section data-tone="forest" className="ol-dots overflow-hidden bg-(--forest)">
      <div className={`${WRAP} grid items-center gap-x-16 gap-y-12 !pb-14 lg:grid-cols-[minmax(0,1fr)_auto] md:!pb-20`}>
        <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: EASE }}>
          <Heading title={t.title} lead={t.lead} />
          <p className="ol-display mt-8 max-w-[32ch] text-[clamp(1.45rem,2.5vw,2.05rem)]" style={{ fontWeight: 500, lineHeight: 1.3 }}>{t.body}</p>
          <p className="ol-lead mt-6 border-l-2 border-(--lime) pl-4 text-lg">{t.close}</p>
          <Link href="/join" className="ol-pill mt-8">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </motion.div>
        <motion.div className="ol-photo" initial={{ y: 28 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photo/shop-front.jpg" alt="A local shop front in the city, with customers at its door" loading="lazy" width={341} height={510} />
        </motion.div>
      </div>
      <div className="ol-partners" role="group" aria-label="Partners on OneLocal">
        <ContourField still className="ol-partners-map" />
        <ul>
          {row.map((x, i) => (
            <li key={i} aria-hidden={i >= PARTNERS.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.src} alt={x.title} loading="lazy" width={256} height={256} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Page 3: one wide photograph, and under it the three kinds of business side by side.
function Place({ t }: { t: LandingCopy["place"] }) {
  return (
    <section data-tone="cream" className="bg-(--cream)">
      <div className={WRAP}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl"><Heading title={t.title} lead={t.lead} /></div>
          <Link href="/join" className="ol-pill shrink-0 self-start md:self-auto">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </div>
        <motion.div className="ol-slot is-wide mt-10 md:mt-12" initial={{ y: 24, scale: 0.985 }} whileInView={{ y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photo/market.jpg" alt="Shelves of fresh produce in a local shop" loading="lazy" className="size-full object-cover" />
        </motion.div>
        <ul className="ol-trio mt-10 md:mt-12">
          {t.lanes.map((l, i) => { const Icon = PLACE_ICONS[i]; return (
            <motion.li key={l.name} initial={{ y: 18 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}>
              <span className="ol-ico"><Icon aria-hidden /></span>
              <p className="ol-display mt-5 text-2xl md:text-3xl">{l.name}</p>
              <p className="ol-lead mt-2 text-lg">{l.line}</p>
            </motion.li>
          ); })}
        </ul>
      </div>
    </section>
  );
}

// Page 4: no picture. The two sentences about charges are set out as a quiet sheet: what you will see before you
// join, one thing to a line in large type, then the sentence about tools under a fine rule.
function Charges({ t }: { t: LandingCopy["charges"] }) {
  return (
    <section data-tone="cream" className="bg-(--cream-2)">
      <div className={`${WRAP} grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}>
        <div>
          <Heading title={t.title} lead={t.lead} />
          <Link href="/join" className="ol-pill mt-8">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </div>
        <motion.div className="ol-sheet" initial={{ y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }}>
          <ContourField mood="cream" still className="ol-sheet-map" />
          <p className="ol-lead relative text-lg">{t.see.lead}</p>
          <ul className="relative mt-5">
            {t.see.items.map(item => <li key={item} className="ol-display">{item}</li>)}
          </ul>
          <p className="ol-points relative mt-7 text-lg">
            {t.tools.lead} <em>{t.tools.items[0]}</em> {t.and} <em>{t.tools.items[1]}</em> {t.tools.tail}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Page 5: no picture. The two kinds of help stand as two stops joined by one fine line. The line fills as the section
// is scrolled through, and the second stop lights up when the line reaches it.
function Help({ t }: { t: LandingCopy["help"] }) {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.7", "end 0.65"] });
  // Eased, so the line glides instead of following every small movement of the scroll.
  const filled = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const [reached, setReached] = useState(false);
  useMotionValueEvent(filled, "change", v => setReached(v > 0.94));
  return (
    <section data-tone="forest" className="ol-dots bg-(--forest)">
      <div className={`${WRAP} grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading title={t.title} lead={t.lead} />
          <Link href="/join" className="ol-pill mt-8">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </div>
        <ol ref={list} className="ol-way">
          {t.points.map((p, i) => { const Icon = HELP_ICONS[i]; return (
            <li key={p} className={i === 0 || reached ? "is-on" : ""}>
              {/* The line runs from this stop down to the next one. */}
              {i < t.points.length - 1 && <span aria-hidden className="ol-way-line"><motion.i style={{ scaleY: filled }} /></span>}
              <span className="ol-ico"><Icon aria-hidden /></span>
              <p className="ol-display text-[clamp(1.35rem,2.2vw,1.8rem)]" style={{ fontWeight: 500, lineHeight: 1.3 }}>{paint(p)}</p>
            </li>
          ); })}
        </ol>
      </div>
    </section>
  );
}

// Page 6: the three apps of One Local on a piece of the map, the Partner app in front.
function Control({ t }: { t: LandingCopy["control"] }) {
  return (
    <section data-tone="cream" className="bg-(--cream)">
      <div className={`${WRAP} grid items-center gap-x-16 gap-y-12 lg:grid-cols-2`}>
        <motion.div className="lg:order-2" initial={{ y: 20 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: EASE }}>
          <Heading title={t.title} lead={t.lead} />
          <div className="ol-points mt-6 space-y-4 text-lg"><p>{paint(t.body)}</p><p>{paint(t.more)}</p></div>
          <Link href="/dashboard" className="ol-pill mt-8">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </motion.div>
        <div className="ol-slot is-apps lg:order-1">
          <ContourField mood="sage" still className="absolute inset-0 size-full" />
          {APPS.map((app, i) => (
            <motion.div key={app.src} className={`ol-app is-${app.at}`} initial={{ x: app.at === "left" ? 36 : app.at === "right" ? -36 : 0, y: 20 }} whileInView={{ x: 0, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.src} alt={app.alt} loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Page 7 of the document: the three stages, as three cards on the deep green map, and the two ways to begin.
function Start({ t }: { t: LandingCopy["start"] }) {
  return (
    <section data-tone="forest" className="relative isolate overflow-hidden bg-(--forest)">
      <ContourField className="absolute inset-0 -z-10 size-full" />
      <div className={`${WRAP} text-center`}>
        <h2 className={H2}>{t.title}</h2>
        <p className="ol-display mt-4 text-2xl text-(--em) md:text-3xl" style={{ fontWeight: 500, lineHeight: 1.2 }}>{t.tagline}</p>
        <p className="ol-lead mt-10 text-lg">{t.intro}</p>
        <ol className="mt-6 grid gap-4 text-left md:grid-cols-3 md:gap-5">
          {t.stages.map((s, i) => { const Icon = STAGE_ICONS[i]; return (
            <motion.li key={s.head} data-tone="cream" className="ol-stage-card" initial={{ y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}>
              <span className="flex items-center justify-between"><span className="ol-ico"><Icon aria-hidden /></span><span aria-hidden className="ol-display text-(--soft) tabular-nums">{i + 1} / {t.stages.length}</span></span>
              <p className="ol-display mt-8 text-2xl">{s.head}</p>
              <p className="ol-lead mt-2">{s.body}</p>
            </motion.li>
          ); })}
        </ol>
        <p className="ol-display mx-auto mt-14 max-w-2xl text-2xl md:text-3xl" style={{ fontWeight: 500, lineHeight: 1.2 }}>{t.close}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Link href="/join" className="ol-pill">{t.cta}<ArrowRight className="size-5" aria-hidden /></Link>
          <a href={`mailto:${LEGAL.contactEmail}?subject=${encodeURIComponent(t.demo)}`} className="ol-label underline decoration-(--em) decoration-2 underline-offset-[6px] hover:text-(--em)">{t.demo}</a>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: LandingCopy["foot"] }) {
  return (
    <footer data-tone="forest" className="bg-(--forest-deep) text-(--soft)">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between md:pb-28 lg:px-10">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-6 w-auto" />
          <span>© 2026 · {t.made}</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-(--fg)">{t.privacy}</Link>
          <Link href="/terms" className="hover:text-(--fg)">{t.terms}</Link>
          <Link href="/delete-account" className="hover:text-(--fg)">{t.del}</Link>
          <Link href="/source" className="hover:text-(--fg)">{t.source}</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing({ fonts }: { fonts: string }) {
  const { lang, setLang } = useMascot();
  const t = LANDING[lang] ?? LANDING.en;
  const [stop, setStop] = useState<number | null>(0);
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <div className={`ol-landing ${fonts}`} lang={lang === "hi" ? "hi" : "en"}>
        <Header t={t.nav} chapters={t.hero.lanes.map(l => l.name)} stop={stop} lang={lang} setLang={setLang} />
        <main>
          <Journey t={t.hero} cta={t.nav.cta} onStop={setStop} onJump={goToStop} />
          <Together t={t.together} />
          <Place t={t.place} />
          <Charges t={t.charges} />
          <Help t={t.help} />
          <Control t={t.control} />
          <Start t={t.start} />
        </main>
        <Footer t={t.foot} />
      </div>
    </MotionConfig>
  );
}
