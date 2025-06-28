"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
};

const formatTime = (timeInSeconds: number, showHours: boolean = false): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return showHours ? "0:00:00" : "00:00";
  }

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (showHours) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};


export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPause = useCallback(async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Video play failed:", err);
          setIsPlaying(false);
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, []);
  
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
  
  const handleFullScreenToggle = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement) {
        try {
            await player.requestFullscreen();
            if (screen.orientation && typeof screen.orientation.lock === "function") {
                await screen.orientation.lock("landscape").catch(() => {});
            }
        } catch (err) {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        }
    } else {
        try {
            if (screen.orientation && typeof screen.orientation.unlock === "function") {
                screen.orientation.unlock();
            }
            await document.exitFullscreen();
        } catch (err) {
            console.error(`Error exiting full-screen mode: ${err.message} (${err.name})`);
        }
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

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
        setIsPlaying(false);
        setShowControls(true);
    };
    const onVolumeChange = () => {
        if (video) setIsMuted(video.muted);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
        resetControlsTimeout();
    };
    const onEnded = () => {
        setIsPlaying(false);
        setShowControls(true);
    };

    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        
        switch(e.key.toLowerCase()) {
            case " ":
            case "k":
                e.preventDefault();
                handlePlayPause();
                break;
            case "f":
                e.preventDefault();
                handleFullScreenToggle();
                break;
            case "m":
                e.preventDefault();
                handleMuteToggle();
                break;
        }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    
    const playerEl = playerRef.current;
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerEl?.addEventListener("keydown", onKeyDown);

    resetControlsTimeout();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerEl?.removeEventListener("keydown", onKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const sliderColorStyle = {
    '--primary': 'hsl(346.8 77.2% 49.8%)',
    '--secondary': 'hsl(0 0% 100% / 0.3)',
  } as React.CSSProperties;
  
  const showHours = duration >= 3600;

  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={hideControls}
      onClick={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDoubleClick={handleFullScreenToggle}
        playsInline
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      <div 
        className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20",
            (isPlaying || isLoading) ? "opacity-0 pointer-events-none" : "opacity-100"
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
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent",
          "transition-all duration-300 ease-in-out",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
      >
        {isFullScreen && (
            <div className="mx-2 sm:mx-4 mb-2">
                <Slider
                    min={0}
                    max={duration || 1}
                    step={1}
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    className="w-full h-2 cursor-pointer [&>span:last-child]:h-3.5 [&>span:last-child]:w-3.5 [&>span:last-child]:bg-red-500"
                    style={sliderColorStyle}
                />
            </div>
        )}
        <div className="flex items-center gap-3 px-2 sm:px-4 pb-1 text-white">
            <button onClick={handlePlayPause} className="hover:text-red-500 transition-colors p-1">
              {isPlaying ? <Pause size={26} /> : <Play size={26} />}
            </button>
            <button onClick={handleMuteToggle} className="hover:text-red-500 transition-colors p-1">
                <VolumeIcon size={26} />
            </button>
            
            <div className="text-xs sm:text-sm font-mono select-none flex items-center gap-1">
                <span>{formatTime(progress, showHours)}</span>
                <span>/</span>
                <span>{formatTime(duration, showHours)}</span>
            </div>
            
            <div className="flex-1" />
            
            <span className="hidden sm:block text-xs font-bold px-2 py-0.5 rounded-sm border border-white/50 cursor-default">HD</span>
            
            <button onClick={handleFullScreenToggle} className="hover:text-red-500 transition-colors p-1">
              {isFullScreen ? <Minimize size={26} /> : <Maximize size={26} />}
            </button>
        </div>
      </div>
    </div>
  );
}
