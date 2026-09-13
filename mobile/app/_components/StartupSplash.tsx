"use client";

import { useEffect, useState } from "react";
import { PharmaLoader, LoaderSteps } from "@/components/loading/PharmaLoader";
import { TOOL_SLUGS } from "../_generated/tool-slugs";

/**
 * How long the splash stays up before fading, in ms. Long enough for the
 * procedure line (a 1.8 s cycle) to reach its last step, short enough not to
 * delay the catalogue noticeably.
 */
const HOLD_MS = 1500;
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
 *
 * The mark is the shared PharmaLoader (src/components/loading/) — the same
 * capsule the website shows while a page loads — replacing a stock calculator
 * icon. The tool count comes from the generated slug list, so it cannot go
 * stale the way the hand-typed "97 calculators" did.
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
        <PharmaLoader tone="brand" label="Starting PharmaWallah" showSteps={false} />
      </div>

      <div className="pw-splash__wordmark">
        <p className="pw-splash__name">PharmaWallah</p>
        <p className="pw-splash__tagline">{TOOL_SLUGS.length} calculators · works offline</p>
      </div>

      <div className="pw-splash__steps">
        <LoaderSteps tone="brand" />
      </div>
    </div>
  );
}
