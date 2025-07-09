'use client';

import { useState, useEffect } from 'react';
import type { AdminAgendaMatch, Channel, Team, Tournament } from '@/types';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addMatch, updateMatch, deleteMatch } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, CalendarIcon, Check, MoreVertical } from 'lucide-react';
import { Badge } from '../ui/badge';

const agendaSchema = z.object({
  tournamentId: z.string({ required_error: "Debe seleccionar un torneo." }).min(1, "Debe seleccionar un torneo."),
  team1: z.string({ required_error: "Debe seleccionar el equipo 1." }).min(1, "Debe seleccionar el equipo 1."),
  team2: z.string({ required_error: "Debe seleccionar el equipo 2." }).min(1, "Debe seleccionar el equipo 2."),
  time: z.date({ required_error: "Debe seleccionar una fecha y hora." }),
  channels: z.array(z.string()).optional(),
  dates: z.string().optional(),
}).refine(data => data.team1 !== data.team2, {
    message: "Los equipos no pueden ser iguales.",
    path: ["team2"],
});

type AgendaFormValues = z.infer<typeof agendaSchema>;

function MatchForm({ match, onFormSubmit, teams, tournaments, channels }: {
    match?: AdminAgendaMatch | null;
    onFormSubmit: () => void;
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
}) {
    const { toast } = useToast();
    const form = useForm<AgendaFormValues>({
        resolver: zodResolver(agendaSchema),
        defaultValues: {
            tournamentId: match?.tournamentId || '',
            team1: match?.team1 || '',
            team2: match?.team2 || '',
            time: match?.time ? new Date(match.time) : new Date(),
            channels: match?.channels || [],
            dates: match?.dates || '',
        },
    });

    const onSubmit = async (data: AgendaFormValues) => {
        try {
            const action = match?.id ? updateMatch.bind(null, match.id) : addMatch;
            const result = await action(data);

            if (result.success) {
                toast({
                    title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Éxito</span></div>,
                    description: result.message
                });
                onFormSubmit();
            } else {
                 toast({
                    variant: 'destructive',
                    title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
                    description: result.message || 'Ocurrió un error inesperado.'
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error de Red',
                description: 'No se pudo conectar con el servidor.'
            });
        }
    };
    
    const groupedChannels = channels.reduce<Record<string, Channel[]>>((acc, channel) => {
        const category = channel.category || 'Sin Categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
        return acc;
    }, {});
    
    const tournamentOptions = tournaments.map(t => ({ value: t.tournamentId, label: t.name, logo: t.logoUrl?.[0] }));
    const teamOptions = teams.map(t => ({ value: t.id, label: t.name, logo: t.logoUrl }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tournament, Team1, Team2 */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tournamentId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Torneo</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                    {field.value ? tournamentOptions.find(t => t.value === field.value)?.label : "Seleccionar torneo"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar torneo..." />
                                                <CommandEmpty>No se encontraron torneos.</CommandEmpty>
                                                <CommandList>
                                                    {tournamentOptions.map(option => (
                                                        <CommandItem key={option.value} onSelect={() => { form.setValue("tournamentId", option.value) }}>
                                                            <Check className={cn("mr-2 h-4 w-4", field.value === option.value ? "opacity-100" : "opacity-0")} />
                                                            {option.logo && <Image src={option.logo} alt={option.label} width={20} height={20} className="mr-2 h-5 w-5 object-contain" />}
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="team1"
                                render={({ field }) => (
                                <FormItem className="flex flex-col flex-1">
                                    <FormLabel>Equipo 1</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                     {field.value ? teamOptions.find(t => t.value === field.value)?.label : "Seleccionar equipo"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar equipo..." />
                                                <CommandEmpty>No se encontraron equipos.</CommandEmpty>
                                                <CommandList>
                                                    {teamOptions.map(option => (
                                                        <CommandItem key={option.value} onSelect={() => { form.setValue("team1", option.value) }}>
                                                            <Check className={cn("mr-2 h-4 w-4", field.value === option.value ? "opacity-100" : "opacity-0")} />
                                                            {option.logo && <Image src={option.logo} alt={option.label} width={20} height={20} className="mr-2 h-5 w-5 object-contain" />}
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="team2"
                                render={({ field }) => (
                                <FormItem className="flex flex-col flex-1">
                                    <FormLabel>Equipo 2</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                     {field.value ? teamOptions.find(t => t.value === field.value)?.label : "Seleccionar equipo"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar equipo..." />
                                                <CommandEmpty>No se encontraron equipos.</CommandEmpty>
                                                <CommandList>
                                                    {teamOptions.map(option => (
                                                        <CommandItem key={option.value} onSelect={() => { form.setValue("team2", option.value) }}>
                                                            <Check className={cn("mr-2 h-4 w-4", field.value === option.value ? "opacity-100" : "opacity-0")} />
                                                            {option.logo && <Image src={option.logo} alt={option.label} width={20} height={20} className="mr-2 h-5 w-5 object-contain" />}
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                         <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha y Hora (AR)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP, HH:mm") : <span>Seleccionar fecha</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            <div className="p-3 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={format(field.value, 'HH:mm')}
                                                        onChange={(e) => {
                                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                                            const newDate = setSeconds(setMinutes(setHours(field.value, hours), minutes), 0);
                                                            field.onChange(newDate);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="dates"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Texto Adicional</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Fase de grupos · Jornada 2" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Channels */}
                    <FormField
                        control={form.control}
                        name="channels"
                        render={() => (
                            <FormItem>
                                <FormLabel>Canales de Transmisión</FormLabel>
                                <Card>
                                    <CardContent className="p-0">
                                         <ScrollArea className="h-72">
                                            {Object.entries(groupedChannels).map(([category, items]) => (
                                                <div key={category} className="p-4 border-b last:border-b-0">
                                                     <h4 className="mb-2 font-semibold text-sm">{category}</h4>
                                                      <div className="space-y-2">
                                                        {items.map(item => (
                                                            <FormField
                                                                key={item.id}
                                                                control={form.control}
                                                                name="channels"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                                        : field.onChange(field.value?.filter(value => value !== item.id))
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal text-sm flex items-center gap-2 cursor-pointer">
                                                                            <Image src={item.logoUrl} alt={item.name} width={24} height={24} className="h-6 w-auto object-contain" />
                                                                            {item.name}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {match ? 'Guardar Cambios' : 'Añadir Partido'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

function AdminAgendaCard({ match, onEdit, onDelete }: { match: AdminAgendaMatch; onEdit: (match: AdminAgendaMatch) => void; onDelete: (id: string) => void; }) {
    const isLive = match.time <= new Date() && new Date().getTime() - match.time.getTime() <= 180 * 60 * 1000;
    
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                         <Badge variant="secondary">{match.tournamentName}</Badge>
                         {isLive && <Badge variant="destructive" className="animate-pulse">EN VIVO</Badge>}
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
                        <DropdownMenuItem onClick={() => onDelete(match.id)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}


export default function AgendaDataTable({ data, teams, tournaments, channels, tournamentOptions }: {
    data: AdminAgendaMatch[];
    teams: Team[];
    tournaments: Tournament[];
    channels: Channel[];
    tournamentOptions: { value: string; label: string; }[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<AdminAgendaMatch | null>(null);
  const { toast } = useToast();

  const handleEditClick = (match: AdminAgendaMatch) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMatch(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteMatch(id);
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
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Partido
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) handleFormSubmit(); else setIsDialogOpen(true); }}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMatch ? 'Editar Partido' : 'Programar Nuevo Partido'}</DialogTitle>
            <DialogDescription>
              {selectedMatch ? 'Modifica los detalles del partido existente.' : 'Completa el formulario para programar un nuevo partido.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
              <MatchForm 
                match={selectedMatch} 
                onFormSubmit={handleFormSubmit}
                teams={teams}
                tournaments={tournaments}
                channels={channels}
              />
          </div>
        </DialogContent>
      </Dialog>
      
       {/* Responsive Layout */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead>Torneo</TableHead>
               <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((match) => {
               const isLive = match.time <= new Date() && new Date().getTime() - match.time.getTime() <= 180 * 60 * 1000;
               return (
                  <TableRow key={match.id} className="opacity-0 animate-fade-in-up">
                    <TableCell>{format(match.time, 'dd/MM/yy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{match.team1Name} vs {match.team2Name}</TableCell>
                    <TableCell>{match.tournamentName}</TableCell>
                     <TableCell>
                        {isLive && <Badge variant="destructive" className="animate-pulse">EN VIVO</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className='inline-flex'>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(match)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Se eliminará el partido entre <strong>{match.team1Name} y {match.team2Name}</strong>. Esta acción no se puede deshacer.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(match.id)} className="bg-destructive hover:bg-destructive/90">
                                          Eliminar
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
               )
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay partidos en la agenda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((match, index) => (
             <AdminAgendaCard
                key={match.id}
                match={match}
                onEdit={handleEditClick}
                onDelete={(id) => {
                   const matchToDelete = data.find(m => m.id === id);
                   if (matchToDelete) {
                       const trigger = document.createElement('button');
                       document.body.appendChild(trigger);
                       const dialog = (
                           <AlertDialog open={true} onOpenChange={(open) => !open && trigger.remove()}>
                               <AlertDialogContent>
                                   <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar este partido?</AlertDialogTitle>
                                       <AlertDialogDescription>
                                            Se eliminará el partido entre <strong>{matchToDelete.team1Name} y {matchToDelete.team2Name}</strong>. Esta acción no se puede deshacer.
                                       </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                       <AlertDialogAction onClick={() => handleDelete(id)} className="bg-destructive hover:bg-destructive/90">
                                           Eliminar
                                       </AlertDialogAction>
                                   </AlertDialogFooter>
                               </AlertDialogContent>
                           </AlertDialog>
                       );
                       const { createRoot } = require('react-dom/client');
                       createRoot(trigger).render(dialog);
                   }
                }}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay partidos en la agenda.</p>
          </div>
        )}
      </div>
    </div>
  );
}