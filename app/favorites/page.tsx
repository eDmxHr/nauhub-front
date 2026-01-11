"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { ShowCard } from "@/components/show-card";
import { useFavorites, useRemoveFromFavorites } from "@/hooks/use-favorites";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";

export default function FavoritesPage() {
  const [editMode, setEditMode] = useState(false);
  const { data: favorites = [], isLoading } = useFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const { user } = useAuthStore();

  const handleRemoveFavorite = (videoId: string | number) => {
    removeFromFavorites.mutate(videoId);
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            <Heart className="size-12 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Sign in to view favorites</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please sign in to see your favorite movies and shows
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 lg:top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-bold">My List</h1>
          {favorites.length > 0 && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm text-brand hover:text-brand/80 transition-colors"
            >
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-4 lg:px-6 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : favorites.length > 0 ? (
        <div className="px-4 lg:px-6 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-4">
            {favorites.map((video) => (
              <div key={video.id} className="relative">
                <ShowCard show={video} variant="compact" showPlayOverlay showType />

                {/* Delete button in edit mode */}
                {editMode && (
                  <button
                    onClick={() => handleRemoveFavorite(video.id)}
                    disabled={removeFromFavorites.isPending}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            <Heart className="size-12 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No favorites yet</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Start adding movies and shows to your favorites to see them here
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
          >
            Browse Content
          </Link>
        </div>
      )}
    </div>
  );
}
