
import type { News } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type NewsCardProps = {
  article: News;
  index: number;
};

const NewsCard = memo(function NewsCard({ article, index }: NewsCardProps) {
  const formattedDate = format(new Date(article.date), "d 'de' MMMM, yyyy", { locale: es });
  
  return (
    <Link 
      href={`/noticias/${article.id}`} 
      className="group block outline-none rounded-lg overflow-hidden transition-all duration-300 bg-card border hover:shadow-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background opacity-0 animate-fade-in-up"
      title={article.title}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-video w-full relative bg-muted/50 overflow-hidden">
        <Image
          unoptimized
          src={article.imageUrl}
          alt={`Imagen para ${article.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="news article"
          priority={index < 4}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>
      
      <div className="p-4">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">{article.source}</p>
        <h3 className="font-bold text-lg text-foreground mt-1 line-clamp-3 leading-tight h-[84px]">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2">
          {formattedDate}
        </p>
      </div>
    </Link>
  );
});

export default NewsCard;
