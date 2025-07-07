import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tv, Film, Radio, Shield, Users, CalendarDays } from "lucide-react";
import { getChannels, getMovies, getRadios, getTeams, getTournaments, getAdminAgenda } from "@/lib/actions";

export default async function AdminDashboard() {
  const [channels, movies, radios, teams, tournaments, agenda] = await Promise.all([
    getChannels(true),
    getMovies(true),
    getRadios(true),
    getTeams(true),
    getTournaments(true),
    getAdminAgenda()
  ]);

  const stats = [
    { title: "Canales", count: channels.length, icon: Tv },
    { title: "Películas", count: movies.length, icon: Film },
    { title: "Radios", count: radios.length, icon: Radio },
    { title: "Partidos", count: agenda.length, icon: CalendarDays },
    { title: "Torneos", count: tournaments.length, icon: Shield },
    { title: "Equipos", count: teams.length, icon: Users },
  ];

  const sections = [
    { title: "Canales", description: "Añade, edita o elimina canales de TV en vivo.", href: "/admin/channels", icon: Tv },
    { title: "Películas", description: "Administra el catálogo completo de películas.", href: "/admin/movies", icon: Film },
    { title: "Radios", description: "Administra las estaciones de radio disponibles.", href: "/admin/radios", icon: Radio },
    { title: "Agenda", description: "Gestiona los partidos y eventos deportivos.", href: "/admin/agenda", icon: CalendarDays },
    { title: "Torneos", description: "Administra los torneos y competencias.", href: "/admin/tournaments", icon: Shield },
    { title: "Equipos", description: "Administra los equipos y sus logos.", href: "/admin/teams", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-lg text-muted-foreground">Bienvenido al centro de control de Plan B Streaming.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">
                registros totales
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
            <Card key={section.title}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" /> {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href={section.href}>Gestionar {section.title}</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
