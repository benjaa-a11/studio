import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tv, Film, Radio, Shield, Users, CalendarDays, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-lg text-muted-foreground">Gestiona todo el contenido de tu aplicación de streaming desde un único lugar.</p>
      </div>

       <div className="border-l-4 border-destructive bg-destructive/10 p-4 text-destructive-foreground">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold">Aviso de Seguridad Importante</h3>
                    <p className="text-sm">
                        Este panel de administración actualmente no tiene un sistema de autenticación. En una aplicación de producción, es <strong>crucial</strong> proteger estas rutas para prevenir el acceso y modificaciones no autorizadas a tus datos.
                    </p>
                </div>
            </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" /> Canales
            </CardTitle>
            <CardDescription>Añade, edita o elimina canales de TV en vivo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/channels">Gestionar Canales</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" /> Películas
            </CardTitle>
            <CardDescription>Administra el catálogo completo de películas.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild>
                <Link href="/admin/movies">Gestionar Películas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" /> Radios
            </CardTitle>
            <CardDescription>Administra las estaciones de radio disponibles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/radios">Gestionar Radios</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Agenda
            </CardTitle>
            <CardDescription>Gestiona los partidos y eventos deportivos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/agenda">Gestionar Agenda</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Torneos
            </CardTitle>
            <CardDescription>Administra los torneos y competencias.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/tournaments">Gestionar Torneos</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Equipos
            </CardTitle>
            <CardDescription>Administra los equipos y sus logos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/teams">Gestionar Equipos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
