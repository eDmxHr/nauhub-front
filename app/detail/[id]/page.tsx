import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailClient } from "./detail-client";
import { getVideoById } from "@/lib/api/videos";
import {
  generateShowMetadata,
  generateMovieJsonLd,
  generateTVSeriesJsonLd,
  generateBreadcrumbJsonLd,
  siteConfig,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    return {
      title: "Not Found",
      description: "The requested video could not be found.",
    };
  }

  // Convert Video type to the format expected by generateShowMetadata
  const type = video.type === "movie" ? "movie" : "tv";
  const genres = video.genres?.map((g) => g.name) || [];
  const rating = typeof video.imdb_rating === "string" 
    ? parseFloat(video.imdb_rating) || 0 
    : video.imdb_rating || 0;
  const year = video.release_year || new Date().getFullYear();
  const image = video.banner || video.thumbnail || siteConfig.ogImage;
  const description = video.description || `Watch ${video.title} on Nauhub`;

  return generateShowMetadata({
    title: video.title,
    description,
    image,
    type: type as "movie" | "tv",
    year,
    rating,
    genres,
    country: "", // Country not available in Video type
    id: String(video.id),
  });
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;
  // Try to fetch video for SEO, but don't block rendering if it fails
  // The client component will handle loading/error states
  const video = await getVideoById(id);

  // Only generate JSON-LD if we have video data
  let jsonLd = null;
  let breadcrumbJsonLd = null;

  if (video) {
    // Prepare data for JSON-LD
    const type = video.type === "movie" ? "movie" : "tv";
    const genres = video.genres?.map((g) => g.name) || [];
    const rating = typeof video.imdb_rating === "string" 
      ? parseFloat(video.imdb_rating) || 0 
      : video.imdb_rating || 0;
    const year = video.release_year || new Date().getFullYear();
    const image = video.banner || video.thumbnail || siteConfig.ogImage;
    const description = video.description || `Watch ${video.title} on Nauhub`;
    const duration = video.duration 
      ? `${Math.floor(video.duration / 60)}h ${video.duration % 60}m`
      : undefined;

    // Generate JSON-LD structured data
    jsonLd =
      type === "movie"
        ? generateMovieJsonLd({
            title: video.title,
            description,
            image,
            year,
            rating,
            duration,
            genres,
            id: String(video.id),
          })
        : generateTVSeriesJsonLd({
            title: video.title,
            description,
            image,
            year,
            rating,
            seasons: video.seasons?.length || 1,
            genres,
            id: String(video.id),
          });

    breadcrumbJsonLd = generateBreadcrumbJsonLd([
      { name: "Home", url: siteConfig.url },
      {
        name: type === "movie" ? "Movies" : "TV Series",
        url: `${siteConfig.url}/category/${
          type === "movie" ? "movies" : video.type === "anime" ? "anime" : "series"
        }`,
      },
      { name: video.title, url: `${siteConfig.url}/detail/${video.id}` },
    ]);
  }

  return (
    <>
      {/* JSON-LD Structured Data - Only render if we have video data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <DetailClient videoId={id} />
    </>
  );
}
