import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#f6efe2] border border-[#dfb15b]/40 flex items-center justify-center mx-auto text-[#6b1426] font-serif text-2xl font-bold">
        404
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-[#4a1220]">
          Pattern Not Found
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
          The embroidery design or atelier page you are looking for does not exist or has been relocated in our catalog.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button asChild>
          <Link href="/designs">
            <Compass className="w-4 h-4 mr-2 text-[#dfb15b]" />
            Browse Catalog
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
