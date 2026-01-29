import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categories } from "@/lib/data";
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
      "Discover what's trending now on Nauhub. The most popular movies and TV shows everyone is watching.",
    "korean-drama":
      "Stream the best Korean dramas (K-dramas) online. Romance, thriller, comedy, and more from Korea.",
    anime:
      "Watch popular anime series and movies. Japanese animation at its finest.",
  };

  return generatePageMetadata({
    title: categoryInfo.name,
    description:
      descriptions[category] ||
      `Browse ${categoryInfo.name} on Nauhub. Stream your favorite content online.`,
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
      <Suspense fallback={<div className="min-h-screen" />}>
        <CategoryClient categoryName={categoryInfo.name} categoryId={category} />
      </Suspense>
    </>
  );
}
