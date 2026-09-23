import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
          Heritage & Technology
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a1220]">
          The Madhus Boutique Atelier
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Where age-old Indian embroidery traditions converge with modern industrial machine precision.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f6efe2] text-xs font-semibold text-[#6b1426] border border-[#dfb15b]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#b8860b]" />
            <span>Our Founding Philosophy</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a1220] leading-snug">
            Empowering Boutiques with Flawless Digital Stitch Files
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Madhus Boutique originated from a simple yet crucial realization: boutique creators, tailors, and digitizers often waste hours troubleshooting poorly calibrated online embroidery files that cause constant thread breakage, needle snapping, and fabric puckering.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every pattern in our library is engineered from the ground up by seasoned digitizers and stitch-tested on commercial Tajima, Brother, and Janome machines before it is ever published to our catalog.
          </p>
          <div className="pt-2">
            <Button asChild>
              <Link href="/designs">Explore Our Creations</Link>
            </Button>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#f7f2e7] border border-[#e7dfd5] space-y-6 luxury-shadow">
          <h3 className="font-serif text-xl font-bold text-[#4a1220]">
            The Madhus Benchmark
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "Calculated Underlay Density",
                desc: "Prevents fabric sinking and puckering on challenging fabrics like organza and raw silk.",
              },
              {
                title: "Zero Needle-Snapping Stitch Paths",
                desc: "Optimized travel runs and tie-in/tie-off locks that prevent unraveling and thread breakages.",
              },
              {
                title: "Multi-Format Compatibility",
                desc: "Bundled DST, PES, JEF, and EXP files tailored for your specific single or multi-head machines.",
              },
              {
                title: "Digital Delivery Zero-Trust Vault",
                desc: "Files are private and guarded until payment is verified, protecting our artisan intellectual property.",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-stone-900">{pillar.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
