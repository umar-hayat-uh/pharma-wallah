// desktop/next.config.mjs
//
// The Windows desktop target (Tauri 2). A THIRD separate Next.js project root,
// for the same reason `mobile/` is a second one: the main app has API routes
// and middleware, so it can never be statically exported. This project contains
// only the calculators (pure client components) plus the desktop app's own
// offline sections, so it CAN be exported, and `desktop/out` is the frontend
// Tauri packages into PharmaWallah.exe.
//
// Build it with `npm run desktop:build` from the repo root (`next build desktop`).
//
// OFFLINE IS THE POINT. Nothing in this bundle may reach the network:
// - no API routes (there is no server at all);
// - no Supabase/Mongo/Redis (none of the calculators imports them — verified);
// - next/font self-hosts Outfit into the export, so no fonts.googleapis.com;
// - AdSlot renders null (see NEXT_PUBLIC_IS_MOBILE_APP below);
// - `scripts/audit-desktop-offline.mjs` re-checks the built output.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Emit a fully static site to desktop/out — no Node runtime inside the .exe.
  output: "export",

  // The calculator pages live in ../src, outside this project root.
  experimental: {
    externalDir: true,
  },

  // Tauri's asset protocol resolves a directory request to index.html, exactly
  // like Capacitor's WebView server, so trailing slashes keep every deep link
  // (`/calculation-tools/<slug>/`) working after a reload inside the window.
  trailingSlash: true,

  images: {
    // There is no image optimisation server in a static export.
    unoptimized: true,
  },

  env: {
    /**
     * The "packaged, offline, ad-free build" flag. It is read by AdSlot (which
     * then renders nothing) and by lab-math's `calculatorHref` (which then
     * emits the trailing slash this export needs).
     *
     * It is named *_IS_MOBILE_APP for one reason: that is the flag the shared
     * calculator kit in src/ already understands, and this target must not
     * require any change to src/. Setting it here is what keeps the desktop
     * build free of ad-network calls without touching the website's code.
     */
    NEXT_PUBLIC_IS_MOBILE_APP: "true",

    /** Lets the desktop chrome tell itself apart from the Android app. */
    NEXT_PUBLIC_IS_DESKTOP_APP: "true",

    /**
     * Belt and braces. AdSlot bails on IS_MOBILE_APP before it ever reads this,
     * but an empty publisher id means that even if that check were removed the
     * component would still render nothing rather than call googlesyndication.
     */
    NEXT_PUBLIC_ADSENSE_CLIENT: "",
  },
};

export default nextConfig;
