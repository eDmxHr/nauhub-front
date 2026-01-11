import { apiClient } from "./client";
import { Video } from "@/types/video";

export interface AddToFavoritesPayload {
  video_id: string | number;
  profile_id: string | number;
}

export interface RemoveFromFavoritesPayload {
  video_id: string | number;
  profile_id: string | number;
}

export interface FavoritesResponse {
  videos: Video[];
}

/**
 * Get user's favorites (my-list)
 */
export async function getFavorites(profileId: string | number): Promise<Video[]> {
  try {
    const response = await apiClient.get<FavoritesResponse>("/playlists/my-list", {
      params: {
        profile_id: profileId,
      },
    });
    return response.data.videos || [];
  } catch (error: any) {
    // Handle 401 gracefully (user not authenticated)
    if (error.response?.status === 401) {
      return [];
    }
    throw error;
  }
}

/**
 * Add a video to favorites
 */
export async function addToFavorites(
  videoId: string | number,
  profileId: string | number
): Promise<void> {
  await apiClient.post("/playlists/my-list/add", {
    video_id: videoId,
    profile_id: profileId,
  } as AddToFavoritesPayload);
}

/**
 * Remove a video from favorites
 */
export async function removeFromFavorites(
  videoId: string | number,
  profileId: string | number
): Promise<void> {
  await apiClient.delete("/playlists/my-list/remove", {
    data: {
      video_id: videoId,
      profile_id: profileId,
    } as RemoveFromFavoritesPayload,
  });
}
