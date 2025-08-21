
import { getNewsById } from "@/lib/actions";
import NewsNotFound from "@/components/news-not-found";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0; // Force dynamic rendering

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const article = await getNewsById(params.id);

  if (!article) {
    return <NewsNotFound />;
  }

  return (
    <div className="flex h-dvh w-full flex-col">
       <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top">
         <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/noticias" aria-label="Volver a noticias">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold truncate leading-tight">{article.title}</h1>
            <p className="text-sm text-muted-foreground leading-tight">{article.source}</p>
          </div>
        </div>
      </header>
      <iframe
        src={article.url}
        className="h-full w-full border-0 flex-1"
        title={article.title}
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
    </div>
  );
}
