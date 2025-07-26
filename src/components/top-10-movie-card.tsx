
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
    return (
        <svg
            viewBox="0 0 200 280"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-foreground drop-shadow-lg"
            aria-label={`Rank ${rank}`}
        >
            <defs>
                <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@900&display=swap');
                        .rank-text {
                            font-family: 'Poppins', sans-serif;
                            font-weight: 900;
                            font-size: 280px;
                        }
                    `}
                </style>
            </defs>
            {/* Stroke for border effect */}
            <text
                x="100"
                y="225"
                textAnchor="middle"
                className="rank-text"
                stroke="hsl(var(--card))"
                strokeWidth="24"
                strokeLinejoin="round"
                fill="none"
            >
                {rank}
            </text>
            {/* Main text fill */}
            <text
                x="100"
                y="225"
                textAnchor="middle"
                className="rank-text"
                fill="hsl(var(--card-foreground))"
            >
                {rank}
            </text>
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
        <div className="absolute left-0 bottom-0 top-0 w-1/2 flex items-center z-10">
            <div className="absolute -left-12 -bottom-2 h-full w-[170px]">
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
        <div className="absolute inset-0 bg-gradient-to-r from-card from-[30%] via-card/50 via-[50%] to-transparent" />
    </Link>
  );
});

export default Top10MovieCard;
