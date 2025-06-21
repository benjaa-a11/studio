"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, SignalZero } from "lucide-react";

import type { Channel } from "@/types";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import ChannelCard from "@/components/channel-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

type ChannelViewProps = {
  channel: Channel;
  relatedChannels: Channel[];
};

export default function ChannelView({ channel, relatedChannels }: ChannelViewProps) {
  const { isFavorite, addFavorite, removeFavorite, isLoaded } = useFavorites();
  
  const isFav = isFavorite(channel.id);

  const handleFavoriteClick = () => {
    if (isFav) {
      removeFavorite(channel.id);
    } else {
      addFavorite(channel.id);
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/" aria-label="Volver a inicio">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
             <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                {channel.logoUrl ? (
                    <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill className="object-contain"/>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">{channel.name.charAt(0)}</div>
                )}
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">{channel.category}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isLoaded ? (
                 <Button
                    variant={isFav ? "default" : "outline"}
                    size="icon"
                    onClick={handleFavoriteClick}
                    aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                    className="transition-all duration-200"
                >
                    <Heart className={cn("h-5 w-5", isFav && "fill-current text-primary-foreground")} />
                </Button>
            ) : (
                <Skeleton className="h-10 w-10 rounded-md" />
            )}
        </div>
      </header>
       <div className="flex-1 overflow-y-auto">
         <div className="container mx-auto p-4 md:p-8">
            <main>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl shadow-primary/10">
                {channel.streamUrl ? (
                  <iframe
                    className="h-full w-full border-0"
                    src={channel.streamUrl}
                    title={channel.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-center">
                      <SignalZero className="h-20 w-20 text-primary/50 mb-6" />
                      <h2 className="text-2xl font-bold text-foreground">Señal no disponible temporalmente</h2>
                      <p className="mt-2 max-w-md text-muted-foreground">
                          Lo sentimos, parece que la transmisión de este canal está experimentando problemas técnicos. Nuestro equipo ya está al tanto y trabajando para solucionarlo. Por favor, intenta de nuevo más tarde.
                      </p>
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-lg bg-card p-6">
                <h1 className="text-3xl font-bold tracking-tight">{channel.name}</h1>
                <p className="mt-1 text-base text-primary">{channel.category}</p>
                <Separator className="my-4"/>
                <p className="text-muted-foreground">{channel.description}</p>
              </div>
            </main>

            {relatedChannels.length > 0 && (
               <aside className="mt-12">
                  <h2 className="text-2xl font-bold tracking-tight">Más en {channel.category}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {relatedChannels.map((c) => <ChannelCard key={c.id} channel={c} />)}
                  </div>
              </aside>
            )}
         </div>
       </div>
    </div>
  );
}
