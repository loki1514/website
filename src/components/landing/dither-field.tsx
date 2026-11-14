"use client";

// The page's living background: a calm green field whose colour drifts slowly, like warmth moving across it,
// seen through faintly fluted glass, with a fine grass texture laid over it. The ribs and the grass stay still. The colour moves on a
// little as the page is scrolled. A light ordered dither gives it a printed grain.
// Drawn small and stretched to stay light on budget phones. Without WebGL the flat field colour shows.
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

// Six shades per mood, deep to light: wide enough apart that the warmth, the glass ribs and the grass all read,
// close enough that the field stays behind the words.
export const MOODS = {
  lime: ["#2f9f22", "#55c22a", "#7fda35", "#a6ea48", "#c9f463", "#ecfb9a"],
  mint: ["#74cf55", "#98de70", "#b9eb90", "#d4f4b0", "#e8f9cc", "#f8fde8"],
  forest: ["#010603", "#03130a", "#072712", "#0d3f1a", "#176324", "#2a8f31"],
} as const;
export type Mood = keyof typeof MOODS;

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform float uTravel; uniform float uRib;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 c4; uniform vec3 c5;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i = 0; i < 3; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v * 1.14; }
float b2(vec2 a){ a = floor(a); return fract(a.x/2.0 + a.y*a.y*0.75); }
float bayer(vec2 a){ return b2(0.25*a)*0.0625 + b2(0.5*a)*0.25 + b2(a); }
// The warmth under the grass: slow, folded clouds that drift, and move on as the page is scrolled.
float heat(vec2 s){
  float t = uTime * 0.04;
  vec2 q = s * 1.1 + vec2(t + uTravel * 1.1, -t * 0.7);
  return fbm(q + 1.4 * fbm(q * 1.3 - t * 1.2));
}
// One row of thin blades. Returns how far up its blade this pixel sits (0 root, 1 tip), or -1 above the row.
float row(vec2 p, float base, float amp, float freq, float seed){
  float x = p.x * freq + seed * 17.0; float cell = floor(x); float f = fract(x) - 0.5;
  float h = (0.35 + 0.65 * hash(vec2(cell, seed))) * (1.0 - smoothstep(0.0, 0.5, abs(f)) * 0.85);
  float up = max(p.y - base, 0.0) / amp;
  return p.y < base ? 0.0 : (up < h ? up / h : -1.0);
}
vec3 pal(float h){
  float n = clamp(h, 0.0, 0.999) * 5.0;
  vec3 a = n < 1.0 ? c0 : n < 2.0 ? c1 : n < 3.0 ? c2 : n < 4.0 ? c3 : c4;
  vec3 b = n < 1.0 ? c1 : n < 2.0 ? c2 : n < 3.0 ? c3 : n < 4.0 ? c4 : c5;
  return mix(a, b, fract(n));
}
void main(){
  vec2 px = gl_FragCoord.xy; vec2 uv = px / uRes; vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  // Fluted glass: narrow upright ribs that each shift the colour behind them, with a light edge and a dark seam.
  // They stay still.
  float f = fract(px.x / uRib) - 0.5;
  float v = (heat(vec2(p.x - f * 0.10, p.y)) - 0.5) * 1.45 + 0.5 + (uv.y - 0.5) * 0.12;
  v += (0.25 - f * f) * 0.085 + smoothstep(-0.30, -0.5, f) * 0.06 - smoothstep(0.32, 0.5, f) * 0.085;
  // Grass, as a quiet texture: rows of thin blades that only nudge the shade a little. Still, never swaying.
  // Rows overlap, so only three of them can reach any one pixel; the nearest row that does wins.
  float amp = 0.17; float at = (1.0 - uv.y - amp * 0.5) / 0.115; float g = 0.0;
  for(int k = 0; k < 3; k++){
    float fi = floor(at) + float(k);
    float r = row(p, 1.0 - fi * 0.115 - amp * 0.5, amp, 74.0, fi + 1.0);
    if(r >= 0.0) g = (r * r - 0.45) + (hash(vec2(floor(p.x * 74.0 + (fi + 1.0) * 17.0), fi)) - 0.5) * 0.5;
  }
  v += g * 0.115;
  v += (bayer(px) - 0.5) * 0.06;
  v = floor(clamp(v, 0.0, 0.999) * 15.0) / 14.0;
  gl_FragColor = vec4(pal(v), 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);

export function DitherField({ mood, travel, className }: { mood: Mood; travel?: MotionValue<number>; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  useEffect(() => { moodRef.current = mood; }, [mood]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;
    const make = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = { res: u("uRes"), time: u("uTime"), travel: u("uTravel"), rib: u("uRib"), c: [0, 1, 2, 3, 4, 5].map(i => u(`c${i}`)) };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The field is soft, so it is drawn small and stretched: a third of the screen's size, a quarter on phones.
    const scale = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ? 4 : 3;
    const shades = MOODS[moodRef.current].map(rgb);
    let raf = 0, prev = 0;
    const size = () => {
      const w = Math.max(2, Math.round(canvas.clientWidth / scale)), h = Math.max(2, Math.round(canvas.clientHeight / scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const draw = (now: number) => {
      size();
      // Ease the shades towards the current mood.
      const want = MOODS[moodRef.current].map(rgb);
      shades.forEach((s, i) => s.forEach((_, k) => { s[k] += (want[i][k] - s[k]) * (still ? 1 : 0.06); }));
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, still ? 12 : now / 1000);
      gl.uniform1f(U.travel, travel?.get() ?? 0);
      gl.uniform1f(U.rib, 26 / scale);
      shades.forEach((s, i) => gl.uniform3f(U.c[i], s[0], s[1], s[2]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - prev < 33) return; // about 30 frames a second is plenty for this
      prev = now; draw(now);
    };
    // The field only works while it is on screen: scrolled out of view, its loop stops altogether.
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); raf = 0;
      if (e.isIntersecting && !still) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    draw(0);
    // With reduced motion the field holds still, and only redraws when the mood or the size changes.
    const stillTimer = still ? window.setInterval(() => draw(0), 400) : 0;
    return () => { cancelAnimationFrame(raf); clearInterval(stillTimer); io.disconnect(); };
  }, [travel]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
