"use client";

// Partner sign-up: four short steps in one card that slides between them (motion from ui lab's multi-step-form),
// then a printed receipt with an APPLIED stamp and the reference. The One Local backend validates everything again
// (server/partner-applications.ts); this form only helps people get it right first time.
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FloatingLabel } from "@/components/floating-label";
import { RadioCards } from "@/components/radio-cards";
import { CheckboxGroup } from "@/components/checkbox-group";
import { MorphingButton } from "@/components/morphing-button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { API } from "@/lib/partners";
import { cn, randomKey } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;
const TYPES = [
  { value: "restaurant", title: "Restaurant", description: "Dine-in or delivery kitchen", price: "" },
  { value: "cloud_kitchen", title: "Cloud kitchen", description: "Delivery only", price: "" },
  { value: "cafe_bakery", title: "Café or bakery", description: "Coffee, cakes, breads", price: "" },
  { value: "sweets", title: "Sweets & farsan", description: "Mithai, namkeen", price: "" },
  { value: "grocery", title: "Grocery / kirana", description: "Daily needs", price: "" },
  { value: "supermarket", title: "Supermarket", description: "Large format store", price: "" },
  { value: "pharmacy", title: "Pharmacy", description: "Medicines and health", price: "" },
  { value: "beauty", title: "Beauty & wellness", description: "Cosmetics, salon products", price: "" },
  { value: "retail", title: "Retail shop", description: "Fashion, electronics, home", price: "" },
  { value: "other", title: "Something else", description: "Tell us in the notes", price: "" },
];
const SERVICES = [
  { id: "delivery", label: "Home delivery" },
  { id: "pickup", label: "Pickup from my store" },
  { id: "dine_in", label: "Dine-in" },
];
const STEPS = ["Your business", "Where you are", "About you", "Licences & services"] as const;

type Form = {
  business_name: string; business_type: string; outlets: string; address: string; pin_code: string;
  owner_name: string; phone: string; email: string; whatsapp_ok: boolean; gstin: string; fssai: string;
  services: string[]; own_delivery: boolean; notes: string; consent: boolean;
};
const EMPTY: Form = { business_name: "", business_type: "restaurant", outlets: "1", address: "", pin_code: "", owner_name: "", phone: "", email: "", whatsapp_ok: true, gstin: "", fssai: "", services: ["delivery"], own_delivery: false, notes: "", consent: false };

const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, ""));
const checks: Record<number, (f: Form) => string | null> = {
  0: f => f.business_name.trim().length < 2 ? "Enter your business name." : !/^\d{1,3}$/.test(f.outlets) || +f.outlets < 1 ? "Outlets must be a number." : null,
  1: f => f.address.trim().length < 5 ? "Enter your shop address." : !/^[1-9]\d{5}$/.test(f.pin_code) ? "PIN code must be 6 digits." : null,
  2: f => f.owner_name.trim().length < 2 ? "Enter your name." : !phoneOk(f.phone) ? "Enter a 10-digit mobile number." : f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) ? "That email looks wrong." : null,
  3: f => f.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(f.gstin.toUpperCase()) ? "GSTIN looks wrong (15 characters)." : f.fssai && !/^\d{14}$/.test(f.fssai) ? "FSSAI licence is 14 digits." : !f.services.length ? "Pick at least one service." : !f.consent ? "Please accept to continue." : null,
};

export function JoinForm() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; existing: boolean } | null>(null);
  const submitKey = useMemo(() => randomKey(), []);
  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => { setF(p => ({ ...p, [k]: v })); setError(null); };

  const go = (to: number) => {
    if (to > step) { const e = checks[step](f); if (e) { setError(e); return; } }
    setError(null); setDir(to > step ? 1 : -1); setStep(to);
  };
  const submit = async () => {
    const e = checks[3](f); if (e) { setError(e); throw new Error(e); }
    const r = await fetch(`${API}/partner-applications`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, outlets: Number(f.outlets), gstin: f.gstin.toUpperCase(), submit_key: submitKey }),
    }).catch(() => null);
    const body = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) { const msg = body?.detail ?? "We couldn't send that. Check your connection and try again."; setError(msg); throw new Error(msg); }
    setTimeout(() => setDone({ reference: body.reference, existing: !!body.existing }), 700);
  };

  if (done) return <Receipt reference={done.reference} existing={done.existing} business={f.business_name} reduce={!!reduce} />;

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { x: d * 60, opacity: 0, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.35, ease: EASE } },
    exit: (d: number) => (reduce ? { opacity: 0 } : { x: d * -60, opacity: 0, filter: "blur(4px)", transition: { duration: 0.2, ease: EASE } }),
  };

  return (
    <div className="w-full max-w-xl">
      <ol className="mb-6 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button type="button" onClick={() => i < step && go(i)} disabled={i >= step} aria-current={i === step ? "step" : undefined} className="block w-full text-left">
              <span className={cn("block h-1.5 rounded-full transition-colors duration-300", i <= step ? "bg-primary" : "bg-white/10")} />
              <span className={cn("mt-2 hidden text-xs font-medium sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <motion.div layout={!reduce} className="overflow-hidden rounded-3xl border border-white/10 bg-card p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-8">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" className="flex flex-col gap-5">
            <div>
              <p className="font-mono text-xs tracking-widest text-primary uppercase">Step {step + 1} of 4</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{STEPS[step]}</h2>
            </div>

            {step === 0 && <>
              <FloatingLabel label="Business name" name="business_name" autoComplete="organization" defaultValue={f.business_name} onValueChange={set("business_name")} className="w-full" />
              <RadioCards label="What do you sell?" name="business_type" options={TYPES} value={f.business_type} onChange={set("business_type")} className="w-full [&_.grid]:sm:grid-cols-2" />
              <FloatingLabel label="Number of outlets" name="outlets" defaultValue={f.outlets} onValueChange={set("outlets")} className="w-full" />
            </>}

            {step === 1 && <>
              <FloatingLabel label="Shop address" name="address" autoComplete="street-address" defaultValue={f.address} onValueChange={set("address")} className="w-full" />
              <FloatingLabel label="PIN code" name="pin_code" autoComplete="postal-code" defaultValue={f.pin_code} onValueChange={set("pin_code")} validate={v => (v && !/^[1-9]\d{5}$/.test(v) ? "6 digits" : null)} className="w-full" />
              <p className="text-sm text-muted-foreground">OneLocal is live in <span className="font-semibold text-foreground">Latur</span>. More cities soon.</p>
            </>}

            {step === 2 && <>
              <FloatingLabel label="Your name" name="owner_name" autoComplete="name" defaultValue={f.owner_name} onValueChange={set("owner_name")} className="w-full" />
              <FloatingLabel label="Mobile number" type="tel" name="phone" autoComplete="tel-national" defaultValue={f.phone} onValueChange={set("phone")} validate={v => (v && !phoneOk(v) ? "10-digit mobile number" : null)} className="w-full" />
              <FloatingLabel label="Email (optional)" type="email" name="email" autoComplete="email" defaultValue={f.email} onValueChange={set("email")} className="w-full" />
              <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={f.whatsapp_ok} onChange={e => set("whatsapp_ok")(e.target.checked)} className="size-4 accent-[oklch(0.9_0.24_128)]" />Send me updates on WhatsApp</label>
            </>}

            {step === 3 && <>
              <div className="grid gap-5 sm:grid-cols-2">
                <FloatingLabel label="GSTIN (optional)" name="gstin" defaultValue={f.gstin} onValueChange={set("gstin")} className="w-full" />
                <FloatingLabel label="FSSAI licence (optional)" name="fssai" defaultValue={f.fssai} onValueChange={set("fssai")} className="w-full" />
              </div>
              <CheckboxGroup label="How do customers get your orders?" items={SERVICES} value={f.services} onChange={set("services")} className="w-full" />
              <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={f.own_delivery} onChange={e => set("own_delivery")(e.target.checked)} className="size-4 accent-[oklch(0.9_0.24_128)]" />I have my own delivery staff</label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed">
                <input type="checkbox" checked={f.consent} onChange={e => set("consent")(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[oklch(0.9_0.24_128)]" />
                <span>I agree that OneLocal may store these details and contact me about joining. They are used only for onboarding and my partner account.</span>
              </label>
            </>}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>{error && <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 text-sm font-medium text-red-400">{error}</motion.p>}</AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:invisible">Back</button>
          {step < 3
            ? <button type="button" onClick={() => go(step + 1)} className="rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]">Continue</button>
            : <MorphingButton onSave={submit} label="Send application" retryLabel="Try again" successFor={60_000} className="[&_button]:bg-primary [&_button]:text-primary-foreground" />}
        </div>
      </motion.div>
    </div>
  );
}

// The confirmation: a printed slip with the reference, and an APPLIED stamp that lands with a thud.
function Receipt({ reference, existing, business, reduce }: { reference: string; existing: boolean; business: string; reduce: boolean }) {
  return (
    <motion.div initial={reduce ? { opacity: 0 } : { y: -40, opacity: 0, rotateX: 12 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ duration: 0.6, ease: EASE }} style={{ transformPerspective: 900 }}
      className="relative w-full max-w-sm bg-white px-7 pt-9 pb-10 font-mono text-[13px] text-neutral-900 uppercase shadow-[0_40px_90px_rgba(0,0,0,0.6)] [clip-path:polygon(0_6px,4%_0,8%_6px,12%_0,16%_6px,20%_0,24%_6px,28%_0,32%_6px,36%_0,40%_6px,44%_0,48%_6px,52%_0,56%_6px,60%_0,64%_6px,68%_0,72%_6px,76%_0,80%_6px,84%_0,88%_6px,92%_0,96%_6px,100%_0,100%_calc(100%-6px),96%_100%,92%_calc(100%-6px),88%_100%,84%_calc(100%-6px),80%_100%,76%_calc(100%-6px),72%_100%,68%_calc(100%-6px),64%_100%,60%_calc(100%-6px),56%_100%,52%_calc(100%-6px),48%_100%,44%_calc(100%-6px),40%_100%,36%_calc(100%-6px),32%_100%,28%_calc(100%-6px),24%_100%,20%_calc(100%-6px),16%_100%,12%_calc(100%-6px),8%_100%,4%_calc(100%-6px),0_100%)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/onelocal-logo.png" alt="OneLocal" className="mx-auto h-7 w-auto" />
      <p className="mt-5 text-center font-bold tracking-[0.25em]">Partner application</p>
      <div className="my-4 border-t border-dashed border-neutral-400" />
      <Row k="Business" v={business} />
      <Row k="Reference" v={reference} bold />
      <Row k="Status" v={existing ? "Already received" : "Received"} />
      <div className="my-4 border-t border-dashed border-neutral-400" />
      <p className="text-center text-[11px] leading-relaxed tracking-wider text-neutral-600 normal-case">Our Latur team will call you on your mobile number to verify your details and set up your menu. Keep this reference handy.</p>
      <motion.div aria-hidden initial={reduce ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 0.9, rotate: -14 }} transition={{ delay: 0.55, type: "spring", stiffness: 520, damping: 22 }}
        className="pointer-events-none absolute top-24 right-5 rounded-lg border-[3px] border-[oklch(0.55_0.2_140)] px-3 py-1 text-xl font-black tracking-[0.2em] text-[oklch(0.55_0.2_140)] mix-blend-multiply">
        Applied
      </motion.div>
    </motion.div>
  );
}
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className="flex items-baseline gap-2 py-0.5"><span>{k}</span><span className="flex-1 overflow-hidden text-neutral-400">{".".repeat(60)}</span><span className={cn("max-w-[60%] truncate text-right", bold && "font-black")}>{v}</span></div>;
}
