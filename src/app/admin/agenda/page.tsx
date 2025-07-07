import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hammer, CheckCircle } from "lucide-react";

export default function AdminAgendaPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Hammer className="h-8 w-8 text-muted-foreground" />
        <div>
          <CardTitle>En Construcción</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            La gestión de la agenda deportiva está en desarrollo.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p>Esta sección permitirá crear, programar y editar los partidos y eventos que aparecen en la página de inicio. Podrás enlazar equipos, torneos y canales de transmisión.</p>
         <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span>La gestión de Equipos y Torneos ya está disponible.</span>
        </div>
      </CardContent>
    </Card>
  );
}
