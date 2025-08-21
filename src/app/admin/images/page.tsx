
import { getAllFeaturedImages } from "@/lib/actions";
import ImageDataTable from "@/components/admin/image-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminImagesPage() {
  const images = await getAllFeaturedImages(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Imágenes</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina las imágenes destacadas de la aplicación (tablas, resultados, etc.).
        </p>
      </div>
      <ImageDataTable data={images} />
    </div>
  );
}
