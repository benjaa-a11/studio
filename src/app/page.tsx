import { getChannels, getCategories } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";

export default async function Home() {
  // Fetch initial data on the server
  const channels = await getChannels();
  const categories = await getCategories();

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ChannelBrowser channels={channels} categories={categories} />
      </div>
    </main>
  );
}
