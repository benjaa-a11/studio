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
  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
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
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
        const newVolume = value[0];
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0 && videoRef.current.muted) {
            videoRef.current.muted = false;
        }
    }
  };
  
  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      const currentMuted = videoRef.current.muted;
      videoRef.current.muted = !currentMuted;
      if(currentMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 0.5;
      }
    }
  }, []);

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
      if (videoRef.current.autoplay) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
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
    const onKeyDown = (e: KeyboardEvent) => {
        // Prevent spacebar from scrolling page
        if (e.key === " ") e.preventDefault();
        if (e.key === " " || e.key === "k") handlePlayPause();
        if (e.key === "f") handleFullScreenToggle();
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerRef.current?.addEventListener("keydown", onKeyDown);

    resetControlsTimeout();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerRef.current?.removeEventListener("keydown", onKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : Volume2;
  const sliderColorStyle = {
    '--primary': 'hsl(346.8 77.2% 49.8%)', // A strong red color
    '--secondary': 'hsl(0 0% 100% / 0.3)', // Semi-transparent white
  } as React.CSSProperties;

  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
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
        playsInline
      />
      
      <div 
        className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <button
          onClick={handlePlayPause}
          className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Play video"
        >
          <Play size={64} className="fill-white ml-1" />
        </button>
      </div>
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 text-white" style={sliderColorStyle}>
            <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <span className="text-xs font-mono select-none w-12 text-center">{formatTime(progress)}</span>

            <Slider
                min={0}
                max={duration || 1}
                step={1}
                value={[progress]}
                onValueChange={handleProgressChange}
                className="flex-1 h-2 cursor-pointer [&>span:last-child]:h-3 [&>span:last-child]:w-3 [&>span:last-child]:bg-white [&>span:last-child]:border-0"
            />
            
            <span className="text-xs font-mono select-none w-12 text-center">{formatTime(duration)}</span>

            <div className="group/volume flex items-center gap-1">
                <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1">
                    <VolumeIcon size={24} />
                </button>
                <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    className="w-0 sm:w-20 h-2 cursor-pointer transition-all duration-300 group-hover/volume:w-20 sm:group-hover/volume:w-20 [&>span:last-child]:h-3 [&>span:last-child]:w-3 [&>span:last-child]:bg-white [&>span:last-child]:border-0"
                />
            </div>

            <span className="hidden sm:block text-xs font-bold px-2 py-0.5 rounded-sm border border-white/50 cursor-default">HD</span>
            
            <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1">
              {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
        </div>
      </div>
    </div>
  );
}