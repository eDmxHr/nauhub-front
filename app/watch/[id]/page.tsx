import type { Metadata } from "next";
import { Suspense } from "react";
import { WatchClient } from "./watch-client";
import { getVideoById } from "@/lib/api/videos";
import { siteConfig } from "@/lib/seo";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ season?: string; episode?: string }>;
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
      description: "The requested content could not be found.",
    };
  }

  const isMovie = video.type === "movie";
  const pageTitle = isMovie
    ? `Watch ${video.title} Online`
    : `Watch ${video.title} - Stream All Episodes`;

  const pageDescription = video.description
    ? `${video.description.slice(0, 100)}...`
    : `Watch ${video.title} online on Nauhub.`;

  const image = video.banner || video.thumbnail || siteConfig.ogImage;
  const duration = video.duration
    ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`
    : undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${siteConfig.url}/watch/${id}`,
      type: "video.other",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WatchPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const video = await getVideoById(id);

  // Generate JSON-LD structured data
  let videoJsonLd = null;

  if (video) {
    const duration = video.duration
      ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`
      : undefined;

    videoJsonLd = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.description || `Watch ${video.title} on Nauhub`,
      thumbnailUrl: video.banner || video.thumbnail || siteConfig.ogImage,
      uploadDate: video.created_at || new Date().toISOString(),
      duration: duration,
      contentUrl: `${siteConfig.url}/watch/${id}`,
      embedUrl: `${siteConfig.url}/watch/${id}`,
    };
  }

  return (
    <>
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <Suspense fallback={<WatchSkeleton />}>
        <WatchClient videoId={id} />
      </Suspense>
    </>
  );
}

function WatchSkeleton() {
  return (
    <div className="min-h-screen bg-black animate-pulse">
      <div >
        <div className="aspect-video bg-white/10" />
      </div>
      <div className="px-4 py-4">
        <div className="h-6 w-48 bg-white/10 rounded" />
        <div className="h-4 w-32 bg-white/10 rounded mt-2" />
      </div>
    </div>
  );
}
