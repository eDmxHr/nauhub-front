"use client";

import { Stream } from "@cloudflare/stream-react";
import { useRef, useState, useEffect, useCallback } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // Volume level 0-1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Don't render if no video ID
  if (!videoId) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-muted-foreground">No video ID provided</p>
      </div>
    );
  }

  // Get the iframe reference and try to access video element
  useEffect(() => {
    const findVideoElement = () => {
      if (!containerRef.current) return;

      const iframe = containerRef.current.querySelector(
        "iframe",
      ) as HTMLIFrameElement;
      if (iframe) {
        iframeRef.current = iframe;

        // Try to access video element through iframe (may be blocked by CORS)
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const video = iframeDoc.querySelector("video");
            if (video) {
              setVideoElement(video);
              return;
            }
          }
        } catch (e) {
          // CORS blocked - this is expected, we'll use postMessage instead
        }
      }
    };

    const timeout1 = setTimeout(findVideoElement, 200);
    const timeout2 = setTimeout(findVideoElement, 1000);

    const container = containerRef.current;
    const observer = container
      ? new MutationObserver(() => {
          findVideoElement();
        })
      : null;

    if (container && observer) {
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      if (observer) observer.disconnect();
    };
  }, [videoId]);

  // Try to access video element more aggressively after iframe loads
  useEffect(() => {
    if (!iframeRef.current) return;

    const tryAccessVideo = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Try multiple ways to access the video
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          // Try accessing video through iframe window
          const iframeDoc = iframe.contentDocument || iframeWindow.document;
          if (iframeDoc) {
            const video = iframeDoc.querySelector("video");
            if (video && !videoElement) {
              setVideoElement(video);
              // Set initial volume and unmute
              if (!autoplay) {
                video.muted = false;
                video.volume = 1;
                setIsMuted(false);
                setVolume(1);
              }
            }
          }
        }
      } catch (e) {
        // CORS - expected, will use streamRef methods
      }
    };

    // Try multiple times with delays
    const timeouts = [
      setTimeout(tryAccessVideo, 500),
      setTimeout(tryAccessVideo, 1500),
      setTimeout(tryAccessVideo, 3000),
    ];

    // Also try when iframe loads
    if (iframeRef.current) {
      iframeRef.current.addEventListener("load", tryAccessVideo);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener("load", tryAccessVideo);
      }
    };
  }, [iframeRef.current, autoplay, videoElement]);

  // Sync video element properties with state
  useEffect(() => {
    if (videoElement) {
      videoElement.muted = isMuted;
      videoElement.volume = volume;
    } else if (streamRef.current) {
      // Fallback: try to set on streamRef
      if (typeof streamRef.current.muted !== "undefined") {
        streamRef.current.muted = isMuted;
      }
      if (typeof streamRef.current.volume !== "undefined") {
        streamRef.current.volume = volume;
      }
    }
  }, [videoElement, isMuted, volume]);

  // Initialize volume - ensure it's not muted by default unless autoplay
  useEffect(() => {
    if (videoElement && !autoplay) {
      videoElement.muted = false;
      videoElement.volume = 1;
      setIsMuted(false);
      setVolume(1);
    }
  }, [videoElement, autoplay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isLoading) return;

      try {
        if (isPlaying) {
          // Pause
          if (videoElement && videoElement.pause) {
            videoElement.pause();
          } else if (streamRef.current?.pause) {
            streamRef.current.pause();
          }
        } else {
          // Play - ensure not muted when user manually plays (unless volume is 0)
          if (videoElement instanceof HTMLVideoElement) {
            if (volume > 0) {
              videoElement.muted = false;
              setIsMuted(false);
            }
            const playPromise = videoElement.play();
            if (playPromise instanceof Promise) {
              await playPromise.catch((error: any) => {
                console.log("Play failed:", error);
              });
            }
          } else if (streamRef.current) {
            // Use streamRef methods
            if (volume > 0 && streamRef.current.muted !== undefined) {
              streamRef.current.muted = false;
              setIsMuted(false);
            }
            const playPromise = streamRef.current.play?.();
            if (playPromise instanceof Promise) {
              await playPromise.catch((error: any) => {
                console.log("Play failed:", error);
              });
            }
          }
        }
      } catch (error) {
        console.error("Error playing/pausing video:", error);
        setHasError(true);
      }
    },
    [isLoading, isPlaying, volume, videoElement],
  );

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (videoElement && videoElement.currentTime !== undefined) {
        videoElement.currentTime = time;
      } else if (streamRef.current?.currentTime !== undefined) {
        streamRef.current.currentTime = time;
      }
      setCurrentTime(time);
    },
    [videoElement],
  );

  const handleSkip = useCallback(
    (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      if (videoElement && videoElement.currentTime !== undefined) {
        videoElement.currentTime = newTime;
      } else if (streamRef.current?.currentTime !== undefined) {
        streamRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
    },
    [videoElement, duration, currentTime],
  );

  const toggleMute = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const newMutedState = !isMuted;

      // Try to click the native mute button in the iframe
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            // Find and click the native mute button
            const muteButton = iframeDoc.querySelector(
              'button[aria-label*="mute" i], button[aria-label*="volume" i], .vjs-mute-control, [class*="mute"]',
            ) as HTMLButtonElement;
            if (muteButton) {
              muteButton.click();
              setIsMuted(newMutedState);
              return;
            }
          }
        } catch (err) {
          // CORS blocked
        }
      }

      // Fallback to direct video element access
      if (videoElement instanceof HTMLVideoElement) {
        videoElement.muted = newMutedState;
        setIsMuted(newMutedState);
      } else if (streamRef.current) {
        // Try to set muted on streamRef
        if (typeof streamRef.current.muted !== "undefined") {
          streamRef.current.muted = newMutedState;
          setIsMuted(newMutedState);
        } else {
          setIsMuted(newMutedState);
        }
      } else {
        setIsMuted(newMutedState);
      }
    },
    [videoElement, isMuted],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);

      // Try to set volume through iframe video element
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            const video = iframeDoc.querySelector("video");
            if (video) {
              video.volume = newVolume;
              // Auto-unmute when volume is increased
              if (newVolume > 0 && video.muted) {
                video.muted = false;
                setIsMuted(false);
              }
              // Auto-mute when volume is set to 0
              if (newVolume === 0 && !video.muted) {
                video.muted = true;
                setIsMuted(true);
              }
              return;
            }
          }
        } catch (err) {
          // CORS blocked
        }
      }

      // Fallback to direct video element access
      if (videoElement instanceof HTMLVideoElement) {
        videoElement.volume = newVolume;
        if (newVolume > 0 && videoElement.muted) {
          videoElement.muted = false;
          setIsMuted(false);
        }
        if (newVolume === 0 && !videoElement.muted) {
          videoElement.muted = true;
          setIsMuted(true);
        }
      } else if (streamRef.current) {
        if (typeof streamRef.current.volume !== "undefined") {
          streamRef.current.volume = newVolume;
        }
        if (typeof streamRef.current.muted !== "undefined") {
          if (newVolume > 0 && streamRef.current.muted) {
            streamRef.current.muted = false;
            setIsMuted(false);
          }
          if (newVolume === 0 && !streamRef.current.muted) {
            streamRef.current.muted = true;
            setIsMuted(true);
          }
        } else {
          if (newVolume > 0 && isMuted) {
            setIsMuted(false);
          }
          if (newVolume === 0 && !isMuted) {
            setIsMuted(true);
          }
        }
      } else {
        if (newVolume > 0 && isMuted) {
          setIsMuted(false);
        }
        if (newVolume === 0 && !isMuted) {
          setIsMuted(true);
        }
      }
    },
    [videoElement, isMuted],
  );

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      // Check if already in fullscreen
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isCurrentlyFullscreen) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        return;
      }

      // Try to click the native fullscreen button in the iframe first
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow?.document;
          if (iframeDoc) {
            // Find and click the native fullscreen button
            const fullscreenButton = iframeDoc.querySelector(
              'button[aria-label*="fullscreen" i], button[aria-label*="full screen" i], .vjs-fullscreen-control, [class*="fullscreen"]',
            ) as HTMLButtonElement;
            if (fullscreenButton) {
              fullscreenButton.click();
              return;
            }
          }
        } catch (err) {
          // CORS blocked, continue with other methods
        }
      }

      // Enter fullscreen - try video element first (best for mobile)
      if (videoElement) {
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
          return;
        } else if ((videoElement as any).webkitRequestFullscreen) {
          await (videoElement as any).webkitRequestFullscreen();
          return;
        } else if ((videoElement as any).mozRequestFullScreen) {
          await (videoElement as any).mozRequestFullScreen();
          return;
        } else if ((videoElement as any).msRequestFullscreen) {
          await (videoElement as any).msRequestFullscreen();
          return;
        }
      }

      // Try iframe fullscreen (good for mobile)
      const iframe = iframeRef.current;
      if (iframe) {
        if (iframe.requestFullscreen) {
          await iframe.requestFullscreen();
          return;
        } else if ((iframe as any).webkitRequestFullscreen) {
          await (iframe as any).webkitRequestFullscreen();
          return;
        } else if ((iframe as any).mozRequestFullScreen) {
          await (iframe as any).mozRequestFullScreen();
          return;
        } else if ((iframe as any).msRequestFullscreen) {
          await (iframe as any).msRequestFullscreen();
          return;
        }
      }

      // Fallback to container fullscreen
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        await (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        await (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        await (container as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, [videoElement]);

  // Style the Stream iframe and hide native controls
  useEffect(() => {
    const styleIframe = () => {
      if (!containerRef.current) return;
      const iframe = containerRef.current.querySelector("iframe");
      if (iframe) {
        // Apply Cloudflare's responsive iframe pattern
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.border = "none";
        // Ensure fullscreen is allowed
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute(
          "allow",
          "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;",
        );

        // Try to hide native controls by injecting styles into iframe
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Check if style already exists
            let styleEl = iframeDoc.getElementById("hide-native-controls");
            if (!styleEl) {
              styleEl = iframeDoc.createElement("style");
              styleEl.id = "hide-native-controls";
              styleEl.textContent = `
                .vjs-control-bar,
                [class*="control"],
                button[aria-label*="mute"],
                button[aria-label*="volume"],
                button[aria-label*="fullscreen"],
                button[aria-label*="full screen"] {
                  opacity: 0 !important;
                  pointer-events: none !important;
                  visibility: hidden !important;
                }
                video {
                  pointer-events: auto !important;
                }
              `;
              iframeDoc.head.appendChild(styleEl);
            }
          }
        } catch (e) {
          // CORS blocked - can't inject styles, that's okay
        }
      }
    };

    const timeout1 = setTimeout(styleIframe, 100);
    const timeout2 = setTimeout(styleIframe, 500);
    const timeout3 = setTimeout(styleIframe, 1000);

    const handleFullscreenChange = () => {
      setTimeout(styleIframe, 100);
    };

    const container = containerRef.current;
    const observer = container
      ? new MutationObserver(() => {
          styleIframe();
        })
      : null;

    if (container && observer) {
      observer.observe(container, { childList: true, subtree: true });
    }

    const handleFullscreenStateChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      // Show controls when entering fullscreen
      if (isCurrentlyFullscreen) {
        setShowControls(true);
      }
      setTimeout(styleIframe, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenStateChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenStateChange,
    );
    document.addEventListener(
      "mozfullscreenchange",
      handleFullscreenStateChange,
    );
    document.addEventListener(
      "MSFullscreenChange",
      handleFullscreenStateChange,
    );

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      if (observer) observer.disconnect();
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenStateChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenStateChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenStateChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenStateChange,
      );
    };
  }, [videoId]);

  // Update time and duration from video element
  useEffect(() => {
    if (!videoElement) return;

    const updateTime = () => {
      if (videoElement.currentTime !== undefined) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    const updateDuration = () => {
      if (videoElement.duration && videoElement.duration > 0) {
        setDuration(videoElement.duration);
      }
    };

    videoElement.addEventListener("timeupdate", updateTime);
    videoElement.addEventListener("loadedmetadata", updateDuration);
    videoElement.addEventListener("durationchange", updateDuration);

    // Initial duration
    if (videoElement.duration) {
      updateDuration();
    }

    return () => {
      videoElement.removeEventListener("timeupdate", updateTime);
      videoElement.removeEventListener("loadedmetadata", updateDuration);
      videoElement.removeEventListener("durationchange", updateDuration);
    };
  }, [videoElement]);

  return (
    <div
      ref={containerRef}
      id="video-container"
      className="relative w-full aspect-video bg-black group overflow-hidden"
      onMouseEnter={() => !isLoading && setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => !isLoading && setShowControls(true)}
      onClick={(e) => {
        // Only toggle play/pause if not loading and clicking on the video itself (not controls)
        if (!isLoading && e.target === e.currentTarget) {
          handlePlayPause(e);
        }
      }}
    >
      {/* Stream component container */}
      <div className="absolute inset-0 w-full h-full">
        <Stream
          streamRef={streamRef}
          src={String(videoId)}
          poster={poster}
          autoplay={autoplay}
          muted={autoplay} // Only mute for autoplay (browser policy)
          controls={true} // Enable native controls for API access, we'll hide them with injected styles
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
            setHasError(true);
            setIsLoading(false);
          }}
          onTimeUpdate={() => {
            if (videoElement && videoElement.currentTime !== undefined) {
              setCurrentTime(videoElement.currentTime);
            } else if (streamRef.current?.currentTime !== undefined) {
              setCurrentTime(streamRef.current.currentTime);
            }
          }}
          onLoadedMetaData={() => {
            if (videoElement && videoElement.duration) {
              setDuration(videoElement.duration);
            } else if (streamRef.current?.duration) {
              setDuration(streamRef.current.duration);
            }
            setIsLoading(false);
          }}
          onCanPlay={() => {
            setIsLoading(false);
            setHasError(false);
            // Ensure volume is set correctly when video can play (not muted unless autoplay)
            if (videoElement instanceof HTMLVideoElement && !autoplay) {
              videoElement.muted = false;
              videoElement.volume = 1;
              setIsMuted(false);
              setVolume(1);
            } else if (streamRef.current && !autoplay) {
              if (streamRef.current.muted !== undefined) {
                streamRef.current.muted = false;
                setIsMuted(false);
              }
              if (streamRef.current.volume !== undefined) {
                streamRef.current.volume = 1;
                setVolume(1);
              }
            }
            // Note: postMessage fallback removed as Cloudflare Stream iframe doesn't listen to custom messages
            // Volume control will work if videoElement or streamRef exposes volume property
          }}
          onLoadStart={() => {
            setIsLoading(true);
          }}
          onLoadedData={() => {
            setIsLoading(false);
          }}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <LoaderIcon className="animate-spin text-brand" />
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
                if (videoElement?.load) {
                  videoElement.load();
                } else if (streamRef.current?.load) {
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
        className={`absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity pointer-events-none z-20 ${
          (showControls || isFullscreen) && !hasError && !isLoading
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none">
            <h3 className="text-white font-semibold text-lg truncate drop-shadow-lg">
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
                className="p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-20 touch-manipulation"
                aria-label="Play"
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
            <span className="text-xs text-white/80 w-10 font-mono">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
            />
            <span className="text-xs text-white/80 w-10 text-right font-mono">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-brand transition-colors touch-manipulation"
                aria-label="Rewind 10 seconds"
              >
                <SkipBack className="size-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-brand transition-colors touch-manipulation"
                disabled={isLoading}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="size-6" />
                ) : (
                  <Play className="size-6 fill-white" />
                )}
              </button>
              <button
                onClick={() => handleSkip(10)}
                className="text-white hover:text-brand transition-colors touch-manipulation"
                aria-label="Forward 10 seconds"
              >
                <SkipForward className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-brand transition-colors touch-manipulation"
                  aria-label={isMuted ? "Unmute" : "Mute"}
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
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
                  aria-label="Volume"
                />
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand transition-colors touch-manipulation z-30"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <Maximize className="size-5 rotate-45" />
                ) : (
                  <Maximize className="size-5" />
                )}
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
