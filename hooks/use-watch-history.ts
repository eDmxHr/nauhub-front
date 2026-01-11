import { useQuery } from "@tanstack/react-query";
import { getResumePoint, ResumePointResponse } from "@/lib/api/watch-history";
import { useAuthStore } from "@/lib/store";

export function useWatchHistory(
  videoId: string | number | undefined,
  episodeId?: string | number | undefined
) {
  const { activeProfile } = useAuthStore();

  return useQuery<ResumePointResponse | null>({
    queryKey: ["watch-history", videoId, episodeId, activeProfile?.id],
    queryFn: async () => {
      if (!videoId || !activeProfile?.id) {
        return null;
      }
      return getResumePoint(videoId, activeProfile.id, episodeId);
    },
    enabled: !!videoId && !!activeProfile?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no watch history found)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
