
"use client";

import { useMemo, useEffect } from "react";
import type { Movie } from "@/types";
import { useMovieFilters } from "@/hooks/use-movie-filters";
import MovieShelf from "./movie-shelf";
import MovieHero from "./movie-hero";
import MovieHeader from "./movie-header"; // Import the new header

type MovieBrowserProps = {
  movies: Movie[];
  isHomePage?: boolean;
};

type MoviesByCategory = {
  [category: string]: Movie[];
};

export default function MovieBrowser({
  movies,
  isHomePage = false,
}: MovieBrowserProps) {
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useMovieFilters();

  // Reset the filters every time the user navigates to this page.
  useEffect(() => {
    if (!isHomePage) {
      setSelectedCategory('Todos');
      setSearchTerm('');
    }
  }, [setSelectedCategory, setSearchTerm, isHomePage]);

  const { heroMovies, trending, topRated, byCategory } = useMemo(() => {
    const filtered = isHomePage ? movies : movies.filter((movie) => 
        (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    const trendingMovies = filtered
      .filter(m => m.isTrending)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    const topRatedMovies = filtered
      .filter(m => m.isTopRated)
      .sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));

    const heroCandidates = [...trendingMovies, ...topRatedMovies];
    const heroMovies = [...new Map(heroCandidates.map(m => [m.id, m])).values()].slice(0, 5);
    
    let categories: MoviesByCategory = {};
    if (!isHomePage && selectedCategory !== 'Todos') {
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
      heroMovies,
      trending: trendingMovies,
      topRated: topRatedMovies,
      byCategory: categories 
    };
  }, [movies, searchTerm, selectedCategory, isHomePage]);
  
  const categories = useMemo(() => Object.keys(byCategory).sort(), [byCategory]);

  return (
    <div className="w-full relative">
        {!isHomePage && <MovieHeader />}
        
        {!isHomePage && heroMovies.length > 0 && selectedCategory === 'Todos' && searchTerm === '' && (
            <MovieHero movies={heroMovies} />
        )}
        
        <div className={!isHomePage ? "container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12" : "space-y-12"}>
            {trending.length > 0 && (selectedCategory === 'Todos' || isHomePage) && searchTerm === '' && (
                <MovieShelf
                    title="Tendencias Ahora"
                    movies={trending}
                    animationDelay={100}
                />
            )}

            {topRated.length > 0 && (selectedCategory === 'Todos' || isHomePage) && searchTerm === '' && (
                <MovieShelf
                    title="Recomendadas para ti"
                    movies={topRated}
                    animationDelay={200}
                />
            )}
            
            {!isHomePage && categories.map((category, index) => (
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
