export { cn } from "cn"

// A random id for idempotency keys. crypto.randomUUID only exists on secure pages (https or localhost); a phone
// opening the site over the local network on plain http has crypto.getRandomValues only.
export function randomKey(bytes = 16): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
}
