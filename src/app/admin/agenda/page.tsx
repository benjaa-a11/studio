import { getChannels, getTeams, getTournaments } from "@/lib/actions";
import { getAdminAgenda } from "@/lib/admin-actions";
import AgendaDataTable from "@/components/admin/agenda-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminAgendaPage() {
  // Fetch all necessary data in parallel for the form
  const [agenda, teams, tournaments, channels] = await Promise.all([
    getAdminAgenda(),
    getTeams(true),
    getTournaments(true),
    getChannels(true)
  ]);

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));
  const tournamentOptions = tournaments.map(t => ({ value: t.tournamentId, label: t.name }));
  const channelOptions = channels.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Agenda</h1>
        <p className="text-muted-foreground">
          Crea, edita o elimina los partidos y eventos deportivos.
        </p>
      </div>
      <AgendaDataTable 
        data={agenda}
        teamOptions={teamOptions}
        tournamentOptions={tournamentOptions}
        channelOptions={channelOptions}
      />
    </div>
  );
}
