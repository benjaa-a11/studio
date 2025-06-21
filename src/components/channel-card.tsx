import type { Channel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

type ChannelCardProps = {
  channel: Channel;
};

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/canal/${channel.id}`} className="group block space-y-3">
      <Card className="overflow-hidden rounded-lg transition-all duration-300 ease-in-out group-hover:shadow-primary/20 group-hover:shadow-lg group-hover:-translate-y-1 border-border/50 group-hover:border-primary/50">
        <div className="aspect-video w-full relative bg-card-foreground/5 p-4 flex items-center justify-center">
          <Image
            src={channel.logoUrl}
            alt={`Logo de ${channel.name}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
            data-ai-hint="channel logo"
          />
        </div>
      </Card>
      <div className="px-1">
        <h3 className="font-headline text-base font-semibold text-foreground truncate">
          {channel.name}
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          {channel.category}
        </p>
      </div>
    </Link>
  );
}
