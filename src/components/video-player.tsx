"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
};

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return "00:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);
  
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };
  
  const handleFullScreenToggle = useCallback(() => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);
  
  const hideControls = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowControls(false);
    }
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
        setIsPlaying(true);
        resetControlsTimeout();
    };
    const onPause = () => {
        setIsPlaying(false);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(true);
    };
    const onVolumeChange = () => {
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };
    const onFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    document.addEventListener("fullscreenchange", onFullScreenChange);
    
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : Volume2;

  return (
    <div 
      ref={playerRef} 
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={hideControls}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-h-full w-full object-contain"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDoubleClick={handleFullScreenToggle}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white flex flex-col gap-2">
            {/* Timeline */}
            <div className="w-full flex items-center gap-3">
              <span className="text-xs font-mono select-none">{formatTime(progress)}</span>
              <Slider
                min={0}
                max={duration}
                step={1}
                value={[progress]}
                onValueChange={handleProgressChange}
                className="w-full h-2 cursor-pointer"
              />
              <span className="text-xs font-mono select-none">{formatTime(duration)}</span>
            </div>
          
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-2">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-2">
                  <VolumeIcon size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-2">
                  {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
