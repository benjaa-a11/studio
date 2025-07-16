
"use client";

import type { Movie } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import MovieHeroCard from "./movie-hero-card";
import { cn } from "@/lib/utils";

export default function MovieHero({ movies }: { movies: Movie[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInteractingRef = useRef(false);

    const scrollToMovie = useCallback((index: number) => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            const movieElement = scrollContainer.children[index] as HTMLElement;
            if (movieElement) {
                const scrollLeft = movieElement.offsetLeft - (scrollContainer.offsetWidth - movieElement.offsetWidth) / 2;
                scrollContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, []);

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!isInteractingRef.current) {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % movies.length;
                    scrollToMovie(nextIndex);
                    return nextIndex;
                });
            }
        }, 6000); // Change movie every 6 seconds
    }, [movies.length, scrollToMovie]);

    useEffect(() => {
        startAutoScroll();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startAutoScroll]);

    const handleManualScroll = () => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        isInteractingRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        const scrollLeft = scrollContainer.scrollLeft;
        const itemWidth = scrollContainer.scrollWidth / movies.length;
        const newIndex = Math.round(scrollLeft / itemWidth);
        
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
        
        // Restart auto-scroll after user stops interacting
        setTimeout(() => {
            isInteractingRef.current = false;
            startAutoScroll();
        }, 3000);
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-muted -mt-8">
            <div 
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                onScroll={handleManualScroll}
            >
                {movies.map((movie, index) => (
                    <div key={movie.id} className="w-full h-full flex-shrink-0 snap-center">
                        <MovieHeroCard movie={movie} isActive={index === currentIndex} />
                    </div>
                ))}
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {movies.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            scrollToMovie(index);
                        }}
                        className={cn(
                            "h-1.5 w-6 rounded-full transition-all duration-300",
                            index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                        )}
                        aria-label={`Go to movie ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
