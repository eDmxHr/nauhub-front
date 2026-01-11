import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store";
import { Video, VideoSeason, VideoEpisode } from "@/types/video";
import { getResumePoint, ResumePointResponse } from "@/lib/api/watch-history";

interface ContinueWatchingVideo extends Video {
  watchHistory: ResumePointResponse;
  lastWatchedEpisode?: {
    episode: VideoEpisode;
    season: VideoSeason;
  };
}

export function useContinueWatching() {
  const { activeProfile } = useAuthStore();

  return useQuery<ContinueWatchingVideo[]>({
    queryKey: ["continue-watching", activeProfile?.id],
    queryFn: async () => {
      if (!activeProfile?.id) {
        return [];
      }

      try {
        // Fetch all published videos (movies and series)
        const videosResponse = await apiClient.get<{ videos: Video[] }>("/videos");
        const allVideos = videosResponse.data.videos || [];
        const publishedVideos = allVideos.filter((v) => v.is_published);

        // Limit to first 50 videos to avoid too many API calls
        const videosToCheck = publishedVideos.slice(0, 50);

        // Fetch watch history for each video in parallel (with limit)
        const continueWatchingPromises = videosToCheck.map(async (video) => {
          try {
            // Check watch history for movies
            if (video.type === "movie") {
              const watchHistory = await getResumePoint(
                video.id,
                activeProfile.id
              );

              // Only include if not completed and has progress
              if (
                watchHistory &&
                !watchHistory.completed &&
                watchHistory.progress_percentage > 0 &&
                watchHistory.progress_percentage < 100
              ) {
                return { ...video, watchHistory };
              }
            }
            // For series/anime, find the last watched episode
            else if (video.type === "series" || video.type === "anime") {
              try {
                // Fetch seasons for this series
                const seasonsResponse = await apiClient.get<{ seasons: VideoSeason[] }>(
                  `/videos/${video.id}/seasons`
                );
                const seasons = (seasonsResponse.data.seasons || []).filter((s) => s.is_published);

                if (seasons.length === 0) {
                  return null;
                }

                // Fetch episodes for all seasons and check watch history
                const episodeWatchHistoryPromises = seasons.flatMap(async (season) => {
                  try {
                    const episodesResponse = await apiClient.get<{ episodes: VideoEpisode[] }>(
                      `/seasons/${season.id}/episodes`
                    );
                    const episodes = (episodesResponse.data.episodes || []).filter((e) => e.is_published);

                    // Check watch history for each episode
                    const episodeHistoryPromises = episodes.map(async (episode) => {
                      try {
                        const watchHistory = await getResumePoint(
                          video.id,
                          activeProfile.id,
                          episode.id
                        );

                        if (
                          watchHistory &&
                          !watchHistory.completed &&
                          watchHistory.progress_percentage > 0 &&
                          watchHistory.progress_percentage < 100
                        ) {
                          return {
                            episode,
                            season,
                            watchHistory,
                            lastWatched: new Date(watchHistory.last_watched).getTime(),
                          };
                        }
                        return null;
                      } catch {
                        return null;
                      }
                    });

                    const results = await Promise.all(episodeHistoryPromises);
                    return results.filter((item): item is NonNullable<typeof item> => item !== null);
                  } catch {
                    return [];
                  }
                });

                const allEpisodeHistories = await Promise.all(episodeWatchHistoryPromises);
                const flatHistories = allEpisodeHistories.flat();

                if (flatHistories.length > 0) {
                  // Find the most recently watched episode
                  const mostRecent = flatHistories.sort((a, b) => b.lastWatched - a.lastWatched)[0];
                  
                  return {
                    ...video,
                    watchHistory: mostRecent.watchHistory,
                    lastWatchedEpisode: {
                      episode: mostRecent.episode,
                      season: mostRecent.season,
                    },
                  };
                }
              } catch (error) {
                // Silently skip series with errors
                return null;
              }
            }
            return null;
          } catch (error) {
            // Silently skip videos with errors
            return null;
          }
        });

        const results = await Promise.all(continueWatchingPromises);
        const continueWatching = results
          .filter((item): item is ContinueWatchingVideo => item !== null)
          .sort((a, b) => {
            // Sort by last_watched date (most recent first)
            const dateA = new Date(a.watchHistory.last_watched).getTime();
            const dateB = new Date(b.watchHistory.last_watched).getTime();
            return dateB - dateA;
          })
          .slice(0, 20); // Limit to 20 items

        return continueWatching;
      } catch (error) {
        console.error("Error fetching continue watching:", error);
        return [];
      }
    },
    enabled: !!activeProfile?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
