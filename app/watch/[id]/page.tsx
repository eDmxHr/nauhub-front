import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getShowById, shows } from "@/lib/data";
import { siteConfig } from "@/lib/seo";
import { WatchClient } from "./watch-client";

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

  const pageTitle =
    show.type === "movie"
      ? `Watch ${show.title} (${show.year}) Online`
      : `Watch ${show.title} - Stream All Episodes`;

  const pageDescription =
    show.type === "movie"
      ? `Watch ${show.title} online on Nauhub. ${show.description.slice(
          0,
          100
        )}...`
      : `Stream ${show.title} episodes online. ${show.seasons ?? 1} season${
          (show.seasons ?? 1) > 1 ? "s" : ""
        } available on Nauhub.`;

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
          url: show.image,
          width: 500,
          height: 750,
          alt: show.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [show.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;
  const show = getShowById(id);

  if (!show) {
    notFound();
  }

  // Video page JSON-LD
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: show.title,
    description: show.description,
    thumbnailUrl: show.image,
    uploadDate: `${show.year}-01-01`,
    duration: show.duration
      ? `PT${show.duration.replace(/\s/g, "").toUpperCase()}`
      : undefined,
    contentUrl: `${siteConfig.url}/watch/${show.id}`,
    embedUrl: `${siteConfig.url}/watch/${show.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <Suspense fallback={<WatchSkeleton />}>
        <WatchClient show={show} />
      </Suspense>
    </>
  );
}

function WatchSkeleton() {
  return (
    <div className="min-h-screen bg-black -mt-16 -mb-20 animate-pulse">
      <div className="pt-16">
        <div className="aspect-video bg-white/10" />
      </div>
      <div className="px-4 py-4">
        <div className="h-6 w-48 bg-white/10 rounded" />
        <div className="h-4 w-32 bg-white/10 rounded mt-2" />
      </div>
    </div>
  );
}
