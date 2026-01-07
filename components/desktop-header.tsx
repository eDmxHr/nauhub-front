"use client";

import { Search, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { useVideos } from "@/hooks/use-videos";
import Image from "next/image";
import Link from "next/link";
import { Genre } from "@/types/genres";

export function DesktopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: videos = [] } = useVideos();

  // Hide on search page
  const isSearchPage = pathname === "/search";

  // Get instant search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const lowerQuery = searchQuery.toLowerCase();

    return videos
      .filter((video) => {
        // Search by title
        if (video.title.toLowerCase().includes(lowerQuery)) return true;

        // Search by genres
        if (video.genres && video.genres.length > 0) {
          if (
            video.genres.some((g: Genre) =>
              g.name.toLowerCase().includes(lowerQuery)
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

        return false;
      })
      .slice(0, 6); // Limit to 6 results
  }, [searchQuery, videos]);

  const showResults = isFocused && searchResults.length > 0;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsFocused(false);
      setSearchQuery("");
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsFocused(false);
  };

  // Don't show header on search page
  if (isSearchPage) {
    return null;
  }

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-black/95 backdrop-blur-sm border-b border-white/10 fixed top-0 left-64 right-0 z-40">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search movies, TV shows, anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full bg-white/10 rounded-md py-2.5 pl-12 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}

          {/* Instant Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className="py-2">
                {searchResults.map((video) => (
                  <Link
                    key={video.id}
                    href={`/detail/${video.id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setIsFocused(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden bg-white/5">
                      {video.thumbnail && (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            video.type === "movie"
                              ? "bg-amber-500/20 text-amber-400"
                              : video.type === "anime"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-brand/20 text-brand"
                          }`}
                        >
                          {video.type === "movie"
                            ? "Movie"
                            : video.type === "anime"
                            ? "Anime"
                            : "Series"}
                        </span>
                        {video.release_year && (
                          <span className="text-xs text-muted-foreground">
                            {video.release_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/10 px-4 py-2 bg-white/5">
                <button
                  type="submit"
                  className="text-sm text-brand hover:text-brand/80 font-medium flex items-center gap-2"
                >
                  <Search className="size-4" />
                  View all results for &quot;{searchQuery}&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </header>
  );
}
