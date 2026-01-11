"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, List, Settings, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useVideo } from "@/hooks/use-video";
import { useVideoSeasons } from "@/hooks/use-video-seasons";
import { useSeasonEpisodes } from "@/hooks/use-season-episodes";
import { useEpisode } from "@/hooks/use-episode";
import { VideoPlayerV2 as VideoPlayer } from "@/components/video-player-v2";
import { Skeleton } from "@/components/ui/skeleton";
import { incrementVideoView, incrementEpisodeView } from "@/lib/api/views";
import { formatDuration } from "@/lib/utils";

interface WatchClientProps {
  videoId: string | number;
}

export function WatchClient({ videoId }: WatchClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  const currentSeason = seasonParam ? parseInt(seasonParam) : null;
  const currentEpisode = episodeParam ? parseInt(episodeParam) : null;

  // Fetch video data
  const { data: video, isLoading: isLoadingVideo } = useVideo(videoId);

  const isMovie = video?.type === "movie";

  // Fetch seasons for series/anime only when we know it's not a movie
  // Don't fetch if video is still loading or if it's a movie
  const shouldFetchSeasons = Boolean(!isLoadingVideo && video && !isMovie);
  const { data: seasons = [] } = useVideoSeasons(videoId, shouldFetchSeasons);

  // Find current season data
  const currentSeasonData = seasons.find(
    (s) => s.season_number === currentSeason
  );

  // Fetch episodes for current season
  const { data: seasonEpisodes = [], isLoading: isLoadingEpisodes } = useSeasonEpisodes(
    currentSeasonData?.id || "",
    !isMovie && !!currentSeasonData?.id
  );

  // Find current episode data
  const currentEpisodeData = seasonEpisodes.find(
    (ep) => ep.episode_number === currentEpisode
  );

  // Fetch full episode details if we have an episode ID
  const { data: episodeDetails, isLoading: isLoadingEpisodeDetails } = useEpisode(
    !isMovie && currentEpisodeData?.id ? currentEpisodeData.id : ""
  );

  // Get Cloudflare video UID
  const cloudflareVideoId = isMovie
    ? video?.cloudflare_video_uid
    : episodeDetails?.cloudflare_video_uid || currentEpisodeData?.cloudflare_video_uid;


  // Track view when video starts playing
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const handleVideoPlay = () => {
    if (!hasTrackedView) {
      setHasTrackedView(true);
      if (isMovie && video?.id) {
        incrementVideoView(video.id);
      } else if (!isMovie && episodeDetails?.id) {
        incrementEpisodeView(episodeDetails.id);
      }
    }
  };

  // Reset view tracking when video/episode changes
  useEffect(() => {
    setHasTrackedView(false);
  }, [videoId, currentSeason, currentEpisode]);

  const goToEpisode = (season: number, episode: number) => {
    router.push(`/watch/${videoId}?season=${season}&episode=${episode}`);
  };

  const nextEpisode = () => {
    if (!currentSeason || !currentEpisode) return;

    const currentIndex = seasonEpisodes.findIndex(
      (ep) => ep.episode_number === currentEpisode
    );

    if (currentIndex < seasonEpisodes.length - 1) {
      // Next episode in same season
      goToEpisode(currentSeason, seasonEpisodes[currentIndex + 1].episode_number);
    } else {
      // Find next season
      const nextSeason = seasons.find(
        (s) => s.season_number === currentSeason + 1
      );
      if (nextSeason) {
        // Fetch episodes for next season to get first episode
        goToEpisode(nextSeason.season_number, 1);
      }
    }
  };

  // Loading state
  if (isLoadingVideo) {
    return (
      <div className="min-h-screen bg-black">
        <div>
          <Skeleton className="w-full aspect-video" />
        </div>
        <div className="px-4 py-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  // For series, ensure we have season and episode
  if (!isMovie && (!currentSeason || !currentEpisode)) {
    // Redirect to first season and episode
    const firstSeason = seasons.find((s) => s.is_published);
    if (firstSeason) {
      router.replace(`/watch/${videoId}?season=${firstSeason.season_number}&episode=1`);
      return null;
    }
  }

  if (!cloudflareVideoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Video Not Available</h1>
          <p className="text-muted-foreground">
            This video is not available for playback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player Section */}
      <div className="relative">
        {/* Top Bar */}
        {/* <div className="absolute top-16 left-0 right-0 z-20 flex items-center justify-between px-4 py-2">
          <button
            onClick={() => router.back()}
            className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            {!isMovie && (
              <button
                onClick={() => {}}
                className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <List className="size-5" />
              </button>
            )}
            <button className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
              <Settings className="size-5" />
            </button>
          </div>
        </div> */}

        {/* Video Player */}
        <div>
          {cloudflareVideoId ? (
            <VideoPlayer
              videoId={cloudflareVideoId}
              contentVideoId={video.id}
              episodeId={!isMovie && episodeDetails?.id ? episodeDetails.id : undefined}
              poster={video.banner || video.thumbnail}
              autoplay={true}
              onPlay={handleVideoPlay}
            />
          ) : (
            <div className="aspect-video bg-black flex items-center justify-center">
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold">{video.title}</h1>
        {!isMovie && currentEpisodeData && (
          <p className="text-sm text-muted-foreground mt-1">
            Season {currentSeason} • Episode {currentEpisode} - {currentEpisodeData.title}
          </p>
        )}
        {isMovie && video.duration && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatDuration(video.duration)}
          </p>
        )}
      </div>

      {/* Episode List for TV Series */}
      {!isMovie && currentSeasonData && currentSeason && seasonEpisodes.length > 0 && (
        <div className="px-4 pb-8">
          <h2 className="text-base font-semibold mb-4">
            Season {currentSeason} Episodes
          </h2>

          {/* Episodes */}
          <div className="space-y-2">
            {seasonEpisodes
              .filter((ep) => ep.is_published)
              .map((episode) => {
                const isCurrentEpisode = episode.episode_number === currentEpisode;

                return (
                  <button
                    key={episode.id}
                    onClick={() => goToEpisode(currentSeason, episode.episode_number)}
                    className={`w-full flex gap-3 p-3 rounded-lg transition-colors text-left ${
                      isCurrentEpisode
                        ? "bg-brand/20 border border-brand/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {/* Episode Number */}
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-white/10 shrink-0">
                      <span className="text-sm font-medium">{episode.episode_number}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-medium line-clamp-1 ${
                          isCurrentEpisode ? "text-brand" : ""
                        }`}
                      >
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {episode.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {episode.duration && (
                          <span>{formatDuration(episode.duration)}</span>
                        )}
                      </div>
                    </div>

                    {isCurrentEpisode && (
                      <div className="flex items-center">
                        <Play className="size-4 text-brand" />
                      </div>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Next Episode Button */}
          {currentEpisode &&
            currentEpisode < seasonEpisodes.filter((ep) => ep.is_published).length && (
              <button
                onClick={nextEpisode}
                className="w-full mt-4 py-3 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
              >
                Next Episode
              </button>
            )}
        </div>
      )}

      {/* Movie Info */}
      {isMovie && video.description && (
        <div className="px-4 pb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {video.description}
          </p>
        </div>
      )}
    </div>
  );
}
