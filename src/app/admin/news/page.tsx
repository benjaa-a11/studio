
import { getNews } from "@/lib/actions";
import NewsDataTable from "@/components/admin/news-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const news = await getNews(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Noticias</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina los artículos de noticias de la aplicación.
        </p>
      </div>
      <NewsDataTable data={news} />
    </div>
  );
}
