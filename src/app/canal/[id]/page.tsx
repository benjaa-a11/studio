import { getChannelById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Tv } from "lucide-react";
import Image from "next/image";

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const channel = await getChannelById(params.id);

  if (!channel) {
    notFound();
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Volver a inicio">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                <Image src={channel.logoUrl} alt={`Logo de ${channel.name}`} fill className="object-cover"/>
            </div>
            <div>
              <h1 className="font-headline text-lg font-semibold">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">{channel.category}</p>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
            <p className="text-sm text-muted-foreground font-body">{channel.description}</p>
        </div>
      </header>
      <main className="flex-1 overflow-hidden bg-black">
        <iframe
          className="h-full w-full border-0"
          src={channel.streamUrl}
          title={channel.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </main>
    </div>
  );
}
