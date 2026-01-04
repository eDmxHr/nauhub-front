"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, List, Settings } from "lucide-react";
import { useState } from "react";
import { Show } from "@/lib/data";
import { VideoPlayerEmbed } from "@/components/video-player";
import Image from "next/image";

interface WatchClientProps {
  show: Show;
}

export function WatchClient({ show }: WatchClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  const currentSeason = seasonParam ? parseInt(seasonParam) : 1;
  const currentEpisode = episodeParam ? parseInt(episodeParam) : 1;
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const isMovie = show.type === "movie";
  const episodes = show.episodes || [];
  const currentEpisodeData = episodes.find(
    (ep) => ep.season === currentSeason && ep.number === currentEpisode
  );
  const seasonEpisodes = episodes.filter((ep) => ep.season === currentSeason);

  const goToEpisode = (season: number, episode: number) => {
    setShowEpisodeList(false);
    router.push(`/watch/${show.id}?season=${season}&episode=${episode}`);
  };

  const nextEpisode = () => {
    const currentIndex = seasonEpisodes.findIndex(
      (ep) => ep.number === currentEpisode
    );
    if (currentIndex < seasonEpisodes.length - 1) {
      goToEpisode(currentSeason, seasonEpisodes[currentIndex + 1].number);
    } else if (currentSeason < (show.seasons ?? 1)) {
      goToEpisode(currentSeason + 1, 1);
    }
  };

  // Cloudflare Stream public demo video ID
  const demoVideoId = "fadd00a9cb8cc13c15e7bdffaa124a24";

  return (
    <div className="min-h-screen bg-black -mt-16 -mb-20">
      {/* Video Player Section */}
      <div className="relative">
        {/* Top Bar */}
        <div className="absolute top-16 left-0 right-0 z-20 flex items-center justify-between px-4 py-2">
          <button
            onClick={() => router.back()}
            className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            {!isMovie && (
              <button
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
              >
                <List className="size-5" />
              </button>
            )}
            <button className="p-2 bg-black/50 rounded-full backdrop-blur-sm">
              <Settings className="size-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="pt-16">
          <VideoPlayerEmbed videoId={demoVideoId} poster={show.image} />
        </div>
      </div>

      {/* Video Info */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold">{show.title}</h1>
        {!isMovie && currentEpisodeData && (
          <p className="text-sm text-muted-foreground mt-1">
            S{currentSeason}:E{currentEpisode} - {currentEpisodeData.title}
          </p>
        )}
        {isMovie && show.duration && (
          <p className="text-sm text-muted-foreground mt-1">{show.duration}</p>
        )}
      </div>

      {/* Episode List for TV Series */}
      {!isMovie && (
        <div className="px-4 pb-8">
          {/* Season Selector */}
          {(show.seasons ?? 1) > 1 && (
            <div className="mb-4">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
              >
                <span className="font-medium">Season {currentSeason}</span>
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}

          {/* Episodes */}
          <div className="space-y-2">
            {seasonEpisodes.map((episode) => {
              const isCurrentEpisode =
                episode.season === currentSeason &&
                episode.number === currentEpisode;

              return (
                <button
                  key={episode.id}
                  onClick={() => goToEpisode(episode.season, episode.number)}
                  className={`w-full flex gap-3 p-3 rounded-lg transition-colors text-left ${
                    isCurrentEpisode
                      ? "bg-brand/20 border border-brand/50"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 aspect-video rounded overflow-hidden shrink-0">
                    <Image
                      src={episode.thumbnail}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                    {isCurrentEpisode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-medium line-clamp-1 ${
                        isCurrentEpisode ? "text-brand" : ""
                      }`}
                    >
                      E{episode.number}. {episode.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {episode.duration}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Episode Button */}
          {currentEpisode < seasonEpisodes.length && (
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
      {isMovie && (
        <div className="px-4 pb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {show.description}
          </p>
          {show.director && (
            <p className="text-sm mt-3">
              <span className="text-muted-foreground">Director: </span>
              {show.director}
            </p>
          )}
          {show.cast && (
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Cast: </span>
              {show.cast.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
