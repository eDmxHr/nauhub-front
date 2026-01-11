"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Heart } from "lucide-react";
import { Video } from "@/types/video";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { Progress } from "@/components/ui/progress";
import { useToggleFavorite } from "@/hooks/use-favorites";
import { useAuthStore } from "@/lib/store";

interface ShowCardProps {
  show: Video;
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
  const { user } = useAuthStore();
  const { toggle, isFavorite, isLoading: isTogglingFavorite } = useToggleFavorite();
  
  // Fetch watch history for movies only (series/episodes handled differently)
  const { data: watchHistory } = useWatchHistory(
    show.type === "movie" ? show.id : undefined
  );
  
  // Use progress_percentage from backend response
  const progressPercentage = watchHistory?.progress_percentage || 0;
  
  // Show progress if not completed and has progress
  const hasProgress = !watchHistory?.completed && progressPercentage > 0 && progressPercentage < 100;
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggle(show.id);
    }
  };
  
  const isFavorited = isFavorite(show.id);

  if (isHorizontal) {
    return (
      <Link
        href={`/detail/${show.id}`}
        className={`shrink-0 w-28 group ${className}`}
      >
        <div className="relative aspect-2/3 rounded-lg overflow-hidden">
          <Image
            src={show.thumbnail || ""}
            alt={show.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {/* Favorite Button */}
          {user && (
            <button
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              className="absolute top-1.5 right-1.5 z-20 p-1 rounded-full bg-black/70 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`size-3 ${isFavorited ? "fill-current text-red-500" : "text-white"}`}
              />
            </button>
          )}
          {/* Quality Badge */}
          {show.quality && show.quality !== "HD" && (
            <div className="absolute top-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {show.quality}
            </div>
          )}
          {/* Rating Badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            {show.imdb_rating}
          </div>
          {/* Progress Bar */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 p-0.5">
              <Progress value={progressPercentage} className="h-1" />
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/detail/${show.id}`} className={`group ${className}`}>
      <div className="relative overflow-hidden rounded-md lg:rounded-lg">
        {/* Favorite Button */}
        {user && (
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/70 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`size-4 ${isFavorited ? "fill-current text-red-500" : "text-white"}`}
            />
          </button>
        )}
        
        {/* Quality Badge */}
        {show.quality && show.quality !== "HD" && (
          <div className="absolute top-2 left-2 z-10 bg-black/70 px-1.5 py-0.5 rounded text-xs font-semibold">
            {show.quality}
          </div>
        )}

        <Image
          src={show.thumbnail || ""}
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
        {showPlayOverlay && show.is_published !== false && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-2 bg-brand rounded-full">
              <Play className="size-4 fill-white" />
            </div>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-semibold">
          {show.imdb_rating}
        </div>

        {/* Progress Bar */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        
          {/* Progress bar */}
          <Progress
            value={progressPercentage}
            className="h-1.5"
          />
        </div>
        
        )}
      </div>
    </Link>
  );
}
