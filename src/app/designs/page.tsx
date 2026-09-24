"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS, POPULAR_SEARCH_SUGGESTIONS } from "@/data/mockProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";
import { SearchBar } from "@/components/storefront/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidersHorizontal, ArrowUpDown, Sparkles, Tag } from "lucide-react";
import { EmbroideryFormat } from "@/types/store";

function DesignsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSubcategory = searchParams.get("subcategory") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory);
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Category match
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }
      // Subcategory match
      if (
        selectedSubcategory !== "All" &&
        product.subcategory !== selectedSubcategory
      ) {
        return false;
      }
      // Format match
      if (
        selectedFormat !== "All" &&
        !product.file_formats.includes(selectedFormat as EmbroideryFormat)
      ) {
        return false;
      }
      // Search query match (name, code, description, subcategory, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCode = product.product_code.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesSubcategory = product.subcategory?.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (
          !matchesName &&
          !matchesCode &&
          !matchesDesc &&
          !matchesSubcategory &&
          !matchesTags
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "stitches") return b.stitch_count - a.stitch_count;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, selectedSubcategory, selectedFormat, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSelectedFormat("All");
    setSearchQuery("");
    setSortBy("featured");
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b8860b]">
          Digital Embroidery Library
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a1220]">
          Embroidery Design Catalogue
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
          Browse studio-digitized machine embroidery patterns. Every design is delivered in a high-speed verified ZIP archive upon payment verification.
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-6 rounded-2xl bg-white border border-[#e7dfd5] shadow-xs space-y-6">
        {/* Top Row: Search and Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSelectSuggestion={handleSelectSuggestion}
            placeholder="Search by motif (Peacock, Rose), code (MB-001), or stitch..."
            className="flex-1 max-w-2xl"
          />

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {/* Format Filter */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b8860b]" />
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="h-10 rounded-lg border border-[#e7dfd5] bg-white px-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                aria-label="Filter by machine format"
              >
                <option value="All">All Formats</option>
                <option value="DST">DST (Tajima)</option>
                <option value="PES">PES (Brother)</option>
                <option value="JEF">JEF (Janome)</option>
                <option value="EXP">EXP (Bernina)</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#b8860b]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-lg border border-[#e7dfd5] bg-white px-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                aria-label="Sort designs"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stitches">Highest Stitch Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Search Suggestions Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#b8860b] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Search Suggestions:</span>
          </div>
          {POPULAR_SEARCH_SUGGESTIONS.slice(0, 7).map((sug) => {
            const isActive = searchQuery.toLowerCase() === sug.toLowerCase();
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleSelectSuggestion(isActive ? "" : sug)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer border flex items-center gap-1 ${
                  isActive
                    ? "bg-[#6b1426] text-white border-[#6b1426] font-semibold shadow-xs"
                    : "bg-[#fdfbf7] hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                <span>{sug}</span>
              </button>
            );
          })}
        </div>

        {/* Categories & Subcategories Filter */}
        <div className="pt-2 border-t border-stone-100">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubcategory("All");
            }}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-b border-[#e7dfd5] pb-3">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "design" : "designs"}
          {selectedCategory !== "All" && (
            <span> in <strong className="text-[#6b1426]">{selectedCategory}</strong></span>
          )}
          {selectedSubcategory !== "All" && (
            <span> • <strong className="text-[#b8860b]">{selectedSubcategory}</strong></span>
          )}
          {searchQuery && (
            <span> matching &quot;<strong className="text-stone-900">{searchQuery}</strong>&quot;</span>
          )}
        </span>
        {(selectedCategory !== "All" || selectedSubcategory !== "All" || selectedFormat !== "All" || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-[#6b1426] hover:underline font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No embroidery designs found"
          description="We couldn't find any designs matching your specific search and filter criteria. Try resetting your search or choosing a different category."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DesignsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
          Loading atelier catalogue...
        </div>
      }
    >
      <DesignsCatalogContent />
    </Suspense>
  );
}
