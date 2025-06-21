import { getChannels, getCategories } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";

export default async function Home() {
  // Fetch initial data on the server
  const channels = await getChannels();
  const categories = await getCategories();

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
                Explora Canales en Vivo
            </h1>
            <p className="mt-3 text-lg text-muted-foreground sm:mt-4 font-body">
                Tu alternativa moderna para el streaming de TV.
            </p>
        </div>
        <ChannelBrowser channels={channels} categories={categories} />
      </div>
    </main>
  );
}
