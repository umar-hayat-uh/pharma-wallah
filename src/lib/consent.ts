/**
 * Advertising consent for visitors in the EEA, the UK and Switzerland
 * (2026-10-13, AdSense remediation phase 3).
 *
 * Google requires consent before personalised ads are served there. This is a
 * BASIC banner, not a Google-certified CMP: until the visitor accepts, the
 * AdSense loader is not added to the page at all, so no ad request and no ad
 * cookie is made. Everywhere else the loader stays in <head> as before (AdSense
 * verifies and reviews from there). HUMAN_TODO.md: switch to a certified CMP
 * (AdSense → Privacy & messaging) before serving ads to these regions.
 *
 * The region comes from Vercel's `x-vercel-ip-country` header, read in
 * middleware and passed on as `x-consent-region: 1`. Unknown country → no banner.
 */
export const CONSENT_COOKIE = "pw_ad_consent";
export type ConsentValue = "granted" | "denied";

/** EU/EEA member states + UK + Switzerland, ISO 3166-1 alpha-2. */
export const CONSENT_COUNTRIES: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", // EU 27
  "IS", "LI", "NO", // rest of the EEA
  "GB", "CH",
]);

export function needsConsent(country: string | null | undefined): boolean {
  return Boolean(country && CONSENT_COUNTRIES.has(country.toUpperCase()));
}
