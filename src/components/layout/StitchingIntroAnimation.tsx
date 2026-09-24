"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function StitchingIntroAnimation() {
  // Always active on browser reload / initial page load
  const [visible, setVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [stitchPhase, setStitchPhase] = useState(0);

  useEffect(() => {
    // When reloading or opening the site, start needle piercing sequence immediately
    setVisible(true);
    setAnimatingOut(false);
    setStitchPhase(0);

    // Phase 0 (0ms - 800ms): Needle rapidly plunges & pierces through the cloth, testing tension
    // Phase 1 (800ms - 2000ms): Needle stitches golden silk thread along the "M" royal monogram & floral flourish
    // Phase 2 (2000ms - 3200ms): Needle pulls up, final lock stitch sparks, and Madhus Boutique emblem shines
    // Phase 3 (3200ms+): Smooth curtain fade out into the storefront
    const t1 = setTimeout(() => setStitchPhase(1), 800);
    const t2 = setTimeout(() => setStitchPhase(2), 2000);
    const t3 = setTimeout(() => {
      handleClose();
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Listen for custom replay event from footer or anywhere
  useEffect(() => {
    const handleReplay = () => {
      setVisible(true);
      setAnimatingOut(false);
      setStitchPhase(0);
      const t1 = setTimeout(() => setStitchPhase(1), 800);
      const t2 = setTimeout(() => setStitchPhase(2), 2000);
      const t3 = setTimeout(() => handleClose(), 3300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };

    window.addEventListener("mb:replay-intro", handleReplay);
    return () => window.removeEventListener("mb:replay-intro", handleReplay);
  }, []);

  const handleClose = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 700);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#170308] overflow-hidden transition-all duration-700 select-none ${
        animatingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-label="Embroidery Stitching Loading Animation"
      role="dialog"
    >
      {/* Atmospheric Silk Texture & Ambient Studio Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,20,38,0.65)_0%,rgba(23,3,8,0.98)_70%)] pointer-events-none" />
      {/* Fine Linen Cloth Weave Texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d4af37 0.8px, transparent 0.8px), radial-gradient(#d4af37 0.8px, #170308 0.8px)`,
          backgroundSize: "14px 14px",
          backgroundPosition: "0 0, 7px 7px",
        }}
      />

      {/* Embroidery Hoop Rig */}
      <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto z-10">
        {/* Wooden Embroidery Hoop Frame with Depth Shadow */}
        <div className="relative w-76 h-76 sm:w-88 sm:h-88 rounded-full border-[12px] border-[#8a4e25] shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(0,0,0,0.7)] flex items-center justify-center bg-[#24060f] overflow-hidden">
          {/* Hoop Brass Tightener Screw at top */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-gradient-to-r from-[#d4af37] via-[#fff4cc] to-[#b8860b] rounded-sm shadow-md border border-[#855e08] z-20" />

          {/* Stretched Taut Fabric Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#3b0c1b_0%,#1c040b_100%)] opacity-95" />

          {/* Needle Piercing SVG Stage */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full relative z-10 overflow-visible"
          >
            <defs>
              {/* Gold Silk Thread Metallic Gradient */}
              <linearGradient id="goldThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7cc" />
                <stop offset="35%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>

              {/* Steel Needle Chrome Finish */}
              <linearGradient id="needleChrome" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="30%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Gold Needle Taper Tip */}
              <linearGradient id="goldTip" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>

              {/* Cloth Piercing Indentation */}
              <radialGradient id="pierceHole" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#080103" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#3b0c1b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b0c1b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Cloth Puncture Pores & Shadow */}
            <ellipse
              cx="150"
              cy="150"
              rx="95"
              ry="95"
              fill="url(#pierceHole)"
            />

            {/* Faint Stencil Trace Marks */}
            <path
              d="M 80,195 L 115,105 L 150,175 L 185,105 L 220,195 M 105,195 Q 150,230 195,195"
              fill="none"
              stroke="#541724"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Realtime Embroidered Machine Stitches (Appears as needle pierces) */}
            <path
              d="M 80,195 L 115,105 L 150,175 L 185,105 L 220,195 M 105,195 Q 150,230 195,195"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="7 3.5"
              className={`transition-all duration-1000 ${
                stitchPhase >= 1 ? "opacity-100" : "opacity-0"
              }`}
              style={{
                strokeDashoffset: stitchPhase >= 1 ? 0 : 550,
                transition: "stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
              }}
            />

            {/* Additional Flourish Stitches */}
            <path
              d="M 150,105 C 130,70 170,70 150,105 M 75,190 C 50,200 65,230 95,205 M 225,190 C 250,200 235,230 205,205"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="5 2.5"
              className={`transition-all duration-700 ${
                stitchPhase >= 2 ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Piercing & Stitching Needle Rig */}
            <g
              className={`transition-all duration-300 transform-gpu ${
                stitchPhase === 0
                  ? "stitch-needle-pierce-rapid"
                  : stitchPhase === 1
                  ? "stitch-needle-travel-monogram"
                  : "stitch-needle-triumph-pull"
              }`}
            >
              {/* Trailing Golden Silk Tension Thread from top spool through needle eye */}
              <path
                d="M 150,-30 Q 170,30 151,75"
                fill="none"
                stroke="url(#goldThreadGrad)"
                strokeWidth="2.5"
                className="opacity-95"
              />

              {/* Needle Blade & Chrome Highlights */}
              <polygon
                points="150,75 152,75 151.5,152 150.5,152"
                fill="url(#needleChrome)"
                stroke="#64748b"
                strokeWidth="0.5"
                filter="drop-shadow(3px 4px 5px rgba(0,0,0,0.8))"
              />
              {/* Needle Eyelet (Thread hole) */}
              <ellipse
                cx="151"
                cy="82"
                rx="1.5"
                ry="4.5"
                fill="#170308"
                stroke="url(#goldTip)"
                strokeWidth="0.8"
              />
              {/* Golden Thread Passing Through Eyelet */}
              <circle cx="151" cy="82" r="1.3" fill="#fff7cc" />
              {/* Razor-sharp Tapered Piercing Tip */}
              <polygon
                points="150.5,152 151.5,152 151,162"
                fill="url(#goldTip)"
              />
              {/* Metallic Polished Specular Gleam */}
              <line
                x1="151"
                y1="90"
                x2="151"
                y2="145"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeOpacity="0.9"
              />
            </g>

            {/* Needle Piercing Spark Punctures */}
            {stitchPhase >= 1 && (
              <g className="animate-ping origin-center">
                <circle cx="150" cy="175" r="3.5" fill="#fef08a" />
                <circle cx="115" cy="105" r="3" fill="#fef08a" />
                <circle cx="185" cy="105" r="3" fill="#fef08a" />
              </g>
            )}
          </svg>

          {/* Center Brand Emblem shining when stitching completes */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 pointer-events-none ${
              stitchPhase >= 2
                ? "opacity-100 scale-100"
                : "opacity-0 scale-85"
            }`}
          >
            <div className="relative w-30 h-30 drop-shadow-[0_0_30px_rgba(212,175,55,0.8)] animate-pulse">
              <Image
                src="/logo-icon.png"
                alt="Madhus Atelier Stitch Emblem"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Text Caption Beneath Hoop */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#dfb15b] text-xs uppercase tracking-[0.25em] font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>
              {stitchPhase === 0
                ? "Needle Piercing Cloth..."
                : stitchPhase === 1
                ? "Machine Stitching Monogram..."
                : "Embroidery Calibrated ✨"}
            </span>
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#fef3c7] tracking-wide">
            Madhus Boutique
          </h2>
          <p className="text-xs text-stone-300 max-w-sm font-sans tracking-wide">
            High-precision digitized machine embroidery & bridal atelier craftsmanship.
          </p>

          {/* Micro Stitch Progress Bar */}
          <div className="w-52 h-1.5 bg-[#3b0c1b] rounded-full mx-auto mt-4 overflow-hidden border border-[#d4af37]/40 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#b8860b] via-[#fde047] to-[#d4af37] transition-all duration-700 ease-out"
              style={{
                width:
                  stitchPhase === 0
                    ? "30%"
                    : stitchPhase === 1
                    ? "75%"
                    : "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Physics Keyframe Animations for Needle Piercing & Stitching */}
      <style jsx global>{`
        /* Rapid needle puncture in & out through fabric tension */
        @keyframes needle-pierce-motion {
          0% {
            transform: translate(0px, -24px) rotate(-6deg) scale(1);
          }
          45% {
            transform: translate(-3px, 20px) rotate(4deg) scale(0.9);
          }
          75% {
            transform: translate(2px, -10px) rotate(-3deg) scale(0.98);
          }
          100% {
            transform: translate(0px, 18px) rotate(3deg) scale(0.92);
          }
        }

        /* Needle traveling along the monogram path */
        @keyframes needle-stitching-travel {
          0% {
            transform: translate(-50px, 25px) rotate(-9deg);
          }
          25% {
            transform: translate(-22px, -40px) rotate(7deg);
          }
          50% {
            transform: translate(0px, 20px) rotate(-6deg);
          }
          75% {
            transform: translate(22px, -40px) rotate(6deg);
          }
          100% {
            transform: translate(50px, 25px) rotate(-5deg);
          }
        }

        /* Final triumphant needle pull-up */
        @keyframes needle-pull-up-final {
          0% {
            transform: translate(50px, 25px) scale(0.92);
          }
          50% {
            transform: translate(0px, -60px) scale(1.1) rotate(14deg);
          }
          100% {
            transform: translate(0px, -95px) scale(1.2) rotate(18deg);
            opacity: 0.15;
          }
        }

        .stitch-needle-pierce-rapid {
          animation: needle-pierce-motion 0.5s infinite alternate ease-in-out;
        }

        .stitch-needle-travel-monogram {
          animation: needle-stitching-travel 1.1s infinite ease-in-out,
            needle-pierce-motion 0.28s infinite alternate ease-in-out;
        }

        .stitch-needle-triumph-pull {
          animation: needle-pull-up-final 0.8s forwards ease-out;
        }
      `}</style>
    </div>
  );
}
