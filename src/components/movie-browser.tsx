
"use client";

import { useMemo, useEffect } from "react";
import type { Movie } from "@/types";
import { useMovieFilters } from "@/hooks/use-movie-filters";
import MovieShelf from "./movie-shelf";
import MovieHero from "./movie-hero";

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

  const { featured, recent, popular, byCategory } = useMemo(() => {
    const filtered = movies.filter((movie) => 
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    const recentMovies = filtered
      .filter(m => m.isRecent)
      .sort((a, b) => (b.year || 0) - (a.year || 0));

    const popularMovies = filtered
      .filter(m => m.isPopular)
      .sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));

    const featuredMovies = [...popularMovies, ...recentMovies].slice(0, 5);
    
    let categories: MoviesByCategory = {};
    if (selectedCategory !== 'Todos') {
        categories = {
            [selectedCategory]: filtered.filter(movie => movie.category?.includes(selectedCategory))
        };
    } else {
        categories = filtered.reduce<MoviesByCategory>((acc, movie) => {
            if (movie.category && movie.category.length > 0) {
                movie.category.forEach(cat => {
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(movie);
                });
            }
            return acc;
        }, {});
    }

    return { 
      featured: featuredMovies,
      recent: recentMovies,
      popular: popularMovies,
      byCategory: categories 
    };
  }, [movies, searchTerm, selectedCategory]);
  
  const categories = useMemo(() => Object.keys(byCategory).sort(), [byCategory]);

  return (
    <div className="w-full">
        {featured.length > 0 && selectedCategory === 'Todos' && searchTerm === '' && (
            <MovieHero movies={featured} />
        )}
        
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
            {recent.length > 0 && selectedCategory === 'Todos' && searchTerm === '' && (
                <MovieShelf
                    title="Agregadas Recientemente"
                    movies={recent}
                    animationDelay={100}
                />
            )}

            {popular.length > 0 && selectedCategory === 'Todos' && searchTerm === '' && (
                <MovieShelf
                    title="Tendencias Ahora"
                    movies={popular}
                    animationDelay={200}
                />
            )}

            {categories.map((category, index) => (
                <MovieShelf 
                    key={category}
                    title={category}
                    movies={byCategory[category]}
                    animationDelay={(searchTerm || selectedCategory !== 'Todos' ? index : index + 2) * 100}
                />
            ))}
        </div>
    </div>
  );
}
