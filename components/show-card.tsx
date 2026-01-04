"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Show } from "@/lib/data";

interface ShowCardProps {
  show: Show;
  variant?: "default" | "compact" | "horizontal";
  showType?: boolean;
  showPlayOverlay?: boolean;
  className?: string;
}

export function ShowCard({
  show,
  variant = "default",
  showType = false,
  showPlayOverlay = false,
  className = "",
}: ShowCardProps) {
  const isCompact = variant === "compact";
  const isHorizontal = variant === "horizontal";

  if (isHorizontal) {
    return (
      <Link
        href={`/detail/${show.id}`}
        className={`shrink-0 w-28 group ${className}`}
      >
        <div className="relative aspect-2/3 rounded-lg overflow-hidden">
          <Image
            src={show.image}
            alt={show.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {/* Quality Badge */}
          {show.quality && show.quality !== "HD" && (
            <div className="absolute top-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {show.quality}
            </div>
          )}
          {/* Rating Badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            {show.rating > 0 ? show.rating : "N/A"}
          </div>
        </div>
        <p className="mt-1.5 text-xs font-medium line-clamp-1">{show.title}</p>
        <p className="text-[10px] text-muted-foreground">{show.year}</p>
      </Link>
    );
  }

  return (
    <Link href={`/detail/${show.id}`} className={`group ${className}`}>
      <div className="relative overflow-hidden rounded-md lg:rounded-lg">
        {/* Quality Badge */}
        {show.quality && show.quality !== "HD" && (
          <div className="absolute top-2 right-2 z-10 bg-black/70 px-1.5 py-0.5 rounded text-xs font-semibold">
            {show.quality}
          </div>
        )}

        {/* Type Badge */}
        {showType && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${"bg-brand"}`}
            >
              {show.type === "movie" ? "Movie" : "TV"}
            </span>
          </div>
        )}

        <Image
          src={show.image}
          alt={show.title}
          className={`object-cover transition-transform group-hover:scale-105 ${
            isCompact
              ? "aspect-2/3 w-full"
              : "h-48 w-32 lg:h-64 lg:w-44 xl:h-72 xl:w-48"
          }`}
          width={isCompact ? 150 : 192}
          height={isCompact ? 225 : 288}
          style={
            isCompact
              ? { width: "100%", height: "auto", aspectRatio: "2/3" }
              : undefined
          }
        />

        {/* Play Overlay */}
        {showPlayOverlay && show.isAvailable !== false && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-2 bg-brand rounded-full">
              <Play className="size-4 fill-white" />
            </div>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-semibold">
          {show.rating > 0 ? show.rating : "N/A"}
        </div>
      </div>

      <figcaption className={`pt-2 ${isCompact ? "" : "w-32 lg:w-44 xl:w-48"}`}>
        <span
          className={`font-medium line-clamp-1 block ${
            isCompact ? "text-xs lg:text-sm" : "text-sm lg:text-base"
          }`}
        >
          {show.title}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <span>{show.year}</span>
          {!isCompact && show.type === "tv" && show.seasons && (
            <>
              <span>•</span>
              <span>{show.seasons}S</span>
            </>
          )}
          {!isCompact && show.type === "movie" && show.duration && (
            <>
              <span>•</span>
              <span>{show.duration}</span>
            </>
          )}
        </div>
      </figcaption>
    </Link>
  );
}
