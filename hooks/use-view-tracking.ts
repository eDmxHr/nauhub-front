import { useEffect, useRef } from "react";
import { incrementVideoView, incrementEpisodeView } from "@/lib/api/views";

/**
 * Hook to track video views
 * Calls the view increment API when video starts playing
 */
export function useViewTracking(
  videoId: string | number | undefined,
  episodeId: string | number | undefined,
  isPlaying: boolean,
  isMovie: boolean
) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Only track once when video starts playing
    if (isPlaying && !hasTrackedRef.current) {
      hasTrackedRef.current = true;

      if (isMovie && videoId) {
        // Track movie view
        incrementVideoView(videoId);
      } else if (!isMovie && episodeId) {
        // Track episode view
        incrementEpisodeView(episodeId);
      }
    }

    // Reset tracking when video/episode changes
    if (!isPlaying) {
      hasTrackedRef.current = false;
    }
  }, [isPlaying, videoId, episodeId, isMovie]);
}

