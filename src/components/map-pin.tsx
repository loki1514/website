"use client";
// The shop's map pin on the join form (0728: the database needs it on submit). Google Maps JavaScript API with a BROWSER key
// (NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY, restricted in Google Cloud to this site's addresses; APIs: Maps JavaScript + Geocoding).
// Drag the pin or tap the map; "Use my current location" asks the phone. A moved pin fills the PIN code (and the address while it is
// empty) from Google's address for that spot. Without a key the map is left out and the current-location button still works.
import { useEffect, useRef, useState } from "react";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY?.trim() || "";
const LATUR = { lat: 18.4088, lng: 76.5604 };

type Pin = { lat: number; lng: number };
type Found = { line: string; pin_code: string };

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

export function MapPin({ value, onPin }: { value: Pin | null; onPin: (pin: Pin, found: Found | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [state, setState] = useState<"off" | "loading" | "ready" | "failed">(KEY ? "loading" : "off");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // the address Google has for a spot: the street part and the PIN code
  const lookUp = async (p: Pin): Promise<Found | null> => {
    if (!window.google?.maps) return null;
    try {
      const { results } = await new window.google.maps.Geocoder().geocode({ location: p });
      const best = results?.[0];
      if (!best) return null;
      const pin = best.address_components?.find((c: any) => c.types?.includes("postal_code"))?.long_name ?? "";
      const line = String(best.formatted_address ?? "").replace(/,?\s*(India|Maharashtra)\b.*$/i, "").replace(/\s*\d{6}\s*$/, "").trim();
      return { line, pin_code: /^\d{6}$/.test(pin) ? pin : "" };
    } catch { return null; }
  };

  const place = async (p: Pin) => {
    const pin = { lat: round(p.lat), lng: round(p.lng) };
    marker.current?.setPosition(pin);
    map.current?.panTo(pin);
    onPin(pin, await lookUp(pin));
  };

  useEffect(() => {
    if (!KEY) return;
    let gone = false;
    loadMaps().then(() => {
      if (gone || !box.current) return;
      const g = window.google.maps;
      const start = value ?? LATUR;
      map.current = new g.Map(box.current, { center: start, zoom: value ? 17 : 13, streetViewControl: false, mapTypeControl: false, fullscreenControl: false, clickableIcons: false, gestureHandling: "greedy" });
      marker.current = new g.Marker({ position: start, map: map.current, draggable: true, title: "Your shop" });
      marker.current.addListener("dragend", () => { const q = marker.current.getPosition(); place({ lat: q.lat(), lng: q.lng() }); });
      map.current.addListener("click", (e: any) => place({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
      setState("ready");
    }).catch(() => !gone && setState("failed"));
    return () => { gone = true; };
    // the map is made once; later pins move it through place()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const here = () => {
    if (!("geolocation" in navigator)) { setNote("This browser cannot share your location. Drag the pin instead."); return; }
    setBusy(true); setNote(null);
    navigator.geolocation.getCurrentPosition(
      p => { setBusy(false); map.current?.setZoom(18); place({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { setBusy(false); setNote("We could not get your location. Allow location for this site, or drag the pin on the map."); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="mt-5">
      <p className="ol-label mb-2 text-base">Pin your shop on the map</p>
      {state !== "off" && (
        <div ref={box} role="application" aria-label="Map: drag the pin to your shop" className="h-64 w-full overflow-hidden rounded-2xl border border-black/10 bg-[#e8efe4] sm:h-72">
          {state === "loading" && <p className="p-4 text-sm opacity-70">Loading the map…</p>}
          {state === "failed" && <p className="p-4 text-sm">The map could not load. Use your current location below.</p>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={here} disabled={busy} className="ol-chip !px-5 !py-2.5 !text-base">
          {busy ? "Finding you…" : "Use my current location"}
        </button>
        {value ? (
          <span className="text-sm">
            Pinned · <a className="underline" href={`https://www.google.com/maps?q=${value.lat},${value.lng}`} target="_blank" rel="noreferrer">check it on Google Maps</a>
          </span>
        ) : (
          <span className="text-sm opacity-75">{state === "off" ? "Stand at your shop and tap the button." : "Drag the pin or tap the map on your shop."}</span>
        )}
      </div>
      {note && <p className="mt-2 text-sm text-[#9a2b1d]" role="alert">{note}</p>}
    </div>
  );
}
