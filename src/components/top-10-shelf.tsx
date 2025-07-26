
"use client";

import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { getTop10Movies } from '@/lib/actions';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import Top10MovieCard from './top-10-movie-card';

function ShelfSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <div className="flex space-x-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-64 shrink-0 space-y-2">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Top10Shelf() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getTop10Movies().then(fetchedMovies => {
            setMovies(fetchedMovies);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <ShelfSkeleton />;
    }

    if (movies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Top 10 en Argentina</h2>
            <div className="relative">
                <ScrollArea className="scrollbar-hide">
                    <div className="flex space-x-4 pb-4">
                        {movies.map((movie, index) => (
                             <Top10MovieCard key={movie.id} movie={movie} rank={index + 1} />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
}
