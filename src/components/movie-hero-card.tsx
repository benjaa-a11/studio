
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
            {/* Background Poster */}
            <Image 
                src={movie.backdropUrl || movie.posterUrl}
                alt={`Fondo para ${movie.title}`}
                fill
                sizes="100vw"
                className="object-cover transition-opacity duration-1000"
                priority
                unoptimized
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent md:bg-gradient-to-r md:from-background/70 md:via-background/30 md:to-transparent" />
            
            {/* Content */}
            <div className={cn(
                "absolute inset-0 flex flex-col justify-end text-center md:text-right transition-all duration-700 ease-in-out p-6 md:p-16 items-center md:items-end",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                 <div className="w-40 h-20 md:w-52 md:h-24 relative mb-4">
                     {movie.logoUrl ? (
                         <Image
                            src={movie.logoUrl}
                            alt={`Logo de ${movie.title}`}
                            fill
                            sizes="(max-width: 768px) 160px, 208px"
                            className="object-contain drop-shadow-2xl"
                            unoptimized
                         />
                     ) : (
                        <h2 
                            className="text-3xl md:text-4xl font-black tracking-tighter"
                            style={{ textShadow: '2px 4px 6px rgba(0,0,0,0.8)' }}
                        >
                            {movie.title}
                        </h2>
                     )}
                 </div>

                <p className="hidden md:block max-w-md text-sm text-white/90 mb-6 drop-shadow-lg" style={{ textShadow: '1px 2px 3px rgba(0,0,0,0.8)' }}>
                    {movie.synopsis.length > 150 ? `${movie.synopsis.substring(0, 150)}…` : movie.synopsis}
                </p>
                
                <Button asChild size="lg" className="shadow-2xl bg-white/90 text-black font-bold hover:bg-white backdrop-blur-sm">
                    <Link href={`/pelicula/${movie.id}`}>
                        <Play className="mr-2 fill-current" />
                        Ver Ahora
                    </Link>
                </Button>
            </div>
        </div>
    )
}
