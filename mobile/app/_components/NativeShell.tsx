"use client";

import { useEffect } from "react";

/**
 * iOS-only native tuning for a form-heavy app. Renders nothing.
 *
 * Two things are wrong by default in a WKWebView that do not matter on
 * Android, and both bite a calculator specifically:
 *
 * 1. **The decimal keypad has no Done key.** Every calculator input is
 *    `type="number" inputMode="decimal"` (NumberField), which on iOS is the
 *    12-key numeric pad — and that pad has no return key, so once it is up the
 *    only way to put it away is to find a gap in a dense form and tap it.
 *    Capacitor ships an accessory bar (‹ › Done) for exactly this and leaves
 *    it off by default.
 *
 * 2. **The focused field can end up under the keyboard.** With
 *    `resize: "native"` the WebView shrinks, and WKWebView usually scrolls the
 *    field into view itself — but not reliably when the field is inside the
 *    sticky-headed scroll container the tool pages use. Re-centring it once,
 *    after the keyboard has finished animating, costs nothing when iOS already
 *    got it right.
 *
 * Android is deliberately untouched: `setAccessoryBarVisible` is a no-op there,
 * and the scroll correction is skipped, so the APK behaves exactly as it did
 * before this component existed.
 */
export default function NativeShell() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.getPlatform() !== "ios") return;

        const { Keyboard } = await import("@capacitor/keyboard");
        if (cancelled) return;

        await Keyboard.setAccessoryBarVisible({ isVisible: true });

        const handle = await Keyboard.addListener("keyboardDidShow", () => {
          const el = document.activeElement;
          if (!(el instanceof HTMLElement)) return;
          const box = el.getBoundingClientRect();
          // Only act when the field is actually out of the resized viewport —
          // scrolling a field that is already comfortably visible would yank
          // the page under the student's thumb for no reason.
          if (box.top >= 0 && box.bottom <= window.innerHeight) return;
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        });

        if (cancelled) {
          await handle.remove();
          return;
        }
        cleanup = () => {
          void handle.remove();
        };
      } catch {
        // Not running natively (the export opened in a desktop browser), or the
        // plugin is missing. The app is usable either way, so this stays quiet.
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
