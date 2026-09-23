"use client";

import React from "react";
import { CATEGORIES } from "@/data/mockProducts";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border",
              isSelected
                ? "bg-[#6b1426] text-white border-[#6b1426] shadow-sm font-semibold"
                : "bg-white text-stone-700 border-[#e7dfd5] hover:border-[#d4af37] hover:bg-[#f6efe2]/50"
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
