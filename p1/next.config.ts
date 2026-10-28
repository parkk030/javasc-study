import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // Isolate local `next build` (`harness:verify`) output from active `next dev` server (.next)
    // so running builds never deletes `/_next/static/css/app/layout.css` while dev server is live.
    distDir:
      phase === PHASE_DEVELOPMENT_SERVER || process.env.VERCEL
        ? ".next"
        : ".next-build",
    eslint: {
      // ESLint v9 flat config is explicitly executed as Gate 2 (`npm run lint`) in harness:verify
      ignoreDuringBuilds: true,
    },
  };
}
