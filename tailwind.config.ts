import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: "#1C7BD9",
        brandGreen: "#21B67A",

        textDark: "#1A1A1A",
        textLight: "#4A4A4A",
        softBg: "#F4FBFF",
        softBg2: "#E9F7F2",

        primary: "#1C7BD9",
        secondary: "#21B67A",
        success: "#21B67A",

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
        clinicalPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;