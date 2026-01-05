import type { Metadata } from "next";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { shows } from "@/lib/data";
import { generatePageMetadata } from "@/lib/seo";
import { HeroCarousel } from "@/components/hero-carousel";
import { ShowCard } from "@/components/show-card";

export const metadata: Metadata = generatePageMetadata({
  title: "Home - Stream Movies & TV Shows",
  description:
    "Discover and stream the best movies and TV shows on Nauhub. Korean dramas, anime, Hollywood blockbusters, and more. Start watching now!",
  path: "/",
  keywords: ["home", "discover", "trending", "new releases"],
});

export default function Home() {
  // Get featured items for carousel (top rated)
  const featuredItems = [...shows]
    .filter((s) => s.isAvailable !== false)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <main className="space-y-6 lg:space-y-8 lg:py-6">
      {/* Hero Carousel */}
      <section className="-mt-4 lg:mt-0 lg:px-6">
        <HeroCarousel items={featuredItems} />
      </section>

      <CategorySection
        title="Trending Now"
        categoryId="trending"
        items={shows.slice(0, 8)}
      />
      <CategorySection
        title="TV Series"
        categoryId="tv-series"
        items={shows.filter((s) => s.type === "tv").slice(0, 8)}
      />
      <CategorySection
        title="Movies"
        categoryId="movies"
        items={shows.filter((s) => s.type === "movie").slice(0, 8)}
      />
      <CategorySection
        title="Korean Drama"
        categoryId="korean-drama"
        items={shows
          .filter((s) => s.country === "Korea" && s.type === "tv")
          .slice(0, 8)}
      />
      <CategorySection
        title="Top Rated"
        categoryId="trending"
        items={[...shows].sort((a, b) => b.rating - a.rating).slice(0, 8)}
      />
    </main>
  );
}

interface CategorySectionProps {
  title: string;
  categoryId: string;
  items: typeof shows;
}

function CategorySection({ title, categoryId, items }: CategorySectionProps) {
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
          {items.map((show) => (
            <ShowCard key={show.id} show={show} className="shrink-0" />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
