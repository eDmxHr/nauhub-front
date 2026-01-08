"use client";

import { Stream } from "@cloudflare/stream-react";
import { useRef, useState, useEffect } from "react";
import { AlertCircle, LoaderIcon } from "lucide-react";

interface VideoPlayerV2Props {
  videoId: string | undefined;
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
  poster,
  title,
  autoplay = false,
  onPlay,
}: VideoPlayerV2Props) {
  const streamRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      <style dangerouslySetInnerHTML={{ __html: `
        /* Style the iframe container */
        #video-container-v2 iframe {
          border-radius: 0.5rem;
          overflow: hidden;
        }

        /* Container styling */
        #video-container-v2 {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Fullscreen styles */
        #video-container-v2:fullscreen,
        #video-container-v2:-webkit-full-screen,
        #video-container-v2:-moz-full-screen,
        #video-container-v2:-ms-fullscreen {
          border-radius: 0;
        }

        #video-container-v2:fullscreen iframe,
        #video-container-v2:-webkit-full-screen iframe,
        #video-container-v2:-moz-full-screen iframe,
        #video-container-v2:-ms-fullscreen iframe {
          border-radius: 0;
        }
      `}} />
      <div
        ref={containerRef}
        id="video-container-v2"
        className="relative w-full aspect-video bg-black overflow-hidden rounded-lg shadow-lg"
      >
      {/* Stream component with native controls enabled */}
      <div className="absolute inset-0 w-full h-full">
        <Stream
          streamRef={streamRef}
          src={String(videoId)}
          poster={poster}
          autoplay={autoplay}
          muted={autoplay}
          controls={true}
          responsive={true}
          primaryColor="#a855f7"
          customerCode={CUSTOMER_CODE}
          onPlay={() => {
            setHasError(false);
            setIsLoading(false);
            onPlay?.();
          }}
          onError={(error: any) => {
            console.error("Cloudflare Stream error:", error);
            setHasError(true);
            setIsLoading(false);
          }}
          onLoadedMetaData={() => {
            setIsLoading(false);
          }}
          onCanPlay={() => {
            setIsLoading(false);
            setHasError(false);
            // Set default volume to 50% and unmute
            if (streamRef.current) {
              if (streamRef.current.volume !== undefined) {
                streamRef.current.volume = 0.5;
              }
              if (streamRef.current.muted !== undefined && streamRef.current.muted) {
                streamRef.current.muted = false;
              }
            }
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
