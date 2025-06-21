import type { Channel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Clapperboard, PlayCircle } from "lucide-react";

type ChannelCardProps = {
  channel: Channel;
};

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/canal/${channel.id}`} className="group block space-y-3 outline-none" title={channel.name}>
      <div className="overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-primary/30 group-hover:shadow-2xl group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
        <div className="aspect-video w-full relative bg-card flex items-center justify-center">
          
          <div className="absolute inset-0 z-10 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-white/80 transform transition-transform duration-300 group-hover:scale-110" />
          </div>

          {channel.logoUrl ? (
            <Image
              src={channel.logoUrl}
              alt={`Logo de ${channel.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
              data-ai-hint="channel logo"
            />
          ) : (
            <Clapperboard className="h-10 w-10 text-muted-foreground/60" />
          )}
        </div>
      </div>
      <div className="px-1">
        <h3 className="font-semibold text-foreground truncate">
          {channel.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {channel.category}
        </p>
      </div>
    </Link>
  );
}
