import { getChannels, getCategories } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";

export default async function Home() {
  const channels = await getChannels();
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
          Tu Universo de Televisión en Vivo
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:mt-5">
          Explora, descubre y disfruta de una selección de canales en directo. Sin complicaciones, solo streaming.
        </p>
      </section>
      <ChannelBrowser channels={channels} categories={categories} />
    </div>
  );
}
