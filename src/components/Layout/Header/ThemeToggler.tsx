'use client';
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch

  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden transition-colors duration-300"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        {isDark ? (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            className="text-yellow-300"
          >
            <path d="M12 3c.132 0 .263 0 .393.005a8 8 0 0 0 3.93 14.342 8 8 0 1 1-4.323-14.347z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            className="text-yellow-500"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v2M12 20v2M4 4l2 2M18 18l2 2M2 12h2M20 12h2M4 20l2-2M18 6l2-2" />
          </svg>
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggler;