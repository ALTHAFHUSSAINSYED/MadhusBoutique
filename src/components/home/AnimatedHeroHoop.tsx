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
          {/* Deep Silk Burgundy Fabric Gradient */}
          <radialGradient id="heroFabricGrad" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#4a0d1e" />
            <stop offset="55%" stopColor="#2a050f" />
            <stop offset="100%" stopColor="#140106" />
          </radialGradient>

          {/* Luxe Metallic Gold Gradient */}
          <linearGradient id="luxeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3bf" />
            <stop offset="35%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>

          {/* Steel Needle Chrome Finish */}
          <linearGradient id="needleSteel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Gold Needle Taper Tip */}
          <linearGradient id="needleGoldTip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          {/* Needle Cloth Shadow */}
          <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
          </filter>

          {/* Spark Glow Filter */}
          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Fabric Background */}
        <rect width="800" height="600" fill="url(#heroFabricGrad)" />

        {/* Linen Fabric Weave Grid */}
        <g opacity="0.12">
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
          opacity="0.85"
          filter="drop-shadow(0 0 25px rgba(0,0,0,0.8))"
        />
        <circle
          cx="400"
          cy="285"
          r="222"
          fill="none"
          stroke="#713f12"
          strokeWidth="3"
        />
        {/* Brass Tightener Screw at top of hoop */}
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

        {/* 3. ROTATING EMBROIDERY WHEEL (Rotates Clockwise Continuously) */}
        <g className="wheel-rotate-cw" transform-origin="400 285">
          <g transform="translate(400, 285)">
            {/* Concentric Golden Machine Stitches */}
            <circle
              cx="0"
              cy="0"
              r="190"
              fill="none"
              stroke="url(#luxeGoldGrad)"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <circle
              cx="0"
              cy="0"
              r="160"
              fill="none"
              stroke="url(#luxeGoldGrad)"
              strokeWidth="2"
              strokeDasharray="5,3"
            />
            <circle
              cx="0"
              cy="0"
              r="130"
              fill="none"
              stroke="url(#luxeGoldGrad)"
              strokeWidth="1.8"
              strokeDasharray="4,3"
            />
            <circle
              cx="0"
              cy="0"
              r="100"
              fill="none"
              stroke="url(#luxeGoldGrad)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.8"
            />

            {/* 12 Radiating Floral Stitched Spokes */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 360) / 12;
              return (
                <g key={idx} transform={`rotate(${angle})`}>
                  <line
                    x1="45"
                    y1="0"
                    x2="190"
                    y2="0"
                    stroke="url(#luxeGoldGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  {/* Decorative Stitch Petal / Dot at outer intersections */}
                  <circle cx="160" cy="0" r="2.5" fill="#fef08a" />
                  <circle cx="190" cy="0" r="3" fill="#d4af37" />
                </g>
              );
            })}

            {/* Scallop Intersecting Arcs */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * 360) / 8;
              return (
                <path
                  key={`arc-${idx}`}
                  d="M 130,0 Q 145,25 160,0"
                  fill="none"
                  stroke="url(#luxeGoldGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
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
              stroke="url(#luxeGoldGrad)"
              strokeWidth="3.5"
            />
            <circle
              cx="0"
              cy="0"
              r="52"
              fill="none"
              stroke="url(#luxeGoldGrad)"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            <circle cx="0" cy="0" r="40" fill="url(#luxeGoldGrad)" />
            <circle cx="0" cy="0" r="22" fill="#4c0519" />
            <circle cx="0" cy="0" r="8" fill="#fef08a" />
          </g>
        </g>

        {/* 4. ACTIVE EMBROIDERY NEEDLE (Continuous Stitching Motion Piercing the Wheel) */}
        <g className="needle-stitching-rig">
          {/* Tension Spool Thread trailing from top hoop into needle eye */}
          <path
            className="thread-tension-flow"
            d="M 400,55 Q 430,110 500,165"
            fill="none"
            stroke="url(#luxeGoldGrad)"
            strokeWidth="2.5"
            strokeDasharray="6,2"
            opacity="0.95"
          />

          {/* Needle Group aligned at 45 degree angle, actively stitching ring r=160 */}
          <g transform="translate(515, 175) rotate(52)" filter="url(#needleShadow)">
            {/* Needle Body (Blade) */}
            <line
              x1="-80"
              y1="0"
              x2="65"
              y2="0"
              stroke="url(#needleSteel)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Chrome Specular Highlights */}
            <line
              x1="-65"
              y1="-0.75"
              x2="50"
              y2="-0.75"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.8"
            />
            {/* Sharp Piercing Gold Tip */}
            <polygon
              points="65,-2.5 82,0 65,2.5"
              fill="url(#needleGoldTip)"
            />
            {/* Needle Eyelet (Thread hole) */}
            <ellipse
              cx="-65"
              cy="0"
              rx="4"
              ry="1.8"
              fill="#140106"
              stroke="url(#needleGoldTip)"
              strokeWidth="0.8"
            />
            {/* Golden Thread knot in Eyelet */}
            <circle cx="-65" cy="0" r="1.5" fill="#fde047" />
          </g>

          {/* Needle Piercing Spark Particle at puncture contact point */}
          <g transform="translate(565, 238)" className="stitch-spark-pulse" filter="url(#goldGlow)">
            <circle cx="0" cy="0" r="4.5" fill="#fff7cc" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#fde047" strokeWidth="1.5" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#fde047" strokeWidth="1.5" />
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
            stroke="url(#luxeGoldGrad)"
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

      {/* Physics CSS Keyframes for Continuous Clockwise Wheel Rotation and Needle Stitching */}
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

        /* Continuous mechanical needle piercing & stitching rhythm */
        @keyframes needle-pierce-cycle {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          35% {
            /* Plunge down into cloth */
            transform: translate(14px, 18px) scale(0.95);
          }
          50% {
            /* Full cloth penetration */
            transform: translate(18px, 24px) scale(0.92);
          }
          75% {
            /* Retract upwards */
            transform: translate(6px, 6px) scale(0.98);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        /* Spark burst when needle pierces cloth */
        @keyframes spark-flash {
          0%, 25% {
            opacity: 0;
            transform: scale(0.2);
          }
          45%, 60% {
            opacity: 1;
            transform: scale(1.3);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(0.4);
          }
        }

        /* Dynamic thread tension */
        @keyframes thread-vibrate {
          0%, 100% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 8;
          }
        }

        .wheel-rotate-cw {
          animation: rotate-wheel-clockwise 22s linear infinite;
        }

        .needle-stitching-rig {
          animation: needle-pierce-cycle 0.9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          transform-origin: 515px 175px;
        }

        .stitch-spark-pulse {
          animation: spark-flash 0.9s ease-in-out infinite;
        }

        .thread-tension-flow {
          animation: thread-vibrate 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
