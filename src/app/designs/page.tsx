"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";
import { SearchBar } from "@/components/storefront/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { EmbroideryFormat } from "@/types/store";

function DesignsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Category match
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }
      // Format match
      if (
        selectedFormat !== "All" &&
        !product.file_formats.includes(selectedFormat as EmbroideryFormat)
      ) {
        return false;
      }
      // Search query match (name, code, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCode = product.product_code.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) {
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
  }, [selectedCategory, selectedFormat, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedFormat("All");
    setSearchQuery("");
    setSortBy("featured");
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder="Search by motif name or code (e.g., MB-001, Peacock, Rose)..."
          />

          <div className="flex items-center gap-3 w-full sm:w-auto">
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

        {/* Bottom Row: Category Pill Tabs */}
        <div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-b border-[#e7dfd5] pb-3">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "design" : "designs"}
        </span>
        {(selectedCategory !== "All" || selectedFormat !== "All" || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-[#6b1426] hover:underline font-semibold cursor-pointer"
          >
            Reset Filters
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
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm text-stone-500">Loading catalog...</div>}>
      <DesignsCatalogContent />
    </Suspense>
  );
}
