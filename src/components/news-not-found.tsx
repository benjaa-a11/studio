
import { AlertTriangle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewsNotFound() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center">
        <AlertTriangle className="mb-6 h-20 w-20 text-destructive/80" />
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Noticia No Encontrada
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Lo sentimos, no pudimos encontrar la noticia que estás buscando. Es
          posible que el enlace no sea correcto o que haya sido eliminada.
        </p>
        <Button asChild className="mt-8">
          <Link href="/noticias">
            <Newspaper className="mr-2 h-4 w-4" />
            Volver a Noticias
          </Link>
        </Button>
      </div>
    </div>
  );
}
