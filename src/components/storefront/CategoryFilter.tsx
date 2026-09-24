"use client";

import React from "react";
import { CATEGORIES, SUBCATEGORIES_MAP } from "@/data/mockProducts";
import { cn } from "@/lib/utils";
import { Sparkles, Layers } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubcategory?: string;
  onSelectSubcategory?: (subcategory: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory = "All",
  onSelectSubcategory,
}: CategoryFilterProps) {
  // Determine relevant subcategories based on chosen category
  const availableSubcategories = React.useMemo(() => {
    if (selectedCategory !== "All" && SUBCATEGORIES_MAP[selectedCategory]) {
      return ["All", ...SUBCATEGORIES_MAP[selectedCategory]];
    }
    // If "All" is selected, collect top popular subcategories across all categories
    const allSubs: string[] = ["All"];
    Object.values(SUBCATEGORIES_MAP).forEach((subs) => {
      subs.forEach((s) => {
        if (!allSubs.includes(s)) allSubs.push(s);
      });
    });
    return allSubs;
  }, [selectedCategory]);

  return (
    <div className="space-y-3">
      {/* Primary Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                if (onSelectSubcategory) {
                  onSelectSubcategory("All");
                }
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border",
                isSelected
                  ? "bg-[#6b1426] text-white border-[#6b1426] shadow-sm font-semibold scale-102"
                  : "bg-white text-stone-700 border-[#e7dfd5] hover:border-[#d4af37] hover:bg-[#f6efe2]/50"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Subcategories Row */}
      {availableSubcategories.length > 1 && onSelectSubcategory && (
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#b8860b] shrink-0 pl-1 pr-1">
            <Layers className="w-3 h-3 text-[#d4af37]" />
            <span className="uppercase tracking-wider">Subcategory:</span>
          </div>

          {availableSubcategories.map((sub) => {
            const isSubSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => onSelectSubcategory(sub)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all cursor-pointer border",
                  isSubSelected
                    ? "bg-[#d4af37] text-[#2a1402] border-[#b8860b] font-bold shadow-2xs"
                    : "bg-[#fdfbf7] text-stone-600 border-stone-200 hover:border-[#d4af37] hover:bg-white"
                )}
              >
                {sub === "All" ? `All ${selectedCategory === "All" ? "Subcategories" : selectedCategory}` : sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
