
import { FeaturedImage } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ImageViewProps = {
    image: FeaturedImage;
};

export default function ImageView({ image }: ImageViewProps) {
  return (
    <div className="flex h-dvh w-full flex-col bg-muted">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top bg-background z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/noticias" aria-label="Volver a noticias">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold truncate leading-tight">{image.title}</h1>
            <p className="text-sm text-muted-foreground leading-tight">{image.category}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
            <Image 
                src={image.imageUrl}
                alt={image.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
                unoptimized
            />
        </div>
      </main>
    </div>
  );
}
