"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ShowCard } from "@/components/show-card";
import { useVideos } from "@/hooks/use-videos";
import { useContinueWatching } from "@/hooks/use-continue-watching";
import { useMemo } from "react";
import { Video } from "@/types/video";

export default function Home() {
  const { data: videos = [], isLoading } = useVideos();
  const { data: continueWatching = [], isLoading: isLoadingContinueWatching } = useContinueWatching();

  // Filter videos into categories
  const { featured, trending, tvSeries, movies, anime } = useMemo(() => {
    // Get featured items for carousel (published and featured)
    let featured = videos
      .filter((v) => v.is_published && v.is_featured)
      .sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0))
      .slice(0, 5);

    // If no featured videos, fallback to trending videos
    if (featured.length === 0) {
      featured = videos
        .filter((v) => v.is_published && v.is_trending)
        .sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0))
        .slice(0, 5);
    }

    // If still no videos, use top rated published videos
    if (featured.length === 0) {
      featured = videos
        .filter((v) => v.is_published)
        .sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0))
        .slice(0, 5);
    }

    // Trending videos
    const trending = videos
      .filter((v) => v.is_published && v.is_trending)
      .slice(0, 12);

    // TV Series (type === "series")
    const tvSeries = videos
      .filter((v) => v.is_published && v.type === "series")
      .slice(0, 12);

    // Movies (type === "movie")
    const movies = videos
      .filter((v) => v.is_published && v.type === "movie")
      .slice(0, 12);

    // Anime (type === "anime")
    const anime = videos
      .filter((v) => v.is_published && v.type === "anime")
      .slice(0, 12);

    return { featured, trending, tvSeries, movies, anime };
  }, [videos]);

  return (
    <main className="space-y-6 lg:space-y-8 lg:py-6">
      {/* Hero Carousel */}
      <section className="-mt-4 lg:mt-0 lg:px-6">
        {isLoading ? (
          <Skeleton className="w-full h-[300px] lg:h-[500px] rounded-lg" />
        ) : (
          <HeroCarousel items={featured} />
        )}
      </section>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <CategorySection
          title="Continue Watching"
          categoryId="continue-watching"
          items={continueWatching}
          isLoading={isLoadingContinueWatching}
        />
      )}

      <CategorySection
        title="Trending Now"
        categoryId="trending"
        items={trending}
        isLoading={isLoading}
      />
      <CategorySection
        title="TV Series"
        categoryId="tv-series"
        items={tvSeries}
        isLoading={isLoading}
      />
      <CategorySection
        title="Movies"
        categoryId="movies"
        items={movies}
        isLoading={isLoading}
      />
      <CategorySection
        title="Anime"
        categoryId="anime"
        items={anime}
        isLoading={isLoading}
      />
    </main>
  );
}

interface CategorySectionProps {
  title: string;
  categoryId: string;
  items: Video[];
  isLoading: boolean;
}

function CategorySection({
  title,
  categoryId,
  items,
  isLoading,
}: CategorySectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between px-4 lg:px-6 mb-3 lg:mb-4">
        <h2 className="font-semibold text-base lg:text-xl">{title}</h2>

        <Link
          href={`/category/${categoryId}`}
          className="flex items-center text-xs lg:text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <span className="capitalize">View All</span>
          <ChevronRight className="size-4 lg:size-5" />
        </Link>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 lg:space-x-4 px-4 lg:px-6">
          {isLoading ? (
            // Show skeleton cards while loading
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[140px] lg:w-[180px] shrink-0 space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-muted-foreground text-sm">
              No content available yet
            </div>
          ) : (
            items.map((video) => (
              <ShowCard key={video.id} show={video} className="shrink-0" />
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
