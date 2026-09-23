"use client";

import React from "react";
import Image from "next/image";

export function WhatsAppBubble() {
  const phoneNumber = "919390213935";
  const defaultMessage = encodeURIComponent(
    "Hello Madhus Boutique! I am interested in your machine embroidery designs and custom embroidery services."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="Support chat" className="fixed bottom-6 right-6 z-40 flex items-center group">
      <div className="mr-3 px-3 py-1.5 bg-white text-stone-800 text-xs font-medium rounded-full shadow-lg border border-[#e7dfd5] hidden sm:group-hover:block transition-all animate-in fade-in slide-in-from-right-2">
        Inquire on WhatsApp
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 drop-shadow-xl hover:drop-shadow-2xl cursor-pointer"
        aria-label="Direct WhatsApp assistance"
      >
        <div className="relative w-16 h-16">
          <Image
            src="/whatsapp-3d.jpg"
            alt="WhatsApp"
            fill
            className="object-contain rounded-2xl"
          />
        </div>
      </a>
    </aside>
  );
}

