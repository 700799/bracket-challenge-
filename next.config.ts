import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Google profile avatars.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;

// Enable the Cloudflare bindings (D1, etc.) during `next dev` via OpenNext.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
