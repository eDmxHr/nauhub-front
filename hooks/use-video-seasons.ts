import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { VideoSeason } from "@/types/video";

export function useVideoSeasons(
  videoId: string | number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["video-seasons", videoId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ seasons: VideoSeason[] }>(
          `/videos/${videoId}/seasons`
        );
        return response.data.seasons || [];
      } catch (error: any) {
        // Handle 401 (unauthorized) and 404 (not found - e.g., movies don't have seasons) errors gracefully
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!videoId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) or 404 (not found - e.g., movies don't have seasons)
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

