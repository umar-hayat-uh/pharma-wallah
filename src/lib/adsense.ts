/**
 * The AdSense publisher ID, in one place.
 *
 * A public identifier (it is in /ads.txt and every page's source), so it is
 * hardcoded with an env override. Until 2026-09-23 only the root layout had the
 * default: AdSlot read NEXT_PUBLIC_ADSENSE_CLIENT alone, so unless that variable
 * was also set in Vercel no ad unit could ever render, even with slot IDs set.
 *
 * The packaged apps (Android, iOS, desktop) build with IS_MOBILE_APP=true and
 * must carry no ad code at all — their audits grep the bundle for "ca-pub". The
 * flag is inlined at build time, so the minifier drops the literal from those
 * builds. The desktop build also blanks NEXT_PUBLIC_ADSENSE_CLIENT, which is why
 * the app check comes first rather than relying on the env fallback.
 */
export const IS_PACKAGED_APP = process.env.NEXT_PUBLIC_IS_MOBILE_APP === "true";

export const ADSENSE_CLIENT: string | undefined = IS_PACKAGED_APP
  ? undefined
  : process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9553986083846603";

/**
 * Master switch for ad UNITS (2026-10-13). Off unless
 * `NEXT_PUBLIC_ADS_ENABLED=true` is set (in Vercel, then redeploy).
 *
 * While AdSense review is pending every slot rendered an empty box labelled
 * "Advertisement" — 3 to 5 per content page — which is exactly what a reviewer
 * judging "low value content" should not see. With the switch off AdSlot
 * renders nothing at all. The loader script and the `google-adsense-account`
 * meta tag in the root layout are NOT affected: AdSense needs them to review
 * and verify the site.
 */
export const ADS_ENABLED = !IS_PACKAGED_APP && process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
