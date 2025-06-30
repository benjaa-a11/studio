"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, FastForward, Rewind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type VideoPlayerProps = {
  src: string;
  posterUrl: string;
};

const formatTime = (timeInSeconds: number, showHours: boolean = false): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return showHours ? "0:00:00" : "00:00";
  }

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function VideoPlayer({ src, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [showRewind, setShowRewind] = useState(false);
  const [showForward, setShowForward] = useState(false);

  const hideControls = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowControls(false);
    }
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (error) {
       if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn("Autoplay was prevented.", error);
      } else if (error instanceof Error && error.name === 'AbortError') {
      } else {
        console.error("Video play failed:", error);
      }
      setIsPlaying(false);
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

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };
  
  const handleFullScreenToggle = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (!document.fullscreenElement) {
        await player.requestFullscreen();
        if (screen.orientation && typeof screen.orientation.lock === "function") {
          await screen.orientation.lock("landscape").catch(() => {});
        }
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === "function") screen.orientation.unlock();
      }
    } catch (err) {
      console.error(`Fullscreen Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);
  
  const handleVideoClick = useCallback(() => {
    setShowControls(true);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const seekBy = useCallback((amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount));
      if (amount > 0) {
        setShowForward(true);
        setTimeout(() => setShowForward(false), 700);
      } else {
        setShowRewind(true);
        setTimeout(() => setShowRewind(false), 700);
      }
    }
  }, [duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsMuted(video.muted); resetControlsTimeout(); };
    const onPause = () => { setIsPlaying(false); setShowControls(true); };
    const onVolumeChange = () => setIsMuted(video.muted || video.volume === 0);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => { setIsLoading(false); resetControlsTimeout(); };
    const onEnded = () => { setIsPlaying(false); setShowControls(true); };
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch(e.key.toLowerCase()) {
        case " ": case "k": e.preventDefault(); handlePlayPause(); break;
        case "f": e.preventDefault(); handleFullScreenToggle(); break;
        case "m": e.preventDefault(); handleMuteToggle(); break;
        case "arrowright": e.preventDefault(); seekBy(5); break;
        case "arrowleft": e.preventDefault(); seekBy(-5); break;
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", () => setIsLoading(false));
    video.addEventListener("playing", onPlaying);
    
    const playerEl = playerRef.current;
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerEl?.addEventListener("keydown", onKeyDown);

    resetControlsTimeout();
    video.play().catch(() => setIsPlaying(false));

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", () => setIsLoading(false));
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerEl?.removeEventListener("keydown", onKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle, seekBy]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const showHours = duration >= 3600;
  const timeWidth = showHours ? "w-20" : "w-14";

  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={hideControls}
      onClick={handleVideoClick}
    >
      {isLoading && posterUrl && (
        <div className="absolute inset-0 z-0">
          <Image src={posterUrl} alt="Movie poster background" layout="fill" objectFit="cover" className="blur-lg scale-110 opacity-30" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className={cn("max-h-full w-full object-contain z-10", isLoading && "opacity-0")}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDoubleClick={handleFullScreenToggle}
        playsInline
        muted={isMuted}
        onPlay={() => setIsMuted(false)} // Unmute on first user play
      />
      
      {isFullScreen && (
          <>
            <div className="absolute left-0 top-0 h-full w-1/3 z-20" onDoubleClick={(e) => {e.stopPropagation(); seekBy(-10)}} />
            <div className="absolute right-0 top-0 h-full w-1/3 z-20" onDoubleClick={(e) => {e.stopPropagation(); seekBy(10)}} />
          </>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
      
      {(showRewind || showForward) && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-2 text-white bg-black/40 p-4 rounded-full animate-fade-in-out">
                {showRewind && <Rewind className="w-8 h-8" />}
                {!showRewind && !showForward && <Play size={64} className="fill-white pl-1" />}
                {showForward && <FastForward className="w-8 h-8" />}
            </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Play video"
          >
            <Play size={64} className="fill-white pl-1" />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2 transition-all duration-300 ease-in-out",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2 pb-1 text-white">
            <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                <VolumeIcon size={28} />
            </button>
            
            {isFullScreen ? (
              <>
                <span className={cn("text-xs sm:text-sm font-mono select-none text-center tabular-nums", timeWidth)}>
                    {formatTime(progress, showHours)}
                </span>
                
                <Slider
                    value={[progress]}
                    max={duration || 1}
                    step={1}
                    onValueChange={handleSeek}
                    onValueChangeStart={() => setIsSeeking(true)}
                    onValueChangeEnd={() => setIsSeeking(false)}
                    className="w-full flex-1 cursor-pointer"
                    aria-label="Video progress bar"
                />

                <span className={cn("text-xs sm:text-sm font-mono select-none text-center tabular-nums", timeWidth)}>
                    {formatTime(duration, showHours)}
                </span>
              </>
            ) : (
                <div className="flex-1" />
            )}
            
            <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1" aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
            </button>
        </div>
      </div>
    </div>
  );
}
