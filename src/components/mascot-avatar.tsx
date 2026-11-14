"use client";

// The drawing half of Ol: the avatar library and Ol's 16 animations. It is the heaviest script on the site, so it
// lives in its own file and is fetched only once Ol is about to be shown (see mascot.tsx), instead of holding up
// the first paint of every page.
import "@bible-strong/avatar-react/styles.css";
import { createAvatar, type AvatarController } from "@bible-strong/avatar-react";
import definition from "@/lib/ol.avatar.json";

const Ol = createAvatar(definition as never);

export default function OlAvatar({ controller, still, size }: { controller: React.RefObject<AvatarController | null>; still: boolean; size: number | string }) {
  return <Ol ref={controller as never} {...(still ? { defaultExpression: "neutral" as never } : { defaultAnimation: "idle" as never })} size={size} ariaLabel="Ol" />;
}
