"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Share2,
  Star,
  Clock,
  Film,
  Download,
  Heart,
  Bell,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ShowCard } from "@/components/show-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MovieRequestModal } from "@/components/movie-request-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuthStore } from "@/lib/store";
import { useVideo } from "@/hooks/use-video";
import { useVideoSeasons } from "@/hooks/use-video-seasons";
import { useVideos } from "@/hooks/use-videos";
import { useToggleFavorite } from "@/hooks/use-favorites";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Genre } from "@/types/genres";
import { SeasonEpisodes } from "@/components/season-episodes";
import { formatDuration } from "@/lib/utils";

interface DetailClientProps {
  videoId: string | number;
}

export function DetailClient({ videoId }: DetailClientProps) {
  const router = useRouter();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const { toggle, isFavorite, isLoading: isTogglingFavorite } = useToggleFavorite();

  // Fetch video data
  const { data: video, isLoading: isLoadingVideo, isError } = useVideo(videoId);

  const isMovie = video?.type === "movie";
  const isAvailable = video?.is_published !== false;

  // Only fetch seasons for series/anime (not movies)
  // Don't fetch if video is still loading or if it's a movie
  const shouldFetchSeasons = Boolean(!isLoadingVideo && video && !isMovie);
  const { data: seasons = [], isLoading: isLoadingSeasons } = useVideoSeasons(
    videoId,
    shouldFetchSeasons
  );

  // Fetch all videos for similar content
  const { data: allVideos = [] } = useVideos();

  // Get published seasons
  const publishedSeasons = seasons.filter((s) => s.is_published);

  // Get similar videos (same type, different id)
  const similarVideos = useMemo(() => {
    if (!video) return [];
    return allVideos
      .filter(
        (v) =>
          v.id !== video.id &&
          v.type === video.type &&
          v.is_published &&
          v.genres?.some((g: Genre) =>
            video.genres?.some(
              (vg: Genre) => vg.id === g.id || vg.slug === g.slug
            )
          )
      )
      .slice(0, 6);
  }, [allVideos, video]);

  const handlePlay = () => {
    if (!video) return;

    // If content is not available, show request modal
    if (!isAvailable) {
      handleRequest();
      return;
    }

    // Navigate to watch page
    if (isMovie) {
      router.push(`/watch/${video.id}`);
    } else {
      // Use the first available season and episode
      const firstSeason = publishedSeasons[0];
      if (firstSeason) {
        // Find first published episode of the first season
        const firstEpisode = firstSeason.episodes?.find((e) => e.is_published);
        if (firstEpisode) {
          router.push(
            `/watch/${video.id}?season=${firstSeason.season_number}&episode=${firstEpisode.episode_number}`
          );
        } else {
          // Fallback to episode 1 if no published episodes found
          router.push(
            `/watch/${video.id}?season=${firstSeason.season_number}&episode=1`
          );
        }
      } else {
        // Fallback if no seasons available
        router.push(`/watch/${video.id}?season=1&episode=1`);
      }
    }
  };

  const handleRequest = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowRequestModal(true);
  };

  const handleShare = async () => {
    if (!video || !navigator.share) return;
    try {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href,
      });
    } catch {
      // Share cancelled or failed
    }
  };

  // Loading state
  if (isLoadingVideo) {
    return (
      <div className="min-h-screen -mt-16 lg:mt-0">
        <div className="relative h-[55vh] min-h-[420px] lg:h-[70vh] lg:min-h-[500px]">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="px-4 lg:px-6 py-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Error or not found state
  if (isError || !video) {
    return (
      <div className="min-h-screen -mt-16 lg:mt-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The video you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-brand hover:bg-brand/90 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -mt-16 lg:mt-0">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[55vh] min-h-[420px] lg:h-[70vh] lg:min-h-[500px]">
        <Image
          src={video.banner || video.thumbnail || "/placeholder.jpg"}
          alt={video.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/30" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-20 lg:top-6 left-4 lg:left-6 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 lg:max-w-4xl">
          {/* Type Badge */}
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
            {video.release_year && (
              <span className="text-xs text-muted-foreground">
                {video.release_year}
              </span>
            )}
            {video.age_rating && (
              <span className="text-xs text-muted-foreground">
                {video.age_rating}
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold mb-3">{video.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            {video.imdb_rating && (
              <div className="flex items-center gap-1">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-semibold">
                  {video.imdb_rating}
                </span>
              </div>
            )}
            {isMovie && video.duration && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            )}
            {!isMovie && seasons.length > 0 && (
              <div className="flex items-center gap-1">
                <Film className="size-4" />
                <span>
                  {seasons.length} Season{seasons.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {video.view_count !== undefined && (
              <div className="flex items-center gap-1">
                <span>{video.view_count.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {video.genres && video.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-1 bg-white/10 rounded-full text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unavailable Notice */}
      {!isAvailable && (
        <div className="mx-4 mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-yellow-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-500">
                Not Available Yet
              </p>
              <p className="text-xs text-muted-foreground">
                Request this content and we&apos;ll notify you when it&apos;s
                available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 lg:px-6 py-4 flex gap-3 lg:max-w-3xl">
        <Button
          onClick={handlePlay}
          variant={isAvailable ? "default" : "outline"}
          className="flex-1"
        >
          {isAvailable ? (
            <>
              <Play className="size-5 fill-current" />
              {isMovie ? "Watch Now" : "Play"}
            </>
          ) : (
            <>
              <Bell className="size-5" />
              Request
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            if (isAuthenticated) {
              toggle(videoId);
            } else {
              setShowLoginModal(true);
            }
          }}
          disabled={isTogglingFavorite}
          variant="ghost"
          size="icon"
          aria-label={isFavorite(videoId) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`size-5 ${isFavorite(videoId) ? "fill-current" : ""}`} />
        </Button>
        <Button
          onClick={handleShare}
          variant="ghost"
          size="icon"
        >
          <Share2 className="size-5" />
        </Button>
      </div>

      {/* Description */}
      {video.description && (
        <div className="px-4 lg:px-6 pb-4 lg:max-w-3xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {video.description}
          </p>
        </div>
      )}

      {/* TV Series-specific: All Seasons with Episodes */}
      {!isMovie && publishedSeasons.length > 0 && (
        <div className="px-4 lg:px-6 pb-8">
          {/* Vertical list of seasons */}
          <div className="space-y-8">
            {publishedSeasons.map((season) => {
              return (
                <div key={season.id} className="space-y-4">
                  {/* Season Header */}
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold">
                      Season {season.season_number}
                    </h3>
                  </div>

                  {/* Episodes for this season - fetched from API */}
                  <SeasonEpisodes
                    season={season}
                    videoId={video.id}
                    videoThumbnail={video.thumbnail}
                    formatDuration={formatDuration}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Similar Videos Section */}
      {similarVideos.length > 0 && (
        <div className="px-4 lg:px-6 pb-8">
          <h2 className="text-lg font-semibold mb-4">More Like This</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3">
              {similarVideos.map((item) => (
                <ShowCard key={item.id} show={item} variant="horizontal" />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Modals */}
      <MovieRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        show={video as any}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
