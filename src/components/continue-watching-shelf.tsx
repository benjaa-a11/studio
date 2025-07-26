"use client";

import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { useMovieHistory } from '@/hooks/use-movie-history';
import { getMoviesByIds } from '@/lib/actions';
import MovieCard from './movie-card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

function ShelfSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-36 shrink-0 space-y-2">
                        <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function ContinueWatchingShelf() {
    const { history, isLoaded } = useMovieHistory();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        const historyEntries = Object.entries(history)
            .sort(([, a], [, b]) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
            .filter(([, data]) => data.duration > 0 && data.progress / data.duration < 0.95); // Don't show finished movies
        
        const movieIds = historyEntries.map(([id]) => id);

        if (movieIds.length > 0) {
            getMoviesByIds(movieIds).then(fetchedMovies => {
                setMovies(fetchedMovies);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [history, isLoaded]);

    if (!isLoaded || isLoading) {
        return <ShelfSkeleton />;
    }

    if (movies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 opacity-0 animate-fade-in-up">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Continuar Viendo</h2>
            <div className="relative">
                <ScrollArea className="scrollbar-hide">
                    <div className="flex space-x-4 pb-4">
                        {movies.map((movie, index) => {
                             const progressData = history[movie.id];
                             const progressPercent = progressData ? (progressData.progress / progressData.duration) * 100 : 0;
                             return (
                                <div key={movie.id} className="w-36 shrink-0">
                                    <MovieCard movie={movie} index={index} progress={progressPercent} />
                                </div>
                            )
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
}
