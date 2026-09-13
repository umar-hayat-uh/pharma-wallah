import "./pharma-loader.css";

/**
 * The PharmaWallah loading mark — shared by the website's route loading UI
 * (src/app/loading.tsx) and the Android app's startup splash
 * (mobile/app/_components/StartupSplash.tsx).
 *
 * The brand capsule from the logo, its green half working as a measuring
 * vessel: the liquid sloshes at a meniscus and bubbles rise, and beneath it the
 * compounding procedure every pharmacy student learns first — weigh, dissolve,
 * make up to volume — lights one step at a time. It says "being prepared"
 * rather than "spinner".
 *
 * Deliberately a server-safe component with no hooks and no animation library:
 * the markup is in the first HTML the browser receives (and in the APK's static
 * export), so the CSS animation is already running before any JavaScript does.
 * Plain classes in pharma-loader.css rather than Tailwind, because the mobile
 * build only scans a fixed set of source globs for utility classes.
 *
 * One loader on screen at a time, so the fixed clipPath id cannot collide.
 */
export function PharmaLoader({
  tone = "light",
  label = "Loading",
  showSteps = true,
}: {
  /** "light" on the site's page background; "brand" on the app's blue splash. */
  tone?: "light" | "brand";
  /** Read by screen readers; the visual carries no text of its own beyond the steps. */
  label?: string;
  showSteps?: boolean;
}) {
  return (
    <div className={`pw-loader pw-loader--${tone}`} role="status" aria-live="polite">
      <span className="pw-loader__sr">{label}…</span>

      <svg className="pw-loader__capsule" viewBox="0 0 64 132" aria-hidden="true" focusable="false">
        <defs>
          {/* The inside of the lower half, inset by the outline's stroke. */}
          <clipPath id="pw-loader-vessel">
            <path d="M13.5 66 V100 A18.5 18.5 0 0 0 50.5 100 V66 Z" />
          </clipPath>
        </defs>

        {/* Liquid: a two-period wave that slides sideways, inside a group that
            bobs the level up and down. Clipped to the vessel. */}
        <g clipPath="url(#pw-loader-vessel)">
          <g className="pw-loader__level">
            <path
              className="pw-loader__wave"
              d="M-44 0 Q-33 -4.5 -22 0 T0 0 T22 0 T44 0 T66 0 T88 0 V70 H-44 Z"
            />
          </g>
          <circle className="pw-loader__bubble" cx="25" cy="114" r="2.2" />
          <circle className="pw-loader__bubble pw-loader__bubble--late" cx="39" cy="116" r="1.6" />
        </g>

        {/* Lower half outline and the seam between the halves. */}
        <path className="pw-loader__outline" d="M11 66 V100 A21 21 0 0 0 53 100 V66" />
        {/* Upper half, filled — the blue cap of the logo's capsule. */}
        <path className="pw-loader__cap" d="M9.5 67.5 V32 A22.5 22.5 0 0 1 54.5 32 V67.5 Z" />
        {/* The shine on the cap, as drawn in the logo. */}
        <path className="pw-loader__shine" d="M21 24 Q19 30 19 40" />
        {/* Graduation marks beside the vessel: it measures, it doesn't just hold. */}
        <path className="pw-loader__ticks" d="M58 76 h4 M58 88 h3 M58 100 h4 M58 112 h3" />
      </svg>

      {showSteps && <LoaderSteps tone={tone} />}
    </div>
  );
}

/**
 * The procedure line on its own — for a layout that puts other content (the
 * app splash's wordmark) between the capsule and the steps. Decorative.
 */
export function LoaderSteps({ tone = "light" }: { tone?: "light" | "brand" }) {
  return (
    <p className={`pw-loader__steps pw-loader--${tone}`} aria-hidden="true">
      <span className="pw-loader__step">Weigh</span>
      <span className="pw-loader__dot" />
      <span className="pw-loader__step pw-loader__step--2">Dissolve</span>
      <span className="pw-loader__dot" />
      <span className="pw-loader__step pw-loader__step--3">Make up to volume</span>
    </p>
  );
}
