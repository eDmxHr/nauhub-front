"use client";

import { Stream } from "@cloudflare/stream-react";
import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  AlertCircle,
  LoaderIcon,
} from "lucide-react";

interface VideoPlayerProps {
  videoId: string | undefined;
  poster?: string;
  title?: string;
  onBack?: () => void;
  autoplay?: boolean;
  onPlay?: () => void;
}

// Cloudflare Stream customer code
// From subdomain: customer-1n8d31xiafu0ke30.cloudflarestream.com
// The React component expects just the code part (without "customer-" prefix)
const CUSTOMER_CODE = "1n8d31xiafu0ke30";

export function VideoPlayer({
  videoId,
  poster,
  title,
  autoplay = false,
  onPlay,
}: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // Volume level 0-1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Don't render if no video ID
  if (!videoId) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-muted-foreground">No video ID provided</p>
      </div>
    );
  }

  // Debug: Log video ID and customer code
  useEffect(() => {
    console.log("VideoPlayer - videoId:", videoId, "customerCode:", CUSTOMER_CODE);
  }, [videoId]);

  // Sync mute and volume state with streamRef
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.muted = isMuted;
      streamRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Try to play when video is ready and autoplay is enabled
  useEffect(() => {
    if (autoplay && streamRef.current && !isLoading && !hasError && !isPlaying) {
      const playPromise = streamRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error: any) => {
          console.log("Autoplay prevented by browser:", error);
          // Browser blocked autoplay - user will need to click play
        });
      }
    }
  }, [autoplay, isLoading, hasError, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling
    if (streamRef.current && !isLoading) {
      try {
        if (isPlaying) {
          streamRef.current.pause();
          // onPause event will update isPlaying state
        } else {
          // Attempt to play
          const playPromise = streamRef.current.play();
          if (playPromise !== undefined) {
            await playPromise
              .then(() => {
                // onPlay event will update isPlaying state
              })
              .catch((error: any) => {
                console.log("Play failed, trying with mute:", error);
                // If play fails, mute and try again (common browser autoplay restriction)
                if (!isMuted) {
                  setIsMuted(true);
                  streamRef.current.muted = true;
                }
                return streamRef.current.play();
              });
          }
        }
      } catch (error) {
        console.error("Error playing/pausing video:", error);
        setHasError(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (streamRef.current) {
      streamRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleSkip = (seconds: number) => {
    if (streamRef.current) {
      streamRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds)
      );
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (streamRef.current) {
      const newMutedState = !isMuted;
      streamRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (streamRef.current) {
      streamRef.current.volume = newVolume;
      // Auto-unmute when volume is increased
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        streamRef.current.muted = false;
      }
      // Auto-mute when volume is set to 0
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
        streamRef.current.muted = true;
      }
    }
  };

  const toggleFullscreen = async () => {
    const container = document.getElementById("video-container");
    if (container) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await container.requestFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
      }
    }
  };

  // Style the Stream iframe to fill container and handle fullscreen
  useEffect(() => {
    const styleIframe = () => {
      const container = document.getElementById("video-container");
      if (container) {
        const iframe = container.querySelector("iframe");
        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.objectFit = "contain";
          iframe.style.display = "block";
          iframe.style.position = "absolute";
          iframe.style.top = "0";
          iframe.style.left = "0";
        }
      }
    };

    // Style when video loads
    const timeout1 = setTimeout(styleIframe, 100);
    const timeout2 = setTimeout(styleIframe, 500);
    const timeout3 = setTimeout(styleIframe, 1000);
    
    const handleFullscreenChange = () => {
      setTimeout(styleIframe, 100);
    };

    // Use MutationObserver to watch for iframe insertion
    const container = document.getElementById("video-container");
    const observer = container
      ? new MutationObserver(() => {
          styleIframe();
        })
      : null;

    if (container && observer) {
      observer.observe(container, { childList: true, subtree: true });
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      if (observer) observer.disconnect();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [videoId]);

  return (
    <div
      id="video-container"
      className="relative w-full aspect-video bg-black group overflow-hidden"
      onMouseEnter={() => !isLoading && setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={(e) => {
        // Only toggle play/pause if not loading and clicking on the video itself (not controls)
        if (!isLoading && e.target === e.currentTarget) {
          handlePlayPause(e);
        }
      }}
    >
      <div className="absolute inset-0 w-full h-full">
        <Stream
            streamRef={streamRef}
            src={String(videoId)}
            poster={poster}
            autoplay={autoplay}
            muted={autoplay ? true : isMuted} // Mute if autoplay (browser policy)
            controls={false}
            responsive={true}
            primaryColor="#a855f7"
            customerCode={CUSTOMER_CODE}
        onPlay={() => {
          setIsPlaying(true);
          setHasError(false);
          setIsLoading(false);
          onPlay?.();
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onError={(error: any) => {
          console.error("Cloudflare Stream error:", error);
          console.error("Video ID:", videoId, "Customer Code:", CUSTOMER_CODE);
          setHasError(true);
          setIsLoading(false);
        }}
        onTimeUpdate={() => {
          if (streamRef.current) {
            setCurrentTime(streamRef.current.currentTime || 0);
          }
        }}
        onLoadedMetaData={() => {
          if (streamRef.current) {
            setDuration(streamRef.current.duration || 0);
            setIsLoading(false);
          }
        }}
        onCanPlay={() => {
          console.log("Stream onCanPlay - video ready");
          setIsLoading(false);
          setHasError(false);
          // Try to play if autoplay is enabled
          if (autoplay && streamRef.current && !isPlaying) {
            streamRef.current.play().catch((err: any) => {
              console.log("Autoplay failed, user interaction required:", err);
            });
          }
        }}
        onLoadStart={() => {
          console.log("Stream onLoadStart - loading video:", videoId);
          setIsLoading(true);
        }}
        onLoadedData={() => {
          console.log("Stream onLoadedData - video data loaded");
          setIsLoading(false);
        }}
      />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <LoaderIcon className="animate-spin text-brand"/>
        </div>
      )}

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
                if (streamRef.current) {
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

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity pointer-events-none ${
          showControls && !hasError && !isLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {title}
            </h3>
          </div>
        )}

        {/* Center Play Button - Only show when not loading and not playing */}
        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            {!isPlaying && (
              <button
                onClick={handlePlayPause}
                className="p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-20"
              >
                <Play className="size-8 text-white fill-white" />
              </button>
            )}
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80 w-10">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-xs text-white/80 w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-brand transition-colors"
              >
                <SkipBack className="size-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-brand transition-colors"
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause className="size-6" />
                ) : (
                  <Play className="size-6 fill-white" />
                )}
              </button>
              <button
                onClick={() => handleSkip(10)}
                className="text-white hover:text-brand transition-colors"
              >
                <SkipForward className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-brand transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="size-5" />
                  ) : (
                    <Volume2 className="size-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand transition-colors"
              >
                <Maximize className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple embed version for when you just want the default player
export function VideoPlayerEmbed({
  videoId,
  poster,
  customerCode = CUSTOMER_CODE,
}: {
  videoId: string;
  poster?: string;
  customerCode?: string;
}) {
  if (!videoId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">No video ID provided</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <Stream
        src={videoId}
        poster={poster}
        controls={true}
        responsive={true}
        primaryColor="#a855f7"
        customerCode={customerCode}
        onError={(error: any) => {
          console.error("Cloudflare Stream embed error:", error);
        }}
      />
    </div>
  );
}
