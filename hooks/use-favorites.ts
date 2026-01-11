import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavorites, addToFavorites, removeFromFavorites } from "@/lib/api/favorites";
import { Video } from "@/types/video";
import { useAuthStore } from "@/lib/store";

/**
 * Hook to fetch user's favorites
 */
export function useFavorites() {
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["favorites", activeProfile?.id],
    queryFn: async () => {
      if (!activeProfile?.id) {
        return [];
      }
      try {
        return await getFavorites(activeProfile.id);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
    },
    enabled: !!user && !!activeProfile?.id, // Only fetch if user is authenticated and has active profile
  });
}

/**
 * Hook to check if a video is in favorites
 */
export function useIsFavorite(videoId: string | number) {
  const { data: favorites = [] } = useFavorites();
  return favorites.some((video) => String(video.id) === String(videoId));
}

/**
 * Hook to add a video to favorites
 */
export function useAddToFavorites() {
  const queryClient = useQueryClient();
  const activeProfile = useAuthStore((state) => state.activeProfile);

  return useMutation({
    mutationFn: async (videoId: string | number) => {
      if (!activeProfile?.id) {
        throw new Error("No active profile selected");
      }
      await addToFavorites(videoId, activeProfile.id);
    },
    onSuccess: () => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * Hook to remove a video from favorites
 */
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();
  const activeProfile = useAuthStore((state) => state.activeProfile);

  return useMutation({
    mutationFn: async (videoId: string | number) => {
      if (!activeProfile?.id) {
        throw new Error("No active profile selected");
      }
      await removeFromFavorites(videoId, activeProfile.id);
    },
    onSuccess: () => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const { data: favorites = [] } = useFavorites();

  const addMutation = useMutation({
    mutationFn: async (videoId: string | number) => {
      if (!activeProfile?.id) {
        throw new Error("No active profile selected");
      }
      await addToFavorites(videoId, activeProfile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (videoId: string | number) => {
      if (!activeProfile?.id) {
        throw new Error("No active profile selected");
      }
      await removeFromFavorites(videoId, activeProfile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    toggle: (videoId: string | number) => {
      const isFavorite = favorites.some((video) => String(video.id) === String(videoId));
      if (isFavorite) {
        removeMutation.mutate(videoId);
      } else {
        addMutation.mutate(videoId);
      }
    },
    isFavorite: (videoId: string | number) => {
      return favorites.some((video) => String(video.id) === String(videoId));
    },
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
