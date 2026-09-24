"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, ArrowRight, Tag, Layers } from "lucide-react";
import { MOCK_PRODUCTS, POPULAR_SEARCH_SUGGESTIONS } from "@/data/mockProducts";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/store";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSelectSuggestion,
  placeholder = "Search by motif, code (MB-001), subcategory or stitch...",
  className = "max-w-xl",
  autoFocus = false,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter matching designs in real time
  const matchedProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MOCK_PRODUCTS.filter((product) => {
      const matchName = product.name.toLowerCase().includes(q);
      const matchCode = product.product_code.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchSubcategory = product.subcategory?.toLowerCase().includes(q);
      const matchTags = product.tags?.some((t) => t.toLowerCase().includes(q));
      const matchDesc = product.description.toLowerCase().includes(q);
      return (
        matchName ||
        matchCode ||
        matchCategory ||
        matchSubcategory ||
        matchTags ||
        matchDesc
      );
    }).slice(0, 5);
  }, [query]);

  // Suggested keywords matching current input or popular defaults
  const keywordSuggestions = useMemo(() => {
    if (!query.trim()) {
      return POPULAR_SEARCH_SUGGESTIONS.slice(0, 6);
    }
    const q = query.toLowerCase().trim();
    const filtered = POPULAR_SEARCH_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(q)
    );
    return filtered.length > 0 ? filtered : POPULAR_SEARCH_SUGGESTIONS.slice(0, 4);
  }, [query]);

  const handleSelectKeyword = (keyword: string) => {
    onQueryChange(keyword);
    if (onSelectSuggestion) {
      onSelectSuggestion(keyword);
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < matchedProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && matchedProducts[selectedIndex]) {
        e.preventDefault();
        router.push(`/designs/${matchedProducts[selectedIndex].slug}`);
        setIsOpen(false);
      } else {
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4 text-[#8c7456]" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-full border border-[#e7dfd5] bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all shadow-2xs"
          aria-label="Search embroidery designs"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete & Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#e7dfd5] shadow-xl z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Keyword Suggestions Pills */}
          <div className="p-3 bg-[#fdfbf7]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b8860b] mb-2 px-1">
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
              <span>Suggested Embroidery Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keywordSuggestions.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleSelectKeyword(kw)}
                  className="px-2.5 py-1 rounded-full text-xs bg-white hover:bg-[#6b1426] hover:text-white text-stone-700 border border-[#e7dfd5] transition-all cursor-pointer flex items-center gap-1 group shadow-2xs"
                >
                  <Tag className="w-2.5 h-2.5 text-[#b8860b] group-hover:text-[#fef3c7]" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Matching Designs */}
          {query.trim().length > 0 && (
            <div className="p-2 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <span>Matching Designs ({matchedProducts.length})</span>
                <span className="text-[10px] text-stone-400 font-normal">Use ↑↓ keys to navigate</span>
              </div>

              {matchedProducts.length > 0 ? (
                <div className="space-y-1">
                  {matchedProducts.map((p, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <Link
                        key={p.id}
                        href={`/designs/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                          isSelected
                            ? "bg-[#f6efe2] text-[#4a1220]"
                            : "hover:bg-stone-50 text-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail preview */}
                          <div className="relative w-11 h-11 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                            <Image
                              src={p.preview_url}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-stone-900 truncate">
                                {p.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6b1426]/10 text-[#6b1426]">
                                {p.product_code}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                              <span className="flex items-center gap-1 text-[#b8860b] font-medium">
                                <Layers className="w-3 h-3" />
                                {p.subcategory || p.category}
                              </span>
                              <span>•</span>
                              <span>{p.stitch_count.toLocaleString()} stitches</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="text-right shrink-0 ml-3">
                          <span className="font-serif font-bold text-sm text-[#4a1220]">
                            {formatPrice(p.price)}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-medium">
                            Instant ZIP
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 px-4 text-xs text-stone-500">
                  <p>No embroidery designs found matching &quot;{query}&quot;.</p>
                  <p className="mt-1 text-stone-400">
                    Try searching for <span className="text-[#6b1426] font-medium cursor-pointer" onClick={() => handleSelectKeyword("Peacock")}>Peacock</span>, <span className="text-[#6b1426] font-medium cursor-pointer" onClick={() => handleSelectKeyword("Zardozi")}>Zardozi</span>, or <span className="text-[#6b1426] font-medium cursor-pointer" onClick={() => handleSelectKeyword("Aari")}>Aari</span>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer of dropdown: View All Results */}
          {query.trim().length > 0 && (
            <div className="p-2.5 bg-stone-50 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onSelectSuggestion) onSelectSuggestion(query);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b1426] hover:text-[#4a1220] transition-colors"
              >
                <span>Filter catalogue for &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
