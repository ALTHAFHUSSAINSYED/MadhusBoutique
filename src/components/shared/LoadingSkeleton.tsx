import React from "react";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-[#e7dfd5] overflow-hidden p-4 space-y-4"
        >
          <div className="aspect-square w-full rounded-xl shimmer-bg" />
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded shimmer-bg" />
            <div className="h-5 w-4/5 rounded shimmer-bg" />
            <div className="h-3 w-full rounded shimmer-bg" />
          </div>
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="h-6 w-16 rounded shimmer-bg" />
            <div className="h-9 w-24 rounded-lg shimmer-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}
