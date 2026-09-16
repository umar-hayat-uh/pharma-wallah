"use client";

import { useAboutMotion } from "./_useAboutMotion";

/**
 * Mounts the page's GSAP scroll choreography.
 *
 * It renders nothing. Keeping the hook behind a component this small is what
 * lets `page.tsx` stay a server component — the motion is an island, and the
 * page's markup and copy never enter the client bundle.
 */
export default function AboutMotion() {
    useAboutMotion();
    return null;
}
