// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
