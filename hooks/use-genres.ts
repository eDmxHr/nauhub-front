import { apiClient } from "@/lib/api/client";
import { Genre } from "@/types/genres";
import { useQuery } from "@tanstack/react-query";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ genres: Genre[] }>("/genres");
        const data = response.data.genres;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
      }
    },
  });
}
