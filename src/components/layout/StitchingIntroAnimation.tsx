"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, X } from "lucide-react";

export function StitchingIntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [stitchPhase, setStitchPhase] = useState(0);

  useEffect(() => {
    // Check if user has already seen the intro animation in this session
    try {
      const alreadySeen = sessionStorage.getItem("mb_stitch_intro_seen");
      if (!alreadySeen) {
        setVisible(true);
        // Stage transitions:
        // 0: Initial piercing starts (0s)
        // 1: Stitching monogram & flourish (0.6s)
        // 2: Final lock stitch & gold brand reveal (1.8s)
        // 3: Fade out to website (2.9s)
        const t1 = setTimeout(() => setStitchPhase(1), 600);
        const t2 = setTimeout(() => setStitchPhase(2), 1700);
        const t3 = setTimeout(() => {
          handleClose();
        }, 3000);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    } catch {
      // Storage unavailable fallback
      setVisible(false);
    }
  }, []);

  // Listen for custom replay event from footer or anywhere
  useEffect(() => {
    const handleReplay = () => {
      setVisible(true);
      setAnimatingOut(false);
      setStitchPhase(0);
      const t1 = setTimeout(() => setStitchPhase(1), 600);
      const t2 = setTimeout(() => setStitchPhase(2), 1700);
      const t3 = setTimeout(() => handleClose(), 3000);
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
    try {
      sessionStorage.setItem("mb_stitch_intro_seen", "true");
    } catch {
      // ignore
    }
    setTimeout(() => {
      setVisible(false);
    }, 600);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#1e050c] overflow-hidden transition-all duration-700 select-none ${
        animatingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-label="Embroidery Stitching Atelier Loading Animation"
      role="dialog"
    >
      {/* Skip Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#fef3c7] text-xs font-medium backdrop-blur-md border border-white/15 transition-all cursor-pointer group"
      >
        <span>Skip Intro</span>
        <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Atmospheric Fabric & Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,20,38,0.5)_0%,rgba(30,5,12,0.95)_70%)] pointer-events-none" />
      {/* Fine Linen Cloth Weave Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#d4af37 0.75px, transparent 0.75px), radial-gradient(#d4af37 0.75px, #1e050c 0.75px)`,
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      />

      {/* Embroidery Hoop Container */}
      <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        {/* Wooden Embroidery Hoop Frame */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-full border-[10px] border-[#935c33] shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center bg-[#290812] overflow-hidden">
          {/* Hoop Brass Tightener Clamp at top */}
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-r from-[#d4af37] via-[#fff4cc] to-[#b8860b] rounded-sm shadow-md border border-[#855e08] z-10" />

          {/* Inner Fabric Texture with Cross-Stitch Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#3b0c1b_0%,#20050e_100%)] opacity-90" />

          {/* SVG Canvas for Stitch Path and Needle */}
          <svg
            viewBox="0 0 300 300"
            className="w-full h-full relative z-10 overflow-visible"
          >
            <defs>
              {/* Gold Thread Metallic Gradient */}
              <linearGradient id="goldThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3bf" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa7c11" />
              </linearGradient>

              {/* Steel Needle Chrome Gradient */}
              <linearGradient id="needleChrome" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="40%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Gold Needle Tip Gradient */}
              <linearGradient id="goldTip" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#fff08a" />
              </linearGradient>

              {/* Needle Pierce Fabric Shadow */}
              <radialGradient id="pierceShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#24050e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#24050e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Simulated Fabric Pierce Indentation Shadow */}
            <ellipse
              cx="150"
              cy="150"
              rx="90"
              ry="90"
              fill="url(#pierceShadow)"
              className="animate-pulse"
            />

            {/* Dotted Embroidery Guide Trace Outline */}
            <path
              d="M 85,190 L 115,110 L 150,175 L 185,110 L 215,190 M 110,190 Q 150,225 190,190"
              fill="none"
              stroke="#541724"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Realtime Embroidered Machine Stitches (Appears as Needle Pierces) */}
            <path
              d="M 85,190 L 115,110 L 150,175 L 185,110 L 215,190 M 110,190 Q 150,225 190,190"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3"
              className={`transition-all duration-1000 ${
                stitchPhase >= 1 ? "stroke-path-draw" : "opacity-0"
              }`}
              style={{
                strokeDashoffset: stitchPhase >= 1 ? 0 : 500,
                transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
              }}
            />

            {/* Floral Petal Flourish Stitches */}
            <path
              d="M 150,110 C 135,80 165,80 150,110 M 80,185 C 60,195 70,220 95,200 M 220,185 C 240,195 230,220 205,200"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 2"
              className={`transition-all duration-700 ${
                stitchPhase >= 2 ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Dynamic Embroidery Needle Piercing & Stitching Rig */}
            <g
              className={`transition-all duration-300 transform-gpu ${
                stitchPhase === 0
                  ? "wa-needle-pierce-fast"
                  : stitchPhase === 1
                  ? "wa-needle-stitching-path"
                  : "wa-needle-pull-up"
              }`}
            >
              {/* Silk Tension Thread trailing from needle eye */}
              <path
                d="M 160,-20 Q 175,40 156,70"
                fill="none"
                stroke="url(#goldThreadGrad)"
                strokeWidth="2.5"
                className="opacity-90"
              />

              {/* The Needle Body */}
              {/* Needle Blade */}
              <polygon
                points="155,70 157,70 156.5,145 155.5,145"
                fill="url(#needleChrome)"
                stroke="#64748b"
                strokeWidth="0.5"
                filter="drop-shadow(3px 4px 6px rgba(0,0,0,0.7))"
              />
              {/* Needle Eyelet */}
              <ellipse
                cx="156"
                cy="76"
                rx="1.5"
                ry="4"
                fill="#1e050c"
                stroke="url(#goldTip)"
                strokeWidth="0.8"
              />
              {/* Thread knot inside Eyelet */}
              <circle cx="156" cy="76" r="1.2" fill="#fff3bf" />
              {/* Needle Sharp Piercing Tip (Gold Taper) */}
              <polygon
                points="155.5,145 156.5,145 156,155"
                fill="url(#goldTip)"
              />
              {/* Metallic Gleam Highlight */}
              <line
                x1="156"
                y1="85"
                x2="156"
                y2="135"
                stroke="#ffffff"
                strokeWidth="0.75"
                strokeOpacity="0.8"
              />
            </g>

            {/* Needle Piercing Sparkles */}
            {stitchPhase >= 1 && (
              <g className="animate-ping origin-center">
                <circle cx="150" cy="175" r="3" fill="#fef08a" />
                <circle cx="115" cy="110" r="2.5" fill="#fef08a" />
                <circle cx="185" cy="110" r="2.5" fill="#fef08a" />
              </g>
            )}
          </svg>

          {/* Center Brand Emblem revealing when stitching locks */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 pointer-events-none ${
              stitchPhase >= 2
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90"
            }`}
          >
            <div className="relative w-28 h-28 drop-shadow-[0_0_25px_rgba(212,175,55,0.7)] animate-pulse">
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
                ? "Calibrating Needle & Tension..."
                : stitchPhase === 1
                ? "Machine Stitching In Progress..."
                : "Atelier Perfection Calibrated ✨"}
            </span>
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#fef3c7] tracking-wide">
            Madhus Boutique
          </h2>
          <p className="text-xs text-stone-300 max-w-sm font-sans tracking-wide">
            High-precision digitized machine embroidery & bridal atelier craftsmanship.
          </p>

          {/* Micro Progress Line */}
          <div className="w-48 h-1 bg-[#4a1220] rounded-full mx-auto mt-4 overflow-hidden border border-[#d4af37]/30">
            <div
              className="h-full bg-gradient-to-r from-[#b8860b] via-[#fef08a] to-[#d4af37] transition-all duration-700 ease-out"
              style={{
                width:
                  stitchPhase === 0
                    ? "25%"
                    : stitchPhase === 1
                    ? "70%"
                    : "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframe Styles for Needle Physics */}
      <style jsx global>{`
        /* Needle fast pierce motion into fabric */
        @keyframes needle-pierce {
          0% {
            transform: translate(0px, -20px) rotate(-6deg) scale(1);
          }
          40% {
            transform: translate(-3px, 16px) rotate(4deg) scale(0.92);
          }
          70% {
            transform: translate(2px, -8px) rotate(-3deg) scale(0.98);
          }
          100% {
            transform: translate(0px, 14px) rotate(2deg) scale(0.93);
          }
        }

        /* Needle moving along the embroidery monogram */
        @keyframes needle-stitching {
          0% {
            transform: translate(-45px, 20px) rotate(-8deg);
          }
          25% {
            transform: translate(-20px, -35px) rotate(6deg);
          }
          50% {
            transform: translate(0px, 15px) rotate(-5deg);
          }
          75% {
            transform: translate(25px, -35px) rotate(5deg);
          }
          100% {
            transform: translate(45px, 20px) rotate(-4deg);
          }
        }

        /* Needle final pull-up triumph */
        @keyframes needle-pull-up {
          0% {
            transform: translate(45px, 20px) scale(0.95);
          }
          60% {
            transform: translate(0px, -50px) scale(1.1) rotate(12deg);
          }
          100% {
            transform: translate(0px, -80px) scale(1.15) rotate(15deg);
            opacity: 0.2;
          }
        }

        .wa-needle-pierce-fast {
          animation: needle-pierce 0.6s infinite alternate ease-in-out;
        }

        .wa-needle-stitching-path {
          animation: needle-stitching 1.2s infinite ease-in-out,
            needle-pierce 0.3s infinite alternate ease-in-out;
        }

        .wa-needle-pull-up {
          animation: needle-pull-up 0.9s forwards ease-out;
        }
      `}</style>
    </div>
  );
}
