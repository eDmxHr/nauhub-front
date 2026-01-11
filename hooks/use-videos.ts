import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export type VideoType = "movie" | "series" | "anime";

interface UseVideosParams {
  type?: VideoType;
  categoryId?: number;
  genreId?: number;
  search?: string;
  page?: number;
}

export function useVideos({
  type,
  categoryId,
  genreId,
  search,
  page = 1,
}: UseVideosParams = {}) {
  return useQuery({
    queryKey: ["videos", { type, categoryId, genreId, search, page }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (categoryId) params.append("category_id", String(categoryId));
        if (genreId) params.append("genre_id", String(genreId));
        if (search) params.append("search", search);
        if (page) params.append("page", String(page));

        const response = await apiClient.get<{
          videos: any[];
        }>(`/videos?${params.toString()}`);

        return Array.isArray(response.data.videos) ? response.data.videos : [];
      } catch (error: any) {
        // Handle 401 gracefully - browsing is allowed without auth
        if (error?.response?.status === 401) {
          return [];
        }
        console.error("Error fetching videos:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}
