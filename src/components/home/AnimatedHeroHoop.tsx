"use client";

import React from "react";

export function AnimatedHeroHoop() {
  return (
    <div className="relative w-full h-full select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        className="w-full h-full overflow-hidden rounded-2xl"
      >
        <defs>
          {/* Deep Royal Silk Fabric Gradient */}
          <radialGradient id="heroFabricGrad" cx="50%" cy="50%" r="85%">
            <stop offset="0%" stopColor="#4a0d1e" />
            <stop offset="60%" stopColor="#24050d" />
            <stop offset="100%" stopColor="#120105" />
          </radialGradient>

          {/* Genuine Metallic Gold Embroidery Thread Gradient */}
          <linearGradient id="goldThreadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff9d6" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="65%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#85580a" />
          </linearGradient>

          {/* Chrome Steel Needle Gradient */}
          <linearGradient id="needleChromeFinish" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Gold Needle Tip */}
          <linearGradient id="goldTipFinish" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          {/* Stitch Depth Shadow Filter */}
          <filter id="stitchDepth" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.7" />
          </filter>

          {/* Needle Shadow */}
          <filter id="needleRealShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          {/* Puncture Hole Dimple Gradient */}
          <radialGradient id="punctureHole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#080103" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#2a050f" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2a050f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Fabric Background */}
        <rect width="800" height="600" fill="url(#heroFabricGrad)" />

        {/* Raw Cloth Linen Texture Grid */}
        <g opacity="0.1">
          {Array.from({ length: 40 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 15}
              x2="800"
              y2={i * 15}
              stroke="#d4af37"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 54 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 15}
              y1="0"
              x2={i * 15}
              y2="600"
              stroke="#d4af37"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* 2. Stationary Outer Wooden Hoop Frame */}
        <circle
          cx="400"
          cy="285"
          r="230"
          fill="none"
          stroke="#ca8a04"
          strokeWidth="12"
          opacity="0.9"
          filter="drop-shadow(0 0 30px rgba(0,0,0,0.85))"
        />
        <circle
          cx="400"
          cy="285"
          r="222"
          fill="none"
          stroke="#713f12"
          strokeWidth="3"
        />
        {/* Brass Tension Tightener Clamp at top */}
        <rect
          x="385"
          y="42"
          width="30"
          height="18"
          rx="4"
          fill="#a16207"
          stroke="#eab308"
          strokeWidth="1.5"
        />

        {/* 3. ROTATING EMBROIDERY WHEEL (Continuous Clockwise Rotation) */}
        {/* Fixed: transformOrigin applied in style and CSS without invalid DOM attribute */}
        <g className="wheel-rotate-cw">
          <g transform="translate(400, 285)">
            {/* Faint Tailor's Chalk Stencil Guide Lines (Unstitched fabric template) */}
            <circle
              cx="0"
              cy="0"
              r="190"
              fill="none"
              stroke="#6b1426"
              strokeWidth="1"
              strokeDasharray="2,6"
              opacity="0.6"
            />
            <circle
              cx="0"
              cy="0"
              r="160"
              fill="none"
              stroke="#6b1426"
              strokeWidth="1"
              strokeDasharray="2,6"
              opacity="0.6"
            />
            <circle
              cx="0"
              cy="0"
              r="130"
              fill="none"
              stroke="#6b1426"
              strokeWidth="1"
              strokeDasharray="2,6"
              opacity="0.6"
            />

            {/* Faint Spoke Guides */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 360) / 12;
              return (
                <line
                  key={`spoke-guide-${idx}`}
                  x1="45"
                  y1="0"
                  x2="190"
                  y2="0"
                  stroke="#6b1426"
                  strokeWidth="1"
                  strokeDasharray="2,8"
                  opacity="0.5"
                  transform={`rotate(${angle})`}
                />
              );
            })}

            {/* REAL EMBROIDERED STITCHES (Genuine 3D thread stitches with stitch depth) */}
            {/* Outer Circle Running Stitches */}
            <circle
              cx="0"
              cy="0"
              r="190"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="2.8"
              strokeDasharray="7,3.5"
              strokeLinecap="round"
              filter="url(#stitchDepth)"
            />

            {/* Middle Circle Heavy Satin Stitch Band */}
            <circle
              cx="0"
              cy="0"
              r="160"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="3.2"
              strokeDasharray="5,2.5"
              strokeLinecap="round"
              filter="url(#stitchDepth)"
            />

            {/* Inner Circle Seed Stitches */}
            <circle
              cx="0"
              cy="0"
              r="130"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="2"
              strokeDasharray="4,3"
              strokeLinecap="round"
              filter="url(#stitchDepth)"
            />

            {/* Authentic Embroidered Floral Spokes with Knots */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 360) / 12;
              return (
                <g key={`stitched-spoke-${idx}`} transform={`rotate(${angle})`}>
                  {/* Dense running stitch bar */}
                  <line
                    x1="45"
                    y1="0"
                    x2="190"
                    y2="0"
                    stroke="url(#goldThreadGrad)"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                    strokeLinecap="round"
                    filter="url(#stitchDepth)"
                  />
                  {/* Embroidered French Knot Beads at intersections */}
                  <circle cx="130" cy="0" r="2.2" fill="#fff9d6" filter="url(#stitchDepth)" />
                  <circle cx="160" cy="0" r="2.8" fill="#fde047" filter="url(#stitchDepth)" />
                  <circle cx="190" cy="0" r="3.2" fill="#d4af37" filter="url(#stitchDepth)" />
                </g>
              );
            })}

            {/* Scallop Intersecting Satin Arcs */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * 360) / 8;
              return (
                <path
                  key={`scallop-${idx}`}
                  d="M 130,0 Q 145,26 160,0"
                  fill="none"
                  stroke="url(#goldThreadGrad)"
                  strokeWidth="2.2"
                  strokeDasharray="4,2"
                  strokeLinecap="round"
                  filter="url(#stitchDepth)"
                  transform={`rotate(${angle})`}
                />
              );
            })}

            {/* Central Royal Mandala Lotus Jewel */}
            <circle
              cx="0"
              cy="0"
              r="70"
              fill="#881337"
              stroke="url(#goldThreadGrad)"
              strokeWidth="4"
              filter="url(#stitchDepth)"
            />
            <circle
              cx="0"
              cy="0"
              r="52"
              fill="none"
              stroke="url(#goldThreadGrad)"
              strokeWidth="2.5"
              strokeDasharray="3.5,3.5"
            />
            <circle cx="0" cy="0" r="40" fill="url(#goldThreadGrad)" filter="url(#stitchDepth)" />
            <circle cx="0" cy="0" r="22" fill="#4c0519" />
            <circle cx="0" cy="0" r="8" fill="#fff9d6" />
          </g>
        </g>

        {/* 4. ACTIVE SEWING NEEDLE RIG: Rapid Machine Stitching Cycle Directly Into Fabric */}
        <g className="needle-machine-assembly">
          {/* Real Fabric Puncture Dimple where needle penetrates */}
          <ellipse
            cx="555"
            cy="242"
            rx="12"
            ry="9"
            fill="url(#punctureHole)"
            className="puncture-dimple-pulse"
          />

          {/* Live Thread Flowing from Upper Spool Guide into Needle Eye */}
          <path
            className="upper-spool-thread"
            d="M 400,55 Q 450,110 500,165"
            fill="none"
            stroke="url(#goldThreadGrad)"
            strokeWidth="2.5"
            strokeDasharray="8,2"
            opacity="0.95"
          />

          {/* Active Silk Thread connecting Needle Eye DIRECTLY INTO the Cloth Puncture */}
          <path
            className="penetrating-thread"
            d="M 505,170 Q 532,205 555,242"
            fill="none"
            stroke="url(#goldThreadGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Needle Shaft Assembly (Pierces in & out of the puncture hole) */}
          <g className="needle-piercing-plunge" filter="url(#needleRealShadow)">
            {/* Needle Shaft / Blade */}
            <line
              x1="455"
              y1="110"
              x2="555"
              y2="242"
              stroke="url(#needleChromeFinish)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Specular White Chrome Reflection */}
            <line
              x1="465"
              y1="120"
              x2="542"
              y2="225"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.85"
            />

            {/* Needle Eyelet (Thread hole at upper shaft) */}
            <ellipse
              cx="472"
              cy="132"
              rx="2"
              ry="4"
              fill="#170308"
              stroke="url(#goldTipFinish)"
              strokeWidth="0.8"
              transform="rotate(52 472 132)"
            />
            {/* Gold Thread Passing through Needle Eye */}
            <circle cx="472" cy="132" r="1.5" fill="#fff9d6" />

            {/* Sharp Tapered Piercing Tip penetrating the cloth */}
            <polygon
              points="550,235 560,248 558,230"
              fill="url(#goldTipFinish)"
            />
          </g>

          {/* Stitch Formation Spark Bursts on each needle strike */}
          <g transform="translate(555, 242)" className="needle-stitch-burst">
            <circle cx="0" cy="0" r="5" fill="#fff9d6" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#fde047" strokeWidth="2" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#fde047" strokeWidth="2" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fff9d6" strokeWidth="1.5" />
            <line x1="-5" y1="5" x2="5" y2="-5" stroke="#fff9d6" strokeWidth="1.5" />
          </g>
        </g>

        {/* 5. Fixed Subtitle Seal: MADHUS BOUTIQUE • EST. 2026 */}
        <g transform="translate(400, 545)">
          <rect
            x="-185"
            y="-19"
            width="370"
            height="38"
            rx="19"
            fill="#1e040b"
            stroke="url(#goldThreadGrad)"
            strokeWidth="1.8"
            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
          />
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="14"
            fontWeight="bold"
            fill="#fef3c7"
            letterSpacing="3"
          >
            MADHUS BOUTIQUE • EST. 2026
          </text>
        </g>
      </svg>

      {/* Real Embroidery Machine Keyframe Physics */}
      <style jsx>{`
        /* Smooth continuous clockwise wheel rotation */
        @keyframes rotate-wheel-clockwise {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* High-speed mechanical sewing machine puncture cycle (~1.8Hz machine stroke) */
        @keyframes needle-machine-stitch-stroke {
          0% {
            /* Retracted above cloth */
            transform: translate(0px, 0px);
          }
          40% {
            /* Plunge down deep into fabric */
            transform: translate(16px, 21px);
          }
          55% {
            /* Bottom dead center (fabric penetration) */
            transform: translate(20px, 26px);
          }
          75% {
            /* Ascending & pulling thread tight */
            transform: translate(8px, 10px);
          }
          100% {
            /* Fully returned for next stitch */
            transform: translate(0px, 0px);
          }
        }

        /* Fabric tension indentation pulse when needle penetrates */
        @keyframes puncture-pulse {
          0%, 30% {
            opacity: 0.3;
            transform: scale(0.7);
          }
          45%, 60% {
            opacity: 1;
            transform: scale(1.4);
          }
          80%, 100% {
            opacity: 0.3;
            transform: scale(0.7);
          }
        }

        /* Gold spark burst exactly when needle locks stitch into cloth */
        @keyframes stitch-flash-spark {
          0%, 35% {
            opacity: 0;
            transform: scale(0.2);
          }
          50%, 65% {
            opacity: 1;
            transform: scale(1.4);
          }
          80%, 100% {
            opacity: 0;
            transform: scale(0.3);
          }
        }

        /* Thread vibrating with machine tension */
        @keyframes thread-tension-motion {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 10;
          }
        }

        .wheel-rotate-cw {
          transform-origin: 400px 285px;
          animation: rotate-wheel-clockwise 18s linear infinite;
        }

        .needle-piercing-plunge {
          animation: needle-machine-stitch-stroke 0.55s cubic-bezier(0.35, 0.05, 0.45, 0.95) infinite;
        }

        .needle-stitch-burst {
          animation: stitch-flash-spark 0.55s ease-in-out infinite;
          transform-origin: 555px 242px;
        }

        .puncture-dimple-pulse {
          animation: puncture-pulse 0.55s ease-in-out infinite;
          transform-origin: 555px 242px;
        }

        .upper-spool-thread {
          animation: thread-tension-motion 0.55s ease-in-out infinite;
        }

        .penetrating-thread {
          animation: needle-machine-stitch-stroke 0.55s cubic-bezier(0.35, 0.05, 0.45, 0.95) infinite;
        }
      `}</style>
    </div>
  );
}
