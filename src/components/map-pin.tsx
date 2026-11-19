"use client";
// The shop's map pin on the join form (0728: the database needs it on submit). Google Maps JavaScript API with a BROWSER key
// (NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY, restricted in Google Cloud to this site's addresses; APIs: Maps JavaScript + Geocoding).
//
// The pin stands still in the middle of the map and the partner drags the map under it until the pin's tip is on the shop's door
// (easier on a phone than grabbing a small marker), or searches Google's places (suggestions while typing, Places API New on the
// key; else Enter finds it with the Geocoding API). Nothing counts as pinned until the map has been moved or a place picked: the
// opening view of Latur is never sent as the shop. Each new spot looks up Google's address for it, which fills the street and
// area and the PIN code while those boxes are empty. Only when the map cannot load at all (no key, or the key refuses this
// address) is "Use my current location" offered, so a partner is never stuck: the database needs a pin (0728).
import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin as PinIcon, Search } from "lucide-react";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY?.trim() || "";
const LATUR = { lat: 18.4088, lng: 76.5604 };

type Pin = { lat: number; lng: number };
export type Found = { line: string; locality: string; pin_code: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { google?: any; __olMaps?: Promise<void> } }

function loadMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  window.__olMaps ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&region=IN&language=en`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("maps"));
    document.head.appendChild(s);
  });
  return window.__olMaps;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;
const part = (r: any, type: string) => r?.address_components?.find((c: any) => c.types?.includes(type))?.long_name ?? "";

// Google's address for a spot: the street part (for the review), the area, and the PIN code.
function readAddress(best: any): Found {
  const pin = part(best, "postal_code");
  const locality = [part(best, "sublocality_level_2"), part(best, "sublocality_level_1") || part(best, "neighborhood")].filter(Boolean).join(", ")
    || part(best, "route");
  const line = String(best?.formatted_address ?? "").replace(/,?\s*(India|Maharashtra)\b.*$/i, "").replace(/\s*\d{6}\s*$/, "").trim();
  return { line, locality, pin_code: /^\d{6}$/.test(pin) ? pin : "" };
}

export function MapPin({ value, onPin }: { value: Pin | null; onPin: (pin: Pin, found: Found | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const moved = useRef(false);
  const onPinRef = useRef(onPin);
  useEffect(() => { onPinRef.current = onPin; });
  const [state, setState] = useState<"off" | "loading" | "ready" | "failed">(KEY ? "loading" : "off");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Google place suggestions while typing (Places API, New): text to show, and the prediction to open
  const [hits, setHits] = useState<{ main: string; sub: string; pred: any }[]>([]);
  const [open, setOpen] = useState(false);
  const places = useRef<any>(null);       // the Places library, once loaded; false when this key cannot use it
  const session = useRef<any>(null);      // one autocomplete session per search, as Google bills it
  const [spot, setSpot] = useState<string | null>(null);

  const lookUp = async (p: Pin): Promise<Found | null> => {
    if (!window.google?.maps) return null;
    try {
      const { results } = await new window.google.maps.Geocoder().geocode({ location: p });
      return results?.[0] ? readAddress(results[0]) : null;
    } catch { return null; }
  };

  // The pin is the middle of the map: called whenever the map comes to rest after the partner moved it.
  const settle = async () => {
    if (!map.current || !moved.current) return;
    const c = map.current.getCenter();
    const pin = { lat: round(c.lat()), lng: round(c.lng()) };
    const found = await lookUp(pin);
    setSpot(found?.line || null);
    onPinRef.current(pin, found);
  };

  useEffect(() => {
    if (!KEY) return;
    let gone = false;
    // Google calls this when the key is refused (for example on an address the key is not allowed on): show our fallback, not Google's error box
    (window as any).gm_authFailure = () => { if (!gone) setState("failed"); };
    loadMaps().then(() => {
      if (gone || !box.current) return;
      const g = window.google.maps;
      map.current = new g.Map(box.current, {
        center: value ?? LATUR, zoom: value ? 18 : 14, streetViewControl: false, mapTypeControl: false, fullscreenControl: false,
        clickableIcons: false, gestureHandling: "greedy", zoomControl: true, keyboardShortcuts: true,
      });
      if (value) moved.current = true;
      map.current.addListener("dragstart", () => { moved.current = true; setDragging(true); setNote(null); });
      map.current.addListener("dragend", () => setDragging(false));
      map.current.addListener("idle", () => { void settle(); });
      setState("ready");
    }).catch(() => !gone && setState("failed"));
    return () => { gone = true; };
    // the map is made once; later moves come from the map itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (p: Pin, zoom = 18) => {
    moved.current = true;
    if (map.current) { map.current.setZoom(zoom); map.current.panTo(p); }   // "idle" then settles the pin
    else onPinRef.current({ lat: round(p.lat), lng: round(p.lng) }, null);  // no map: the location is the pin
  };

  const here = () => {
    if (!("geolocation" in navigator)) { setNote("This browser cannot share your location. Move the map instead."); return; }
    setBusy(true); setNote(null);
    navigator.geolocation.getCurrentPosition(
      p => { setBusy(false); goTo({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { setBusy(false); setNote("We could not get your location. Allow location for this site, or move the map to your shop."); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Suggestions as the partner types, kept near Latur. Without the Places API on the key, Enter still finds the place (search below).
  useEffect(() => {
    const q = query.trim();
    if (state !== "ready" || q.length < 3) { setHits([]); return; }
    let gone = false;
    const t = setTimeout(async () => {
      try {
        if (places.current === null) places.current = await window.google.maps.importLibrary("places").catch(() => false);
        if (!places.current || gone) return;
        session.current ??= new places.current.AutocompleteSessionToken();
        const { suggestions } = await places.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q, sessionToken: session.current, includedRegionCodes: ["in"], locationBias: { center: LATUR, radius: 40000 },
        });
        if (gone) return;
        setHits((suggestions ?? []).map((x: any) => x.placePrediction).filter(Boolean).slice(0, 5)
          .map((pr: any) => ({ main: pr.mainText?.text ?? pr.text?.text ?? "", sub: pr.secondaryText?.text ?? "", pred: pr })));
        setOpen(true);
      } catch { if (!gone) setHits([]); }
    }, 250);
    return () => { gone = true; clearTimeout(t); };
  }, [query, state]);

  const pick = async (h: { main: string; sub: string; pred: any }) => {
    setOpen(false); setHits([]); setQuery(h.sub ? `${h.main}, ${h.sub}` : h.main); setNote(null);
    try {
      const place = h.pred.toPlace();
      await place.fetchFields({ fields: ["location"] });
      session.current = null;   // the session ends with a chosen place
      if (place.location) goTo({ lat: place.location.lat(), lng: place.location.lng() }, 18);
    } catch { setNote("We could not open that place. Try another one, or move the map."); }
  };

  // Search an area, street or landmark, kept to Latur (Enter, or when suggestions are not available).
  const search = async () => {
    const q = query.trim();
    if (!q || !window.google?.maps) return;
    setNote(null);
    try {
      const { results } = await new window.google.maps.Geocoder().geocode({
        address: `${q}, Latur, Maharashtra`, componentRestrictions: { country: "IN" },
        bounds: { south: 17.9, west: 75.9, north: 18.9, east: 77.2 },
      });
      const loc = results?.[0]?.geometry?.location;
      if (!loc) { setNote("We could not find that place. Try an area or a landmark near your shop."); return; }
      goTo({ lat: loc.lat(), lng: loc.lng() }, 17);
    } catch { setNote("We could not find that place. Try an area or a landmark near your shop."); }
  };

  return (
    <div className="mt-7">
      {state !== "off" && (
        <>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <label>
                <span className="sr-only">Search your shop, street or a landmark in Latur</span>
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-(--soft)" aria-hidden />
                <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => hits.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (hits[0]) void pick(hits[0]); else void search(); } if (e.key === "Escape") setOpen(false); }}
                  placeholder="Search your shop, street or a landmark" enterKeyHint="search" className="ol-field !pl-11" disabled={state !== "ready"}
                  role="combobox" aria-expanded={open && hits.length > 0} aria-controls="map-search-hits" aria-autocomplete="list" autoComplete="off" />
              </label>
              {open && hits.length > 0 && (
                <ul id="map-search-hits" role="listbox" className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-(--line) bg-white shadow-[0_18px_36px_-18px_oklch(0.19_0.045_156/0.5)]">
                  {hits.map((h, i) => (
                    <li key={i} role="option" aria-selected={false}>
                      <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => void pick(h)}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-(--chip)">
                        <PinIcon className="mt-0.5 size-4 shrink-0 text-(--soft)" aria-hidden />
                        <span className="min-w-0"><span className="block truncate text-[0.95rem] font-semibold">{h.main}</span>
                          {h.sub && <span className="block truncate text-sm text-(--soft)">{h.sub}</span>}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={() => void search()} disabled={state !== "ready" || !query.trim()} className="ol-pill is-quiet !min-h-[3.25rem] !px-5">Find</button>
          </div>
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-(--line) bg-[#e8efe4] shadow-[0_18px_36px_-24px_oklch(0.19_0.045_156/0.5)]">
            <div ref={box} role="application" aria-label="Map: move it until the pin is on your shop" className="h-[19rem] w-full sm:h-[22rem]" />
            {state === "loading" && <p className="absolute inset-0 grid place-items-center text-sm text-(--soft)">Loading the map…</p>}
            {state === "failed" && (
              <div className="absolute inset-0 grid place-items-center bg-[#e8efe4] p-6 text-center">
                <div>
                  <p className="text-[0.95rem] font-semibold">The map could not load.</p>
                  <p className="mt-1 text-sm text-(--soft)">Stand at your shop and use your current location instead.</p>
                  <button type="button" onClick={here} disabled={busy} className="ol-pill is-quiet mt-4 !min-h-11 !px-5 bg-white">
                    <LocateFixed className="size-4.5" aria-hidden />{busy ? "Finding you…" : "Use my current location"}
                  </button>
                </div>
              </div>
            )}
            {state === "ready" && <>
              {/* The fixed pin: its tip marks the middle of the map. */}
              <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <span className={`block transition-transform duration-200 ease-out ${dragging ? "-translate-y-2.5" : ""}`}>
                  <PinIcon className="size-11 fill-(--forest) text-(--lime) drop-shadow-[0_6px_6px_oklch(0.19_0.045_156/0.45)]" strokeWidth={1.6} />
                </span>
              </span>
              <span aria-hidden className={`pointer-events-none absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--forest)/40 transition-transform duration-200 ${dragging ? "scale-150" : ""}`} />
              {!value && <p className="pointer-events-none absolute inset-x-3 top-3 mx-auto w-fit rounded-full bg-(--forest) px-4 py-1.5 text-center text-sm font-semibold text-(--on-forest)">Drag the map to put the pin on your shop</p>}
            </>}
          </div>
        </>
      )}
      {state === "off" && (
        <button type="button" onClick={here} disabled={busy} className="ol-chip !px-5 !py-2.5 !text-base">
          <LocateFixed className="size-4.5" aria-hidden />{busy ? "Finding you…" : "Use my current location"}
        </button>
      )}
      <p className="mt-3 text-sm" aria-live="polite">
        {value
          ? <><b>Pinned</b>{spot ? <> near {spot}</> : null} · <a className="underline underline-offset-4" href={`https://www.google.com/maps?q=${value.lat},${value.lng}`} target="_blank" rel="noreferrer">check on Google Maps</a></>
          : <span className="text-(--soft)">{state === "off" ? "Stand at your shop and tap the button." : "Riders use this pin to reach your shop, so put it on the door."}</span>}
      </p>
      {note && <p className="mt-2 text-sm text-(--danger)" role="alert">{note}</p>}
    </div>
  );
}
