"use client";

// The partner website's home page: one flat colour field and one idea per screen, like an onboarding flow.
// Words come from src/lib/landing-copy.ts in English, Hindi and Hinglish (the same choice Ol the mascot uses).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, BadgeCheck, Bike, Check, CircleHelp, FileText, HeartHandshake, Landmark, Layers, MapPin, MonitorSmartphone, Plus, Receipt, Rocket, ScanBarcode, ShieldCheck, ShoppingBag, Star, Store, Sunrise } from "lucide-react";
import { useMascot } from "@/components/mascot";
import { LANDING, LANG_LABEL, type LandingCopy } from "@/lib/landing-copy";
import type { OlLang } from "@/lib/ol-lines";
import { Journey, MOOD, STOPS } from "./journey";

const EASE = [0.16, 1, 0.3, 1] as const;
// The join flow reads this once and fills the business name with it.
export const PREFILL_KEY = "onelocal.join-prefill";
const LANGS: OlLang[] = ["en", "hi", "hinglish"];
const LANE_ART = ["/onboarding/stores/grocery-and-daily-needs-grocery.webp", "/onboarding/stores/grocery-and-daily-needs-bakery-and-sweets.webp", "/onboarding/stores/service-health.webp"];

// Small icons that sit beside the words in the lower sections, in the order the copy lists them.
const ECO_ICONS = [ShoppingBag, Store, Bike, ShieldCheck];
const WHY_ICONS = [MapPin, Layers, Bike, Star, HeartHandshake];
const STEP_ICONS = [FileText, BadgeCheck, ScanBarcode, Rocket];
const BETTER_ICONS = [Layers, Receipt, MonitorSmartphone, Sunrise];

// A small, slightly tilted phone screen, used as a quiet picture beside a section.
function MiniShot({ src, alt, tilt }: { src: string; alt: string; tilt: number }) {
  return (
    <div className="ol-mini" style={{ rotate: `${tilt}deg` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="size-full object-cover object-top" />
    </div>
  );
}

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

// Jump to one of the journey's stops (1 customer app, 2 Partner POS, 3 rider app).
function goToStop(stop: number) {
  const el = document.getElementById("journey");
  if (!el) return;
  const top = el.offsetTop + ((stop + 0.2) / STOPS) * (el.offsetHeight - window.innerHeight);
  if (scroller.lenis) scroller.lenis.scrollTo(top, { duration: 1.2 }); else window.scrollTo({ top });
}

// A slim bar of frosted glass. While the journey is on screen it takes the journey's mood and carries the three
// apps as chapters: the yellow marker slides to the one being shown, and each can be clicked to jump there.
function Header({ t, chapters, stop, lang, setLang }: { t: LandingCopy["nav"]; chapters: string[]; stop: number | null; lang: OlLang; setLang: (l: OlLang) => void }) {
  const tone = stop === null ? "mint" : MOOD[stop];
  const dark = tone === "forest";
  const active = stop === null ? -1 : Math.min(stop, 3) - 1;
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3">
      <div className="ol-glass mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full pr-1.5 pl-4" data-tone={tone}>
        <Link href="/" aria-label="OneLocal partners home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dark ? "/brand/onelocal-logo-on-dark.png" : "/brand/onelocal-logo.png"} alt="OneLocal" className="h-5 w-auto sm:h-6" />
        </Link>
        <nav aria-label="The three apps" className={`hidden items-center transition-opacity duration-500 md:flex ${stop === null ? "pointer-events-none opacity-0" : ""}`}>
          {chapters.map((c, i) => (
            <button key={c} type="button" onClick={() => goToStop(i + 1)} aria-current={active === i ? "step" : undefined} tabIndex={stop === null ? -1 : 0} className="ol-bar-tab">
              {active === i && <motion.span layoutId="ol-chapter" className="absolute inset-0 rounded-full border-[2.5px] border-(--ink) bg-[#ffe44d]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative transition-colors duration-300" style={{ color: active === i ? "var(--ink)" : undefined }}>{c}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <div role="group" aria-label="Language" className="flex text-sm font-bold">
            {LANGS.map(l => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l === "hi" ? "hi" : undefined}
                className="rounded-full px-2.5 py-1 transition-colors duration-200"
                style={lang === l ? { background: "var(--chip-on)", color: "var(--chip-on-text)" } : { color: "var(--soft)" }}>{LANG_LABEL[l]}</button>
            ))}
          </div>
          <Link href="/dashboard" className="shrink-0 rounded-full px-2.5 py-1 text-sm font-bold" style={{ color: "var(--soft)" }}>{t.signIn}</Link>
          <span className="hidden sm:block"><Link href="/join" className="ol-bar-cta">{t.cta}</Link></span>
        </div>
      </div>
    </header>
  );
}

// The first question of the application, asked right on the page. The answer travels into the join flow.
function Ask({ t, value, onValue, id, pop = false }: { t: LandingCopy["hero"]; value: string; onValue: (v: string) => void; id: string; pop?: boolean }) {
  const router = useRouter();
  return (
    <form className="max-w-md" onSubmit={e => {
      e.preventDefault();
      try { if (value.trim()) sessionStorage.setItem(PREFILL_KEY, value.trim().slice(0, 80)); } catch { /* storage blocked: the form simply starts empty */ }
      router.push("/join");
    }}>
      <label htmlFor={id} className={pop ? "ol-pop-say block text-lg sm:text-xl" : "ol-display block text-2xl sm:text-[1.75rem]"} style={pop ? undefined : { fontWeight: 500 }}>{t.ask}</label>
      <input id={id} className={pop ? "ol-pop-ask mt-3.5" : "ol-ask mt-3"} value={value} onChange={e => onValue(e.target.value)} placeholder={t.placeholder} autoComplete="organization" maxLength={80} enterKeyHint="next" />
      <button type="submit" className={`ol-pill mt-5 w-full sm:w-auto sm:min-w-56 ${pop ? "is-pop" : "mt-6"}`}>{t.next}<ArrowRight className="size-5" aria-hidden /></button>
    </form>
  );
}

function Ecosystem({ t }: { t: LandingCopy["eco"] }) {
  return (
    <section className="on-forest ol-dots bg-(--forest) text-(--mint)">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-32 lg:px-10">
        <h2 className="ol-display text-[clamp(2.4rem,6vw,4.75rem)]">{t.title}</h2>
        <p className="mt-4 max-w-xl text-lg text-(--on-forest-soft) md:text-xl">{t.intro}</p>
        <ul className="mt-12 md:mt-16">
          {t.parts.map((p, i) => { const Icon = ECO_ICONS[i]; return (
            <li key={p.name} className="grid gap-x-10 gap-y-1 border-t border-(--forest-2) py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:py-8">
              <p className={`ol-display flex items-center gap-4 text-3xl md:text-4xl ${i === 1 ? "text-(--lime)" : ""}`}><span className={`ol-ico ${i === 1 ? "" : "is-forest"}`}><Icon aria-hidden /></span>{p.name}</p>
              <p className="text-lg text-(--on-forest-soft) md:pt-2.5">{p.line}</p>
            </li>
          ); })}
        </ul>
        <p className="ol-script mt-10 text-3xl text-(--lime) md:text-4xl">{t.close}</p>
      </div>
    </section>
  );
}

// The title and a small app screen stay pinned while the reasons scroll past. The reason crossing the middle of
// the screen is lit; the others wait dimmed. An IntersectionObserver does the watching, so scrolling stays cheap.
function Why({ t }: { t: LandingCopy["why"] }) {
  const [lit, setLit] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const items = [...(list.current?.children ?? [])];
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setLit(items.indexOf(e.target));
    }, { rootMargin: "-48% 0px -48% 0px" });
    items.forEach(i => io.observe(i));
    return () => io.disconnect();
  }, []);
  return (
    <section className="ol-dots bg-(--mint)">
      <div className="relative mx-auto grid max-w-6xl gap-x-16 gap-y-10 px-6 py-16 md:py-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:px-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="ol-display text-[clamp(2.2rem,5vw,4rem)]">{t.title}</h2>
          <div className="mt-10 hidden lg:block"><MiniShot src="/shots/customer-home.jpg" alt="The One Local customer app" tilt={-4} /></div>
        </div>
        <ul ref={list}>
          {t.points.map((p, i) => { const Icon = WHY_ICONS[i]; return (
            <li key={p.head} className={`ol-why grid grid-cols-[auto_1fr] gap-x-5 py-7 lg:py-14 ${lit === i ? "is-lit" : ""}`}>
              <span className="ol-ico mt-0.5"><Icon aria-hidden /></span>
              <div>
                <p className="ol-display text-2xl md:text-4xl">{p.head}</p>
                <p className="mt-2 max-w-[52ch] text-lg text-(--ink-soft) md:text-xl">{p.body}</p>
              </div>
            </li>
          ); })}
        </ul>
      </div>
    </section>
  );
}

// The four steps, drawn like the progress line of the application itself.
function Steps({ t, cta }: { t: LandingCopy["join"]; cta: string }) {
  return (
    <section className="ol-dots bg-(--lime)">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-32 lg:px-10">
        <h2 className="ol-display max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">{t.title}</h2>
        <ol className="relative mt-14 grid gap-y-10 md:grid-cols-4 md:gap-x-8">
          {t.steps.map((s, i) => { const Icon = STEP_ICONS[i]; return (
            <li key={s.head} className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 md:block">
              {i < t.steps.length - 1 && <span aria-hidden className="absolute top-10 -bottom-10 left-[1.2rem] w-0.5 bg-(--ink) md:top-[1.2rem] md:-right-8 md:bottom-auto md:left-10 md:h-0.5 md:w-auto" />}
              <span className="ol-display relative grid size-10 place-items-center rounded-full bg-(--ink) text-lg text-(--lime) tabular-nums">{i + 1}</span>
              <div>
                <p className="ol-display flex items-center gap-2.5 text-2xl md:mt-5">{s.head}<Icon className="size-5 shrink-0 text-(--ink-soft)" aria-hidden /></p>
                <p className="mt-1.5 text-(--ink-soft)">{s.body}</p>
              </div>
            </li>
          ); })}
        </ol>
        <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-(--ink-soft)">{t.note}</p>
          <Link href="/join" className="ol-pill shrink-0">{cta}<ArrowRight className="size-5" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}

function Pos({ t }: { t: LandingCopy["pos"] }) {
  const [lane, setLane] = useState(0);
  const l = t.lanes[lane];
  return (
    <section className="ol-dots bg-(--mint)">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-32 lg:px-10">
        <div className="absolute top-24 right-10 hidden lg:block"><MiniShot src="/shots/pos-home.jpg" alt="The Partner POS home screen" tilt={5} /></div>
        <h2 className="ol-display max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">{t.title}</h2>
        <p className="mt-3 text-lg text-(--ink-soft) md:text-xl">{t.intro}</p>
        <div role="tablist" aria-label={t.intro} className="mt-9 inline-flex rounded-full bg-(--mint-2) p-1.5">
          {t.lanes.map((x, i) => (
            <button key={x.name} role="tab" type="button" aria-selected={lane === i} onClick={() => setLane(i)}
              className={`ol-display rounded-full px-5 py-2.5 text-lg transition-colors duration-200 sm:px-7 ${lane === i ? "bg-(--ink) text-(--lime)" : "text-(--ink-soft) hover:text-(--ink)"}`}>{x.name}</button>
          ))}
        </div>
        <div role="tabpanel" className="mt-8 grid items-center gap-x-14 gap-y-6 md:grid-cols-2 lg:pr-56">
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[520px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={lane} src={LANE_ART[lane]} alt="" loading="lazy" className="absolute inset-0 size-full object-contain"
                initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease: EASE }} />
            </AnimatePresence>
          </div>
          <div>
            <p className="text-lg text-(--ink-soft)">{l.forWho}</p>
            <ul className="mt-5 space-y-4">
              {l.points.map(p => (
                <li key={p} className="ol-display flex items-center gap-3.5 text-2xl md:text-3xl">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--lime)"><Check className="size-5" strokeWidth={3} aria-hidden /></span>{p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-20 grid gap-x-16 gap-y-12 border-t border-(--mint-2) pt-14 md:grid-cols-2">
          <div>
            <h3 className="ol-display text-2xl md:text-3xl">{t.betterTitle}</h3>
            <ul className="mt-5 space-y-3 text-lg text-(--ink-soft)">
              {t.better.map((b, i) => { const Icon = BETTER_ICONS[i]; return <li key={b} className="flex gap-3"><Icon className="mt-1 size-5 shrink-0 text-(--ink)" aria-hidden />{b}</li>; })}
            </ul>
          </div>
          <div>
            <h3 className="ol-display text-2xl md:text-3xl">{t.plansTitle}</h3>
            <dl className="mt-5">
              {t.plans.map(p => (
                <div key={p.name} className="flex flex-col gap-x-6 border-b border-(--mint-2) py-3.5 sm:flex-row sm:items-baseline">
                  <dt className="ol-display shrink-0 text-xl sm:w-56">{p.name}</dt><dd className="text-(--ink-soft)">{p.line}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-(--ink-soft)">{t.plansNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Two weeks side by side: the week you sell, then the Wednesday it is paid.
function Pay({ t }: { t: LandingCopy["pay"] }) {
  return (
    <section className="on-forest ol-dots bg-(--forest) text-(--mint)">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-32 lg:px-10">
        <span className="ol-ico mb-6"><Landmark aria-hidden /></span>
        <h2 className="ol-display text-[clamp(2.4rem,7vw,5.5rem)]">{t.title} <span className="text-(--lime)">{t.day}</span></h2>
        <p className="mt-5 max-w-xl text-lg text-(--on-forest-soft) md:text-xl">{t.body}</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-10">
          {[0, 1].map(week => (
            <div key={week}>
              <p className="mb-3 text-sm font-semibold text-(--on-forest-soft)">{week === 0 ? t.weekLabel : t.paidLabel}</p>
              <ol className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                {t.days.map((d, i) => {
                  const paid = week === 1 && i === 2;
                  return (
                    <motion.li key={i} className={`ol-display grid aspect-square place-items-center rounded-2xl text-base sm:text-xl ${week === 0 ? "bg-(--forest-2) text-(--lime)" : paid ? "bg-(--lime) text-(--ink)" : "border border-(--forest-2) text-(--on-forest-soft)"}`}
                      initial={paid ? { scale: 0.7 } : false} whileInView={paid ? { scale: 1 } : undefined} viewport={{ once: true, amount: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.25 }}>
                      {paid ? <span className="grid place-items-center leading-none">{d}<Check className="mt-0.5 size-4" strokeWidth={3} aria-hidden /></span> : d}
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ t }: { t: LandingCopy["faq"] }) {
  return (
    <section className="ol-dots bg-(--mint)">
      <div className="ol-faq relative mx-auto grid max-w-6xl gap-x-16 gap-y-8 px-6 py-16 md:py-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:px-10">
        <div><span className="ol-ico mb-6"><CircleHelp aria-hidden /></span><h2 className="ol-display text-[clamp(2.2rem,5vw,4rem)]">{t.title}</h2></div>
        <div>
          {t.items.map(f => (
            <details key={f.q} className="border-b border-(--mint-2)">
              <summary className="ol-display flex items-center justify-between gap-4 py-5 text-xl md:text-2xl">{f.q}<span className="ol-plus grid size-9 shrink-0 place-items-center rounded-full bg-(--lime)"><Plus className="size-5" aria-hidden /></span></summary>
              <p className="max-w-[60ch] pb-6 text-lg text-(--ink-soft)">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close({ t, hero, shop, setShop }: { t: LandingCopy["end"]; hero: LandingCopy["hero"]; shop: string; setShop: (v: string) => void }) {
  return (
    <section className="overflow-hidden bg-(--lime)">
      <div className="mx-auto grid max-w-6xl items-center gap-x-10 gap-y-8 px-6 py-16 md:py-32 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        <div>
          <p className="ol-script text-3xl sm:text-4xl" style={{ transform: "rotate(-3deg)", transformOrigin: "left center" }}>{t.hello}</p>
          <h2 className="ol-display mt-4 text-[clamp(2.4rem,6vw,4.75rem)]">{t.title}</h2>
          <p className="mt-4 text-lg text-(--ink-soft)">{t.sub}</p>
          <div className="mt-9"><Ask t={hero} value={shop} onValue={setShop} id="shop-name-end" /></div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/onboarding/stores/default-shop.webp" alt="" loading="lazy" width={900} height={642} className="mx-auto w-full max-w-[460px]" />
      </div>
    </section>
  );
}

function Footer({ t }: { t: LandingCopy["foot"] }) {
  return (
    <footer className="on-forest bg-(--forest) text-(--on-forest-soft)">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:pb-28 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-6 w-auto" />
          <span>© 2026 · {t.made}</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-(--mint)">{t.privacy}</Link>
          <Link href="/terms" className="hover:text-(--mint)">{t.terms}</Link>
          <Link href="/delete-account" className="hover:text-(--mint)">{t.del}</Link>
          <Link href="/source" className="hover:text-(--mint)">{t.source}</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing({ fonts }: { fonts: string }) {
  const { lang, setLang } = useMascot();
  const t = LANDING[lang] ?? LANDING.en;
  const [shop, setShop] = useState("");
  const [stop, setStop] = useState<number | null>(0);
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <div className={`ol-landing ${fonts}`} lang={lang === "hi" ? "hi" : "en"}>
        <Header t={t.nav} chapters={t.journey.chapters} stop={stop} lang={lang} setLang={setLang} />
        <main>
          <Journey t={t.journey} hero={t.hero} cta={t.nav.cta} onStop={setStop} ask={<Ask t={t.hero} value={shop} onValue={setShop} id="shop-name" pop />} />
          <Ecosystem t={t.eco} />
          <Why t={t.why} />
          <Steps t={t.join} cta={t.nav.cta} />
          <Pos t={t.pos} />
          <Pay t={t.pay} />
          <Faq t={t.faq} />
          <Close t={t.end} hero={t.hero} shop={shop} setShop={setShop} />
        </main>
        <Footer t={t.foot} />
      </div>
    </MotionConfig>
  );
}
