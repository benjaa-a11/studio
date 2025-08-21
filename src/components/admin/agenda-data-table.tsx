
'use client';

import { useState, useEffect, useMemo, useActionState } from 'react';
import type { AdminAgendaMatch, Channel, Team, Tournament } from '@/types';
import Image from 'next/image';
import { addMatch, updateMatch, deleteMatch } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


// Icons
import { PlusCircle, Edit, Trash2, CheckCircle, AlertCircle, MoreVertical, ArrowLeft, Clock, Search, Image as ImageIcon } from 'lucide-react';
import { Label } from '../ui/label';

const initialState = { message: '', errors: {}, success: false };

// --- MatchWizard Component ---
// This is the new, completely rebuilt multi-step wizard for creating/editing matches.

type MatchWizardProps = {
    match?: AdminAgendaMatch | null;
    onFormSubmit: () => void;
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
};

function MatchWizard({ match, onFormSubmit, teams, tournaments, channels }: MatchWizardProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<AdminAgendaMatch>>({
        tournamentId: match?.tournamentId || '',
        team1: match?.team1 || '',
        team2: match?.team2 || '',
        time: match?.time ? new Date(match.time) : new Date(),
        channels: match?.channels || [],
        dates: match?.dates || '',
        statusText: match?.statusText || '',
        imageUrl: match?.imageUrl || '',
    });
    
    // State for team/channel selection flow
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const formAction = match?.id ? updateMatch.bind(null, match.id) : addMatch;
    const [state, dispatch, isPending] = useActionState(formAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (isPending) return;
        if (state.message) {
            if (state.success) {
                toast({
                    title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Éxito</span></div>,
                    description: state.message
                });
                onFormSubmit();
            } else {
                 toast({
                    variant: 'destructive',
                    title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
                    description: state.message
                });
            }
        }
    }, [state, isPending, onFormSubmit, toast]);


    const nextStep = () => { setStep(s => s + 1); };
    const prevStep = () => { setStep(s => s - 1); };

    const handleSelect = (field: keyof AdminAgendaMatch, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'tournamentId') nextStep();
        if (field === 'team1' || field === 'team2') {
            nextStep();
            setSelectedCountry(null);
            setTeamSearchTerm('');
        }
    };
    
    const teamsByCountry = useMemo(() => {
        return teams.reduce<Record<string, Team[]>>((acc, team) => {
            const country = team.country || 'Sin País';
            if (!acc[country]) acc[country] = [];
            acc[country].push(team);
            return acc;
        }, {});
    }, [teams]);

    const filteredTeams = useMemo(() => {
        if (!selectedCountry) return [];
        return teamsByCountry[selectedCountry].filter(team =>
            team.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
        );
    }, [selectedCountry, teamsByCountry, teamSearchTerm]);

    const channelsByCategory = useMemo(() => {
        return channels.reduce<Record<string, Channel[]>>((acc, channel) => {
            const category = channel.category || 'Sin Categoría';
            if (!acc[category]) acc[category] = [];
            acc[category].push(channel);
            return acc;
        }, {});
    }, [channels]);

    const renderStepContent = () => {
        switch (step) {
            // Step 1: Select Tournament
            case 1:
                return (
                    <div key="step1" className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-4 text-center">1. Selecciona el Torneo</h3>
                        <ScrollArea className="h-[400px]">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                                {tournaments.map(t => (
                                    <button key={t.id} type="button" onClick={() => handleSelect('tournamentId', t.tournamentId)} className={cn("group flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary", formData.tournamentId === t.tournamentId && "border-primary ring-2 ring-primary")}>
                                        <Image src={t.logoUrl?.[0] || 'https://placehold.co/128x128.png'} alt={t.name} width={48} height={48} className="h-12 w-12 object-contain" unoptimized />
                                        <span className="text-xs font-medium">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                );
            // Steps 2 & 3: Select Teams
            case 2:
            case 3:
                const teamKey = step === 2 ? 'team1' : 'team2';
                return (
                    <div key={`step${step}`} className="animate-fade-in-up h-[400px] flex flex-col">
                        <h3 className="text-xl font-semibold mb-4 text-center">{step}. Selecciona el Equipo {step - 1}</h3>
                        <div className="relative flex-grow overflow-hidden">
                            {/* Country List */}
                            <div className={cn("absolute inset-0 transition-all duration-300", selectedCountry ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-100 translate-x-0")}>
                                <ScrollArea className="h-full">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                                        {Object.keys(teamsByCountry).sort().map(country => (
                                            <button key={country} type="button" onClick={() => setSelectedCountry(country)} className="group flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-center transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary h-24">
                                                <span className="text-sm font-semibold">{country}</span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                            {/* Team List */}
                            <div className={cn("absolute inset-0 transition-all duration-300 flex flex-col", selectedCountry ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
                                <div className="flex-shrink-0 mb-2 flex items-center gap-2">
                                    <button type="button" onClick={() => {setSelectedCountry(null); setTeamSearchTerm('');}} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                                        <ArrowLeft size={16}/> Volver
                                    </button>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Buscar equipo..."
                                            value={teamSearchTerm}
                                            onChange={(e) => setTeamSearchTerm(e.target.value)}
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="flex-grow">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                                        {filteredTeams.map(team => (
                                            <button key={team.id} type="button" onClick={() => handleSelect(teamKey, team.id)} className={cn("group flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed", (formData.team1 === team.id || formData.team2 === team.id) && "border-primary ring-2 ring-primary")} disabled={formData[teamKey === 'team1' ? 'team2' : 'team1'] === team.id}>
                                                <Image src={team.logoUrl} alt={team.name} width={48} height={48} className="h-12 w-12 object-contain" unoptimized />
                                                <span className="text-xs font-medium">{team.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                );
            // Step 4: Date and Time
            case 4:
                return (
                    <div key="step4" className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-4 text-center">4. Fecha y Hora del Partido (AR)</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Calendar
                                mode="single"
                                selected={formData.time}
                                onSelect={(date) => date && setFormData(p => ({...p, time: date}))}
                                locale={es}
                                className="rounded-md border"
                            />
                            <div className="flex flex-col gap-2 p-4 border rounded-md">
                                <label htmlFor="match-time" className="font-medium text-sm">Hora (24hs)</label>
                                <Input
                                    id="match-time"
                                    type="time"
                                    value={format(formData.time || new Date(), 'HH:mm')}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = setSeconds(setMinutes(setHours(formData.time || new Date(), hours), minutes), 0);
                                        setFormData(p => ({...p, time: newDate}));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            // Step 5: Channels
            case 5:
                return (
                    <div key="step5" className="animate-fade-in-up h-[400px] flex flex-col">
                        <h3 className="text-xl font-semibold mb-4 text-center">5. Canales de Transmisión</h3>
                        <div className="relative flex-grow overflow-hidden">
                            {/* Category List */}
                            <div className={cn("absolute inset-0 transition-all duration-300", selectedCategory ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-100 translate-x-0")}>
                                <ScrollArea className="h-full">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                                        {Object.keys(channelsByCategory).sort().map(category => (
                                            <button key={category} type="button" onClick={() => setSelectedCategory(category)} className="group flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-center transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary h-24">
                                                <span className="text-sm font-semibold">{category}</span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                            {/* Channel List */}
                            <div className={cn("absolute inset-0 transition-all duration-300 flex flex-col", selectedCategory ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
                                <div className="flex-shrink-0 mb-2">
                                    <button type="button" onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                                        <ArrowLeft size={16}/> Volver a Categorías
                                    </button>
                                </div>
                                <ScrollArea className="flex-grow">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1">
                                        {selectedCategory && channelsByCategory[selectedCategory].map(c => (
                                            <label key={c.id} className={cn("flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors", formData.channels?.includes(c.id) ? "border-primary bg-primary/10" : "hover:bg-muted/50")}>
                                                <Checkbox
                                                    checked={formData.channels?.includes(c.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentChannels = formData.channels || [];
                                                        const newChannels = checked ? [...currentChannels, c.id] : currentChannels.filter(id => id !== c.id);
                                                        setFormData(p => ({ ...p, channels: newChannels }));
                                                    }}
                                                />
                                                <Image src={c.logoUrl?.[0] ?? ''} alt={c.name} width={24} height={24} className="h-6 w-auto object-contain" unoptimized />
                                                <span className="text-xs font-medium flex-1">{c.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                );
            // Step 6: Dates & Optional Fields
            case 6:
                return (
                    <div key="step6" className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-4 text-center">6. Datos Adicionales (Opcional)</h3>
                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <Label htmlFor="dates">Texto Adicional</Label>
                                <Input
                                    id="dates"
                                    placeholder="Ej: Fase de Grupos · Jornada 2 de 3"
                                    value={formData.dates || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, dates: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Este texto aparece debajo del torneo en la tarjeta del partido.</p>
                            </div>
                            <div>
                                <Label htmlFor="statusText">Texto de Estado</Label>
                                <Input
                                    id="statusText"
                                    placeholder="Ej: Entretiempo, Finalizado"
                                    value={formData.statusText || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, statusText: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Sobrescribe el estado (ej: EN VIVO o la hora).</p>
                            </div>
                            <div>
                                <Label htmlFor="imageUrl">URL de Imagen</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    placeholder="Ej: https://i.imgur.com/tabla.png"
                                    value={formData.imageUrl || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Para mostrar tablas de posiciones, resultados, etc.</p>
                            </div>
                        </div>
                    </div>
                );
            // Step 7: Final Review and Submit
            case 7:
                const team1Data = teams.find(t => t.id === formData.team1);
                const team2Data = teams.find(t => t.id === formData.team2);
                const tournamentData = tournaments.find(t => t.tournamentId === formData.tournamentId);
                const isLive = formData.time && formData.time <= new Date();

                return (
                    <div key="step7" className="animate-fade-in-up">
                        <h3 className="text-xl font-semibold mb-4 text-center">7. Revisión Final</h3>
                        <p className="text-center text-muted-foreground mb-4">Así se verá el partido en la página principal.</p>
                        <div className="flex justify-center">
                        <Card className="w-[340px] overflow-hidden shadow-lg flex-shrink-0 flex flex-col">
                                <div className="p-3 bg-muted/40 border-b flex justify-between items-center gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {tournamentData?.logoUrl?.[0] && (
                                            <Image unoptimized src={tournamentData.logoUrl[0]} alt={tournamentData.name} width={24} height={24} className="h-6 w-6 object-contain flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs truncate">{tournamentData?.name}</p>
                                            {formData.dates && (
                                                <p className="text-xs text-muted-foreground truncate">{formData.dates}</p>
                                            )}
                                        </div>
                                    </div>
                                    {formData.statusText ? (
                                        <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">{formData.statusText}</Badge>
                                    ) : isLive ? (
                                        <Badge variant="destructive" className="animate-pulse text-xs font-bold px-2 py-0.5">EN VIVO</Badge>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-primary text-sm font-bold flex-shrink-0">
                                            <Clock className="h-4 w-4" />
                                            <span>{format(formData.time || new Date(), 'HH:mm')} hs</span>
                                        </div>
                                    )}
                                </div>
                                
                                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center">
                                    <div className="flex items-center justify-around w-full gap-4">
                                        <div className="flex flex-col items-center gap-2 text-center flex-1">
                                            <Image unoptimized src={team1Data?.logoUrl || 'https://placehold.co/128x128.png'} alt={team1Data?.name || ''} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" />
                                            <h3 className="font-semibold text-base text-center">{team1Data?.name}</h3>
                                        </div>
                                        
                                        <div className="text-muted-foreground font-bold text-lg">VS</div>
                                        
                                        <div className="flex flex-col items-center gap-2 text-center flex-1">
                                            <Image unoptimized src={team2Data?.logoUrl || 'https://placehold.co/128x128.png'} alt={team2Data?.name || ''} width={64} height={64} className="h-16 w-16 object-contain drop-shadow-sm" />
                                            <h3 className="font-semibold text-base text-center">{team2Data?.name}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }
    
    return (
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{match ? 'Editar Partido' : 'Programar Nuevo Partido'}</DialogTitle>
                <DialogDescription>
                    {match ? 'Modifica los detalles del partido existente.' : 'Sigue los pasos para programar un nuevo partido.'}
                </DialogDescription>
            </DialogHeader>
            
            <form action={() => dispatch(formData as AdminAgendaMatch)} className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-6 -mr-6 min-h-[450px]">
                    {renderStepContent()}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                    <div className="w-full flex justify-between items-center">
                        <div>
                             {step > 1 && (
                                <Button type="button" variant="ghost" onClick={prevStep}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            {step < 7 && (
                                <Button type="button" onClick={nextStep}>
                                    Siguiente
                                </Button>
                            )}
                            {step === 7 && (
                                <Button type="submit" disabled={!formData.team1 || !formData.team2 || isPending}>
                                    {match ? 'Guardar Cambios' : 'Añadir Partido'}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

const getMatchStatus = (match: AdminAgendaMatch): { text: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' | null } => {
    if (match.statusText) {
        return { text: match.statusText, variant: 'secondary' };
    }
    
    const now = new Date();
    const matchTime = match.time;
    const matchEndTime = new Date(matchTime.getTime() + 180 * 60 * 1000); // 3 hours after start

    if (now >= matchTime && now <= matchEndTime) {
        return { text: 'EN VIVO', variant: 'destructive' };
    }
    if (now > matchEndTime) {
        return { text: 'Finalizado', variant: 'secondary' };
    }
    return { text: 'Programado', variant: 'outline' };
};


function AdminAgendaCard({ match, onEdit, onDelete }: { match: AdminAgendaMatch; onEdit: (match: AdminAgendaMatch) => void; onDelete: (match: AdminAgendaMatch) => void; }) {
    const status = getMatchStatus(match);
    
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                         <Badge variant="secondary">{match.tournamentName}</Badge>
                         <Badge variant={status.variant} className={cn(status.text === 'EN VIVO' && "animate-pulse")}>{status.text}</Badge>
                    </div>
                    <p className="font-semibold">{match.team1Name} vs {match.team2Name}</p>
                    <p className="text-sm text-muted-foreground">{format(match.time, 'dd/MM/yyyy HH:mm')} hs</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(match)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(match)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function AgendaDataTable({ data, teams, tournaments, channels }: {
    data: AdminAgendaMatch[];
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
    tournamentOptions: { value: string; label: string; }[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<AdminAgendaMatch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return data.filter(match => {
      const searchContent = `${match.team1Name} ${match.team2Name} ${match.tournamentName}`.toLowerCase();
      const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
      const matchesTournament = tournamentFilter === 'all' || match.tournamentId === tournamentFilter;
      return matchesSearch && matchesTournament;
    });
  }, [data, searchTerm, tournamentFilter]);

  const handleEditClick = (match: AdminAgendaMatch) => {
    setSelectedMatch(match);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMatch(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (match: AdminAgendaMatch) => {
    setSelectedMatch(match);
    setIsAlertOpen(true);
  }
  
  const confirmDelete = async () => {
    if (!selectedMatch) return;

    const result = await deleteMatch(selectedMatch.id);
    if(result.success) {
      toast({ 
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Eliminado</span></div>,
        description: result.message 
      });
    } else {
      toast({ 
        variant: "destructive", 
        title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>, 
        description: result.message
      });
    }
    setIsAlertOpen(false);
    setSelectedMatch(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por equipo o torneo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por torneo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los torneos</SelectItem>
                {tournaments.map(t => (
                    <SelectItem key={t.id} value={t.tournamentId}>{t.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddClick} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Partido
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) handleFormSubmit(); else setIsFormOpen(true); }}>
        <MatchWizard
            key={selectedMatch ? selectedMatch.id : 'new'}
            match={selectedMatch}
            onFormSubmit={handleFormSubmit}
            teams={teams}
            tournaments={tournaments}
            channels={channels}
        />
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Se eliminará el partido entre <strong>{selectedMatch?.team1Name} y {selectedMatch?.team2Name}</strong>. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedMatch(null)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                      Eliminar
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

       {/* Responsive Layout */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead>Torneo</TableHead>
               <TableHead>Estado</TableHead>
               <TableHead>Imagen</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((match) => {
               const status = getMatchStatus(match);
               return (
                  <TableRow key={match.id} className="opacity-0 animate-fade-in-up">
                    <TableCell>{format(match.time, 'dd/MM/yy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{match.team1Name} vs {match.team2Name}</TableCell>
                    <TableCell>{match.tournamentName}</TableCell>
                     <TableCell>
                        <Badge variant={status.variant} className={cn(status.text === 'EN VIVO' && "animate-pulse")}>{status.text}</Badge>
                    </TableCell>
                    <TableCell>
                        {match.imageUrl ? <ImageIcon className="h-5 w-5 text-green-500" /> : <ImageIcon className="h-5 w-5 text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className='inline-flex'>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(match)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(match)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
               )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron partidos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <div className="md:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((match) => (
             <AdminAgendaCard
                key={match.id}
                match={match}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron partidos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
