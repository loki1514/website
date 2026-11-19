"use client";

// The site's living background: a survey map. A slow, drifting landscape is shaded from deep to light, and fine
// contour lines trace its heights, creeping outward very slowly. It is drawn per pixel on the graphics chip, so the lines stay hair-thin and smooth at any size.
// The colours belong to a `mood` and ease from one mood to the next. The land moves on a little as the page is
// scrolled (`travel`). With a `route` the map also carries the journey: three places stand as peaks (the lines
// ring around them), a line of small squares runs between them, and the map slides past as the visitor moves on.
// It stops when off screen, and holds one still frame for visitors who ask for less motion
// (or with `still`). Without WebGL the plain colour behind the canvas shows.
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

// Per mood: the low ground, the high ground, the soft light that wanders over it, the ink of the lines, the colour of
// the route where the order has been, how strong the ink is, and how much dark shading the land carries.
// `forest` is the deep green map. `day`, `sage` and `sand` are the light maps the home page's journey moves through:
// whitish cream with a faint wash of green, drawn in dark green. `cream` is the quietest, for behind forms.
export const MOODS = {
  forest: { low: "#0a2215", high: "#17492b", light: "#2c7434", ink: "#d9ffb0", trail: "#b5f53d", strength: 1, shade: 0 },
  day: { low: "#fcfaf4", high: "#f3f0e3", light: "#d9e6c8", ink: "#16402a", trail: "#14472a", strength: 0.9, shade: 1 },
  sage: { low: "#f9f9f0", high: "#eef0df", light: "#c8dbb5", ink: "#16402a", trail: "#14472a", strength: 0.9, shade: 1 },
  sand: { low: "#fcf9f0", high: "#f4eedd", light: "#e0e6c6", ink: "#16402a", trail: "#14472a", strength: 0.9, shade: 1 },
  cream: { low: "#f9f6ee", high: "#f3f0e3", light: "#e9eed8", ink: "#1b4a2c", trail: "#14472a", strength: 0.55, shade: 0.5 },
} as const;
export type Mood = keyof typeof MOODS;
// The journey on the map. `x`, `y`: where the visitor's marker stays on screen, in CSS pixels from the canvas's top
// left. `at`: how far it has travelled, 0 at the first place to 2 at the last. `started`: the journey has begun.
export type Route = { x: number; y: number; at: number; started: boolean };
// The distance between two places on the map, in CSS pixels.
export const ROUTE_STEP = 230;

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
// Simplex noise by Ian McEwan, Ashima Arts (MIT licence).
const FRAG = `
#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform float uTravel; uniform float uStrength;
uniform vec3 cLow; uniform vec3 cHigh; uniform vec3 cLight; uniform vec3 cInk; uniform vec3 cTrail;
uniform vec4 uRoute; uniform float uRouteOn; uniform float uShade;
const float STEP = ${ROUTE_STEP}.0;
vec3 permute(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// The height of the land at a point (in CSS pixels): broad, rounded hills. The ground is bent gently before it is
// measured, which is what makes the lines flow instead of wobble.
float land(vec2 q){
  float t = uTime;
  vec2 p = q / 860.0;
  vec2 bend = vec2(snoise(p * 0.7 + vec2(t * 0.006, 3.7)), snoise(p * 0.7 + vec2(11.3, -t * 0.005)));
  return 0.5 + 0.5 * snoise(p + bend * 0.32 + vec2(uTravel * 0.45 + t * 0.007, -t * 0.005));
}
// The places of the route, as peaks: the one the order is at stands tallest.
float peaks(vec2 q){
  float b = 0.0;
  for(int i = 0; i < 3; i++){
    float n = float(i);
    vec2 d = q - vec2(uRoute.x, uRoute.y + (n - uRoute.z) * STEP);
    b += (0.1 + 0.2 * max(0.0, 1.0 - abs(n - uRoute.z))) * exp(-dot(d, d) / 18000.0);
  }
  return b * uRouteOn;
}
void main(){
  vec2 q = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float peak = peaks(q);
  float h = land(q) + peak;
  // Shade: low ground to high ground, with one soft light wandering across.
  float lift = smoothstep(0.15, 0.9, h);
  float glow = 0.5 + 0.5 * snoise(q / 1200.0 + vec2(uTravel * 1.3 + uTime * 0.005, 3.1));
  vec3 col = mix(cLow, cHigh, lift);
  col = mix(col, cLight, glow * glow * lift * 0.4);
  // Shading, in the trail's dark green and always slight: the valleys sit a little deeper, and the slopes that face
  // away from the light (top left) are a touch darker, the way a printed map shows relief. It is part of the land,
  // so it drifts, slides and rises around the places with everything else.
  vec2 slope2 = vec2(dFdx(h), dFdy(h)) * uDpr * 300.0;
  float relief = clamp(dot(slope2, vec2(0.6, -0.8)), 0.0, 1.0);
  float valley = 1.0 - lift;
  col = mix(col, cTrail, (valley * valley * 0.11 + relief * 0.09) * uShade);
  // Contour lines, all one weight and a pixel wide whatever the slope. They creep outward very slowly, like rings
  // on water. Where the land is steep and the lines would crowd together, they fade out instead.
  float v = h * 22.0 + uTime * 0.03;
  float slope = fwidth(v);
  float hw = 0.5 * uDpr;
  float line = 1.0 - smoothstep(hw - 0.6, hw + 0.6, abs(fract(v - 0.5) - 0.5) / slope);
  float room = 1.0 - smoothstep(0.12, 0.3, slope * uDpr);
  // Around a place the rings are drawn stronger, so each place reads as a target on the map.
  float ink = line * room * 0.2 * (0.5 + 0.5 * lift) * (1.0 + 7.0 * peak);
  col = mix(col, cInk, ink * uStrength);
  // The route: small squares from place to place, swaying gently; in the trail colour where the order has been. The order itself
  // is a larger square that stays put while the map slides past it.
  float along = q.y - uRoute.y + uRoute.z * STEP;
  float row = floor(along / 12.0 + 0.5) * 12.0;
  float sway = uRoute.x + 26.0 * sin(3.14159 * row / STEP);
  float dot_ = step(max(abs(q.x - sway), abs(along - row)), 1.6) * step(-0.5, row) * step(row, 2.0 * STEP + 0.5) * uRouteOn;
  float done = step(row, uRoute.z * STEP + 0.5) * uRoute.w;
  col = mix(col, mix(cInk, cTrail, done), dot_ * mix(0.4, 0.95, done));
  vec2 o = q - vec2(uRoute.x + 26.0 * sin(3.14159 * uRoute.z), uRoute.y);
  float order = max(step(max(abs(o.x), abs(o.y)), 4.0), exp(-dot(o, o) / 260.0) * (0.3 + 0.15 * sin(uTime * 3.0)));
  gl_FragColor = vec4(mix(col, cTrail, order * uRoute.w * uRouteOn), 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const shades = (mood: Mood) => { const m = MOODS[mood]; return [rgb(m.low), rgb(m.high), rgb(m.light), rgb(m.ink), rgb(m.trail), [m.strength, m.shade]]; };

export function ContourField({ mood = "forest", travel, route, still = false, className }: { mood?: Mood; travel?: MotionValue<number>; route?: { current: Route | null }; still?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  const redraw = useRef<() => void>(null);
  useEffect(() => { moodRef.current = mood; redraw.current?.(); }, [mood]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!canvas || !gl || !gl.getExtension("OES_standard_derivatives")) return;
    const make = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = { res: u("uRes"), dpr: u("uDpr"), time: u("uTime"), travel: u("uTravel"), strength: u("uStrength"), route: u("uRoute"), routeOn: u("uRouteOn"), shade: u("uShade"), c: ["cLow", "cHigh", "cLight", "cInk", "cTrail"].map(u) };

    const phone = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const frozen = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Sharp enough for hairlines, capped so budget phones are not asked for more pixels than they can fill.
    const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
    const now = shades(moodRef.current);
    const draw = (ms: number) => {
      const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      // Ease the colours towards the current mood.
      const want = shades(moodRef.current);
      now.forEach((s, i) => s.forEach((_, k) => { s[k] += (want[i][k] - s[k]) * (frozen ? 1 : 0.05); }));
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.dpr, dpr);
      // A still frame is taken from a fixed moment, so it looks the same on every load.
      gl.uniform1f(U.time, frozen ? 40 : ms / 1000);
      gl.uniform1f(U.travel, travel?.get() ?? 0);
      gl.uniform1f(U.strength, now[5][0]);
      gl.uniform1f(U.shade, now[5][1]);
      const r = route?.current;
      gl.uniform1f(U.routeOn, r ? 1 : 0);
      if (r) gl.uniform4f(U.route, r.x, r.y, r.at, r.started ? 1 : 0);
      U.c.forEach((c, i) => gl.uniform3f(c, now[i][0], now[i][1], now[i][2]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    let raf = 0, prev = 0;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || ms - prev < 33) return; // about 30 frames a second is plenty for something this slow
      prev = ms; draw(ms);
    };
    // The map only works while it is on screen.
    const watchView = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); raf = 0;
      if (e.isIntersecting && !frozen) raf = requestAnimationFrame(loop);
    });
    watchView.observe(canvas);
    // A still map redraws only when its size or its mood changes.
    const watchSize = new ResizeObserver(() => draw(performance.now()));
    watchSize.observe(canvas);
    redraw.current = frozen ? () => draw(0) : null;
    return () => { cancelAnimationFrame(raf); watchView.disconnect(); watchSize.disconnect(); redraw.current = null; };
  }, [travel, route, still]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
