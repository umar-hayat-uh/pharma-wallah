// next.config.mjs

import withPWAInit from "next-pwa";

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

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,

  disable: process.env.NODE_ENV === "development",

  runtimeCaching: [],

  exclude: [
    ({ asset }) => asset.name.startsWith("server/"),
    ({ size }) => size > 500000,
  ],
});

export default withPWA(nextConfig);