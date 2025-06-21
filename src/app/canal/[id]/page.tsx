import { getChannelById, getChannelsByCategory } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import ChannelCard from "@/components/channel-card";
import { Separator } from "@/components/ui/separator";

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const channel = await getChannelById(params.id);

  if (!channel) {
    notFound();
  }

  const relatedChannels = await getChannelsByCategory(channel.category, channel.id);

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
                <Image src={channel.logoUrl || `https://placehold.co/100x100.png`} alt={`Logo de ${channel.name}`} fill className="object-contain"/>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">{channel.category}</p>
            </div>
          </div>
        </div>
      </header>
       <div className="flex-1 overflow-y-auto">
         <div className="container mx-auto p-4 md:p-8">
            <main>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl shadow-primary/10">
                <iframe
                  className="h-full w-full border-0"
                  src={channel.streamUrl}
                  title={channel.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
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
