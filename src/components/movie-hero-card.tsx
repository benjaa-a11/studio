
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
                src={movie.posterUrl}
                alt={`Póster de ${movie.title}`}
                fill
                sizes="100vw"
                className="object-cover transition-opacity duration-1000"
                priority
                unoptimized
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            {/* Content */}
            <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white transition-all duration-700 ease-in-out",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
                 <div className="w-40 h-20 relative mb-4">
                     {movie.logoUrl ? (
                         <Image
                            src={movie.logoUrl}
                            alt={`Logo de ${movie.title}`}
                            fill
                            sizes="160px"
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
