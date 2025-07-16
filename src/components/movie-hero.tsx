
"use client";

import type { Movie } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import MovieHeroCard from "./movie-hero-card";

export default function MovieHero({ movies }: { movies: Movie[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, 6000); // Change movie every 6 seconds
    }, [movies.length]);

    useEffect(() => {
        resetInterval();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [resetInterval]);

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-muted -mt-8">
            {movies.map((movie, index) => (
                <div
                    key={movie.id}
                    className="absolute inset-0 w-full h-full transition-opacity duration-1000"
                    style={{ opacity: index === currentIndex ? 1 : 0, zIndex: index === currentIndex ? 1 : 0 }}
                >
                    <MovieHeroCard movie={movie} isActive={index === currentIndex} />
                </div>
            ))}
        </div>
    );
}
