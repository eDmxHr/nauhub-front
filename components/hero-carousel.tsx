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
import { Show } from "@/lib/data";

interface HeroCarouselProps {
  items: Show[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
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
        {items.map((show) => (
          <CarouselItem key={show.id} className="pl-0">
            <div className="relative aspect-16/15">
              {/* Background Image */}
              <Image
                src={show.image}
                alt={show.title}
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
                      show.type === "movie"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-brand/20 text-brand"
                    }`}
                  >
                    {show.type === "movie" ? "Movie" : "TV Series"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{show.rating}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-1">
                  {show.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-lg">
                  {show.description}
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {show.genre.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 bg-white/10 rounded text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/watch/${show.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Play className="size-4 fill-current" />
                  </Link>
                  <Link
                    href={`/detail/${show.id}`}
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
