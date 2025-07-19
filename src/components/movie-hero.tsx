
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
    const animationFrameRef = useRef<number>();

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (movies.length <= 1) return;
        
        intervalRef.current = setInterval(() => {
            if (!isInteractingRef.current) {
                setCurrentIndex(prevIndex => (prevIndex + 1) % movies.length);
            }
        }, 6000);
    }, [movies.length]);

    const scrollToMovie = useCallback((index: number) => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && scrollContainer.children[index]) {
            const movieElement = scrollContainer.children[index] as HTMLElement;
            scrollContainer.scrollTo({
                left: movieElement.offsetLeft,
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        scrollToMovie(currentIndex);
    }, [currentIndex, scrollToMovie]);

    const handleManualScroll = useCallback(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || !isInteractingRef.current) return;
        
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = requestAnimationFrame(() => {
            const { scrollLeft, scrollWidth, children } = scrollContainer;
            if (scrollWidth <= 0 || children.length === 0) return;
            const itemWidth = scrollWidth / movies.length;
            const newIndex = Math.round(scrollLeft / itemWidth);
            
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        });
    }, [currentIndex, movies.length]);
    
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
        container?.addEventListener('scroll', handleManualScroll, { passive: true });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            container?.removeEventListener('touchstart', onInteractionStart);
            container?.removeEventListener('touchend', onInteractionEnd);
            container?.removeEventListener('mousedown', onInteractionStart);
            container?.removeEventListener('mouseup', onInteractionEnd);
            container?.removeEventListener('scroll', handleManualScroll);
        };
    }, [startAutoScroll, handleManualScroll]);


    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-black">
             <div 
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                {movies.map((movie, index) => (
                    <div key={movie.id} className="w-full h-full flex-shrink-0 snap-center">
                        <MovieHeroCard movie={movie} isActive={index === currentIndex} />
                    </div>
                ))}
            </div>

            {movies.length > 1 && (
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
            )}
        </div>
    );
}
