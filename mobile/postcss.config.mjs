import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * The Tailwind config MUST be named explicitly.
 *
 * `next build mobile` runs with the process cwd at the repo root, so Tailwind's
 * auto-detection finds the *web* tailwind.config.ts instead of this project's.
 * That silently produced a stylesheet with none of the app's own classes in it
 * (the web config's `content` globs never look at mobile/), and with none of the
 * shadcn/ui tokens — `@apply border-border` then fails outright.
 */
const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: { config: join(here, "tailwind.config.ts") },
  },
};

export default config;
