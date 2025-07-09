'use client';

import { useState, useEffect } from 'react';
import type { Radio } from '@/types';
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
import { addRadio, updateRadio, deleteRadio } from '@/lib/admin-actions';
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
            {isEditing ? 'Guardar Cambios' : 'Añadir Radio'}
        </Button>
    )
}

function RadioForm({ radio, onFormSubmit }: { radio?: Radio | null; onFormSubmit: () => void }) {
  const formAction = radio?.id ? updateRadio.bind(null, radio.id) : addRadio;
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
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={radio?.name} />
          {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">URL del Logo</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={radio?.logoUrl} />
           {state.errors?.logoUrl && <p className="text-sm font-medium text-destructive">{state.errors.logoUrl.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="emisora">Emisora (Opcional)</Label>
          <Input id="emisora" name="emisora" defaultValue={radio?.emisora} />
           {state.errors?.emisora && <p className="text-sm font-medium text-destructive">{state.errors.emisora.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="streamUrl">URLs de Stream (separadas por coma)</Label>
          <Textarea id="streamUrl" name="streamUrl" defaultValue={radio?.streamUrl.join(', ')} placeholder="https://ejemplo.com/stream1.mp3, https://ejemplo.com/stream2.pls"/>
           {state.errors?.streamUrl && <p className="text-sm font-medium text-destructive">{state.errors.streamUrl.join(', ')}</p>}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!radio} />
      </DialogFooter>
    </form>
  );
}

function AdminRadioCard({ radio, onEdit, onDelete }: { radio: Radio; onEdit: (radio: Radio) => void; onDelete: (id: string, name: string) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={radio.logoUrl} alt={radio.name} width={48} height={48} className="object-contain rounded-md border p-1 h-12 w-12" />
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{radio.name}</p>
                    <p className="text-sm text-muted-foreground">{radio.emisora || 'Radio'}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(radio)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(radio.id, radio.name)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function RadioDataTable({ data }: { data: Radio[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);
  const { toast } = useToast();

  const handleEditClick = (radio: Radio) => {
    setSelectedRadio(radio);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRadio(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteRadio(id);
    if(result.success) {
      toast({
        title: (
            <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-foreground">Radio Eliminada</p>
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
    setSelectedRadio(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Radio
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedRadio ? 'Editar Radio' : 'Añadir Nueva Radio'}</DialogTitle>
            <DialogDescription>
              {selectedRadio ? 'Modifica los detalles de la estación de radio existente.' : 'Completa el formulario para añadir una nueva estación de radio. El ID se generará a partir del nombre.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <RadioForm radio={selectedRadio} onFormSubmit={handleFormSubmit} />
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
              <TableHead>Emisora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? data.map((radio) => (
              <TableRow key={radio.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={radio.logoUrl} alt={radio.name} width={40} height={40} className="object-contain rounded-md border p-1" />
                </TableCell>
                <TableCell className="font-medium">{radio.name}</TableCell>
                <TableCell>{radio.emisora || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(radio)}>
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
                                  <AlertDialogTitle>¿Eliminar la radio {radio.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(radio.id)} className="bg-destructive hover:bg-destructive/90">
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
                  No hay radios para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((radio, index) => (
             <AdminRadioCard
                key={radio.id}
                radio={radio}
                onEdit={handleEditClick}
                onDelete={(id, name) => {
                   const trigger = document.createElement('button');
                   document.body.appendChild(trigger);
                   const dialog = (
                       <AlertDialog open={true} onOpenChange={(open) => !open && trigger.remove()}>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>¿Eliminar la radio {name}?</AlertDialogTitle>
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
            <p>No hay radios para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
}