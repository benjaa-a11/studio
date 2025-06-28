"use client";

import type { Movie } from "@/types";
import MovieCard from "./movie-card";
import { Clapperboard } from "lucide-react";

type MovieBrowserProps = {
  movies: Movie[];
};

export default function MovieBrowser({
  movies,
}: MovieBrowserProps) {

  return (
    <div className="space-y-8">
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Clapperboard className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron películas
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Vuelve más tarde para ver el contenido disponible en esta sección.
          </p>
        </div>
      )}
    </div>
  );
}
