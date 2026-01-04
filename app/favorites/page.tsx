"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { shows } from "@/lib/data";
import { ShowCard } from "@/components/show-card";

// Mock favorites - in a real app, this would come from a database/localStorage
const mockFavorites = shows.slice(0, 4).map((s) => s.id);

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>(mockFavorites);
  const [editMode, setEditMode] = useState(false);

  const favoriteShows = shows.filter((show) => favorites.includes(show.id));

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f !== id));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Favorites</h1>
          {favoriteShows.length > 0 && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm text-brand"
            >
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {favoriteShows.length > 0 ? (
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
            {favoriteShows.map((show) => (
              <div key={show.id} className="relative">
                <ShowCard show={show} variant="compact" showPlayOverlay />

                {/* Delete button in edit mode */}
                {editMode && (
                  <button
                    onClick={() => removeFavorite(show.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full shadow-lg z-10"
                  >
                    <Trash2 className="size-3" />
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
