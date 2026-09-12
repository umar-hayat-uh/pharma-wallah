// mobile/next.config.mjs
//
// The Android build target. This is a SEPARATE Next.js project root from the
// main app on purpose: the main app has API routes and middleware, so it can
// never be statically exported (see .claude/skills/deployment-and-env).
// This project contains only the 89 calculators, which are pure client
// components — so it CAN be exported, and the resulting `out/` directory is
// packaged inside the APK and served by Capacitor's local WebView server.
//
// Build it with `npm run mobile:build` from the repo root (`next build mobile`).

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Emit a fully static site to mobile/out — no Node server inside the APK.
  output: "export",

  // The calculator pages live in ../src, outside this project root. Next
  // refuses to compile files outside the root without this flag.
  experimental: {
    externalDir: true,
  },

  // Capacitor's WebView server resolves a directory request to index.html, so
  // trailing slashes make every deep link (`/calculation-tools/<slug>/`)
  // survive a cold start or a reload inside the app.
  trailingSlash: true,

  images: {
    // There is no image optimisation server in a static export.
    unoptimized: true,
  },

  env: {
    // The CFU Calculator is the only tool that calls an API. Inside the APK the
    // page is served from https://localhost, which has no /api, so point it at
    // the deployed site. A public origin, never a key — and set only here, so
    // the web build keeps using a same-origin relative request.
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://pharmawallah.com",

    // Lets shared components tell the two surfaces apart. AdSlot reads this and
    // renders nothing: the app is offline by design, so an ad network call would
    // fail anyway, and serving ads in a packaged APK breaches AdSense policy.
    NEXT_PUBLIC_IS_MOBILE_APP: "true",
  },
};

export default nextConfig;
