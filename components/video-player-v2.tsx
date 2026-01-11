"use client";

import { Stream } from "@cloudflare/stream-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { AlertCircle, LoaderIcon } from "lucide-react";
import {
  getResumePoint,
  updateProgress,
  markCompleted,
} from "@/lib/api/watch-history";
import { useAuthStore } from "@/lib/store";

interface VideoPlayerV2Props {
  videoId: string | undefined; // Cloudflare video UID
  contentVideoId?: string | number; // Database video ID for resume point tracking
  episodeId?: string | number; // Episode ID for series/anime
  poster?: string;
  title?: string;
  onBack?: () => void;
  autoplay?: boolean;
  onPlay?: () => void;
}

// Cloudflare Stream customer code
const CUSTOMER_CODE = "1n8d31xiafu0ke30";

export function VideoPlayerV2({
  videoId,
  contentVideoId,
  episodeId,
  poster,
  title,
  autoplay = false,
  onPlay,
}: VideoPlayerV2Props) {
  const streamRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [resumePoint, setResumePoint] = useState<number | null>(null);
  const [hasSeekedToResumePoint, setHasSeekedToResumePoint] = useState(false);
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const previousTimeRef = useRef<number>(0);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { activeProfile } = useAuthStore();

  // Fetch resume point when component mounts and reset completed state
  useEffect(() => {
    setHasMarkedCompleted(false);
    setHasSeekedToResumePoint(false);
    setLastSavedTime(0);
    previousTimeRef.current = 0;

    if (contentVideoId && activeProfile?.id) {
      getResumePoint(contentVideoId, activeProfile.id, episodeId).then(
        (response) => {
          if (response && response.resume_point > 0) {
            setResumePoint(response.resume_point);
            // Mark as completed if backend says so
            if (response.completed) {
              setHasMarkedCompleted(true);
            }
          }
        }
      );
    }
  }, [contentVideoId, episodeId, activeProfile?.id]);

  // Set default volume to 50% and unmute when video loads
  useEffect(() => {
    if (streamRef.current && !isLoading) {
      // Set volume to 0.5 (50%)
      if (streamRef.current.volume !== undefined) {
        streamRef.current.volume = 0.5;
      }
      // Unmute if muted
      if (streamRef.current.muted !== undefined && streamRef.current.muted) {
        streamRef.current.muted = false;
      }
    }
  }, [streamRef.current, isLoading]);

  // Seek to resume point when video metadata is loaded
  useEffect(() => {
    if (
      streamRef.current &&
      resumePoint !== null &&
      !hasSeekedToResumePoint &&
      duration > 0 &&
      resumePoint < duration
    ) {
      try {
        if (streamRef.current.currentTime !== undefined) {
          streamRef.current.currentTime = resumePoint;
          setCurrentTime(resumePoint);
          previousTimeRef.current = resumePoint;
          setHasSeekedToResumePoint(true);
        } else if (streamRef.current.seek) {
          streamRef.current.seek(resumePoint);
          setCurrentTime(resumePoint);
          previousTimeRef.current = resumePoint;
          setHasSeekedToResumePoint(true);
        }
      } catch (error) {
        console.error("Failed to seek to resume point:", error);
      }
    }
  }, [resumePoint, hasSeekedToResumePoint, duration]);

  // Update progress - always save, no conditions
  const saveProgress = useCallback(
    (force = false) => {
      if (
        contentVideoId &&
        activeProfile?.id &&
        currentTime > 0 &&
        duration > 0
      ) {
        // Only save if time has changed significantly (at least 1 second) or forced
        const timeDiff = Math.abs(currentTime - lastSavedTime);
        if (force || timeDiff >= 1) {
          // Calculate watch percentage
          const watchPercentage = (currentTime / duration) * 100;

          // Mark as completed if watched 90% or more, or within last 10 seconds
          if (
            !hasMarkedCompleted &&
            (watchPercentage >= 90 || currentTime >= duration - 10)
          ) {
            markCompleted(contentVideoId, activeProfile.id, episodeId);
            setHasMarkedCompleted(true);
          }

          // Always save progress (no conditions)
          updateProgress(
            contentVideoId,
            currentTime,
            duration,
            activeProfile.id,
            episodeId
          );
          setLastSavedTime(currentTime);
        }
      }
    },
    [
      contentVideoId,
      episodeId,
      currentTime,
      duration,
      hasMarkedCompleted,
      activeProfile?.id,
      lastSavedTime,
    ]
  );

  // Set up interval to update progress every 15 seconds
  useEffect(() => {
    if (currentTime > 0 && duration > 0 && activeProfile?.id) {
      // Clear existing interval
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }

      // Set up new interval
      progressUpdateIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 15000); // Update every 15 seconds

      return () => {
        if (progressUpdateIntervalRef.current) {
          clearInterval(progressUpdateIntervalRef.current);
        }
      };
    }
  }, [currentTime, duration, saveProgress, activeProfile?.id]);

  // Save progress on unmount (exit)
  useEffect(() => {
    return () => {
      if (progressUpdateIntervalRef.current) {
        clearInterval(progressUpdateIntervalRef.current);
      }
      // Always save on exit
      if (
        contentVideoId &&
        activeProfile?.id &&
        currentTime > 0 &&
        duration > 0
      ) {
        updateProgress(
          contentVideoId,
          currentTime,
          duration,
          activeProfile.id,
          episodeId
        );
      }
    };
  }, [contentVideoId, episodeId, currentTime, duration, activeProfile?.id]);

  // Don't render if no video ID
  if (!videoId) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-muted-foreground">No video ID provided</p>
      </div>
    );
  }

  return (
    <>
      {/* Global styles for Cloudflare Stream player */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Style the iframe container - ensure controls are visible */
        #video-container-v2 iframe {
          width: 100%;
          height: 100%;
        }

        /* Container styling */
        #video-container-v2 {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `,
        }}
      />
      <div
        ref={containerRef}
        id="video-container-v2"
        className="relative w-full aspect-video bg-black shadow-lg"
      >
        {/* Stream component with native controls enabled */}
        <div className="absolute inset-0 w-full h-full">
          <Stream
            streamRef={streamRef}
            src={String(videoId)}
            poster={poster}
            autoplay={autoplay}
            muted={autoplay}
            controls
            responsive={true}
            primaryColor="#f15025"
            customerCode={CUSTOMER_CODE}
            onPlay={() => {
              setHasError(false);
              setIsLoading(false);
              onPlay?.();
            }}
            onPause={() => {
              // Always save progress when paused
              saveProgress(true);
            }}
            onEnded={() => {
              // Mark as completed when video ends
              if (contentVideoId && activeProfile?.id && !hasMarkedCompleted) {
                markCompleted(contentVideoId, activeProfile.id, episodeId);
                setHasMarkedCompleted(true);
              }
              // Save final progress
              saveProgress(true);
            }}
            onError={(error: any) => {
              console.error("Cloudflare Stream error:", error);
              setHasError(true);
              setIsLoading(false);
            }}
            onLoadedMetaData={() => {
              setIsLoading(false);
              // Get duration from streamRef
              if (streamRef.current) {
                if (streamRef.current.duration !== undefined) {
                  setDuration(streamRef.current.duration);
                }
              }
            }}
            onTimeUpdate={() => {
              // Track current time for progress updates
              if (streamRef.current) {
                if (streamRef.current.currentTime !== undefined) {
                  const newTime = streamRef.current.currentTime;
                  const previousTime = previousTimeRef.current;

                  // Detect seek: if time jumps more than 2 seconds, it's likely a seek
                  const timeDiff = Math.abs(newTime - previousTime);
                  if (
                    previousTime > 0 &&
                    timeDiff > 2 &&
                    newTime < duration - 5
                  ) {
                    // User sought - save progress immediately
                    setCurrentTime(newTime);
                    previousTimeRef.current = newTime;
                    setTimeout(() => saveProgress(true), 100); // Small delay to ensure state is updated
                  } else {
                    setCurrentTime(newTime);
                    previousTimeRef.current = newTime;
                  }
                }
              }
            }}
            onSeeking={() => {
              // Save progress when seeking starts
              if (contentVideoId && activeProfile?.id && currentTime > 0) {
                saveProgress(true);
              }
            }}
            onSeeked={() => {
              // Save progress when seek completes
              if (contentVideoId && activeProfile?.id) {
                // Get current time from streamRef
                if (streamRef.current?.currentTime !== undefined) {
                  const seekedTime = streamRef.current.currentTime;
                  setCurrentTime(seekedTime);
                  previousTimeRef.current = seekedTime;
                  setTimeout(() => saveProgress(true), 100);
                }
              }
            }}
            onCanPlay={() => {
              setIsLoading(false);
              setHasError(false);
              // Set default volume to 50% and unmute
              if (streamRef.current) {
                if (streamRef.current.volume !== undefined) {
                  streamRef.current.volume = 0.5;
                }
                if (
                  streamRef.current.muted !== undefined &&
                  streamRef.current.muted
                ) {
                  streamRef.current.muted = false;
                }
                // Get duration if available
                if (streamRef.current.duration !== undefined) {
                  setDuration(streamRef.current.duration);
                }
              }
            }}
            onLoadStart={() => {
              setIsLoading(true);
              setHasSeekedToResumePoint(false);
            }}
            onLoadedData={() => {
              setIsLoading(false);
              // Get duration from streamRef
              if (streamRef.current) {
                if (streamRef.current.duration !== undefined) {
                  setDuration(streamRef.current.duration);
                }
              }
            }}
          />
        </div>

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <AlertCircle className="size-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-semibold mb-2">Failed to load video</p>
              <p className="text-sm text-white/70 mb-4">
                Please check your connection and try again
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (streamRef.current?.load) {
                    streamRef.current.load();
                  }
                }}
                className="px-4 py-2 bg-brand hover:bg-brand/80 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Title overlay (if provided) */}
        {title && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none z-20">
            <h3 className="text-white font-semibold text-lg truncate drop-shadow-lg">
              {title}
            </h3>
          </div>
        )}
      </div>
    </>
  );
}
