import { getChannels } from "@/lib/actions";
import FavoriteChannelGrid from "@/components/favorite-channel-grid";

export default async function FavoritesPage() {
  const allChannels = await getChannels();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <FavoriteChannelGrid channels={allChannels} />
    </div>
  );
}
