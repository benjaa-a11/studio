
"use client";

import type { Movie } from "@/types";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import MovieHeroCard from "./movie-hero-card";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function MovieHero({ movies }: { movies: Movie[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInteractingRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const animationFrameRef = useRef<number>();

    const processedMovies = useMemo(() => {
        if (movies.length <= 1) return movies;
        // Clone first and last items for infinite loop
        return [movies[movies.length - 1], ...movies, movies[0]];
    }, [movies]);

    const stopAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const startAutoScroll = useCallback(() => {
        stopAutoScroll();
        if (processedMovies.length <= 3) return; // No auto-scroll for 1 or fewer original items

        intervalRef.current = setInterval(() => {
            if (!isInteractingRef.current) {
                setCurrentIndex(prevIndex => prevIndex + 1);
            }
        }, 6000);
    }, [processedMovies.length, stopAutoScroll]);
    
    // Jump to the correct initial slide without animation
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && processedMovies.length > 1) {
            const initialOffset = scrollContainer.children[1] as HTMLElement;
            if (initialOffset) {
                scrollContainer.scrollTo({ left: initialOffset.offsetLeft, behavior: 'instant' });
            }
        }
    }, [processedMovies]);


    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isTransitioningRef.current || processedMovies.length <= 1) return;
        
        const targetIndex = currentIndex + 1; // +1 to account for the prepended clone
        const movieElement = scrollContainer.children[targetIndex] as HTMLElement;

        if (movieElement) {
            scrollContainer.scrollTo({
                left: movieElement.offsetLeft,
                behavior: 'smooth'
            });
        }
        
    }, [currentIndex, processedMovies.length]);


    const handleManualScroll = useCallback(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isTransitioningRef.current) return;
        
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = requestAnimationFrame(() => {
            const { scrollLeft, children } = scrollContainer;
            const itemWidth = (scrollContainer.children[1] as HTMLElement).offsetWidth;
            if (itemWidth <= 0) return;
            
            const newRealIndex = Math.round(scrollLeft / itemWidth) - 1;

            if (newRealIndex !== currentIndex) {
                 setCurrentIndex(newRealIndex);
            }
        });
    }, [currentIndex]);
    
    const handleTransitionEnd = useCallback(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        isTransitioningRef.current = true;
        let jumped = false;
        
        // Loop to the beginning
        if (currentIndex === movies.length) {
            const targetElement = scrollContainer.children[1] as HTMLElement;
            scrollContainer.scrollTo({ left: targetElement.offsetLeft, behavior: 'instant' });
            setCurrentIndex(0);
            jumped = true;
        } 
        // Loop to the end
        else if (currentIndex === -1) {
            const targetElement = scrollContainer.children[movies.length] as HTMLElement;
            scrollContainer.scrollTo({ left: targetElement.offsetLeft, behavior: 'instant' });
            setCurrentIndex(movies.length - 1);
            jumped = true;
        }

        // Delay re-enabling transitions and starting autoscroll to ensure instant scroll is complete
        setTimeout(() => {
            isTransitioningRef.current = false;
            if (jumped && !isInteractingRef.current) {
                startAutoScroll();
            }
        }, 50);

    }, [currentIndex, movies.length, startAutoScroll]);


    useEffect(() => {
        startAutoScroll();
        const container = scrollRef.current;

        const onInteractionStart = () => {
            isInteractingRef.current = true;
            stopAutoScroll();
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
        container?.addEventListener('scrollend', handleTransitionEnd, { passive: true });


        return () => {
            stopAutoScroll();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            container?.removeEventListener('touchstart', onInteractionStart);
            container?.removeEventListener('touchend', onInteractionEnd);
            container?.removeEventListener('mousedown', onInteractionStart);
            container?.removeEventListener('mouseup', onInteractionEnd);
            container?.removeEventListener('scroll', handleManualScroll);
            container?.removeEventListener('scrollend', handleTransitionEnd);
        };
    }, [startAutoScroll, stopAutoScroll, handleManualScroll, handleTransitionEnd]);


    if (!movies || movies.length === 0) {
        return null;
    }

    const originalMovieCount = movies.length;

    return (
        <div className="w-full aspect-video md:aspect-[2.4/1] relative overflow-hidden bg-black">
             <div 
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                {processedMovies.map((movie, index) => (
                    <Link 
                        key={`${movie.id}-${index}`} 
                        href={`/pelicula/${movie.id}`}
                        className="w-full h-full flex-shrink-0 snap-center block transition-transform duration-200 active:scale-[0.98] outline-none"
                        aria-label={`Ver ${movie.title}`}
                        draggable={false}
                    >
                        <MovieHeroCard movie={movie} isActive={currentIndex === (index - 1)} />
                    </Link>
                ))}
            </div>

            {originalMovieCount > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {movies.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
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
