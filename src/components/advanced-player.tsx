
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { StreamSource } from '@/types';
import { Loader2, AlertCircle, Maximize, Minimize } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AdvancedPlayerProps {
  source: Extract<StreamSource, object>;
}

declare global {
  interface Window {
    jwplayer: any;
  }
}

const AdvancedPlayer = ({ source }: AdvancedPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const jwPlayerInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenToggle = useCallback(() => {
    const playerElement = playerRef.current;
    if (!playerElement) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err.message, err.name);
      });
    }
  }, []);

  const setupPlayer = useCallback(() => {
    if (typeof window.jwplayer === 'undefined') {
      console.error("JW Player script not loaded yet.");
      setError("Error al cargar el reproductor.");
      setIsLoading(false);
      return;
    }

    if (!playerRef.current) {
      console.error("Player container not available.");
      return;
    }

    try {
      const playerConfig: any = {
        width: "100%",
        height: "100%",
        autostart: true,
        mute: false,
        stretching: "uniform",
        preload: "auto",
        liveSyncDuration: 3,
        primary: 'html5',
      };
      
      const playlistItem: any = {
        sources: [{ file: source.url }],
      };

      if (source.k1 && source.k2) {
        playlistItem.sources[0].drm = {
          "clearkey": {
            keyId: source.k1,
            key: source.k2
          }
        };
      }
      
      playerConfig.playlist = [playlistItem];

      jwPlayerInstance.current = window.jwplayer(playerRef.current.id).setup(playerConfig);

      jwPlayerInstance.current.on('ready', () => {
        setIsLoading(false);
      });
      jwPlayerInstance.current.on('error', (e: any) => {
        console.error("JW Player Error:", e);
        setError("No se pudo cargar la transmisión.");
        setIsLoading(false);
      });
       jwPlayerInstance.current.on('buffer', () => setIsLoading(true));
      jwPlayerInstance.current.on('play', () => setIsLoading(false));
      jwPlayerInstance.current.on('pause', () => setIsLoading(false));

    } catch (e) {
      console.error("Error setting up JW Player:", e);
      setError("Error al inicializar el reproductor.");
      setIsLoading(false);
    }
  }, [source]);

  useEffect(() => {
    const jwPlayerKey = process.env.NEXT_PUBLIC_JWPLAYER_KEY;
    if (!jwPlayerKey) {
        setError("La clave de JW Player no está configurada.");
        setIsLoading(false);
        return;
    }

    if (window.jwplayer) {
      window.jwplayer.key = jwPlayerKey;
      setupPlayer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://ssl.p.jwpcdn.com/player/v/8.26.0/jwplayer.js';
      script.async = true;
      script.onload = () => {
        window.jwplayer.key = jwPlayerKey;
        setupPlayer();
      };
      script.onerror = () => {
        setError("No se pudo cargar el script de JW Player.");
        setIsLoading(false);
      };
      document.body.appendChild(script);
      
      return () => {
         document.body.removeChild(script);
      }
    }
  }, [setupPlayer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (jwPlayerInstance.current) {
        jwPlayerInstance.current.remove();
        jwPlayerInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center text-white">
      <div id={`jwplayer-container-${source.url}`} ref={playerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="mt-4 text-lg font-semibold">Cargando transmisión...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-4 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold">{error}</h3>
          <p className="text-muted-foreground mt-2">Intente con otra fuente o canal.</p>
        </div>
      )}

      <div className={cn(
          "absolute inset-x-0 bottom-0 z-30 p-2 sm:p-4 transition-opacity duration-300",
          isLoading || error ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={handleFullScreenToggle} className="text-white hover:text-primary hover:bg-white/10">
                {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPlayer;
