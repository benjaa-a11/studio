
"use client";

import { useCallback, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Check, ThumbsUp, Share2, Play } from "lucide-react";

import type { Movie } from "@/types";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VideoPlayer from '@/components/video-player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimilarMoviesGrid from './similar-movies-grid';
import { useMovieFavorites } from '@/hooks/use-movie-favorites';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Image from 'next/image';

type MovieViewProps = {
  movie: Movie;
  similarMovies: Movie[];
};

const ActionButton = ({ icon, label, onClick, disabled = false }: { icon: React.ReactNode; label: string; onClick?: () => void, disabled?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" onClick={onClick} disabled={disabled} className="h-auto flex-col p-2 gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50">
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </Button>
    </div>
);

export default function MovieView({ movie, similarMovies }: MovieViewProps) {
  const { toast } = useToast();
  const { isFavorite, addFavorite, removeFavorite, isLoaded } = useMovieFavorites();
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<{ play: () => void }>(null);

  const isFav = isLoaded && isFavorite(movie.id);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie.id);
    }
  };
  
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.synopsis,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace a la película ha sido copiado al portapapeles.",
      });
    }
  }, [movie.title, movie.synopsis, toast]);

  const handleRate = () => {
     toast({
        title: "Función no disponible",
        description: "La calificación de películas aún no está implementada.",
      });
  }

  const handleWatchClick = async () => {
    setShowPlayer(true);
    // Request fullscreen and landscape orientation
    const playerElement = playerRef.current;
    if (playerElement) {
        try {
            await playerElement.requestFullscreen();
            if (screen.orientation && typeof screen.orientation.lock === 'function') {
                await screen.orientation.lock('landscape').catch(() => {});
            }
            if (videoPlayerRef.current) {
                videoPlayerRef.current.play();
            }
        } catch (err) {
            console.error("Error entering fullscreen:", err);
            // Fallback for browsers that fail, just show player
        }
    }
  }

  const backgroundImageUrl = movie.backdropUrl || movie.posterUrl;

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      <header className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top transition-opacity duration-300",
        showPlayer ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/peliculas" aria-label="Volver a películas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold truncate">{movie.title}</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-y-auto">
        <div className={cn("absolute inset-0 transition-opacity duration-500", showPlayer ? "opacity-100 z-20" : "opacity-0 z-0 pointer-events-none")}>
            {movie.streamUrl && movie.format === 'mp4' ? (
              <div ref={playerRef} className="w-full h-full">
                <VideoPlayer
                    ref={videoPlayerRef}
                    movieId={movie.id}
                    src={movie.streamUrl}
                    posterUrl={movie.posterUrl}
                    backdropUrl={movie.backdropUrl}
                    autoPlay={false} // Autoplay is handled by the fullscreen promise
                />
              </div>
            ) : movie.streamUrl && movie.format === 'iframe' ? (
                <iframe
                    key={movie.id}
                    src={movie.streamUrl}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                    title={`Reproductor de ${movie.title}`}
                ></iframe>
            ) : null }
        </div>

        <main className={cn(showPlayer ? "opacity-0" : "opacity-100")}>
            <div className="aspect-video relative w-full overflow-hidden bg-black shadow-lg shadow-primary/10">
              {movie.trailerUrl ? (
                <iframe
                    key={movie.id + "-trailer"}
                    src={`${movie.trailerUrl}?autoplay=1&mute=1&loop=1&playlist=${movie.trailerUrl.split('/').pop()}&controls=0&iv_load_policy=3&modestbranding=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0 scale-125"
                    title={`Tráiler de ${movie.title}`}
                ></iframe>
              ) : backgroundImageUrl ? (
                <Image
                    src={backgroundImageUrl}
                    alt={`Fondo para ${movie.title}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-muted p-8 text-center">
                    <h3 className="text-xl font-bold">Contenido no disponible</h3>
                </div>
              )}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
              
            <div className="container mx-auto p-4 md:p-6 space-y-6 -mt-16 relative z-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">{movie.title}</h1>
                 
                <div className="flex items-center gap-4 text-muted-foreground text-sm flex-wrap">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.duration && movie.duration !== "N/A" && <span>{movie.duration}</span>}
                  {movie.rating && <Badge variant="outline" className="border-primary/50 text-base">{movie.rating} ★</Badge>}
                </div>

                <div className="space-y-3">
                    <Button className="w-full h-12 text-lg" onClick={handleWatchClick}>
                        <Play className="mr-2 h-6 w-6 fill-current" />
                        Ver
                    </Button>
                    <Button className="w-full h-12 text-lg" variant="secondary" disabled>
                        Descargar
                    </Button>
                </div>
                 
                <p className="text-foreground/80 leading-relaxed text-base max-w-3xl">{movie.synopsis}</p>
                 
                <div className="flex items-start justify-center gap-8 text-center pt-3 w-full max-w-sm mx-auto">
                    <ActionButton 
                        icon={isFav ? <Check className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6" />}
                        label={isFav ? "En mi lista" : "Mi Lista"} 
                        onClick={handleToggleFavorite}
                        disabled={!isLoaded}
                    />
                    <ActionButton 
                        icon={<ThumbsUp className="h-6 w-6" />}
                        label="Calificar" 
                        onClick={handleRate}
                    />
                    <ActionButton 
                        icon={<Share2 className="h-6 w-6" />}
                        label="Compartir" 
                        onClick={handleShare}
                    />
                </div>
                 
                <div className="mt-4">
                  <Tabs defaultValue="similar">
                    <TabsList>
                      <TabsTrigger value="similar">Más títulos similares</TabsTrigger>
                      <TabsTrigger value="trailers" disabled>Tráileres y más</TabsTrigger>
                    </TabsList>
                    <TabsContent value="similar" className="mt-4">
                       {similarMovies.length > 0 ? (
                          <SimilarMoviesGrid movies={similarMovies} />
                       ) : (
                          <p className="text-muted-foreground text-sm p-4 text-center">No se encontraron películas similares.</p>
                       )}
                    </TabsContent>
                  </Tabs>
                </div>
            </div>
         </main>
       </div>
    </div>
  );
}
