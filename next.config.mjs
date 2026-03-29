// next.config.mjs
import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Optional: customize runtime caching
  runtimeCaching: [
    // add custom strategies if needed
  ],
  // Exclude large files from precaching if necessary
  exclude: [
    ({ asset }) => asset.name.startsWith('server/'),
    ({ size }) => size > 500000, // skip files > 500KB
  ],
});

export default withPWA(nextConfig);