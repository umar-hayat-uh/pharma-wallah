// next.config.mjs
import { statSync } from "node:fs";

/**
 * Size in bytes of a file under public/, measured once at BUILD time (2026-11-04).
 * The download page used to stat the files on every request; that runtime
 * `process.cwd() + "public"` path made Next's file tracer copy the WHOLE public/
 * folder (245 MB of previews, slides and models) into the server function, and
 * Netlify refused to upload it ("request body too large"). "0" = not built yet.
 */
function publicFileBytes(path) {
  try {
    return String(statSync(new URL(`./public${path}`, import.meta.url)).size);
  } catch {
    return "0";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Inlined into the server bundle at build time (src/app/(site)/download/page.tsx).
  env: {
    PW_ANDROID_APK_BYTES: publicFileBytes("/downloads/pharmawallah-calculators.apk"),
    PW_WINDOWS_SETUP_BYTES: publicFileBytes("/downloads/PharmaWallah-Setup.exe"),
  },

  // Course lesson markdown lives in /content (not public/) and is read from disk
  // at request time by src/lib/courses/content.ts. The file tracer cannot follow
  // a runtime path, so include the folder in the lesson route's bundle
  // explicitly — without this the deployed lesson pages would find no files.
  experimental: {
    outputFileTracingIncludes: {
      "/courses/[subjectSlug]/[unit]": ["./content/**/*"],
    },
    // Never ship these inside the server function (2026-11-04, Netlify's upload
    // limit). public/ is served by the CDN, never read by server code. sharp's
    // native libvips (two copies, 33 MB) is only for Next's image optimiser,
    // which is off (`images.unoptimized`) — Netlify's image CDN does that job.
    outputFileTracingExcludes: {
      "*": [
        "public/**/*",
        "node_modules/sharp/**/*",
        "node_modules/@img/**/*",
        "node_modules/.pnpm/sharp@*/**/*",
        "node_modules/.pnpm/@img+*/**/*",
      ],
    },
  },

  async headers() {
    return [
      {
        // The Android app is served from this site rather than an external
        // host. Without an explicit type some browsers try to display the file
        // instead of saving it; the attachment disposition makes every browser
        // download it under a stable name.
        source: "/downloads/:file*.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="pharmawallah-calculators.apk"',
          },
          // Each release replaces the file at the same path, so it must not be
          // cached indefinitely or users would keep getting the old build.
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },

  // The Molecule Viewer became Molecular Lab (2026-09-16). Permanent, and
  // query strings pass through, so old bookmarks and links keep working.
  async redirects() {
    return [
      { source: "/molecule-viewer", destination: "/molecular-lab", permanent: true },
      // The Q&A pages became the community (2026-09-20). These two mappings are
      // static, so they belong here as real 308s rather than as server
      // components — a `redirect()` in a prerendered page ships a 1-second
      // meta-refresh instead. The third legacy route,
      // /community/question/<id>, needs a database lookup to find the post that
      // old id became, so it stays a server component.
      { source: "/community/ask", destination: "/community/submit?kind=question", permanent: true },
      {
        source: "/community/question/:id/answer",
        destination: "/community/question/:id",
        permanent: true,
      },
      // The Books Library was removed on 2026-09-20: it linked scanned copies
      // of commercial textbooks we hold no licence to distribute. The AI Guide
      // took over its job — explaining a topic and pointing at material we own
      // — so old links, bookmarks and any indexed page land there.
      { source: "/books-library", destination: "/ai-guide", permanent: true },
      // Battle Royale v2 (2026-09-28): check-in and results became one status page.
      { source: "/battle-royale/check-in", destination: "/battle-royale/status", permanent: false },
      { source: "/battle-royale/results", destination: "/battle-royale/status", permanent: false },
      // Removed 2026-09-23 while preparing the AdSense review. /mentor was a
      // second copy of /contact under a different heading; /documentation was
      // the purchased UI template's own developer docs ("Crypgo"), live and
      // indexable. Both are duplicate or foreign content to a reviewer.
      { source: "/mentor", destination: "/contact", permanent: true },
      { source: "/documentation", destination: "/", permanent: true },
      // A single-drug demo page with a search box that did nothing.
      { source: "/flash-cards/sample", destination: "/flash-cards", permanent: true },
      // The legacy /simulations hub, its eight labs and /compounding-lab were
      // removed on 2026-10-20 in favour of /virtual-labs. Titration and the
      // compounding lab have a direct successor; every other old lab lands on
      // the Virtual Labs index. Specific rules first — Next matches in order.
      { source: "/simulations", destination: "/virtual-labs", permanent: true },
      {
        source: "/simulations/titration",
        destination: "/virtual-labs/pharmaceutical-chemistry/acid-base-titration",
        permanent: true,
      },
      { source: "/simulations/:path*", destination: "/virtual-labs", permanent: true },
      { source: "/compounding-lab", destination: "/virtual-labs/pharmaceutics/simple-syrup", permanent: true },
    ];
  },

  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "princetonlibrary.org",
      },
    ],
  },
};

// next-pwa was removed on 2026-09-12: the offline story is now the real Android
// app (see mobile/ and android/), and a service worker on top of it only added a
// stale-cache failure mode plus an "Install app" prompt competing with the APK.
// public/sw.js is now a self-destructing worker — see the comment in that file.
export default nextConfig;
