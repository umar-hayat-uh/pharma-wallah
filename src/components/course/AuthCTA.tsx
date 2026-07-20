"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthCTA() {
  return (
    <div className="flex justify-center py-8">
      <Link href="/signin" className="focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 rounded-3xl">
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.03 },
            tap: { scale: 0.97 },
          }}
          className="relative flex items-center gap-5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-3 pr-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] transition-shadow cursor-pointer overflow-hidden group"
        >
          {/* Subtle animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon Container */}
          <div className="relative z-10 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100/50 p-2">
            <svg
              width="64"
              height="64"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              {/* Ambient glowing orb behind lock */}
              <motion.circle
                cx="40"
                cy="40"
                r="24"
                fill="#3b82f6"
                filter="blur(16px)"
                variants={{
                  rest: { opacity: 0.15, scale: 1 },
                  hover: { opacity: 0.3, scale: 1.2 },
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Lock Icon */}
              <motion.g
                variants={{
                  rest: { rotate: 0 },
                  hover: { rotate: [0, -8, 4, 0] },
                }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
              >
                {/* Shackle (Unlocks on hover) */}
                <motion.path
                  variants={{
                    rest: { y: 0 },
                    hover: { y: -6 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  d="M30 36V26a10 10 0 0 1 20 0v10"
                  stroke="url(#lockGradient)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Lock Body */}
                <rect
                  x="24"
                  y="36"
                  width="32"
                  height="24"
                  rx="6"
                  fill="url(#lockGradient)"
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Keyhole */}
                <circle cx="40" cy="45" r="3" fill="white" />
                <path
                  d="M40 48v4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Floating Ambient Particles */}
              <motion.circle
                cx="14"
                cy="20"
                r="3"
                fill="#60a5fa"
                animate={{ y: [0, -10, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="66"
                cy="60"
                r="4"
                fill="#818cf8"
                animate={{ y: [0, 10, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <motion.circle
                cx="64"
                cy="24"
                r="2"
                fill="#34d399"
                animate={{ y: [0, -8, 0], opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="lockGradient" x1="24" y1="26" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Text Content */}
          <div className="relative z-10 flex flex-col items-start gap-0.5">
            <span className="text-[1.05rem] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Unlock the Discussion
            </span>
            <span className="flex items-center text-[0.875rem] font-medium text-blue-600">
              Sign In / Sign Up to Comment
              <motion.span
                variants={{
                  rest: { x: 0, opacity: 0.7 },
                  hover: { x: 4, opacity: 1 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="ml-1.5 inline-block"
              >
                →
              </motion.span>
            </span>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}