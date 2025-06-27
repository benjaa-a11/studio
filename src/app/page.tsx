import { getChannels, getAgendaMatches } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";
import AgendaHero from "@/components/agenda-hero";

export default async function Home() {
  const [channels, matches] = await Promise.all([
    getChannels(),
    getAgendaMatches(),
  ]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {matches.length > 0 && <AgendaHero matches={matches} />}
        <ChannelBrowser channels={channels} />
      </div>
    </>
  );
}
