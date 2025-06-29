"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type LivePlayerProps = {
  src: string;
};

export default function LivePlayer({ src }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<import("hls.js").default | null>(null);

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

    // Reset states for new source
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);

    // Cleanup previous HLS instance if it exists
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
    }

    const initializePlayer = async () => {
      try {
        const Hls = (await import('hls.js')).default;
        
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsInstanceRef.current = hls;
          
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {
              // Autoplay was prevented, user will need to click play.
              setIsPlaying(false);
              setIsLoading(false);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.warn(`HLS fatal error: ${data.type}`, data);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setError('No se pudo cargar la transmisión. Es posible que no esté disponible o sea incompatible.');
                  setIsLoading(false);
                  break;
                default:
                  // For other fatal errors, we can also show a generic message
                  setError('Ocurrió un error inesperado al reproducir el video.');
                  setIsLoading(false);
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          // Native HLS support on Safari/iOS devices
           video.play().catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
           });
        } else {
          setError('Este formato de video no es compatible con su navegador.');
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Failed to load or initialize hls.js:", e);
        setError("No se pudo cargar el reproductor para este formato.");
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
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
      console.warn("Video play/pause failed:", err);
      // If play fails, ensure state is correct
      setIsPlaying(false);
    }
  }, [error]);

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
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
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
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  const handlePlayerClick = useCallback(() => {
    setShowControls(s => !s);
  }, []);
  
  const handleCenterPlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handlePlayPause();
  }, [handlePlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    const playerEl = playerRef.current;
    if (!video || !playerEl) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted || video.volume === 0);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null); // Critical: Clear any previous non-fatal errors on successful playback
      resetControlsTimeout();
    };
    const onCanPlay = () => setIsLoading(false);
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if ([' ', 'k', 'f', 'm'].includes(key)) {
        e.preventDefault();
        resetControlsTimeout();
        if (key === ' ' || key === 'k') handlePlayPause();
        if (key === 'f') handleFullScreenToggle();
        if (key === 'm') handleMuteToggle();
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    document.addEventListener("fullscreenchange", onFullScreenChange);
    playerEl.addEventListener("keydown", onKeyDown);
    playerEl.addEventListener('mousemove', resetControlsTimeout);
    playerEl.addEventListener('mouseleave', hideControls);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      playerEl.removeEventListener("keydown", onKeyDown);
      playerEl.removeEventListener('mousemove', resetControlsTimeout);
      playerEl.removeEventListener('mouseleave', hideControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout, handlePlayPause, handleFullScreenToggle, handleMuteToggle, hideControls]);

  const VolumeIcon = isMuted ? VolumeX : Volume2;

  return (
    <div
      ref={playerRef}
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onClick={handlePlayerClick}
      onDoubleClick={handleFullScreenToggle}
    >
      <video ref={videoRef} className="max-h-full w-full object-contain" playsInline autoPlay muted />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-4 text-center">
          <VideoOff className="w-12 h-12 mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-1">Error de reproducción</h3>
          <p className="text-sm text-white/80 max-w-xs">{error}</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300">
          <button
            onClick={handleCenterPlayClick}
            className="bg-black/50 text-white rounded-full p-4 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50"
            aria-label="Reproducir"
          >
            <Play className="h-10 w-10 fill-white pl-1" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-300 ease-in-out",
          (showControls && isPlaying) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none",
          error && "hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 text-white">
          <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <Badge variant="destructive" className="animate-pulse font-semibold">EN VIVO</Badge>
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
