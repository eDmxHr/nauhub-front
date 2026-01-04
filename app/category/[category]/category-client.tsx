"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { genres, years, countries, filterShows, Show } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShowCard } from "@/components/show-card";

interface CategoryClientProps {
  categoryName: string;
  categoryShows: Show[];
}

const contentTypes = ["All", "Movies", "Series"] as const;
type ContentType = (typeof contentTypes)[number];

export function CategoryClient({
  categoryName,
  categoryShows,
}: CategoryClientProps) {
  const searchParams = useSearchParams();

  const [selectedGenre, setSelectedGenre] = useState(
    searchParams.get("genre") || "All"
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || "All"
  );
  const [selectedCountry, setSelectedCountry] = useState(
    searchParams.get("country") || "All"
  );
  const [selectedType, setSelectedType] = useState<ContentType>("All");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const filteredShows = useMemo(() => {
    let filtered = filterShows(
      categoryShows,
      selectedGenre,
      selectedYear,
      selectedCountry
    );

    // Filter by content type
    if (selectedType === "Movies") {
      filtered = filtered.filter((show) => show.type === "movie");
    } else if (selectedType === "Series") {
      filtered = filtered.filter((show) => show.type === "tv");
    }

    return filtered;
  }, [
    categoryShows,
    selectedGenre,
    selectedYear,
    selectedCountry,
    selectedType,
  ]);

  const handleReset = () => {
    setSelectedGenre("All");
    setSelectedYear("All");
    setSelectedCountry("All");
    setSelectedType("All");
  };

  const hasFilters =
    selectedGenre !== "All" ||
    selectedYear !== "All" ||
    selectedCountry !== "All" ||
    selectedType !== "All";

  return (
    <div className="min-h-screen">
      {/* Filter Bar - hides on scroll down */}
      <div
        className={`sticky top-14 lg:top-0  bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-3 transition-transform duration-300 ${
          isFilterVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Content Type Filter */}
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

          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-auto min-w-24 h-9">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre === "All" ? "All Genres" : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-auto min-w-20 h-9">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year === "All" ? "All Years" : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          {/* <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-auto min-w-24 h-9">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country === "All" ? "All Countries" : country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

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
        <p className="text-sm text-muted-foreground mt-1">
          {filteredShows.length}{" "}
          {filteredShows.length === 1 ? "title" : "titles"}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 lg:px-6 pb-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
          {filteredShows.map((show) => (
            <ShowCard key={show.id} show={show} variant="compact" showType />
          ))}
        </div>

        {filteredShows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No shows found matching your filters.</p>
            <button
              onClick={handleReset}
              className="mt-4 text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
