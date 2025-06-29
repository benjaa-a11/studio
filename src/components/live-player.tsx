"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LivePlayerProps = {
  src: string;
};

export default function LivePlayer({ src }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    setError(null);
    setIsLoading(true);

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.warn(`HLS fatal error: ${data.type}`, data);
                setError('No se pudo cargar la transmisión. Es posible que no esté disponible o sea incompatible.');
                setIsLoading(false);
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (e.g., Safari)
        video.src = src;
    } else {
        setError('Este formato de video no es compatible con su navegador.');
        setIsLoading(false);
    }

    return () => {
        if (hls) {
            hls.destroy();
        }
    };
}, [src]);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current || error) return;
    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (err) {
       if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
        // This is expected in some cases, e.g., user interaction interruption
       } else {
        console.warn("Video play/pause failed:", err);
      }
    }
  }, [error]);
  
  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      const currentMuted = videoRef.current.muted;
      videoRef.current.muted = !currentMuted;
      if(currentMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 1;
      }
    }
  }, []);
  
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
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
            screen.orientation.unlock();
        }
      }
    } catch (err) {
        console.error(`Fullscreen Error: ${err instanceof Error ? err.message : String(err)}`);
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

  const handlePlayerClick = useCallback(() => {
    if (isPlaying) {
      setShowControls(s => !s);
    }
  }, [isPlaying]);

  const handleCenterPlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handlePlayPause();
  }, [handlePlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
        setIsPlaying(false);
        setShowControls(true);
    };
    const onVolumeChange = () => {
        if (video) setIsMuted(video.muted || video.volume === 0);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
        resetControlsTimeout();
    };
    
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        
        const key = e.key.toLowerCase();
        if (key === ' ' || key === 'f' || key === 'm') {
          e.preventDefault();
          resetControlsTimeout();
          switch(key) {
              case " ":
              case "k":
                  handlePlayPause();
                  break;
              case "f":
                  handleFullScreenToggle();
                  break;
              case "m":
                  handleMuteToggle();
                  break;
          }
        }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    
    const playerEl = playerRef.current;
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerEl?.addEventListener("keydown", onKeyDown);

    playerEl?.addEventListener('mousemove', resetControlsTimeout);
    playerEl?.addEventListener('mouseleave', hideControls);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerEl?.removeEventListener("keydown", onKeyDown);
      playerEl?.removeEventListener('mousemove', resetControlsTimeout);
      playerEl?.removeEventListener('mouseleave', hideControls);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle, hideControls]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;
  
  return (
    <div 
      ref={playerRef} 
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onClick={handlePlayerClick}
    >
      <video
        ref={videoRef}
        className="max-h-full w-full object-contain"
        onDoubleClick={handleFullScreenToggle}
        playsInline
      />
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-4 text-center">
            <VideoOff className="w-12 h-12 mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-1">Error de reproducción</h3>
            <p className="text-sm text-white/80">{error}</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={handleCenterPlayClick}
            className="bg-black/40 text-white rounded-full p-2 sm:p-4 backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Play video"
          >
            <Play size={64} className="fill-white pl-1" />
          </button>
        </div>
      )}
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2",
          "transition-all duration-300 ease-in-out",
          (showControls && !error) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-4 text-white">
            <button onClick={handlePlayPause} className="hover:text-red-500 transition-colors p-1" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <Badge variant="destructive" className="animate-pulse">EN VIVO</Badge>
            
            <div className="flex-1" />
            
            <button onClick={handleMuteToggle} className="hover:text-red-500 transition-colors p-1" aria-label={isMuted ? "Quitar silencio" : "Silenciar"}>
                <VolumeIcon size={28} />
            </button>
            
            <button onClick={handleFullScreenToggle} className="hover:text-red-500 transition-colors p-1" aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}>
              {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
            </button>
        </div>
      </div>
    </div>
  );
}
