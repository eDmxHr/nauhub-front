"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import { Video } from "@/types/video";

interface HeroCarouselProps {
  items: Video[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: true,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="ml-0">
        {items.map((video) => (
          <CarouselItem key={video.id} className="pl-0">
            <div className="relative aspect-16/15">
              {/* Background Image */}
              <Image
                src={video.banner || video.thumbnail || "/placeholder.jpg"}
                alt={video.title}
                fill
                className="object-cover"
                priority
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      video.type === "movie"
                        ? "bg-amber-500/20 text-amber-400"
                        : video.type === "anime"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-brand/20 text-brand"
                    }`}
                  >
                    {video.type === "movie"
                      ? "Movie"
                      : video.type === "anime"
                      ? "Anime"
                      : "TV Series"}
                  </span>
                  {video.imdb_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">
                        {video.imdb_rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-1">
                  {video.title}
                </h2>

                {/* Description */}
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-lg">
                    {video.description}
                  </p>
                )}

                {/* Genres */}
                {video.genres && video.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {video.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.id}
                        className="px-2 py-0.5 bg-white/10 rounded text-xs"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/watch/${video.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Play className="size-4 fill-current" />
                  </Link>
                  <Link
                    href={`/detail/${video.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Info className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselDots className="absolute bottom-2 left-0 right-0" />
    </Carousel>
  );
}
