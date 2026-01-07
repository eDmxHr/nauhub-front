import { apiClient } from "./client";

/**
 * Increment view count for a video (movie)
 */
export async function incrementVideoView(videoId: string | number): Promise<void> {
  try {
    await apiClient.post(`/videos/${videoId}/view`);
  } catch (error: any) {
    // Silently fail - view tracking shouldn't break the app
    console.error("Failed to increment video view:", error);
  }
}

/**
 * Increment view count for an episode (series/anime)
 */
export async function incrementEpisodeView(episodeId: string | number): Promise<void> {
  try {
    await apiClient.post(`/episodes/${episodeId}/view`);
  } catch (error: any) {
    // Silently fail - view tracking shouldn't break the app
    console.error("Failed to increment episode view:", error);
  }
}

