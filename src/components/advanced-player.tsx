
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { StreamSource } from '@/types';
import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle } from "lucide-react";

interface AdvancedPlayerProps {
  source: Extract<StreamSource, object>;
}

declare global {
  interface Window {
    jwplayer: any;
  }
}

const AdvancedPlayer = ({ source }: AdvancedPlayerProps) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); // To hold the JW Player instance
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playerId = useMemo(() => `jwplayer-container-${Math.random().toString(36).substring(2)}`, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (playerRef.current) {
        playerRef.current.getState() === 'playing' ? playerRef.current.pause() : playerRef.current.play();
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (playerRef.current) {
        playerRef.current.setMute(!playerRef.current.getMute());
    }
  }, []);

  const handleFullScreenToggle = useCallback(() => {
    if (playerRef.current) {
        playerRef.current.setFullscreen(!playerRef.current.getFullscreen());
    }
  }, []);

  const handlePlayerClick = useCallback(() => {
    setShowControls(v => !v);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  useEffect(() => {
    const jwPlayerKey = process.env.NEXT_PUBLIC_JWPLAYER_KEY;
    if (!jwPlayerKey) {
        setError("La clave del reproductor no está configurada.");
        setIsLoading(false);
        return;
    }

    const setupPlayer = () => {
        if (!window.jwplayer || !playerContainerRef.current) return;

        try {
            const playerConfig = {
                key: jwPlayerKey,
                width: "100%",
                height: "100%",
                autostart: true,
                mute: false,
                stretching: "uniform",
                preload: "auto",
                controls: false, // Hide default controls
                playlist: [{
                    sources: [{ 
                        file: source.url,
                        drm: {
                            clearkey: {
                                keyId: source.k1,
                                key: source.k2
                            }
                        }
                    }]
                }]
            };

            const instance = window.jwplayer(playerId).setup(playerConfig);
            playerRef.current = instance;

            // Event Listeners
            instance.on('play', () => { setIsPlaying(true); setIsLoading(false); resetControlsTimeout(); });
            instance.on('pause', () => setIsPlaying(false));
            instance.on('fullscreen', (e: { fullscreen: boolean }) => setIsFullScreen(e.fullscreen));
            instance.on('mute', (e: { mute: boolean }) => setIsMuted(e.mute));
            instance.on('buffer', () => setIsLoading(true));
            instance.on('firstFrame', () => setIsLoading(false));
            instance.on('setupError', (e: any) => { console.error("JWPlayer Setup Error:", e); setError("Error al configurar el reproductor."); setIsLoading(false); });
            instance.on('error', (e: any) => { console.error("JWPlayer Playback Error:", e); setError("Error de reproducción."); setIsLoading(false); });

        } catch (e) {
            console.error("Error setting up JW Player:", e);
            setError("Error al inicializar el reproductor.");
            setIsLoading(false);
        }
    };

    if (window.jwplayer) {
      setupPlayer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://ssl.p.jwpcdn.com/player/v/8.26.0/jwplayer.js';
      script.async = true;
      script.onload = setupPlayer;
      script.onerror = () => {
        setError("No se pudo cargar el script del reproductor.");
        setIsLoading(false);
      };
      document.body.appendChild(script);
      
      return () => {
         try {
           if (document.body.contains(script)) {
              document.body.removeChild(script);
           }
         } catch (e) { console.warn("Could not remove JW Player script on cleanup.")}
      }
    }

    return () => {
      if (playerRef.current) {
        try {
            playerRef.current.remove();
        } catch (e) {
            console.warn("Could not remove JW Player instance on cleanup.")
        }
        playerRef.current = null;
      }
    };
  }, [source.url, source.k1, source.k2, playerId, resetControlsTimeout]);


  const areControlsVisible = showControls || !isPlaying || !!error;
  const VolumeIcon = isMuted ? VolumeX : Volume2;
  
  return (
    <div
      tabIndex={0}
      className="relative w-full h-full bg-black flex items-center justify-center group/player overflow-hidden outline-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onDoubleClick={handleFullScreenToggle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div id={playerId} ref={playerContainerRef} className="w-full h-full" onClick={handlePlayerClick} />
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 pointer-events-none text-white">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}

      {error && !isLoading && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-4 text-center pointer-events-none">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-white">Error de reproducción</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-4 transition-all duration-300",
          areControlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks on controls from bubbling up to the player
      >
        <div className="flex items-center gap-2 sm:gap-4 text-white">
          <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          
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
};

export default AdvancedPlayer;

    