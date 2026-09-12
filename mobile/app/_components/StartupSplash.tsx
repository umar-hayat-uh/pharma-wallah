"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";

/** How long the splash stays up before fading, in ms. */
const HOLD_MS = 1100;
/** Must match the fade duration in the CSS below. */
const FADE_MS = 420;

/**
 * The app's startup animation.
 *
 * Android shows a native launch screen (android/.../drawable/launch_screen.xml)
 * from the tap until the WebView paints, and this takes over from there — both
 * on brandBlue, so the handover is invisible and there is no black gap.
 *
 * Rendered in the static HTML with `visible` starting true, and animated with
 * CSS keyframes rather than a JS animation library, so the animation is already
 * running on the very first paint — before React has hydrated. Hydration then
 * matches (both sides start visible) and the effect below fades it out.
 */
export default function StartupSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), HOLD_MS);
    const remove = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pw-splash"
      data-leaving={leaving ? "true" : undefined}
      // Purely decorative, and it disappears on its own — keep it out of the
      // accessibility tree so a screen reader goes straight to the catalogue.
      aria-hidden="true"
      role="presentation"
    >
      <div className="pw-splash__mark">
        <Calculator strokeWidth={1.75} />
      </div>

      <div className="pw-splash__wordmark">
        <p className="pw-splash__name">PharmaWallah</p>
        <p className="pw-splash__tagline">89 calculators · works offline</p>
      </div>

      <div className="pw-splash__bar">
        <span />
      </div>
    </div>
  );
}
