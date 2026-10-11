import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public build (Cloudflare link) builds into its own folder, so building it never breaks a running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Development only: let phones and other devices on the same Wi-Fi load the dev server's assets
  // (http://<this Mac's address>:3100). Private network ranges only.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
};

export default nextConfig;
