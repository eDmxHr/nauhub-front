"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowCard } from "@/components/show-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenres } from "@/hooks/use-genres";
import { useVideos } from "@/hooks/use-videos";
import { Video } from "@/types/video";

interface CategoryClientProps {
  categoryName: string;
  categoryId?: string;
}

const contentTypes = ["All", "Movies", "Series"] as const;
type ContentType = (typeof contentTypes)[number];

// Categories where content type filter should be hidden (redundant)
const categoriesWithoutTypeFilter = ["movies", "tv-series", "anime"];

export function CategoryClient({
  categoryName,
  categoryId,
}: CategoryClientProps) {
  const searchParams = useSearchParams();

  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(
    searchParams.get("genre") || undefined,
  );

  const [selectedType, setSelectedType] = useState<ContentType>("All");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Hide content type filter for specific category pages on desktop only
  // On mobile, always show the filter so users can switch between Movies/Series
  const showTypeFilter =
    isMobile ||
    !categoryId ||
    !categoriesWithoutTypeFilter.includes(categoryId);

  const { data: genres = [] } = useGenres();

  const { data: videos = [], isLoading, isError } = useVideos();

  // Hide filter bar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsFilterVisible(false);
      } else {
        setIsFilterVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const filteredVideos = useMemo(() => {
    let filtered: Video[] = [...videos];

    // On mobile, if type filter is shown, let the type filter handle the filtering
    // On desktop, first filter by category page, then by type filter if shown
    if (isMobile && showTypeFilter) {
      // On mobile with type filter, ignore category-based type filtering
      // Let the type selector handle it
      if (selectedType === "Movies") {
        filtered = filtered.filter((video) => video.type === "movie");
      } else if (selectedType === "Series") {
        // Series includes both "series" and "anime"
        filtered = filtered.filter(
          (video) => video.type === "series" || video.type === "anime",
        );
      }
      // "All" shows everything, no filtering needed

      // Still apply category-specific filters (like trending)
      if (categoryId === "trending") {
        filtered = filtered.filter((video) => video.is_trending);
      }
    } else {
      // Desktop behavior: first filter by category page
      if (categoryId) {
        switch (categoryId) {
          case "movies":
            filtered = filtered.filter((video) => video.type === "movie");
            break;
          case "tv-series":
          case "series":
            filtered = filtered.filter((video) => video.type === "series");
            break;
          case "anime":
            filtered = filtered.filter((video) => video.type === "anime");
            break;
          case "trending":
            filtered = filtered.filter((video) => video.is_trending);
            break;
          // Add more category filters as needed
          default:
            // For other categories, don't filter by type
            break;
        }
      }

      // Then filter by content type selector (only if type filter is shown)
      // This further narrows down the category filter
      if (showTypeFilter) {
        if (selectedType === "Movies") {
          filtered = filtered.filter((video) => video.type === "movie");
        } else if (selectedType === "Series") {
          // Series includes both "series" and "anime"
          filtered = filtered.filter(
            (video) => video.type === "series" || video.type === "anime",
          );
        }
        // "All" shows everything (from the category), no additional filtering needed
      }
    }

    // Filter by genre
    if (selectedGenre && selectedGenre !== "all") {
      filtered = filtered.filter((video) => {
        // Check if the video has genres array
        if (video.genres && video.genres.length > 0) {
          return video.genres.some(
            (genre) =>
              genre.slug === selectedGenre || genre.name === selectedGenre,
          );
        }
        // Fallback to genre_ids if genres array is not populated
        if (
          video.genre_ids &&
          video.genre_ids.length > 0 &&
          genres.length > 0
        ) {
          const selectedGenreObj = genres.find(
            (g) => g.slug === selectedGenre || g.name === selectedGenre,
          );
          if (selectedGenreObj) {
            return video.genre_ids.includes(Number(selectedGenreObj.id));
          }
        }
        return false;
      });
    }

    return filtered;
  }, [
    videos,
    categoryId,
    selectedType,
    selectedGenre,
    genres,
    showTypeFilter,
    isMobile,
  ]);

  const handleReset = () => {
    setSelectedGenre(undefined);
    if (showTypeFilter) {
      setSelectedType("All");
    }
  };

  const hasFilters =
    Boolean(selectedGenre) || (showTypeFilter && selectedType !== "All");

  return (
    <div className="min-h-screen">
      {/* Filter Bar - hides on scroll down */}
      <div
        className={`sticky top-14 lg:top-0  bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-3 transition-transform duration-300 ${
          isFilterVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Content Type Filter - Only show for categories where it makes sense */}
          {showTypeFilter && (
            <>
              <div className="flex gap-1 shrink-0">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type
                        ? "bg-brand text-white"
                        : "bg-white/10 text-muted-foreground hover:bg-white/20"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-white/20 shrink-0" />
            </>
          )}

          <Select
            value={selectedGenre || "all"}
            onValueChange={(value) =>
              setSelectedGenre(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-auto min-w-24 h-9">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.slug}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-brand hover:text-brand/80 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="px-4 lg:px-6 py-4 lg:py-6">
        <h1 className="text-xl lg:text-2xl font-bold">{categoryName}</h1>
        {!isLoading && (
          <p className="text-sm text-muted-foreground mt-1">
            {filteredVideos.length}{" "}
            {filteredVideos.length === 1 ? "title" : "titles"}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 lg:px-6 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-2/3 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Error loading videos. Please try again.</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No videos found matching your filters.</p>
            <button
              onClick={handleReset}
              className="mt-4 text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
            {filteredVideos.map((video) => (
              <ShowCard
                key={video.id}
                show={video}
                variant="compact"
                showType
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
