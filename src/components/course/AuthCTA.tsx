"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";

const LOOP = 6; // Master duration (seconds)

export default function AuthCTA() {
  const shouldReduceMotion = useReducedMotion();

  const loop = (transition: Record<string, unknown>) =>
    shouldReduceMotion
      ? { duration: 0 }
      : { repeat: Infinity, ease: "easeInOut", ...transition };

  // --- Animation Variants ---
  // Standing Capsule Mascot (Left)
  const capsuleVariants: Variants = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [0, -8, 0, -4, 0],
          rotate: [-3, -6, -3, 0, -3],
          scaleY: [1, 1.04, 1, 1.02, 1],
          transition: loop({ duration: LOOP, times: [0, 0.25, 0.5, 0.75, 1], delay: 0.1 }),
        },
    hover: {
      y: -4,
      rotate: 10, // Leans in toward the Sign In button on hover
      scale: 1.08,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  // Beaker Mascot (Right)
  const beakerVariants: Variants = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [0, -8, 0, -4, 0],
          rotate: [0, 4, 0, -3, 0],
          scaleY: [1, 1.06, 1, 1.03, 1],
          transition: loop({ duration: LOOP, times: [0, 0.25, 0.5, 0.75, 1] }),
        },
    hover: {
      y: -8,
      scale: 1.08,
      transition: { type: "spring", stiffness: 300, damping: 12 },
    },
  };

  const bubbleVariants: Variants = {
    animate: shouldReduceMotion
      ? {}
      : {
          scale: [1, 1.04, 1],
          y: [0, -4, 0],
          transition: loop({ duration: LOOP / 2, times: [0, 0.5, 1] }),
        },
    hover: {
      scale: 1.05,
      y: -4,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  };

  const arrowVariants: Variants = {
    animate: shouldReduceMotion
      ? { opacity: 0.9 }
      : {
          opacity: [0.3, 1, 0.3],
          y: [0, 8, 0],
          transition: loop({ duration: LOOP / 3, times: [0, 0.5, 1] }),
        },
  };

  return (
    <div className="flex justify-center py-8">
      <Link
        href="/signin"
        aria-label="Sign in or sign up to join the discussion"
        className="focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/50 rounded-[2.2rem]"
      >
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.02 },
            tap: { scale: 0.98 },
          }}
          className="relative w-[360px] sm:w-[480px] aspect-video overflow-hidden rounded-[2.2rem] border border-white/90 shadow-[0_12px_40px_rgba(30,41,59,0.12)] hover:shadow-[0_22px_50px_rgba(168,85,247,0.25)] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-purple-100/90 via-blue-50/70 to-emerald-50/80 backdrop-blur-md"
        >
          {/* Animated Background Aura */}
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0,transparent_50%)] pointer-events-none"
            animate={
              shouldReduceMotion
                ? {}
                : { rotate: [0, 360], scale: [1, 1.1, 1] }
            }
            transition={loop({ duration: 18, ease: "linear" })}
          />

          {/* Floating background motifs */}
          <FloatingCrosses reduced={!!shouldReduceMotion} />

          {/* Main SVG Scene */}
          <svg
            viewBox="0 0 400 225"
            className="relative z-10 w-full h-full drop-shadow-md select-none"
            role="img"
            aria-labelledby="authCtaTitle"
          >
            <title id="authCtaTitle">
              A standing purple capsule and beaker mascot point towards signing in.
            </title>

            <defs>
              {/* Purple Capsule Top Half (Cap) */}
              <linearGradient id="capsuleCapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>

              {/* Purple Capsule Bottom Half (Body) */}
              <linearGradient id="capsuleBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>

              {/* Beaker Gradient */}
              <linearGradient id="beakerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>

              {/* CTA Button Gradient */}
              <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              {/* Soft Drop Shadow */}
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Central Speech Bubble */}
            <g transform="translate(200 56)">
              <motion.g variants={bubbleVariants} animate="animate" filter="url(#softShadow)">
                <rect
                  x="-125"
                  y="-34"
                  width="250"
                  height="62"
                  rx="24"
                  fill="#ffffff"
                  stroke="#c084fc"
                  strokeWidth="2.5"
                />
                <path
                  d="M -14 28 L 0 45 L 14 28 Z"
                  fill="#ffffff"
                  stroke="#c084fc"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={800}
                  fontSize="13.5"
                  fill="#1e293b"
                  className="tracking-tight"
                >
                  Ready to join in? 🚀
                </text>
                <text
                  x="0"
                  y="15"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={600}
                  fontSize="12"
                  fill="#64748b"
                >
                  Sign in or sign up below 💬
                </text>
              </motion.g>

              {/* Orbiting Sparkles */}
              <Sparkle radius={135} startAngle={30} duration={LOOP} reduced={!!shouldReduceMotion} />
              <Sparkle radius={145} startAngle={210} duration={LOOP * 1.2} reduced={!!shouldReduceMotion} />
              <Sparkle radius={115} startAngle={300} duration={LOOP * 0.9} reduced={!!shouldReduceMotion} />
            </g>

            {/* Mascot 1: Standing Purple Capsule (Left, Pointing) */}
            <motion.g
              variants={capsuleVariants}
              animate="animate"
              transform="translate(82 110)"
              filter="url(#softShadow)"
              style={{ transformOrigin: "0px 45px" }}
            >
              {/* Shoes & Legs */}
              <path d="M -8 52 L -12 68 M 8 52 L 12 68" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="-13" cy="70" rx="8" ry="5" fill="#9333ea" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="13" cy="70" rx="8" ry="5" fill="#9333ea" stroke="#1e293b" strokeWidth="2" />

              {/* Upright Standing Capsule Body */}
              <g>
                {/* Outer Capsule Base Outline */}
                <rect x="-20" y="-10" width="40" height="66" rx="20" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                
                {/* Bottom Half (Body - Indigo/Purple) */}
                <path d="M -20 23 L 20 23 L 20 36 A 20 20 0 0 1 -20 36 Z" fill="url(#capsuleBodyGrad)" stroke="#1e293b" strokeWidth="2.5" />
                
                {/* Top Half (Cap - Vibrant Light Purple) */}
                <path d="M -20 23 A 20 20 0 0 1 20 23 L 20 23 L -20 23 Z" fill="url(#capsuleCapGrad)" stroke="#1e293b" strokeWidth="2.5" />
                <path d="M -20 10 A 20 20 0 0 1 20 10 L 20 23 L -20 23 Z" fill="url(#capsuleCapGrad)" />
                
                {/* Capsule Seam Line */}
                <line x1="-20" y1="23" x2="20" y2="23" stroke="#1e293b" strokeWidth="2" />

                {/* Glossy Reflection Highlight */}
                <rect x="-14" y="-2" width="6" height="48" rx="3" fill="#ffffff" opacity="0.4" />
              </g>

              {/* Face & Blinking Eyes (Positioned on the top cap) */}
              <BlinkingEyes cx1={-5} cx2={7} cy={8} reduced={!!shouldReduceMotion} />
              <path d="M -4 16 Q 1 21 6 16" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="-11" cy="14" r="3" fill="#f43f5e" opacity="0.4" />
              <circle cx="13" cy="14" r="3" fill="#f43f5e" opacity="0.4" />

              {/* Left Arm (Relaxed at side) */}
              <path d="M -20 25 Q -32 35 -28 48" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="-28" cy="48" r="4.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />

              {/* Right Arm & Pointing Hand (Actively pointing down-right toward Sign In) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: [0, 8, 0],
                        transition: loop({ duration: 2 }),
                      }
                }
                style={{ transformOrigin: "18px 25px" }}
              >
                {/* Reaching Arm */}
                <path d="M 18 25 Q 35 38 45 52" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                
                {/* Pointing Hand with Index Finger Extended */}
                <g transform="translate(46 54) rotate(35)">
                  <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                  {/* Finger pointing toward button */}
                  <path d="M 0 0 L 16 16" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                </g>
              </motion.g>
            </motion.g>

            {/* Mascot 2: Cheering Beaker (Right) */}
            <motion.g
              variants={beakerVariants}
              animate="animate"
              transform="translate(318 130)"
              filter="url(#softShadow)"
              style={{ transformOrigin: "0px 30px" }}
            >
              {/* Shoes & Legs */}
              <path d="M -8 34 L -12 50 M 8 34 L 12 50" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="-13" cy="51" rx="8" ry="5" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="13" cy="51" rx="8" ry="5" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />

              {/* Left Arm (Cheering) */}
              <motion.path
                d="M -22 15 Q -42 2 -36 -14"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="-36" cy="-14" r="5" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />

              {/* Beaker Body */}
              <path
                d="M -12 -28 L -12 -8 L -28 26 A 9 9 0 0 0 -20 38 L 20 38 A 9 9 0 0 0 28 26 L 12 -8 L 12 -28 Z"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M -22 12 L 22 12 L 28 26 A 9 9 0 0 1 20 38 L -20 38 A 9 9 0 0 1 -28 26 Z"
                fill="url(#beakerGrad)"
                stroke="#1e293b"
                strokeWidth="2.5"
              />
              <ellipse cx="0" cy="-28" rx="14" ry="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />

              {/* Rising Liquid Bubbles */}
              <motion.circle
                cx="-8"
                cy="24"
                r="3"
                fill="#ffffff"
                opacity={0.8}
                animate={shouldReduceMotion ? {} : { cy: [26, -10], opacity: [0.9, 0] }}
                transition={loop({ duration: 2, ease: "easeOut" })}
              />
              <motion.circle
                cx="6"
                cy="28"
                r="2"
                fill="#ffffff"
                opacity={0.8}
                animate={shouldReduceMotion ? {} : { cy: [30, -5], opacity: [0.9, 0] }}
                transition={loop({ duration: 2.5, delay: 0.7, ease: "easeOut" })}
              />

              {/* Face & Blinking Eyes */}
              <BlinkingEyes cx1={-7} cx2={7} cy={20} reduced={!!shouldReduceMotion} />
              <path d="M -4 26 Q 0 30 4 26" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="-13" cy="23" r="3.5" fill="#10b981" opacity="0.4" />
              <circle cx="13" cy="23" r="3.5" fill="#10b981" opacity="0.4" />

              {/* Right Arm (Cheering) */}
              <motion.path
                d="M 22 15 Q 42 2 36 -14"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="36" cy="-14" r="5" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
            </motion.g>

            {/* Directional Arrow */}
            <motion.g variants={arrowVariants} animate="animate">
              <path d="M 200 116 L 200 162" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" />
              <path d="M 193 154 L 200 165 L 207 154" stroke="#8b5cf6" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>

            {/* Target CTA Button: Sign In / Sign Up */}
            <g transform="translate(200 194)">
              <motion.g
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <rect
                  x="-68"
                  y="-17"
                  width="136"
                  height="34"
                  rx="17"
                  fill="url(#btnGrad)"
                  filter="url(#softShadow)"
                />
                <rect x="-64" y="-14" width="128" height="12" rx="6" fill="#ffffff" opacity="0.25" />
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight={700}
                  fontSize="13"
                  fill="#ffffff"
                  className="tracking-wider uppercase"
                >
                  Sign In / Sign Up
                </text>
              </motion.g>
            </g>
          </svg>
        </motion.div>
      </Link>
    </div>
  );
}

/** Animated Eye Blink Helper */
function BlinkingEyes({ cx1, cx2, cy, reduced }: { cx1: number; cx2: number; cy: number; reduced: boolean }) {
  return (
    <motion.g
      animate={
        reduced
          ? {}
          : {
              scaleY: [1, 1, 0.1, 1, 1],
            }
      }
      transition={{
        repeat: Infinity,
        repeatDelay: 3.5,
        duration: 0.2,
      }}
      style={{ transformOrigin: `0px ${cy}px` }}
    >
      <ellipse cx={cx1} cy={cy} rx="2.5" ry="4.2" fill="#1e293b" />
      <ellipse cx={cx2} cy={cy} rx="2.5" ry="4.2" fill="#1e293b" />
      <circle cx={cx1 + 1} cy={cy - 1.5} r="1.2" fill="#ffffff" />
      <circle cx={cx2 + 1} cy={cy - 1.5} r="1.2" fill="#ffffff" />
    </motion.g>
  );
}

/** Orbiting Sparkle Component */
function Sparkle({ radius, startAngle, duration, reduced }: { radius: number; startAngle: number; duration: number; reduced: boolean }) {
  const angles = [startAngle, startAngle + 360];
  const cx = angles.map((a) => radius * Math.cos((a * Math.PI) / 180) * 0.42);
  const cy = angles.map((a) => radius * Math.sin((a * Math.PI) / 180) * 0.22);

  return (
    <motion.g
      animate={
        reduced
          ? { opacity: 0.8 }
          : {
              x: cx,
              y: cy,
              opacity: [0.2, 1, 0.2],
              scale: [0.7, 1.3, 0.7],
              rotate: [0, 180, 360],
            }
      }
      transition={reduced ? { duration: 0 } : { duration, repeat: Infinity, ease: "linear" }}
    >
      <path d="M0 -6 Q 0 0 6 0 Q 0 0 0 6 Q 0 0 -6 0 Q 0 0 0 -6 Z" fill="#fbbf24" />
    </motion.g>
  );
}

/** Floating Pharmacy Cross Background Motifs */
function FloatingCrosses({ reduced }: { reduced: boolean }) {
  const crosses = [
    { top: "10%", left: "8%", size: 26, delay: 0 },
    { top: "68%", left: "10%", size: 20, delay: 0.8 },
    { top: "14%", left: "86%", size: 22, delay: 1.4 },
    { top: "74%", left: "86%", size: 28, delay: 0.4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {crosses.map((c, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          width={c.size}
          height={c.size}
          style={{ position: "absolute", top: c.top, left: c.left }}
          className="text-purple-400/35"
          animate={
            reduced
              ? { opacity: 0.3 }
              : { y: [0, -12, 0], opacity: [0.2, 0.6, 0.2], rotate: [0, 15, 0] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: LOOP, repeat: Infinity, ease: "easeInOut", delay: c.delay }
          }
        >
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </motion.svg>
      ))}
    </div>
  );
}