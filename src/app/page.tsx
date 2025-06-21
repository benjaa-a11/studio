import { getChannels, getCategories } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";

export default async function Home() {
  const channels = await getChannels();
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ChannelBrowser channels={channels} categories={categories} />
    </div>
  );
}
