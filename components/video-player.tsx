"use client";

import { Stream } from "@cloudflare/stream-react";
import { useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  title?: string;
  onBack?: () => void;
  autoplay?: boolean;
}

export function VideoPlayer({
  videoId,
  poster,
  title,
  autoplay = false,
}: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const streamRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (streamRef.current) {
      if (isPlaying) {
        streamRef.current.pause();
      } else {
        streamRef.current.play();
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

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("video-container");
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  return (
    <div
      id="video-container"
      className="relative w-full aspect-video bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handlePlayPause}
    >
      <Stream
        streamRef={streamRef}
        src={videoId}
        poster={poster}
        autoplay={autoplay}
        controls={false}
        responsive={true}
        primaryColor="#a855f7"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (streamRef.current) {
            setCurrentTime(streamRef.current.currentTime);
          }
        }}
        onLoadedMetaData={() => {
          if (streamRef.current) {
            setDuration(streamRef.current.duration);
          }
        }}
      />

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {title}
            </h3>
          </div>
        )}

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="size-8 text-white fill-white" />
            ) : (
              <Play className="size-8 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
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
              <button
                onClick={toggleMute}
                className="text-white hover:text-brand transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </button>
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
  customerCode = "customer-450hlmgeahk5dcih", // Cloudflare's public demo customer code
}: {
  videoId: string;
  poster?: string;
  customerCode?: string;
}) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <Stream
        src={videoId}
        poster={poster}
        controls={true}
        responsive={true}
        primaryColor="#a855f7"
        customerCode={customerCode}
      />
    </div>
  );
}
