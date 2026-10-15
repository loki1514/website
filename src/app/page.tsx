import Link from "next/link";
import { Bell, Check, Printer, Smartphone } from "lucide-react";
import { Marquee } from "@/components/marquee";
import { Accordion } from "@/components/accordion";
import { SiteHeader } from "@/components/site-header";
import { LoopVideo, Phone } from "@/components/media";
import { PARTNERS } from "@/lib/partners";
import { DotGrid } from "@/components/dot-grid";
import { WordRotator } from "@/components/word-rotator";
import { TiltCard } from "@/components/tilt-card";
import { WordReveal } from "@/components/word-reveal";
import { StickyStack } from "@/components/sticky-stack";
import { SwipeDeck } from "@/components/swipe-deck";
import { DemoOrder, MagneticCta } from "@/components/interactive";

const STEPS = [
  { title: "Apply in 2 minutes", body: "Tell us about your business. No documents needed to start.", image: "/photo/step-apply.webp" },
  { title: "We call and verify", body: "Our Latur team checks your details and sets up your menu with you.", image: "/photo/market.jpg" },
  { title: "Go live on OneLocal", body: "Your store appears in the app and orders reach your partner app.", image: "/photo/step-live.webp" },
];

const FAQ = [
  { question: "Who can join?", answer: "Restaurants, cloud kitchens, cafés and bakeries, sweet shops, grocers and supermarkets, pharmacies, beauty and retail stores in Latur." },
  { question: "What do I need to apply?", answer: "Just your business name, address and a mobile number. GSTIN and FSSAI help us go faster, and food businesses will need FSSAI before going live." },
  { question: "What does it cost?", answer: "Our team explains the plans and fees on the call, before you sign anything." },
  { question: "When do I get paid?", answer: "Payout timing is confirmed with you during onboarding." },
  { question: "Can I use my own delivery staff?", answer: "Yes. Tell us in the form, and you can still call OneLocal riders when you need them." },
];

// Direct APK download for the VINII Partner app: the newest release in the releases-only repo (no source code there).
const PARTNER_APP_APK = "https://github.com/proviyaaretailtech/vinii-partner-releases/releases/latest/download/vinii-partner.apk";

function Cta({ children = "Apply in 2 minutes", dark = false }: { children?: React.ReactNode; dark?: boolean }) {
  return (
    <Link href="/join" className={dark
      ? "inline-flex items-center gap-2 rounded-full bg-neutral-950 px-7 py-4 text-base font-extrabold text-primary transition-transform hover:scale-[1.03] active:scale-[0.97]"
      : "neon-glow inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-extrabold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]"}>
      {children}<span aria-hidden>→</span>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <SiteHeader />
      <main>
        {/* Hero: words on the left, a wall of food moving on the right with the real app in front. */}
        <section className="relative isolate" data-mascot-tip="Hi, I’m Ol! Sign up takes 2 minutes and needs no documents.">
          <DotGrid className="absolute inset-0 -z-10 aspect-auto h-full w-full rounded-none bg-transparent opacity-70 shadow-none" />
          <div className="pointer-events-none absolute -top-40 right-[-10%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,oklch(0.9_0.24_128/0.18),transparent)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />Now onboarding in Latur
              </p>
              <h1 className="mt-6 text-[clamp(2.8rem,6.8vw,5.6rem)] leading-[0.92] font-extrabold tracking-[-0.05em]">
                Your <WordRotator words={["shop.", "kitchen.", "kirana.", "pharmacy.", "bakery.", "sweet shop."]} interval={2200} /><br /><span className="neon">Every phone</span><br />in Latur.
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">Restaurants, kiranas, pharmacies and shops: take orders on OneLocal, the app your neighbourhood opens every day.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MagneticCta>Apply in 2 minutes →</MagneticCta>
                <a href="#try" className="rounded-full border border-white/15 px-6 py-4 text-base font-semibold transition-colors hover:bg-white/5">Try a demo order</a>
                <a href={PARTNER_APP_APK} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-base font-semibold transition-colors hover:bg-white/5">
                  <Smartphone className="size-5" aria-hidden /> Download Partner app
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Android · direct APK — tap “allow from this source” when your phone asks.</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex -space-x-3">
                  {PARTNERS.slice(0, 5).map(p => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.title} src={p.src} alt={p.title} title={p.title} className="size-11 rounded-full bg-white object-contain p-0.5 ring-2 ring-background" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Latur favourites</span> are already joining</p>
              </div>
            </div>

            <div className="relative mx-auto h-[540px] w-full max-w-[520px] [perspective:1400px] sm:h-[600px]">
              <div className="absolute inset-0 grid grid-cols-3 gap-3 [transform:rotateY(-14deg)_rotateX(6deg)] opacity-90">
                <div className="mt-16 overflow-hidden rounded-3xl"><LoopVideo src="/video/tomato.mp4" /></div>
                <div className="overflow-hidden rounded-3xl"><LoopVideo src="/video/pasta.mp4" /></div>
                <div className="mt-28 overflow-hidden rounded-3xl"><LoopVideo src="/video/dairy.mp4" /></div>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-background via-background/10 to-transparent" />
              <div className="absolute bottom-0 left-1/2 w-[230px] -translate-x-1/2 sm:w-[255px]"><TiltCard className="rounded-[2.6rem]"><Phone video="/video/app-demo.mp4" alt="The OneLocal app in action" /></TiltCard></div>
            </div>
          </div>
        </section>

        {/* Partner logos, big and moving. */}
        <section data-mascot-tip="These Latur favourites are joining OneLocal. You can be next!" aria-label="Businesses on OneLocal" className="border-y border-white/5 bg-white/[0.02] py-8">
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-[logos_38s_linear_infinite] gap-5 motion-reduce:animate-none">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <div key={i} className="flex h-24 w-44 items-center justify-center rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={i < PARTNERS.length ? p.title : ""} className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-24 lg:grid-cols-[1.1fr_1fr]">
          <WordReveal className="text-[clamp(1.8rem,3.4vw,2.9rem)] leading-[1.15] font-extrabold tracking-[-0.03em]"
            text="Every evening Latur decides what to eat, what to buy and where to get it. OneLocal puts your shop right inside that moment, on every phone in the city." />
          {/* The three things in that sentence, as pictures. */}
          <div className="grid h-[380px] grid-cols-2 grid-rows-2 gap-3 sm:h-[420px]">
            {[
              { src: "/photo/collage-eat.webp", caption: "What to eat", span: "row-span-2" },
              { src: "/photo/collage-buy.webp", caption: "What to buy", span: "" },
              { src: "/photo/collage-app.webp", caption: "Where to get it: OneLocal", span: "" },
            ].map(c => (
              <figure key={c.caption} className={`relative overflow-hidden rounded-3xl border border-white/10 ${c.span}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <figcaption className="absolute bottom-3 left-4 pr-3 text-sm font-bold text-white">{c.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* What partners get: a bento with the real app, video and plain promises. */}
        <section data-mascot-tip="Your store shows up right inside the app people already use." id="see" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">Why OneLocal</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Everything you need to sell online, <span className="neon">in one place.</span></h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-6 lg:grid-rows-[280px_280px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[oklch(0.25_0.06_140)] to-card p-8 lg:col-span-3 lg:row-span-2">
              <h3 className="max-w-xs text-2xl font-bold">Your store, inside the app Latur already uses</h3>
              <p className="mt-2 max-w-xs text-muted-foreground">Your logo, menu and offers in front of customers on the food, grocery and pharmacy screens.</p>
              <Phone src="/shots/app-receipt.webp" alt="A brand's coming-soon card in the OneLocal app" className="absolute -bottom-36 left-[8%] w-[190px] rotate-[6deg] opacity-95 lg:right-[15.5rem] lg:left-auto" />
              <Phone src="/shots/app-food.webp" alt="A store's logo row in the OneLocal app" className="absolute -bottom-24 right-[6%] w-[230px] rotate-[-4deg] lg:right-8" />
              <div className="h-[380px] lg:h-0" />
            </div>
            {/* Orders straight to your counter: what rings, and the kitchen ticket that prints. */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[oklch(0.22_0.05_150)] to-card p-7 sm:min-h-[280px] lg:col-span-3">
              <div className="max-w-[15rem]">
                <h3 className="text-2xl font-bold">Orders straight to your counter</h3>
                <p className="mt-1 text-muted-foreground">New orders ring on the VINII Partner app and POS, with the kitchen ticket ready.</p>
              </div>
              <div className="relative mt-6 h-[250px] w-full max-w-[290px] sm:absolute sm:top-5 sm:right-6 sm:mt-0 sm:w-[290px]" aria-hidden>
                {/* The kitchen ticket slides out from under the order, like it is printing. */}
                <div className="absolute top-[146px] right-7 z-0 w-[150px] rotate-[-3deg] bg-[#f7f1e1] px-3.5 pt-2.5 pb-5 font-mono text-[10px] leading-snug text-neutral-800 shadow-[0_16px_36px_rgba(0,0,0,0.5)] [clip-path:polygon(0_0,100%_0,100%_calc(100%-6px),94%_100%,88%_calc(100%-6px),82%_100%,76%_calc(100%-6px),70%_100%,64%_calc(100%-6px),58%_100%,52%_calc(100%-6px),46%_100%,40%_calc(100%-6px),34%_100%,28%_calc(100%-6px),22%_100%,16%_calc(100%-6px),10%_100%,4%_calc(100%-6px),0_100%)]">
                  <p className="flex items-center justify-between font-bold"><span>KITCHEN TICKET</span><Printer className="size-3" /></p>
                  <p className="border-b border-dashed border-neutral-400 pb-1">Order OL-00042</p>
                  <p className="mt-1">2 × Cheeseburger</p>
                  <p>1 × Cheese Fries</p>
                </div>
                <div className="absolute top-0 right-0 z-10 w-[250px] rounded-2xl bg-white p-3.5 text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-[oklch(0.9_0.24_128)] [animation:bell-ring_2.4s_ease-in-out_infinite] motion-reduce:animate-none"><Bell className="size-4" /></span>
                    <div><p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">New order</p><p className="text-sm font-extrabold">₹ 468 · 3 items</p></div>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">2 × Classic Cheeseburger, 1 × Loaded Cheese Fries</p>
                  <div className="mt-2.5 flex h-8 items-center justify-center gap-1.5 rounded-xl bg-neutral-950 text-sm font-extrabold text-[oklch(0.9_0.24_128)]"><Check className="size-4" />Accept order</div>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-card p-7 lg:col-span-2">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground">🛵</div>
              <h3 className="mt-6 text-xl font-bold">Your riders or ours</h3>
              <p className="mt-1 text-muted-foreground">Deliver yourself, or call a OneLocal rider for any order.</p>
            </div>
            <div className="rounded-[2rem] bg-primary p-7 text-primary-foreground lg:col-span-1">
              <p className="text-5xl font-black tracking-tighter">₹</p>
              <h3 className="mt-6 text-lg leading-tight font-extrabold">Money to your bank</h3>
            </div>
          </div>
        </section>

        <section data-mascot-tip="Go on, tap Accept order. I love this part!" id="try" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24"><DemoOrder /></section>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-24 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-widest text-primary uppercase">Swipe it</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">All day, Latur is <span className="neon">craving something.</span></h2>
            <p className="mt-4 max-w-md text-muted-foreground">Flick the cards. Each one is a moment a customer could be ordering from you.</p>
          </div>
          <div className="flex justify-center"><SwipeDeck cards={[
            { title: "7 am · Milk, bread & eggs", note: "The morning rush before school and office", image: "/photo/swipe-milk.webp" },
            { title: "11 am · Weekly kirana", note: "Atta, dal, oil, delivered before lunch", image: "/photo/swipe-kirana.webp" },
            { title: "2 pm · Medicines", note: "The pharmacy order that cannot wait", image: "/photo/swipe-medicine.webp" },
            { title: "6 pm · Sweets & farsan", note: "Guests at home, something special", image: "/photo/swipe-sweets.webp", fit: "contain", backdrop: "linear-gradient(160deg, oklch(0.85 0.14 70), oklch(0.7 0.17 45))" },
            { title: "9 pm · Late-night cravings", note: "Hot, crisp and at the door", image: "/photo/swipe-latenight.webp" },
          ]} /></div>
        </section>

        <section className="border-y border-white/5 py-7">
          <Marquee label="What you can sell on OneLocal" speed={40} items={["Restaurants", "Cloud kitchens", "Cafés & bakeries", "Sweets & farsan", "Groceries", "Supermarkets", "Pharmacies", "Beauty & wellness", "Fashion & retail", "Thali & mess"]} />
        </section>

        <section data-mascot-tip="Three steps and you’re live. We call you after you apply." className="mx-auto max-w-3xl px-5 py-24">
          <StickyStack label="How to join OneLocal" items={STEPS.map(x => ({ title: x.title, text: x.body, image: x.image }))}
            heading={<><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Live in three steps.</h2><p className="text-sm text-muted-foreground">Scroll to stack them up.</p></>} />
        </section>

        {/* The closing moment: a street of local shops, and the rider who brings them to your door. */}
        <section className="border-t border-white/5" data-mascot-tip="Ready? It takes two minutes, and we call you after.">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <h2 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Latur is ordering. <span className="neon">Be the one they find.</span></h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Cta>Become a partner</Cta>
              <a href={PARTNER_APP_APK} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-base font-semibold transition-colors hover:bg-white/5">
                <Smartphone className="size-5" aria-hidden /> Already a partner? Get the app
              </a>
            </div>
            <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photo/onelocal-banner.webp" alt="A OneLocal rider shows the app in front of a street of neighbourhood shops: fruits and vegetables, daily needs, dairy, pharmacy, restaurant, café and bakery." className="h-auto w-full" />
            </div>
          </div>
        </section>

        <section data-mascot-tip="Still unsure? Our team explains fees on the call, before you sign anything." className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Questions partners ask</h2>
          <Accordion items={FAQ} />
        </section>
      </main>
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-muted-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-6 w-auto" />
          <span>© 2026 OneLocal · Made in Latur · <a href={process.env.NEXT_PUBLIC_SOURCE_URL ?? "/source"} className="underline underline-offset-2 hover:text-foreground">Source code (AGPL-3.0)</a></span>
        </div>
      </footer>
    </div>
  );
}
