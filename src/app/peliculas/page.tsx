
import { getMovies } from "@/lib/actions";
import MovieBrowser from "@/components/movie-browser";

export const dynamic = 'force-dynamic'; // Ensures the page is always rendered dynamically

export default async function MoviesPage() {
  const movies = await getMovies(true); // Include placeholders in case db is empty

  return (
    <MovieBrowser movies={movies} />
  );
}
