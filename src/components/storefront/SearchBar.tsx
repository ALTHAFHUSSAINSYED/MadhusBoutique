"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  query,
  onQueryChange,
  placeholder = "Search by motif, design code (e.g. MB-001), or category...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-lg">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
        <Search className="w-4 h-4 text-[#8c7456]" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-full border border-[#e7dfd5] bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all shadow-2xs"
      />
      {query && (
        <button
          onClick={() => onQueryChange("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
