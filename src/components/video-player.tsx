"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize } from "lucide-react";
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
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
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
    }
  };
  
  const handleFullScreenToggle = () => {
    if (!playerRef.current) return;

    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } else {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };
  
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
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
    
    resetControlsTimeout();
    
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

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div 
      ref={playerRef} 
      className="relative w-full h-full bg-black flex items-center justify-center group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-h-full max-w-full object-contain"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex flex-col gap-2">
            {/* Timeline */}
            <div className="w-full flex items-center gap-3">
              <span className="text-xs font-mono">{formatTime(progress)}</span>
              <Slider
                min={0}
                max={duration}
                step={1}
                value={[progress]}
                onValueChange={handleProgressChange}
                className="w-full h-2 cursor-pointer"
              />
              <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
          
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handlePlayPause} className="hover:text-primary transition-colors">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="flex items-center gap-2 w-32">
                  <button onClick={handleMuteToggle} className="hover:text-primary transition-colors">
                    <VolumeIcon size={24} />
                  </button>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    className="w-full h-2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors">
                  {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
