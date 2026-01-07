import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { VideoEpisode } from "@/types/video";

export function useSeasonEpisodes(
  seasonId: string | number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["season-episodes", seasonId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ episodes: VideoEpisode[] }>(
          `/seasons/${seasonId}/episodes`
        );
        return response.data.episodes || [];
      } catch (error: any) {
        // Handle 401 errors gracefully
        if (error?.response?.status === 401) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!seasonId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

