"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useSeasonEpisodes } from "@/hooks/use-season-episodes";
import { VideoSeason, VideoEpisode } from "@/types/video";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface SeasonEpisodesProps {
  season: VideoSeason;
  videoId: string | number;
  videoThumbnail?: string;
  formatDuration: (minutes?: number) => string;
}

export function SeasonEpisodes({
  season,
  videoId,
  videoThumbnail,
  formatDuration,
}: SeasonEpisodesProps) {
  const { data: episodes = [], isLoading } = useSeasonEpisodes(
    season.id,
    !!season.id
  );

  const publishedEpisodes = episodes.filter((ep) => ep.is_published);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg">
            <Skeleton className="w-28 lg:w-32 aspect-video rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (publishedEpisodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No episodes available</p>
    );
  }

  return (
    <div className="space-y-3">
      {publishedEpisodes.map((episode) => (
        <Link
          key={episode.id}
          href={`/watch/${videoId}?season=${season.season_number}&episode=${episode.episode_number}`}
          className="flex gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-28 lg:w-32 aspect-video rounded-md overflow-hidden shrink-0">
            <Image
              src={
                episode.thumbnail || videoThumbnail || "/placeholder.jpg"
              }
              alt={episode.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                <Play className="size-4 fill-white" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-1">
            <h4 className="font-medium text-sm lg:text-base mb-1 line-clamp-1">
              Episode {episode.episode_number} - {episode.title}
            </h4>
            {episode.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {episode.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {episode.duration && (
                <span>{formatDuration(episode.duration)}</span>
              )}
              {episode.release_date && (
                <span>{formatDate(episode.release_date)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

