import { apiClient } from "./client";

export interface ResumePointResponse {
  completed: boolean;
  duration: number; // Total duration in seconds
  last_watched: string; // ISO date string
  message?: string;
  progress_percentage: number; // Progress percentage (0-100)
  resume_point: number; // Time in seconds
}

export interface ResumePointPayload {
  video_id: string | number;
  episode_id?: string | number;
  profile_id: string | number;
}

export interface UpdateProgressPayload {
  video_id: string | number;
  progress_seconds: number; // Time in seconds (integer)
  duration_seconds: number; // Total duration in seconds (integer)
  episode_id?: string | number;
  profile_id: string | number;
}

export interface MarkCompletedPayload {
  video_id: string | number;
  episode_id?: string | number;
  profile_id: string | number;
}

/**
 * Get the resume point for a video or episode
 */
export async function getResumePoint(
  videoId: string | number,
  profileId: string | number,
  episodeId?: string | number
): Promise<ResumePointResponse | null> {
  try {
    const payload: ResumePointPayload = { 
      video_id: videoId,
      profile_id: profileId
    };
    if (episodeId) {
      payload.episode_id = episodeId;
    }

    const response = await apiClient.post<ResumePointResponse>(
      "/watch-history/resume-point",
      payload
    );
    return response.data;
  } catch (error: any) {
    // Silently fail - resume point is optional
    if (error.response?.status === 404) {
      // No resume point found, which is fine
      return null;
    }
    console.error("Failed to get resume point:", error);
    return null;
  }
}

/**
 * Update the watch progress for a video or episode
 */
export async function updateProgress(
  videoId: string | number,
  progress: number,
  duration: number,
  profileId: string | number,
  episodeId?: string | number
): Promise<void> {
  try {
    const payload: UpdateProgressPayload = {
      video_id: videoId,
      progress_seconds: Math.round(progress), // Ensure integer value
      duration_seconds: Math.round(duration), // Ensure integer value
      profile_id: profileId,
    };
    if (episodeId) {
      payload.episode_id = episodeId;
    }

    await apiClient.post("/watch-history/update-progress", payload);
  } catch (error: any) {
    // Silently fail - progress tracking shouldn't break the app
    console.error("Failed to update progress:", error);
  }
}

/**
 * Mark a video or episode as completed
 */
export async function markCompleted(
  videoId: string | number,
  profileId: string | number,
  episodeId?: string | number
): Promise<void> {
  try {
    const payload: MarkCompletedPayload = { 
      video_id: videoId,
      profile_id: profileId
    };
    if (episodeId) {
      payload.episode_id = episodeId;
    }

    await apiClient.post("/watch-history/mark-completed", payload);
  } catch (error: any) {
    // Silently fail - marking as completed shouldn't break the app
    console.error("Failed to mark as completed:", error);
  }
}
