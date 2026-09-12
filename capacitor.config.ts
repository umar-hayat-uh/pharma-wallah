import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the static calculator export in an Android WebView.
 *
 * `webDir` points at mobile/out — the output of `npm run mobile:build`, NOT the
 * main Next app, which has API routes and middleware and cannot be exported.
 * Everything in that directory is packaged into the APK, so the calculators
 * work with the device offline.
 */
const config: CapacitorConfig = {
  appId: "com.pharmawallah.calculators",
  appName: "PharmaWallah Calculators",
  webDir: "mobile/out",
  android: {
    // Serve from https://localhost rather than file://, so the WebView keeps a
    // normal secure origin — required for localStorage and absolute /_next
    // asset paths to resolve.
    allowMixedContent: false,

    // The WebView's own background, visible for the instant between the native
    // launch screen disappearing and the page painting. Matching brandBlue is
    // what removes the black flash on startup.
    backgroundColor: "#1C7BD9",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
