
"use client";

import { useMemo, useEffect } from "react";
import type { Movie } from "@/types";
import { Clapperboard } from "lucide-react";
import { useMovieFilters } from "@/hooks/use-movie-filters";
import MovieShelf from "./movie-shelf";

type MovieBrowserProps = {
  movies: Movie[];
};

type MoviesByCategory = {
  [category: string]: Movie[];
};

export default function MovieBrowser({
  movies,
}: MovieBrowserProps) {
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useMovieFilters();

  // Reset the filters every time the user navigates to this page.
  useEffect(() => {
    setSelectedCategory('Todos');
    setSearchTerm('');
  }, [setSelectedCategory, setSearchTerm]);

  const moviesByCategory = useMemo(() => {
    const filtered = movies.filter((movie) => 
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'Todos') {
        return {
            [selectedCategory]: filtered.filter(movie => movie.category?.includes(selectedCategory))
        };
    }
    
    return filtered.reduce<MoviesByCategory>((acc, movie) => {
        if (movie.category && movie.category.length > 0) {
            movie.category.forEach(cat => {
                if (!acc[cat]) {
                    acc[cat] = [];
                }
                acc[cat].push(movie);
            });
        }
        return acc;
    }, {});
  }, [movies, searchTerm, selectedCategory]);
  
  const categories = useMemo(() => Object.keys(moviesByCategory).sort(), [moviesByCategory]);

  return (
    <div className="space-y-8">
      {categories.length > 0 ? (
        <div className="space-y-10">
          {categories.map((category, index) => (
            <MovieShelf 
              key={category}
              title={category}
              movies={moviesByCategory[category]}
              animationDelay={index * 100}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Clapperboard className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            No se encontraron películas
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Prueba a cambiar la categoría o utiliza un término de búsqueda diferente.
          </p>
        </div>
      )}
    </div>
  );
}
