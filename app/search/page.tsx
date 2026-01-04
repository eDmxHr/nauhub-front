"use client";

import { useState, useMemo } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { shows } from "@/lib/data";
import { ShowCard } from "@/components/show-card";

// Note: Metadata is exported from a separate file for client components
// See search/layout.tsx for SEO metadata

const recentSearches = ["Stranger Things", "Korean Drama", "Action Movies"];
const trendingSearches = ["Squid Game", "The Glory", "Kingdom", "Parasite"];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return shows.filter(
      (show) =>
        show.title.toLowerCase().includes(lowerQuery) ||
        show.genre.some((g) => g.toLowerCase().includes(lowerQuery)) ||
        show.country.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const hasResults = searchResults.length > 0;
  const showSuggestions = !query.trim();

  return (
    <div className="min-h-screen -mt-px">
      {/* Search Input - removed gap by using -mt-px */}
      <div className="sticky top-13 z-40 bg-black px-4 py-3 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 rounded-xl py-3 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions (when no query) */}
      {showSuggestions && (
        <div className="px-4 py-4 space-y-6">
          {/* Recent Searches */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="size-4" />
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Trending Searches */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="size-4" />
              Trending Searches
            </h2>
            <div className="space-y-2">
              {trendingSearches.map((term, index) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <span className="text-sm">{term}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div className="px-4 py-4">
          {hasResults ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
                {searchResults.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    variant="compact"
                    showType
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching for something else
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
