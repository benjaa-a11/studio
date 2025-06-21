import type { Channel } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type ChannelCardProps = {
  channel: Channel;
};

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/canal/${channel.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardContent className="relative p-0">
          <div className="aspect-square w-full relative">
            <Image
              src={channel.logoUrl}
              alt={`Logo de ${channel.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="channel logo"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="font-headline text-lg font-semibold text-white">
              {channel.name}
            </h3>
            <p className="text-sm text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 font-body">
              {channel.category}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
