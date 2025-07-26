
import type { Movie } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { cn } from "@/lib/utils";

type Top10MovieCardProps = {
  movie: Movie;
  rank: number;
};

// Custom SVG component for the rank number to achieve the specific style.
const RankNumber = ({ rank }: { rank: number }) => {
    const textPath = {
        '1': "M 10 7 L 10 93",
        '2': "M 10 15 A 35 35 0 0 1 75 15 L 75 40 L 10 93",
        '3': "M 10 20 A 25 25 0 1 1 50 45 A 25 25 0 0 1 10 70",
        '4': "M 65 7 L 10 50 L 80 50 M 65 7 L 65 93",
        '5': "M 80 7 L 10 7 L 10 45 A 35 35 0 0 0 80 70",
        '6': "M 60 93 A 40 40 0 1 1 50 15 L 10 50",
        '7': "M 10 7 L 90 7 L 25 93",
        '8': "M 45 50 A 25 25 0 1 1 45 0 A 25 25 0 1 1 45 50 M 45 50 A 25 25 0 1 0 45 95 A 25 25 0 1 0 45 50",
        '9': "M 40 7 A 40 40 0 1 1 50 85 L 90 50",
        '10': "M 10 7 L 10 93 M 40 50 A 40 40 0 1 1 40 45 A 40 40 0 1 1 40 50"
    }[String(rank)] || "";

    return (
        <svg
            viewBox={rank === 10 ? "0 0 125 100" : "0 0 90 100"}
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label={`Rank ${rank}`}
        >
            <path
                d={textPath}
                stroke="hsl(var(--card))"
                strokeWidth="12"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d={textPath}
                stroke="hsl(var(--card-foreground))"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
};


const Top10MovieCard = memo(function Top10MovieCard({ movie, rank }: Top10MovieCardProps) {
  const backdropImage = movie.backdropUrl || movie.posterUrl;

  return (
    <Link 
      href={`/pelicula/${movie.id}`} 
      className="group relative block w-64 h-36 shrink-0 overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      title={movie.title}
      style={{ animationDelay: `${rank * 50}ms` }}
    >
      <div className="absolute left-0 bottom-0 top-0 w-1/3 z-10">
        <div className="absolute -left-1 sm:-left-2 bottom-0 h-3/4 w-full">
            <RankNumber rank={rank} />
        </div>
      </div>
      
      <div className="absolute right-0 top-0 bottom-0 w-2/3 h-full">
        {backdropImage ? (
            <Image
                src={backdropImage}
                alt={`Fondo de ${movie.title}`}
                fill
                sizes="(max-width: 768px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="movie backdrop"
            />
        ) : (
            <div className="w-full h-full bg-muted" />
        )}
      </div>
       <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent" />
    </Link>
  );
});

export default Top10MovieCard;
