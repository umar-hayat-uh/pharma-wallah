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
      },

      boxShadow: {
        "input-shadow": "0 20px 40px rgba(28, 123, 217, 0.15)",
        "course-shadow": "0 25px 25px rgba(0,0,0,.12)",
        "testimonial-shadow1": "0 5px 10px rgba(0,0,0,.05)",
        "testimonial-shadow2": "0 20px 80px rgba(0,0,0,.10)",
      },

      spacing: {
        "75%": "75%",
      },

      backgroundImage: {
        "newsletter-bg": "url('/images/newsletter/bgFile.png')",
        "newsletter-bg-2": "url('/images/newsletter/bgFile.png')",
      },

      /** ⭐ ADDING MARQUEE ANIMATION HERE ⭐ **/
      animation: {
        marquee: "marquee 25s linear infinite",
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      /** ⭐ END MARQUEE ANIMATION ⭐ **/
    },
  },
  plugins: [],
};

export default config;
