// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
    return [{ source: "/molecule-viewer", destination: "/molecular-lab", permanent: true }];
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
