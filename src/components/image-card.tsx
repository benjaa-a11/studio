
import type { FeaturedImage } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";

type ImageCardProps = {
  item: FeaturedImage;
  index: number;
};

const ImageCard = memo(function ImageCard({ item, index }: ImageCardProps) {
  return (
    <Link 
      href={`/imagen/${item.id}`} 
      className="group block outline-none rounded-lg overflow-hidden transition-all duration-300 bg-card border hover:shadow-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 animate-fade-in-up"
      title={item.title}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-video w-full relative bg-muted/50 overflow-hidden">
        <Image
          unoptimized
          src={item.imageUrl}
          alt={`Imagen para ${item.title}`}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="featured image"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
             <h3 className="font-bold text-lg text-white drop-shadow-md leading-tight">
                {item.title}
             </h3>
        </div>
      </div>
    </Link>
  );
});

export default ImageCard;
