"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Share2,
  Star,
  Globe,
  Clock,
  Film,
  Users,
  Download,
  Heart,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { Show, shows } from "@/lib/data";
import { ShowCard } from "@/components/show-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MovieRequestModal } from "@/components/movie-request-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuthStore } from "@/lib/store";

interface DetailClientProps {
  show: Show;
}

export function DetailClient({ show }: DetailClientProps) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const isAvailable = show.isAvailable !== false;

  const isMovie = show.type === "movie";
  const seasonEpisodes = (show.episodes || []).filter(
    (ep) => ep.season === selectedSeason
  );
  const hasEpisodes = show.episodes && show.episodes.length > 0;
  const similarShows = shows
    .filter((s) => s.id !== show.id && s.type === show.type)
    .slice(0, 6);

  const handlePlay = () => {
    // If content is not available, show request modal
    if (!isAvailable) {
      handleRequest();
      return;
    }
    // Navigate to watch page
    if (isMovie) {
      router.push(`/watch/${show.id}`);
    } else {
      router.push(`/watch/${show.id}?season=1&episode=1`);
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: show.title,
          text: show.description,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or failed
      }
    }
  };

  return (
    <div className="min-h-screen -mt-16 lg:mt-0">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[55vh] min-h-[420px] lg:h-[70vh] lg:min-h-[500px]">
        <Image
          src={show.image}
          alt={show.title}
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
              className={`px-2 py-0.5 rounded text-xs font-medium ${"bg-amber-500/20 text-amber-400"}`}
            >
              {isMovie ? "Movie" : "TV Series"}
            </span>
            {show.year && (
              <span className="text-xs text-muted-foreground">{show.year}</span>
            )}
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold mb-3">{show.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Star className="size-4 text-yellow-500 fill-yellow-500" />
              <span className="text-white font-semibold">{show.rating}</span>
            </div>
            {isMovie && show.duration && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{show.duration}</span>
              </div>
            )}
            {!isMovie && show.seasons && (
              <div className="flex items-center gap-1">
                <Film className="size-4" />
                <span>
                  {show.seasons} Season{show.seasons > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {!isMovie && show.duration && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{show.duration}/ep</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Globe className="size-4" />
              <span>{show.country}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {show.genre.map((g) => (
              <span
                key={g}
                className="px-2 py-1 bg-white/10 rounded-full text-xs"
              >
                {g}
              </span>
            ))}
          </div>
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
        <button
          onClick={handlePlay}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
            isAvailable
              ? "bg-brand hover:bg-brand/90 text-white"
              : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
          }`}
        >
          {isAvailable ? (
            <>
              <Play className="size-5 fill-current" />
              {isMovie ? "Watch Now" : "Play S1:E1"}
            </>
          ) : (
            <>
              <Bell className="size-5" />
              Request
            </>
          )}
        </button>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`p-3 rounded-lg transition-colors ${
            isFavorite
              ? "bg-red-500/20 text-red-500"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <Heart className={`size-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={handleShare}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Share2 className="size-5" />
        </button>
      </div>

      {/* Description */}
      <div className="px-4 lg:px-6 pb-4 lg:max-w-3xl">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {show.description}
        </p>
      </div>

      {/* Movie-specific: Director & Cast */}
      {isMovie && (
        <div className="px-4 lg:px-6 pb-4 space-y-3 lg:max-w-3xl">
          {show.director && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-16">
                Director
              </span>
              <span className="text-sm">{show.director}</span>
            </div>
          )}
          {show.cast && show.cast.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground w-16">Cast</span>
              <span className="text-sm">{show.cast.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* TV Series-specific: Season Selector & Episodes */}
      {!isMovie && hasEpisodes && (
        <>
          {/* Season Selector */}
          {(show.seasons ?? 1) > 1 && (
            <div className="px-4 lg:px-6 pb-4">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2">
                  {Array.from(
                    { length: show.seasons ?? 1 },
                    (_, i) => i + 1
                  ).map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSeason === season
                          ? "bg-brand text-white"
                          : "bg-white/10 text-muted-foreground hover:bg-white/20"
                      }`}
                    >
                      Season {season}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* Episodes */}
          <div className="px-4 lg:px-6 pb-6">
            <h2 className="text-lg font-semibold mb-4">
              Episodes {(show.seasons ?? 1) > 1 && `• Season ${selectedSeason}`}
            </h2>
            <div className="space-y-3">
              {seasonEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/watch/${show.id}?season=${episode.season}&episode=${episode.number}`}
                  className="flex gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 aspect-video rounded-md overflow-hidden shrink-0">
                    <Image
                      src={episode.thumbnail}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                        <Play className="size-3 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">
                      E{episode.number}. {episode.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {episode.duration}
                    </p>
                  </div>

                  {/* Download */}
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="self-center p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Download className="size-4 text-muted-foreground" />
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Cast for TV Series */}
          {show.cast && show.cast.length > 0 && (
            <div className="px-4 lg:px-6 pb-6">
              <h2 className="text-lg font-semibold mb-3">Cast</h2>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {show.cast.join(", ")}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Similar Shows Section */}
      <div className="px-4 lg:px-6 pb-8">
        <h2 className="text-lg font-semibold mb-4">More Like This</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {similarShows.map((item) => (
              <ShowCard key={item.id} show={item} variant="horizontal" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Modals */}
      <MovieRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        show={show}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
