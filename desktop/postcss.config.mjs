import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * The Tailwind config MUST be named explicitly.
 *
 * `next build desktop` runs with the process cwd at the repo root, so
 * Tailwind's auto-detection finds the *web* tailwind.config.ts instead of this
 * project's. That silently produces a stylesheet with none of the app's own
 * classes and none of the shadcn/ui tokens — `@apply border-border` then fails
 * outright. Same trap as the Android build (MEMORY gotcha 23).
 */
const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: { config: join(here, "tailwind.config.ts") },
  },
};

export default config;
