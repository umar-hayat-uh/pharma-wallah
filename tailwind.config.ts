import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /*
       * Outfit, loaded by next/font in src/app/layout.tsx (and mobile/app/layout.tsx,
       * which inherits this config) and exposed as --font-outfit on <html>.
       *
       * Overriding `sans` matters as much as the <body> class: ~10 pages and
       * components use the `font-sans` utility on their root element, and with
       * Tailwind's default stack that utility silently overrode the body font
       * with system-ui. They now resolve to Outfit like everything else.
       */
      fontFamily: {
        sans: ["var(--font-outfit)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brandBlue: "#1C7BD9",
        brandGreen: "#21B67A",

        textDark: "#1A1A1A",
        textLight: "#4A4A4A",
        softBg: "#F4FBFF",
        softBg2: "#E9F7F2",

        /*
         * `primary` keeps the exact brandBlue it always was (#1C7BD9 === hsl(210 77% 48%)),
         * now driven by the CSS variable in globals.css so shadcn/ui components and the
         * existing site markup share one accent. `secondary` likewise stays brandGreen.
         * Existing `bg-primary` / `text-primary` usages are unaffected.
         */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: "#21B67A",

        /* ── shadcn/ui tokens ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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

        grey: "#6B7280",
        midnight_text: "#1A1A1A",
        slateGray: "#F4FBFF",
        deepSlate: "#E0F5FF",

        /* ── Clinical sub-brand tokens ── */
        clinicalPrimary: "#1C7BD9",
        clinicalAccent: "#0D9488",
        clinicalDark: "#0F172A",
        clinicalMuted: "#64748B",
        clinicalSurface: "#F8FAFC",
      },

      boxShadow: {
        "input-shadow": "0 20px 40px rgba(28, 123, 217, 0.15)",
        "course-shadow": "0 25px 25px rgba(0,0,0,.12)",
        "testimonial-shadow1": "0 5px 10px rgba(0,0,0,.05)",
        "testimonial-shadow2": "0 20px 80px rgba(0,0,0,.10)",
        /* clinical card hover glow */
        "clinical-glow": "0 20px 50px -12px rgba(28, 123, 217, 0.15)",
      },

      spacing: {
        "75%": "75%",
      },

      /*
       * Motion curves for the calculator kit and shadcn primitives. The browser
       * defaults (`ease`, `ease-out`) read as mechanical; these settle the way a
       * physical control does. Values from .claude/skills/top-design.
       */
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },

      backgroundImage: {
        "newsletter-bg": "url('/images/newsletter/bgFile.png')",
        "newsletter-bg-2": "url('/images/newsletter/bgFile.png')",
      },

      animation: {
        marquee: "marquee 25s linear infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
        "clinical-float": "clinicalFloat 6s ease-in-out infinite",
        "clinical-float-delayed": "clinicalFloat 6s ease-in-out 2s infinite",
        "clinical-pulse": "clinicalPulse 3s ease-in-out infinite",
        /* A calculator result arriving — keyed on the value, so it replays each time the answer changes. */
        "calc-result": "calcResult 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        clinicalFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        calcResult: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        clinicalPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  /*
   * tailwindcss-animate supplies the `animate-in` / `data-[state=open]:…`
   * utilities that shadcn/ui components (navigation-menu) are written against.
   * It was already a devDependency but was never registered, so those classes
   * compiled to nothing.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  plugins: [require("tailwindcss-animate")],
};

export default config;