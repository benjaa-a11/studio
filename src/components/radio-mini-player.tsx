
"use client";

import { useRadioPlayer } from "@/hooks/use-radio-player";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, X, SkipForward, Music4, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function RadioMiniPlayer() {
  const { 
    currentRadio, 
    isPlaying, 
    isLoading, 
    togglePlayPause, 
    closePlayer, 
    next 
  } = useRadioPlayer();

  if (!currentRadio) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] md:left-auto md:bottom-4 md:right-4 md:w-80 md:rounded-lg overflow-hidden shadow-2xl animate-fade-in-up md:bottom-[calc(env(safe-area-inset-bottom)+1rem)]">
      <Link href={`/radio/${currentRadio.id}`} className="block w-full">
        <div className="flex h-16 items-center gap-3 bg-background/80 p-2 pr-4 backdrop-blur-md border-t md:border">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {currentRadio.logoUrl ? (
              <Image 
                src={currentRadio.logoUrl} 
                alt={`Logo de ${currentRadio.name}`} 
                fill 
                className="object-cover" 
                sizes="48px"
                unoptimized
              />
            ) : <Music4 className="w-6 h-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-foreground">{currentRadio.name}</p>
            <p className="truncate text-sm text-muted-foreground">{currentRadio.emisora}</p>
          </div>
        </div>
      </Link>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
          {isLoading ? <Loader2 className="animate-spin" /> : (isPlaying ? <Pause /> : <Play />)}
        </Button>
         <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 hidden md:inline-flex" onClick={(e) => { e.stopPropagation(); next(); }}>
          <SkipForward />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={(e) => { e.stopPropagation(); closePlayer(); }}>
          <X />
        </Button>
      </div>
    </div>
  );
}
