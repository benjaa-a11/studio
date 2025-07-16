import { getChannels, getAgendaMatches, getMovies } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";
import MatchesHero from "@/components/matches-hero";
import MovieBrowser from "@/components/movie-browser";

export const dynamic = 'force-dynamic'; // Force dynamic rendering and no caching

export default async function Home() {
  const [channels, matches, movies] = await Promise.all([
    getChannels(),
    getAgendaMatches(),
    getMovies(true),
  ]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        <MatchesHero matches={matches} />
        <MovieBrowser movies={movies} isHomePage={true} />
        <ChannelBrowser channels={channels} />
      </div>
    </>
  );
}
