"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LivePlayerProps = {
  src: string;
};

export default function LivePlayer({ src }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<any | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Main effect for HLS setup and teardown
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: any; // Hls instance

    async function setupHls() {
      if (video?.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = src;
        setIsLoading(true);
        // Autoplay is handled by the video tag's autoPlay prop
      } else {
        // Use hls.js
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          hls = new Hls({
             fragLoadErrorMaxRetry: 5,
             manifestLoadErrorMaxRetry: 2,
          });
          hlsInstanceRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if(video.paused) {
                video.play().catch(() => {
                    // Autoplay with sound was likely blocked.
                    setIsPlaying(false);
                });
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.warn(`HLS fatal error: ${data.type}`, data.details);
            }
          });
        }
      }
    }

    setupHls();

    return () => {
      if (hls) {
        hls.destroy();
        hlsInstanceRef.current = null;
      }
    };
  }, [src]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current?.paused) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
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
        await document.exitFullscreen();
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
            screen.orientation.unlock();
        }
      }
    } catch (err) {
        console.error(`Fullscreen Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const handlePlayerClick = useCallback(() => {
    if(isPlaying) {
      setShowControls(s => !s);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  // Effect for event listeners on the video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const onFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);
  
  // Effect for auto-hiding controls
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (showControls && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);


  const VolumeIcon = isMuted ? VolumeX : Volume2;
  const showOverlay = !isPlaying && !isLoading;
  const showPlayerControls = showControls || !isPlaying;

  return (
    <div
      ref={playerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onClick={handlePlayerClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {if (isPlaying) setShowControls(false)}}
      onDoubleClick={handleFullScreenToggle}
    >
      <video ref={videoRef} className="max-h-full w-full object-contain" playsInline autoPlay muted={isMuted} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      <div className={cn(
          "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300",
          showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
          className="bg-black/50 text-white rounded-full p-4 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50"
          aria-label="Reproducir"
        >
          <Play className="h-10 w-10 fill-white pl-1" />
        </button>
      </div>
      
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4 transition-all duration-300",
          showPlayerControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 text-white">
          <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <Badge variant="destructive" className="font-semibold">EN VIVO</Badge>
          <div className="flex-1" />
          <button onClick={handleMuteToggle} className="hover:text-primary transition-colors p-1" aria-label={isMuted ? "Quitar silencio" : "Silenciar"}>
            <VolumeIcon size={28} />
          </button>
          <button onClick={handleFullScreenToggle} className="hover:text-primary transition-colors p-1" aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}>
            {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
}
