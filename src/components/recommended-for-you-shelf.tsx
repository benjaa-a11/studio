"use client";

import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { useMovieHistory } from '@/hooks/use-movie-history';
import { getRecommendedMovies } from '@/lib/actions';
import MovieShelf from './movie-shelf';
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

export default function RecommendedForYouShelf() {
    const { history, isLoaded } = useMovieHistory();
    const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        
        getRecommendedMovies(history).then(movies => {
            setRecommendedMovies(movies);
            setIsLoading(false);
        });
    }, [isLoaded, history]);

    if (!isLoaded || isLoading) {
        return <ShelfSkeleton />;
    }
    
    if (recommendedMovies.length === 0) {
        return null;
    }

    return (
        <MovieShelf
            title="Recomendado para ti"
            movies={recommendedMovies}
            animationDelay={100}
        />
    );
}
