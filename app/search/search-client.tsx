"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Clock } from "lucide-react";
import { ShowCard } from "@/components/show-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideos } from "@/hooks/use-videos";
import { useSearchParams } from "next/navigation";
import { Genre } from "@/types/genres";

const recentSearches = ["Action", "Romance", "Thriller", "Comedy"];

export function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { data: videos = [], isLoading } = useVideos();

  // Update query when URL search param changes
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();

    return videos.filter((video) => {
      // Search by title
      if (video.title.toLowerCase().includes(lowerQuery)) return true;

      // Search by description
      if (video.description?.toLowerCase().includes(lowerQuery)) return true;

      // Search by genres
      if (video.genres && video.genres.length > 0) {
        if (
          video.genres.some((g: Genre) =>
            g.name.toLowerCase().includes(lowerQuery),
          )
        ) {
          return true;
        }
      }

      // Search by type
      const typeMatch =
        (video.type === "movie" && "movie".includes(lowerQuery)) ||
        (video.type === "series" &&
          ("series".includes(lowerQuery) || "tv".includes(lowerQuery))) ||
        (video.type === "anime" && "anime".includes(lowerQuery));
      if (typeMatch) return true;

      // Search by year
      if (video.release_year?.toString().includes(query.trim())) return true;

      return false;
    });
  }, [query, videos]);

  const hasResults = searchResults.length > 0;
  const showSuggestions = !query.trim();
  const isSearching = query.trim() && isLoading;

  return (
    <div className="min-h-screen -mt-px">
      {/* Search Input - removed gap by using -mt-px */}
      <div className="sticky top-13 lg:top-0 z-40 bg-black px-4 lg:px-6 py-3 border-b border-white/10">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies, TV shows, anime..."
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
        <div className="px-4 lg:px-6 py-4 space-y-6 max-w-3xl mx-auto">
          {/* Quick Search Tags */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="size-4" />
              Quick Search
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
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="px-4 lg:px-6 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-2/3 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && !isSearching && (
        <div className="px-4 lg:px-6 py-4">
          {hasResults ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
                {searchResults.map((video) => (
                  <ShowCard
                    key={video.id}
                    show={video}
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
