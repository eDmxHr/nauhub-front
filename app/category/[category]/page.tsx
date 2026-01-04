import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categories, getShowsByCategory } from "@/lib/data";
import {
  generatePageMetadata,
  siteConfig,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { CategoryClient } from "./category-client";

interface PageProps {
  params: Promise<{ category: string }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.id,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = categories.find((c) => c.id === category);

  if (!categoryInfo) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  const descriptions: Record<string, string> = {
    "tv-series":
      "Browse and stream the best TV series from around the world. Korean dramas, American shows, anime, and more.",
    movies:
      "Watch the latest and greatest movies online. Hollywood blockbusters, Korean films, Japanese cinema, and more.",
    trending:
      "Discover what's trending now on Balani. The most popular movies and TV shows everyone is watching.",
    "korean-drama":
      "Stream the best Korean dramas (K-dramas) online. Romance, thriller, comedy, and more from Korea.",
    anime:
      "Watch popular anime series and movies. Japanese animation at its finest.",
  };

  return generatePageMetadata({
    title: categoryInfo.name,
    description:
      descriptions[category] ||
      `Browse ${categoryInfo.name} on Balani. Stream your favorite content online.`,
    path: `/category/${category}`,
    keywords: [categoryInfo.name, "streaming", "watch online", "free"],
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = categories.find((c) => c.id === category);

  if (!categoryInfo) {
    notFound();
  }

  const categoryShows = getShowsByCategory(category);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: categoryInfo.name, url: `${siteConfig.url}/category/${category}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryClient
          categoryName={categoryInfo.name}
          categoryShows={categoryShows}
        />
      </Suspense>
    </>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-white/10 rounded-full" />
          <div className="h-9 w-16 bg-white/10 rounded-full" />
          <div className="h-9 w-20 bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="h-7 w-32 bg-white/10 rounded" />
      </div>
      <div className="px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-2/3 bg-white/10 rounded-lg" />
              <div className="mt-2 h-4 w-full bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
