"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function WhatsAppBubble() {
  const phoneNumber = "919390213935";
  const defaultMessage = encodeURIComponent(
    "Hello Madhus Boutique! I am interested in your machine embroidery designs and custom embroidery services."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  // One-time entrance animation on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes wa-bounce-in {
          0%   { opacity: 0; transform: scale(0.3) translateY(40px); }
          50%  { opacity: 1; transform: scale(1.15) translateY(-8px); }
          70%  { transform: scale(0.92) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wa-float-breathe {
          0%, 100% {
            transform: translateY(0);
            filter: drop-shadow(0 10px 18px rgba(37, 211, 102, 0.4)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
          }
          50% {
            transform: translateY(-8px) scale(1.04);
            filter: drop-shadow(0 18px 28px rgba(37, 211, 102, 0.6)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.2));
          }
        }
        @keyframes wa-periodic-wiggle {
          0%, 82%, 100% { transform: rotate(0deg); }
          85% { transform: rotate(-12deg) scale(1.08); }
          88% { transform: rotate(10deg) scale(1.08); }
          91% { transform: rotate(-8deg); }
          94% { transform: rotate(6deg); }
          97% { transform: rotate(0deg); }
        }
        @keyframes wa-sonar-pulse {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          70%, 100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }
        .wa-entrance {
          animation: wa-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .wa-animated-icon {
          animation: wa-float-breathe 3.5s ease-in-out infinite, wa-periodic-wiggle 5s ease-in-out infinite;
        }
        .wa-sonar-ring {
          animation: wa-sonar-pulse 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .wa-hidden { opacity: 0; }
      `}</style>

      <aside
        aria-label="Support chat"
        className="fixed bottom-6 right-6 z-40 flex items-center group pointer-events-auto"
      >
        {/* Tooltip on hover */}
        <div className="mr-3 px-3.5 py-1.5 bg-stone-900/95 backdrop-blur text-white text-xs font-medium rounded-full shadow-xl border border-stone-700/50 hidden sm:group-hover:flex items-center gap-1.5 transition-all animate-in fade-in slide-in-from-right-2">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>Chat on WhatsApp</span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative w-15 h-15 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-95 ${mounted ? "wa-entrance" : "wa-hidden"}`}
          aria-label="Direct WhatsApp assistance: 9390213935"
        >
          {/* Subtle glowing radar ripple behind icon */}
          <span className="absolute inset-0 rounded-2xl bg-[#25D366]/35 wa-sonar-ring pointer-events-none" />

          {/* Pure 3D WhatsApp Icon — zero background boxes, transparent PNG */}
          <div className="relative w-full h-full wa-animated-icon">
            <Image
              src="/whatsapp-3d.png"
              alt="WhatsApp Assistance"
              fill
              className="object-contain"
              priority
            />
          </div>
        </a>
      </aside>
    </>
  );
}
