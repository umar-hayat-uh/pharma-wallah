import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

/**
 * Capacitor wraps the static calculator export in an Android WebView and, since
 * 2026-09-22, an iOS WKWebView. Both platforms package the *same* bundle.
 *
 * `webDir` points at mobile/out — the output of `npm run mobile:build`, NOT the
 * main Next app, which has API routes and middleware and cannot be exported.
 * Everything in that directory is packaged into the app, so the calculators
 * work with the device offline.
 *
 * `appName` is the Android launcher label (android/.../values/strings.xml, set
 * once at `cap add` time and not rewritten by sync). iOS deliberately shows the
 * shorter "PharmaWallah" instead — see CFBundleDisplayName in
 * ios/App/App/Info.plist — because the home-screen label truncates at roughly
 * twelve characters.
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
  ios: {
    // Same brandBlue as the native launch screen (Splash.imageset) and the web
    // splash (.pw-splash in mobile/app/globals.css), so the three hand over to
    // each other with no flash of another colour.
    backgroundColor: "#1C7BD9",

    // The web layer already pads for the notch, the Dynamic Island and the home
    // indicator with env(safe-area-inset-*) under viewportFit: cover (see
    // mobile/app/layout.tsx, MobileShell, ToolHub, BottomNav). Letting WKWebView
    // add its own automatic content inset on top of that would double every one
    // of those gaps, so the native inset is switched off and the CSS owns it.
    contentInset: "never",
  },
  server: {
    androidScheme: "https",
    // iOS keeps Capacitor's own scheme: WKWebView cannot register a handler for
    // https, and the origin is what localStorage is keyed to — changing it later
    // would silently empty every student's Recent and Saved list.
    iosScheme: "capacitor",
  },
  plugins: {
    Keyboard: {
      // "native" is the documented default on both platforms, so Android's
      // behaviour is unchanged by this block; it is written out because a
      // calculator is a dense form and the resize mode is the single setting
      // that decides whether the Calculate button stays reachable on an iPhone.
      resize: KeyboardResize.Native,
    },
  },
};

export default config;
