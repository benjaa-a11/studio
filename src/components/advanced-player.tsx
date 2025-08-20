
"use client";

import { useEffect, useRef } from 'react';
import type { StreamSource } from '@/types';

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

  useEffect(() => {
    const jwPlayerKey = process.env.NEXT_PUBLIC_JWPLAYER_KEY;
    if (!jwPlayerKey) {
        console.error("La clave de JW Player no está configurada.");
        return;
    }

    let jwPlayerInstance: any = null;

    const setupPlayer = () => {
      if (typeof window.jwplayer === 'undefined' || !playerRef.current) {
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
        };
        
        const playlistItem: any = {
          sources: [{ file: source.url }],
        };

        if ('k1' in source && 'k2' in source && source.k1 && source.k2) {
          playlistItem.sources[0].drm = {
            "clearkey": {
              keyId: source.k1,
              key: source.k2
            }
          };
        }
        
        playerConfig.playlist = [playlistItem];

        jwPlayerInstance = window.jwplayer(playerRef.current.id).setup(playerConfig);

      } catch (e) {
        console.error("Error setting up JW Player:", e);
      }
    };

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
        console.error("No se pudo cargar el script de JW Player.");
      };
      document.body.appendChild(script);
      
      return () => {
         document.body.removeChild(script);
      }
    }

    return () => {
      if (jwPlayerInstance) {
        jwPlayerInstance.remove();
      }
    };
  }, [source]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center text-white">
      <div id={`jwplayer-container-${source.url}`} ref={playerRef} className="w-full h-full" />
    </div>
  );
};

export default AdvancedPlayer;
