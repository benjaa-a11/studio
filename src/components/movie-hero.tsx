
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

    const scrollToMovie = useCallback((index: number, smooth = true) => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && scrollContainer.children[index]) {
            const movieElement = scrollContainer.children[index] as HTMLElement;
            scrollContainer.scrollTo({
                left: movieElement.offsetLeft,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }, []);

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!isInteractingRef.current) {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % movies.length;
                    return nextIndex;
                });
            }
        }, 6000); // Change movie every 6 seconds
    }, [movies.length]);

    useEffect(() => {
        scrollToMovie(currentIndex, true);
    }, [currentIndex, scrollToMovie]);

    useEffect(() => {
        startAutoScroll();
        const container = scrollRef.current;

        const onInteractionStart = () => {
            isInteractingRef.current = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };

        const onInteractionEnd = () => {
            isInteractingRef.current = false;
            startAutoScroll();
        };

        container?.addEventListener('touchstart', onInteractionStart, { passive: true });
        container?.addEventListener('touchend', onInteractionEnd, { passive: true });
        container?.addEventListener('mousedown', onInteractionStart, { passive: true });
        container?.addEventListener('mouseup', onInteractionEnd, { passive: true });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            container?.removeEventListener('touchstart', onInteractionStart);
            container?.removeEventListener('touchend', onInteractionEnd);
            container?.removeEventListener('mousedown', onInteractionStart);
            container?.removeEventListener('mouseup', onInteractionEnd);
        };
    }, [startAutoScroll]);

    const handleManualScroll = useCallback(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || !isInteractingRef.current) return;

        const { scrollLeft, scrollWidth, children } = scrollContainer;
        const itemWidth = scrollWidth / movies.length;
        const newIndex = Math.round(scrollLeft / itemWidth);
        
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, movies.length]);


    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-muted">
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
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "h-1.5 w-6 rounded-full transition-all duration-300",
                            index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                        )}
                        aria-label={`Ir a película ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
