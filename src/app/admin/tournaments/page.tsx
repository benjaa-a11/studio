import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function AdminTournamentsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Hammer className="h-8 w-8 text-muted-foreground" />
        <div>
          <CardTitle>En Construcción</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            La gestión de torneos está en desarrollo.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p>Esta sección permitirá administrar las competencias, incluyendo su nombre, ID único y logos para los temas claro y oscuro. Estos datos se usarán en la agenda deportiva.</p>
      </CardContent>
    </Card>
  );
}
