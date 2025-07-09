'use client';

import { useState, useEffect } from 'react';
import type { Movie } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormState, useFormStatus } from 'react-dom';
import { addMovie, updateMovie, deleteMovie } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent } from '../ui/card';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Película'}
        </Button>
    )
}

function MovieForm({ movie, onFormSubmit }: { movie?: Movie | null; onFormSubmit: () => void }) {
  const formAction = movie?.id ? updateMovie.bind(null, movie.id) : addMovie;
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if(state.success) {
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
    } else if (state.message && !Object.keys(state.errors ?? {}).length) {
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
  }, [state, onFormSubmit, toast]);

  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="tmdbID">ID de TMDb</Label>
          <Input id="tmdbID" name="tmdbID" defaultValue={movie?.tmdbID} placeholder="Ej: 157336" />
          {state.errors?.tmdbID && <p className="text-sm font-medium text-destructive">{state.errors.tmdbID.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="streamUrl">URL del Stream</Label>
          <Input id="streamUrl" name="streamUrl" defaultValue={movie?.streamUrl} placeholder="URL .mp4 o de iframe" />
           {state.errors?.streamUrl && <p className="text-sm font-medium text-destructive">{state.errors.streamUrl.join(', ')}</p>}
        </div>
         <div className="grid gap-2">
          <Label>Formato</Label>
          <RadioGroup name="format" defaultValue={movie?.format || 'mp4'} className="flex gap-4">
             <div className="flex items-center space-x-2">
                <RadioGroupItem value="mp4" id="mp4" />
                <Label htmlFor="mp4">MP4 (Player Nativo)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="iframe" id="iframe" />
                <Label htmlFor="iframe">Iframe (Player Externo)</Label>
            </div>
          </RadioGroup>
          {state.errors?.format && <p className="text-sm font-medium text-destructive">{state.errors.format.join(', ')}</p>}
        </div>
        <div className='p-4 border rounded-md bg-muted/50'>
            <h4 className="font-semibold mb-2 text-sm">Campos Opcionales</h4>
            <p className="text-xs text-muted-foreground mb-4">Déjalos en blanco para usar los datos de TMDb automáticamente. El ID del documento se generará a partir del título.</p>
             <div className="grid gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="title">Título (Opcional)</Label>
                    <Input id="title" name="title" defaultValue={movie?.title} />
                     {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title.join(', ')}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="posterUrl">URL de Póster (Opcional)</Label>
                    <Input id="posterUrl" name="posterUrl" defaultValue={movie?.posterUrl} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="synopsis">Sinopsis (Opcional)</Label>
                    <Textarea id="synopsis" name="synopsis" defaultValue={movie?.synopsis} />
                </div>
             </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!movie} />
      </DialogFooter>
    </form>
  );
}

function AdminMovieCard({ movie, onEdit, onDelete }: { movie: Movie; onEdit: (movie: Movie) => void; onDelete: (id: string, name: string) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={movie.posterUrl} alt={movie.title} width={48} height={72} className="object-cover rounded-md border p-1 h-18 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">Formato: {movie.format}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(movie)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(movie.id, movie.title)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}


export default function MovieDataTable({ data }: { data: Movie[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { toast } = useToast();

  const handleEditClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedMovie(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteMovie(id);
    if(result.success) {
      toast({
        title: (
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-foreground">Película Eliminada</p>
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
    setSelectedMovie(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Película
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMovie ? 'Editar Película' : 'Añadir Nueva Película'}</DialogTitle>
            <DialogDescription>
              {selectedMovie ? 'Modifica los detalles de la película existente.' : 'Completa el formulario para añadir una nueva película a la aplicación.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <MovieForm movie={selectedMovie} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Póster</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((movie) => (
              <TableRow key={movie.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={movie.posterUrl} alt={movie.title} width={40} height={60} className="object-cover rounded-md border p-1" />
                </TableCell>
                <TableCell className="font-medium">{movie.title}</TableCell>
                <TableCell>{movie.format}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(movie)}>
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
                                  <AlertDialogTitle>¿Eliminar la película {movie.title}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(movie.id)} className="bg-destructive hover:bg-destructive/90">
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
                  No hay películas para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((movie, index) => (
             <AdminMovieCard
                key={movie.id}
                movie={movie}
                onEdit={handleEditClick}
                onDelete={(id, name) => {
                   const trigger = document.createElement('button');
                   document.body.appendChild(trigger);
                   const dialog = (
                       <AlertDialog open={true} onOpenChange={(open) => !open && trigger.remove()}>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>¿Eliminar la película {name}?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       Esta acción no se puede deshacer.
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
                }}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No hay películas para mostrar.</p>
          </div>
        )}
      </div>

    </div>
  );
}