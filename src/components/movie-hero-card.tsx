
"use client";

import type { Movie } from "@/types";
import Image from "next/image";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MovieHeroCardProps = {
    movie: Movie;
    isActive: boolean;
};

export default function MovieHeroCard({ movie, isActive }: MovieHeroCardProps) {
    return (
        <div className="relative w-full h-full">
            {movie.backdropUrl && (
                <Image 
                    src={movie.backdropUrl}
                    alt={`Fondo de ${movie.title}`}
                    fill
                    sizes="100vw"
                    className="object-cover transition-opacity duration-1000"
                    priority
                    unoptimized
                    style={{ opacity: isActive ? 1 : 0 }}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className={cn(
                "absolute bottom-8 left-4 md:bottom-16 md:left-16 right-4 space-y-2 md:space-y-4 transition-all duration-700 delay-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                <h2 
                    className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white"
                    style={{ textShadow: '2px 4px 6px rgba(0,0,0,0.8)' }}
                >
                    {movie.title}
                </h2>
                <p 
                    className="max-w-xl text-white/90 text-sm md:text-lg line-clamp-3"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                >
                    {movie.synopsis}
                </p>
                <Button asChild size="lg" className="shadow-2xl shadow-primary/30 mt-2">
                    <Link href={`/pelicula/${movie.id}`}>
                        <Play className="mr-2 fill-current" />
                        Ver Ahora
                    </Link>
                </Button>
            </div>
        </div>
    )
}
