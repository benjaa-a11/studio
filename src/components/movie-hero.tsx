
"use client";

import type { Movie } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import MovieHeroCard from "./movie-hero-card";
import { cn } from "@/lib/utils";

export default function MovieHero({ movies }: { movies: Movie[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const goToIndex = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

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
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-muted">
            {movies.map((movie, index) => (
                <div
                    key={movie.id}
                    className="absolute inset-0 w-full h-full transition-opacity duration-1000"
                    style={{ opacity: index === currentIndex ? 1 : 0, zIndex: index === currentIndex ? 1 : 0 }}
                >
                    <MovieHeroCard movie={movie} isActive={index === currentIndex} />
                </div>
            ))}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {movies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            goToIndex(index);
                            resetInterval();
                        }}
                        className={cn(
                            "h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-white/50 transition-all duration-300",
                            currentIndex === index && "bg-white scale-125"
                        )}
                        aria-label={`Ir a la película ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
