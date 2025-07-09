'use client';

import { useState, useEffect } from 'react';
import type { Team } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useFormStatus } from 'react-dom';
import { addTeam, updateTeam, deleteTeam } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Equipo'}
        </Button>
    )
}

function TeamForm({ team, onFormSubmit }: { team?: Team | null; onFormSubmit: () => void }) {
  const formAction = team?.id ? updateTeam.bind(null, team.path) : addTeam;
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if(state.message) {
        if (state.success) {
            toast({
                title: (
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Éxito</p>
                            <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
                        </div>
                    </div>
                )
            });
            onFormSubmit();
        } else {
            toast({
                variant: 'destructive',
                title: (
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive-foreground mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-destructive-foreground">Error</p>
                            <p className="text-sm text-destructive-foreground/80 mt-1">{state.message}</p>
                        </div>
                    </div>
                )
            });
        }
    }
  }, [state, onFormSubmit, toast]);

  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre del Equipo</Label>
          <Input id="name" name="name" defaultValue={team?.name} disabled={!!team} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
           {!!team && <p className="text-xs text-muted-foreground mt-1">El nombre no se puede cambiar ya que forma parte del ID del documento.</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={team?.logoUrl} />
           {state.errors?.logoUrl && <p className="text-sm font-medium text-destructive">{state.errors.logoUrl.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" name="country" defaultValue={team?.country} disabled={!!team} />
           {state.errors?.country && <p className="text-sm font-medium text-destructive">{state.errors.country.join(', ')}</p>}
           {!!team && <p className="text-xs text-muted-foreground mt-1">El país no se puede cambiar ya que forma parte de la ruta del documento.</p>}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!team} />
      </DialogFooter>
    </form>
  );
}

function AdminTeamCard({ team, onEdit, onDelete }: { team: Team; onEdit: (team: Team) => void; onDelete: (path: string, name: string) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={team.logoUrl} alt={team.name} width={48} height={48} className="object-contain rounded-md border p-1 bg-white h-12 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.country}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(team)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(team.path, team.name)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function TeamDataTable({ data }: { data: Team[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTeam(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (path: string) => {
    const result = await deleteTeam(path);
    if(result.success) {
      toast({
        title: (
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-foreground">Equipo Eliminado</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                </div>
            </div>
        )
      });
    } else {
      toast({
        variant: 'destructive',
        title: (
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive-foreground mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-destructive-foreground">Error</p>
                    <p className="text-sm text-destructive-foreground/80 mt-1">{result.message}</p>
                </div>
            </div>
        )
      });
    }
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Equipo
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTeam ? 'Editar Equipo' : 'Añadir Nuevo Equipo'}</DialogTitle>
            <DialogDescription>
              {selectedTeam ? 'Modifica los detalles del equipo existente.' : 'Completa el formulario para añadir un nuevo equipo. El ID se generará a partir del nombre y país.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <TeamForm team={selectedTeam} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>País</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((team) => (
              <TableRow key={team.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={team.logoUrl} alt={team.name} width={40} height={40} className="object-contain rounded-md border p-1 bg-white" />
                </TableCell>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.country}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(team)}>
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
                                  <AlertDialogTitle>¿Eliminar el equipo {team.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(team.path)} className="bg-destructive hover:bg-destructive/90">
                                      Eliminar
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay equipos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

        {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((team, index) => (
             <AdminTeamCard
                key={team.id}
                team={team}
                onEdit={handleEditClick}
                onDelete={(path, name) => {
                   const trigger = document.createElement('button');
                   document.body.appendChild(trigger);
                   const dialog = (
                       <AlertDialog open={true} onOpenChange={(open) => !open && trigger.remove()}>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>¿Eliminar el equipo {name}?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       Esta acción no se puede deshacer.
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDelete(path)} className="bg-destructive hover:bg-destructive/90">
                                       Eliminar
                                   </AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                   );
                   const { createRoot } = require('react-dom/client');
                   createRoot(trigger).render(dialog);
                }}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay equipos para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
}