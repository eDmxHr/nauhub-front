import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { VideoEpisode } from "@/types/video";

export function useEpisode(id: string | number) {
  return useQuery({
    queryKey: ["episode", id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ episode: VideoEpisode }>(
          `/episodes/${id}`
        );
        return response.data.episode;
      } catch (error: any) {
        // Handle 401 errors gracefully
        if (error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!id,
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

