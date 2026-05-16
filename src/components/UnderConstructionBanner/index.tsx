"use client";

import { motion } from "framer-motion";

export default function UnderConstructionBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full"
    >
      {/* ═══ BLACK & YELLOW CAUTION STRIP ═══ */}
      <div
        className="h-3 w-full"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            #facc15 0px,
            #facc15 8px,
            #1f2937 8px,
            #1f2937 16px
          )`,
          backgroundSize: "22.63px 22.63px",
        }}
      />

      {/* ═══ MOVING SLIDER (Marquee) ═══ */}
      <div className="w-full bg-gray-900 overflow-hidden py-1.5 pt-7">
        <div
          className="whitespace-nowrap text-yellow-400 text-xs font-bold uppercase tracking-widest"
          style={{
            animation: "scroll-left 20s linear infinite",
          }}
        >
          <style jsx>{`
            @keyframes scroll-left {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
          <span>
            🚧 Project is under construction · New features rolling out soon · Stay tuned for dashboard, progress tracking & more 🚧 &nbsp;
            🚧 We appreciate your patience while we build the ultimate pharmacy e‑learning platform 🚧
          </span>
        </div>
      </div>
    </motion.div>
  );
}