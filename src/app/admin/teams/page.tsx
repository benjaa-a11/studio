import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function AdminTeamsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Hammer className="h-8 w-8 text-muted-foreground" />
        <div>
          <CardTitle>En Construcción</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            La gestión de equipos está en desarrollo.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p>Esta sección permitirá añadir y modificar los equipos que participan en los torneos, incluyendo su nombre, país y logo. Estos datos se usarán en la agenda deportiva.</p>
      </CardContent>
    </Card>
  );
}
