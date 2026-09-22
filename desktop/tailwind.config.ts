import { existsSync } from "node:fs";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import baseConfig from "../tailwind.config";

/**
 * The Windows desktop app keeps the web project's brand tokens (brandBlue,
 * brandGreen, the shared animations including the calculator kit's liquid
 * glass) so a calculator looks identical in the .exe, in the APK and on the
 * web, and layers shadcn/ui's CSS-variable tokens on top for the app's chrome.
 */
const CONTENT = [
  "./desktop/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/(site)/calculation-tools/**/*.{js,ts,jsx,tsx,mdx}",
  // shadcn/ui primitives and the calculator kit are shared with the website;
  // without these globs their classes never reach the desktop stylesheet.
  "./src/components/ui/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/calculators/**/*.{js,ts,jsx,tsx,mdx}",
];

for (const dir of [
  "./desktop/app",
  "./src/app/(site)/calculation-tools",
  "./src/components/ui",
  "./src/components/calculators",
]) {
  if (!existsSync(dir)) {
    throw new Error(
      `[desktop/tailwind.config.ts] "${dir}" not found from cwd "${process.cwd()}". ` +
        `Tailwind resolves content globs against the process cwd, so this build must run ` +
        `from the repo root — use \`npm run desktop:build\`. Continuing would emit a ` +
        `stylesheet with no utility classes and ship an unstyled desktop app.`,
    );
  }
}

const baseExtend = (baseConfig.theme?.extend ?? {}) as Record<string, unknown>;
const baseColors = (baseExtend.colors ?? {}) as Record<string, unknown>;

const config: Config = {
  ...baseConfig,
  // Relative to the PROCESS CWD, not to this file — see MEMORY gotcha 23(b).
  content: CONTENT,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseExtend,
      colors: {
        ...baseColors,
        /* ── shadcn/ui tokens, driven by the CSS variables in app/globals.css ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
