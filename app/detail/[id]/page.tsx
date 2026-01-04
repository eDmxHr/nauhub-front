import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShowById, shows } from "@/lib/data";
import {
  generateShowMetadata,
  generateMovieJsonLd,
  generateTVSeriesJsonLd,
  generateBreadcrumbJsonLd,
  siteConfig,
} from "@/lib/seo";
import { DetailClient } from "./detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for all shows
export async function generateStaticParams() {
  return shows.map((show) => ({
    id: show.id,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const show = getShowById(id);

  if (!show) {
    return {
      title: "Not Found",
      description: "The requested content could not be found.",
    };
  }

  return generateShowMetadata({
    title: show.title,
    description: show.description,
    image: show.image,
    type: show.type,
    year: show.year,
    rating: show.rating,
    genres: show.genre,
    country: show.country,
    id: show.id,
  });
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;
  const show = getShowById(id);

  if (!show) {
    notFound();
  }

  // Generate JSON-LD structured data
  const jsonLd =
    show.type === "movie"
      ? generateMovieJsonLd({
          title: show.title,
          description: show.description,
          image: show.image,
          year: show.year,
          rating: show.rating,
          director: show.director,
          cast: show.cast,
          duration: show.duration,
          genres: show.genre,
          id: show.id,
        })
      : generateTVSeriesJsonLd({
          title: show.title,
          description: show.description,
          image: show.image,
          year: show.year,
          rating: show.rating,
          cast: show.cast,
          seasons: show.seasons,
          genres: show.genre,
          id: show.id,
        });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    {
      name: show.type === "movie" ? "Movies" : "TV Series",
      url: `${siteConfig.url}/category/${
        show.type === "movie" ? "movies" : "tv-series"
      }`,
    },
    { name: show.title, url: `${siteConfig.url}/detail/${show.id}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DetailClient show={show} />
    </>
  );
}
