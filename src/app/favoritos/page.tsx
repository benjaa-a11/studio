"use client";

import { useState, useEffect, useMemo } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { getChannels } from '@/lib/actions';
import type { Channel } from '@/types';
import ChannelCard from '@/components/channel-card';
import { HeartOff, Tv2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function FavoritesLoading() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-9 w-64 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <div className="px-1 space-y-2">
                           <Skeleton className="h-5 w-3/4 rounded-md" />
                           <Skeleton className="h-4 w-1/2 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChannels() {
      try {
        const channels = await getChannels();
        setAllChannels(channels);
      } catch (error) {
        console.error("Failed to fetch channels", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllChannels();
  }, []);

  const favoriteChannels = useMemo(() => {
    if (!isLoaded) return [];
    return allChannels.filter(channel => favorites.includes(channel.id));
  }, [allChannels, favorites, isLoaded]);

  if (isLoading || !isLoaded) {
      return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <FavoritesLoading />
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Tv2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Mis Canales Favoritos</h1>
      </div>

      {favoriteChannels.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {favoriteChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <HeartOff className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground">
            Aún no tienes favoritos
          </h3>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Haz clic en el corazón de un canal para agregarlo aquí.
          </p>
        </div>
      )}
    </div>
  );
}
