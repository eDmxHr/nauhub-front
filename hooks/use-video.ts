import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@/types/video";

export function useVideo(id: string | number) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ video: Video }>(`/videos/${id}`);
        return response.data.video;
      } catch (error: any) {
        // Handle 401 errors gracefully - videos should be publicly viewable
        if (error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

