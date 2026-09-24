// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Course lesson markdown lives in /content (not public/) and is read from disk
  // at request time by src/lib/courses/content.ts. The file tracer cannot follow
  // a runtime path, so include the folder in the lesson route's bundle
  // explicitly — without this the deployed lesson pages would find no files.
  experimental: {
    outputFileTracingIncludes: {
      "/courses/[subjectSlug]/[unit]": ["./content/**/*"],
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
      // Removed 2026-09-23 while preparing the AdSense review. /mentor was a
      // second copy of /contact under a different heading; /documentation was
      // the purchased UI template's own developer docs ("Crypgo"), live and
      // indexable. Both are duplicate or foreign content to a reviewer.
      { source: "/mentor", destination: "/contact", permanent: true },
      { source: "/documentation", destination: "/", permanent: true },
      // A single-drug demo page with a search box that did nothing.
      { source: "/flash-cards/sample", destination: "/flash-cards", permanent: true },
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
