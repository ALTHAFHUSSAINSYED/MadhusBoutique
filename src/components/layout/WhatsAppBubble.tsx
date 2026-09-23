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
        .wa-entrance {
          animation: wa-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .wa-hidden { opacity: 0; }
      `}</style>

      <aside
        aria-label="Support chat"
        className="fixed bottom-6 right-6 z-40 flex items-center group"
      >
        <div className="mr-3 px-3 py-1.5 bg-white text-stone-800 text-xs font-medium rounded-full shadow-lg border border-[#e7dfd5] hidden sm:group-hover:block transition-all animate-in fade-in slide-in-from-right-2">
          Inquire on WhatsApp
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-16 h-16 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer drop-shadow-2xl ${mounted ? "wa-entrance" : "wa-hidden"}`}
          aria-label="Direct WhatsApp assistance"
        >
          {/* Rounded-full clips the JPG corners — no white box visible */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src="/whatsapp-3d.jpg"
              alt="WhatsApp"
              fill
              className="object-cover scale-[0.88]"
            />
          </div>
        </a>
      </aside>
    </>
  );
}
