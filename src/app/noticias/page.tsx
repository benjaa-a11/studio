
import { getNews, getFeaturedImages } from "@/lib/actions";
import NewsCard from "@/components/news-card";
import { Newspaper } from "lucide-react";
import ImageCard from "@/components/image-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const [newsItems, featuredImages] = await Promise.all([
    getNews(),
    getFeaturedImages(3, true)
  ]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {featuredImages.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Destacados</h2>
          <div className="relative">
            <ScrollArea className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-4 pb-4">
                {featuredImages.map((item, index) => (
                  <div key={item.id} className="w-80 shrink-0">
                    <ImageCard item={item} index={index} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>
      )}

      <section>
        {newsItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsItems.map((item, index) => (
              <NewsCard key={item.id} article={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
            <Newspaper className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-semibold text-foreground">
              No hay noticias por ahora
            </h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Vuelve más tarde para ver las últimas actualizaciones.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
