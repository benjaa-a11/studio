import { Newspaper } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20 text-center">
        <Newspaper className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-2xl font-semibold text-foreground">
          Sección de Noticias
        </h3>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Esta sección está actualmente en desarrollo. ¡Vuelve pronto!
        </p>
      </div>
    </div>
  );
}
